import { VERIFIED_RECITERS } from "@/data/reciters";
import { MUSHAF_TIMESTAMP_RECITERS } from "@/lib/api/mushaf";
import {
  getArabicAlphabetGroup,
  normalizeArabicText,
  slugifyReciterName,
} from "@/lib/audio/normalize";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import type {
  CatalogReciter,
  CatalogRiwayah,
  RecitationStyleId,
  ReciterCatalogSnapshot,
  ReciterMoshafVariant,
} from "@/types/islamic";

const MP3QURAN_API_BASE = "https://mp3quran.net/api/v3";
const QURAN_COM_API_BASE = "https://api.quran.com/api/v4";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

interface Mp3QuranRawMoshaf {
  id: number;
  name: string;
  rewaya_id?: number;
  server: string;
  surah_total: number;
  moshaf_type: number;
  surah_list?: string;
}

interface Mp3QuranRawReciter {
  id: number;
  name: string;
  letter?: string;
  date?: string;
  moshaf: Mp3QuranRawMoshaf[];
}

interface Mp3QuranRawRiwayah {
  id: number;
  name: string;
}

interface QComRawChapterReciter {
  id: number;
  name: string;
  style?: { name?: string };
  qirat?: { name?: string };
  translated_name?: { name?: string; language_name?: string };
}

declare global {
  var __waslReciterCatalogCache:
    | { snapshot: ReciterCatalogSnapshot; expiresAt: number }
    | undefined;
}

const QDC_TIMESTAMP_IDS = new Set<number>(
  MUSHAF_TIMESTAMP_RECITERS.map((r) => r.qdcId)
);

const ARABIC_KNOWN_RIWAYAH_ENGLISH: Record<string, string> = {
  "حفص عن عاصم": "Hafs 'an 'Asim",
  "ورش عن نافع": "Warsh 'an Nafi'",
  "قالون عن نافع": "Qalun 'an Nafi'",
  "الدوري عن أبي عمرو": "Al-Duri 'an Abi 'Amr",
  "السوسي عن أبي عمرو": "Al-Susi 'an Abi 'Amr",
  "شعبة عن عاصم": "Shu'bah 'an 'Asim",
  "خلف عن حمزة": "Khalaf 'an Hamzah",
  "البزي عن ابن كثير": "Al-Bazzi 'an Ibn Kathir",
  "قنبل عن ابن كثير": "Qunbul 'an Ibn Kathir",
  "الدوري عن الكسائي": "Al-Duri 'an Al-Kisa'i",
  "ابن ذكوان عن ابن عامر": "Ibn Dhakwan 'an Ibn 'Amir",
  "هشام عن ابن عامر": "Hisham 'an Ibn 'Amir",
};

function classifyStyle(moshafType: number, name: string): {
  styleId: RecitationStyleId;
  styleAr: string;
  styleEn: string;
} {
  const n = name.toLowerCase();
  if (moshafType === 12 || moshafType === 52 || moshafType === 132 || moshafType === 152 || /المجود|مجود|mujawwad/.test(n)) {
    return { styleId: "mujawwad", styleAr: "المصحف المجود", styleEn: "Mujawwad" };
  }
  if (moshafType === 13 || /المعلم|معلم|muallim/.test(n)) {
    return { styleId: "muallim", styleAr: "المصحف المعلم", styleEn: "Muallim (Teaching)" };
  }
  if (moshafType === 120 || /1387|1967|تسجيل عام|نادرة/.test(n)) {
    return { styleId: "historic", styleAr: "تسجيل تاريخي نادر", styleEn: "Historic Recording" };
  }
  if (/مرتل|murattal/.test(n) || moshafType % 10 === 1 || moshafType === 14) {
    return { styleId: "murattal", styleAr: "مرتل", styleEn: "Murattal" };
  }
  return { styleId: "other", styleAr: "تلاوة متميزة", styleEn: "Special Recitation" };
}

function parseSurahList(rawList?: string): number[] {
  if (!rawList) return [];
  const nums = rawList
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 114);
  return Array.from(new Set(nums)).sort((a, b) => a - b);
}

function ensureTrailingSlash(url: string): string {
  const clean = url.trim();
  return clean.endsWith("/") ? clean : `${clean}/`;
}

function buildBaselineSnapshot(): ReciterCatalogSnapshot {
  const fullList = Array.from({ length: 114 }, (_, i) => i + 1);
  const reciters: CatalogReciter[] = VERIFIED_RECITERS.map((r) => ({
    slug: r.slug,
    mp3quranId: r.id,
    nameAr: r.nameAr,
    nameEn: r.nameEn,
    normalizedAr: normalizeArabicText(r.nameAr),
    normalizedEn: r.nameEn.toLowerCase(),
    letter: getArabicAlphabetGroup(r.nameAr),
    moshafs: [
      {
        moshafId: `mp3q-${r.id}-baseline`,
        provider: "verified_baseline",
        rawReciterId: r.id,
        rawMoshafId: r.id,
        nameAr: r.rewayahAr,
        nameEn: r.rewayahEn,
        rewayahId: 1,
        rewayahAr: "حفص عن عاصم",
        rewayahEn: "Hafs 'an 'Asim",
        styleId: "murattal",
        styleAr: "مرتل",
        styleEn: "Murattal",
        serverUrl: r.server,
        surahTotal: r.surahTotal,
        availableSurahs: fullList,
      },
    ],
    riwayatIds: [1],
    totalSurahsMax: r.surahTotal,
  }));

  return {
    reciters,
    riwayat: [{ id: 1, nameAr: "حفص عن عاصم", nameEn: "Hafs 'an 'Asim" }],
    stats: {
      mp3quranReciters: 0,
      qdcChapterReciters: 0,
      totalReciters: reciters.length,
      totalMoshafVariants: reciters.length,
      riwayatCount: 1,
      syncedAt: new Date().toISOString(),
      sourceStatus: {
        mp3quran: "unavailable",
        qdc: "unavailable",
        supabaseCache: "unavailable",
      },
      isStaleFallback: true,
    },
  };
}

async function fetchJsonWithTimeout<T>(url: string, timeoutMs = 12000): Promise<T> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return (await res.json()) as T;
}

async function persistCatalogToSupabase(snapshot: ReciterCatalogSnapshot): Promise<void> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  try {
    if (snapshot.riwayat.length > 0) {
      await supabase.from("quran_riwayat").upsert(
        snapshot.riwayat.map((rw) => ({
          id: rw.id,
          name_ar: rw.nameAr,
          name_en: rw.nameEn,
          updated_at: snapshot.stats.syncedAt,
        })),
        { onConflict: "id" }
      );
    }

    const chunkSize = 80;
    for (let i = 0; i < snapshot.reciters.length; i += chunkSize) {
      const batch = snapshot.reciters.slice(i, i + chunkSize).map((r) => ({
        slug: r.slug,
        mp3quran_id: r.mp3quranId ?? null,
        qdc_id: r.qdcId ?? null,
        name_ar: r.nameAr,
        name_en: r.nameEn,
        normalized_ar: r.normalizedAr,
        normalized_en: r.normalizedEn,
        letter: r.letter,
        source_updated_at: r.updatedAt ?? null,
        moshafs: r.moshafs,
        riwayat_ids: r.riwayatIds,
        total_surahs_max: r.totalSurahsMax,
        is_active: true,
        synced_at: snapshot.stats.syncedAt,
      }));

      await supabase.from("quran_reciters_catalog").upsert(batch, {
        onConflict: "slug",
      });
    }

    await supabase.from("catalog_sync_runs").insert({
      provider: "mp3quran_v3+quran_com_v4",
      status:
        snapshot.stats.sourceStatus.mp3quran === "ok" &&
        snapshot.stats.sourceStatus.qdc === "ok"
          ? "ok"
          : "partial",
      reciters_count: snapshot.stats.totalReciters,
      moshaf_count: snapshot.stats.totalMoshafVariants,
      synced_at: snapshot.stats.syncedAt,
    });
  } catch {
    // Catalog persistence should never crash page rendering
  }
}

async function loadCatalogFromSupabase(): Promise<ReciterCatalogSnapshot | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  try {
    const [{ data: riwayatRows }, { data: reciterRows }] = await Promise.all([
      supabase.from("quran_riwayat").select("*").order("id", { ascending: true }),
      supabase
        .from("quran_reciters_catalog")
        .select("*")
        .eq("is_active", true)
        .order("name_ar", { ascending: true }),
    ]);

    if (!reciterRows || reciterRows.length < 20) return null;

    const reciters: CatalogReciter[] = reciterRows.map((row) => ({
      slug: row.slug,
      mp3quranId: row.mp3quran_id ?? undefined,
      qdcId: row.qdc_id ?? undefined,
      nameAr: row.name_ar,
      nameEn: row.name_en,
      normalizedAr: row.normalized_ar,
      normalizedEn: row.normalized_en,
      letter: row.letter,
      updatedAt: row.source_updated_at ?? undefined,
      moshafs: Array.isArray(row.moshafs) ? (row.moshafs as ReciterMoshafVariant[]) : [],
      riwayatIds: Array.isArray(row.riwayat_ids) ? (row.riwayat_ids as number[]) : [],
      totalSurahsMax: row.total_surahs_max ?? 0,
    }));

    const riwayat: CatalogRiwayah[] = (riwayatRows || []).map((r) => ({
      id: r.id,
      nameAr: r.name_ar,
      nameEn: r.name_en,
    }));

    const totalVariants = reciters.reduce((acc, r) => acc + r.moshafs.length, 0);
    return {
      reciters,
      riwayat,
      stats: {
        mp3quranReciters: reciters.filter((r) => Boolean(r.mp3quranId)).length,
        qdcChapterReciters: reciters.filter((r) => Boolean(r.qdcId)).length,
        totalReciters: reciters.length,
        totalMoshafVariants: totalVariants,
        riwayatCount: riwayat.length,
        syncedAt: reciterRows[0]?.synced_at || new Date().toISOString(),
        sourceStatus: {
          mp3quran: "cached",
          qdc: "cached",
          supabaseCache: "hit",
        },
      },
    };
  } catch {
    return null;
  }
}

export async function syncAndLoadReciterCatalog(options?: {
  forceRefresh?: boolean;
}): Promise<ReciterCatalogSnapshot> {
  const forceRefresh = Boolean(options?.forceRefresh);
  const now = Date.now();

  if (
    !forceRefresh &&
    globalThis.__waslReciterCatalogCache &&
    globalThis.__waslReciterCatalogCache.expiresAt > now
  ) {
    return globalThis.__waslReciterCatalogCache.snapshot;
  }

  let mp3Status: "ok" | "cached" | "unavailable" = "unavailable";
  let qdcStatus: "ok" | "cached" | "unavailable" = "unavailable";
  let mp3ArReciters: Mp3QuranRawReciter[] = [];
  let mp3EnReciters: Mp3QuranRawReciter[] = [];
  let mp3ArRiwayat: Mp3QuranRawRiwayah[] = [];
  let mp3EnRiwayat: Mp3QuranRawRiwayah[] = [];
  let qdcReciters: QComRawChapterReciter[] = [];

  try {
    const [arRec, enRec, arRiw, enRiw] = await Promise.all([
      fetchJsonWithTimeout<{ reciters?: Mp3QuranRawReciter[] }>(
        `${MP3QURAN_API_BASE}/reciters?language=ar`
      ),
      fetchJsonWithTimeout<{ reciters?: Mp3QuranRawReciter[] }>(
        `${MP3QURAN_API_BASE}/reciters?language=eng`
      ),
      fetchJsonWithTimeout<{ riwayat?: Mp3QuranRawRiwayah[] }>(
        `${MP3QURAN_API_BASE}/riwayat?language=ar`
      ),
      fetchJsonWithTimeout<{ riwayat?: Mp3QuranRawRiwayah[] }>(
        `${MP3QURAN_API_BASE}/riwayat?language=eng`
      ),
    ]);
    mp3ArReciters = arRec.reciters || [];
    mp3EnReciters = enRec.reciters || [];
    mp3ArRiwayat = arRiw.riwayat || [];
    mp3EnRiwayat = enRiw.riwayat || [];
    if (mp3ArReciters.length > 0) {
      mp3Status = "ok";
    }
  } catch {
    mp3Status = "unavailable";
  }

  try {
    const qdcPayload = await fetchJsonWithTimeout<{ reciters?: QComRawChapterReciter[] }>(
      `${QURAN_COM_API_BASE}/resources/chapter_reciters?language=ar`
    );
    qdcReciters = qdcPayload.reciters || [];
    if (qdcReciters.length > 0) {
      qdcStatus = "ok";
    }
  } catch {
    qdcStatus = "unavailable";
  }

  // Fallback to Supabase cached catalog if primary upstream fails completely
  if (mp3ArReciters.length === 0 && qdcReciters.length === 0) {
    const supaCached = await loadCatalogFromSupabase();
    if (supaCached) {
      const staleSnapshot: ReciterCatalogSnapshot = {
        ...supaCached,
        stats: {
          ...supaCached.stats,
          sourceStatus: {
            mp3quran: "unavailable",
            qdc: "unavailable",
            supabaseCache: "hit",
          },
          isStaleFallback: true,
        },
      };
      globalThis.__waslReciterCatalogCache = {
        snapshot: staleSnapshot,
        expiresAt: now + 10 * 60 * 1000,
      };
      return staleSnapshot;
    }

    return buildBaselineSnapshot();
  }

  // Map Riwayat dictionary
  const enRiwayatMap = new Map<number, string>();
  for (const r of mp3EnRiwayat) {
    enRiwayatMap.set(r.id, r.name.trim());
  }
  const riwayatMap = new Map<number, CatalogRiwayah>();
  for (const r of mp3ArRiwayat) {
    const nameAr = r.name.trim();
    const nameEn =
      enRiwayatMap.get(r.id) || ARABIC_KNOWN_RIWAYAH_ENGLISH[nameAr] || nameAr;
    riwayatMap.set(r.id, { id: r.id, nameAr, nameEn });
  }
  if (!riwayatMap.has(1)) {
    riwayatMap.set(1, { id: 1, nameAr: "حفص عن عاصم", nameEn: "Hafs 'an 'Asim" });
  }

  // Map English names & moshaf names from MP3Quran English feed
  const enReciterMap = new Map<number, Mp3QuranRawReciter>();
  for (const r of mp3EnReciters) {
    enReciterMap.set(r.id, r);
  }

  const catalogBySlug = new Map<string, CatalogReciter>();
  const slugCollisionGuard = new Set<string>();

  for (const arRec of mp3ArReciters) {
    const enRec = enReciterMap.get(arRec.id);
    const nameAr = arRec.name.trim();
    const nameEn = enRec?.name?.trim() || nameAr;
    let slug = slugifyReciterName(nameEn, arRec.id);
    if (slugCollisionGuard.has(slug)) {
      slug = `${slug}-${arRec.id}`;
    }
    slugCollisionGuard.add(slug);

    const enMoshafMap = new Map<number, Mp3QuranRawMoshaf>();
    for (const em of enRec?.moshaf || []) {
      enMoshafMap.set(em.id, em);
    }

    const variants: ReciterMoshafVariant[] = [];
    const seenVariantIds = new Set<string>();
    const riwayatIdsSet = new Set<number>();

    for (const m of arRec.moshaf || []) {
      if (!m.server) continue;
      const availableSurahs = parseSurahList(m.surah_list);
      if (availableSurahs.length === 0) continue;

      const rewayahId = typeof m.rewaya_id === "number" ? m.rewaya_id : 1;
      const riwayahObj = riwayatMap.get(rewayahId) || {
        id: rewayahId,
        nameAr: m.name.split("-")[0]?.trim() || "حفص عن عاصم",
        nameEn: "Hafs 'an 'Asim",
      };

      const style = classifyStyle(m.moshaf_type, m.name);
      const enVariant = enMoshafMap.get(m.id);
      const variantKey = `mp3q-${arRec.id}-${m.id}`;
      if (seenVariantIds.has(variantKey)) continue;
      seenVariantIds.add(variantKey);

      riwayatIdsSet.add(rewayahId);
      variants.push({
        moshafId: variantKey,
        provider: "mp3quran_v3",
        rawReciterId: arRec.id,
        rawMoshafId: m.id,
        nameAr: m.name.trim(),
        nameEn: enVariant?.name?.trim() || `${riwayahObj.nameEn} — ${style.styleEn}`,
        rewayahId,
        rewayahAr: riwayahObj.nameAr,
        rewayahEn: riwayahObj.nameEn,
        styleId: style.styleId,
        styleAr: style.styleAr,
        styleEn: style.styleEn,
        serverUrl: ensureTrailingSlash(m.server),
        surahTotal: availableSurahs.length,
        availableSurahs,
        updatedAt: arRec.date,
      });
    }

    if (variants.length === 0) continue;

    catalogBySlug.set(slug, {
      slug,
      mp3quranId: arRec.id,
      nameAr,
      nameEn,
      normalizedAr: normalizeArabicText(nameAr),
      normalizedEn: nameEn.toLowerCase(),
      letter: getArabicAlphabetGroup(nameAr, arRec.letter),
      updatedAt: arRec.date,
      moshafs: variants,
      riwayatIds: Array.from(riwayatIdsSet),
      totalSurahsMax: Math.max(...variants.map((v) => v.surahTotal)),
    });
  }

  // Merge Quran.com API v4 complete-chapter reciters without erasing existing variants
  const all114Surahs = Array.from({ length: 114 }, (_, i) => i + 1);
  for (const qRec of qdcReciters) {
    const arName = qRec.translated_name?.language_name === "arabic"
      ? qRec.translated_name.name || qRec.name
      : qRec.name;
    const enName = qRec.name;
    const normQAr = normalizeArabicText(arName);
    const normQEn = enName.toLowerCase();

    // Try matching existing MP3Quran reciter by normalized Arabic or English token similarity
    let matchedReciter: CatalogReciter | undefined;
    for (const existing of catalogBySlug.values()) {
      if (
        existing.normalizedEn === normQEn ||
        existing.normalizedAr === normQAr ||
        (normQAr.length > 6 && existing.normalizedAr.includes(normQAr)) ||
        (normQEn.length > 6 && existing.normalizedEn.includes(normQEn))
      ) {
        matchedReciter = existing;
        break;
      }
    }

    const qiratRaw = qRec.qirat?.name?.toLowerCase() || "hafs";
    const styleRaw = qRec.style?.name?.toLowerCase() || "murattal";
    const styleId: RecitationStyleId = styleRaw.includes("mujawwad")
      ? "mujawwad"
      : styleRaw.includes("muallim")
        ? "muallim"
        : "murattal";
    const styleAr =
      styleId === "mujawwad"
        ? "المصحف المجود"
        : styleId === "muallim"
          ? "المصحف المعلم"
          : "مرتل";
    const rewayahId = qiratRaw.includes("warsh")
      ? 2
      : qiratRaw.includes("qalun")
        ? 5
        : 1;
    const rewayahObj = riwayatMap.get(rewayahId) || {
      id: 1,
      nameAr: "حفص عن عاصم",
      nameEn: "Hafs 'an 'Asim",
    };

    const qdcVariant: ReciterMoshafVariant = {
      moshafId: `qdc-${qRec.id}`,
      provider: "quran_com_v4",
      rawReciterId: qRec.id,
      rawMoshafId: qRec.id,
      nameAr: `${rewayahObj.nameAr} - ${styleAr} (Quran.com)`,
      nameEn: `${rewayahObj.nameEn} — ${qRec.style?.name || "Murattal"} (Quran.com)`,
      rewayahId,
      rewayahAr: rewayahObj.nameAr,
      rewayahEn: rewayahObj.nameEn,
      styleId,
      styleAr,
      styleEn: qRec.style?.name || "Murattal",
      serverUrl: `${QURAN_COM_API_BASE}/chapter_recitations/${qRec.id}`,
      surahTotal: 114,
      availableSurahs: all114Surahs,
      hasVerseTiming: QDC_TIMESTAMP_IDS.has(qRec.id),
      qdcId: qRec.id,
    };

    if (matchedReciter) {
      matchedReciter.qdcId = qRec.id;
      matchedReciter.moshafs.push(qdcVariant);
      if (!matchedReciter.riwayatIds.includes(rewayahId)) {
        matchedReciter.riwayatIds.push(rewayahId);
      }
      matchedReciter.totalSurahsMax = Math.max(matchedReciter.totalSurahsMax, 114);
    } else {
      const slug = `qdc-${slugifyReciterName(enName, qRec.id)}`;
      catalogBySlug.set(slug, {
        slug,
        qdcId: qRec.id,
        nameAr: arName,
        nameEn: enName,
        normalizedAr: normQAr,
        normalizedEn: normQEn,
        letter: getArabicAlphabetGroup(arName),
        moshafs: [qdcVariant],
        riwayatIds: [rewayahId],
        totalSurahsMax: 114,
      });
    }
  }

  const reciters = Array.from(catalogBySlug.values()).sort((a, b) =>
    a.nameAr.localeCompare(b.nameAr, "ar")
  );
  const riwayat = Array.from(riwayatMap.values()).sort((a, b) => a.id - b.id);
  const totalVariants = reciters.reduce((acc, r) => acc + r.moshafs.length, 0);

  const snapshot: ReciterCatalogSnapshot = {
    reciters,
    riwayat,
    stats: {
      mp3quranReciters: mp3ArReciters.length,
      qdcChapterReciters: qdcReciters.length,
      totalReciters: reciters.length,
      totalMoshafVariants: totalVariants,
      riwayatCount: riwayat.length,
      syncedAt: new Date().toISOString(),
      sourceStatus: {
        mp3quran: mp3Status,
        qdc: qdcStatus,
        supabaseCache: "bypass",
      },
    },
  };

  globalThis.__waslReciterCatalogCache = {
    snapshot,
    expiresAt: now + CACHE_TTL_MS,
  };

  // Non-blocking DB sync update in the background on server
  void persistCatalogToSupabase(snapshot);

  return snapshot;
}

export async function getCatalogReciterBySlug(
  slug: string
): Promise<CatalogReciter | null> {
  const snapshot = await syncAndLoadReciterCatalog();
  const normalizedSlug = decodeURIComponent(slug).trim().toLowerCase();
  return (
    snapshot.reciters.find((r) => r.slug.toLowerCase() === normalizedSlug) ||
    snapshot.reciters.find((r) => String(r.mp3quranId) === normalizedSlug) ||
    null
  );
}

import {
  buildDirectMp3UrlFromVariant,
  buildPlayerReciter,
  filterReciterCatalog,
} from "@/lib/audio/clientCatalog";

export { buildDirectMp3UrlFromVariant, buildPlayerReciter, filterReciterCatalog };

export async function resolveSurahAudioUrlForVariant(
  variant: ReciterMoshafVariant,
  surahNumber: number
): Promise<string | null> {
  if (!variant.availableSurahs.includes(surahNumber)) {
    return null;
  }
  const direct = buildDirectMp3UrlFromVariant(variant, surahNumber);
  if (direct) return direct;

  if (variant.provider === "quran_com_v4") {
    try {
      const data = await fetchJsonWithTimeout<{
        audio_file?: { audio_url?: string };
      }>(`${QURAN_COM_API_BASE}/chapter_recitations/${variant.rawReciterId}/${surahNumber}`);
      return data.audio_file?.audio_url || null;
    } catch {
      return null;
    }
  }
  return null;
}

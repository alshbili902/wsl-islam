import {
  CURATED_ARABIC_ASBAB_NUZUL,
  VERIFIED_TAFSIR_SOURCES,
} from "@/data/tafsir-sources";
import { SURAHS } from "@/data/surahs";
import type {
  AsbabNuzulEntry,
  TafsirSourceMeta,
  WordAnalysisItem,
} from "@/types/islamic";

export interface TafsirVersePayload {
  surahNumber: number;
  ayahNumber: number;
  verseKey: string;
  surahNameAr: string;
  surahNameEn: string;
  totalAyahsInSurah: number;
  juzNumber: number;
  pageNumber: number;
  hizbNumber: number;
  sajdahNumber: number | null;
  textUthmani: string;
  translationEn: string;
  translationSourceEn: string;
  source: TafsirSourceMeta;
  tafsirTextHtml: string;
  tafsirPlainText: string;
  tafsirAvailable: boolean;
  tafsirProviderNote: string;
  words: WordAnalysisItem[];
  arabicMorphologyText: string | null;
  arabicIrabText: string | null;
  gharibText: string | null;
  asbabEntries: AsbabNuzulEntry[];
}

function sanitizeTafsirHtml(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/href="javascript:[^"]*"/gi, 'href="#"');
}

function stripHtmlTags(raw: string): string {
  return raw
    .replace(/<\/(p|div|li|br|h\d)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchJsonSafe<T>(url: string, timeoutMs = 8000): Promise<T | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchTafsirForVerse(
  surahNumber: number,
  ayahNumber: number,
  sourceSlug: string = "ar-tafsir-ibn-kathir"
): Promise<TafsirVersePayload> {
  const surahMeta = SURAHS.find((s) => s.number === surahNumber) ?? SURAHS[0];
  const safeAyah = Math.max(1, Math.min(ayahNumber, surahMeta.numberOfAyahs));
  const verseKey = `${surahMeta.number}:${safeAyah}`;

  const sourceMeta =
    VERIFIED_TAFSIR_SOURCES.find((s) => s.slug === sourceSlug) ??
    VERIFIED_TAFSIR_SOURCES[0];

  const [
    verseData,
    tafsirPrimary,
    tafsirCdnFallback,
    morphologyData,
    irabData,
    gharibData,
    wahidiData,
  ] = await Promise.all([
    fetchJsonSafe<{
      verse?: {
        text_uthmani?: string;
        page_number?: number;
        juz_number?: number;
        hizb_number?: number;
        sajdah_number?: number | null;
        translations?: { text?: string }[];
        words?: {
          position: number;
          char_type_name?: string;
          text_uthmani?: string;
          line_number?: number;
          audio_url?: string | null;
          translation?: { text?: string } | null;
          transliteration?: { text?: string } | null;
        }[];
      };
    }>(
      `https://api.quran.com/api/v4/verses/by_key/${verseKey}?words=true&translations=20&word_fields=text_uthmani,transliteration,translation,line_number&fields=text_uthmani,page_number,juz_number,hizb_number,sajdah_number`
    ),
    fetchJsonSafe<{
      tafsir?: { text?: string; resource_name?: string };
    }>(
      `https://api.quran.com/api/v4/tafsirs/${sourceMeta.providerSourceId}/by_ayah/${verseKey}`
    ),
    fetchJsonSafe<{ text?: string }>(
      `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${sourceMeta.slug}/${surahMeta.number}/${safeAyah}.json`
    ),
    fetchJsonSafe<{ text?: string }>(
      `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/tahlil-kalimat-al-qur-an/${surahMeta.number}/${safeAyah}.json`
    ),
    fetchJsonSafe<{ text?: string }>(
      `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/al-i-rab-al-muyassar/${surahMeta.number}/${safeAyah}.json`
    ),
    fetchJsonSafe<{ text?: string }>(
      `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/asseraj-fi-bayan-gharib-alquran/${surahMeta.number}/${safeAyah}.json`
    ),
    fetchJsonSafe<{ text?: string }>(
      `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/en-asbab-al-nuzul-by-al-wahidi/${surahMeta.number}/${safeAyah}.json`
    ),
  ]);

  let rawTextUthmani = verseData?.verse?.text_uthmani?.trim() || "";
  let translationEn = stripHtmlTags(
    verseData?.verse?.translations?.[0]?.text || ""
  );
  let juzNumber = verseData?.verse?.juz_number ?? 1;
  let pageNumber = verseData?.verse?.page_number ?? 1;
  const hizbNumber = verseData?.verse?.hizb_number ?? 1;
  const sajdahNumber = verseData?.verse?.sajdah_number ?? null;

  // Fallback to Al-Quran Cloud if Quran.com verse lookup failed
  if (!rawTextUthmani) {
    const aqFallback = await fetchJsonSafe<{
      data?: { text?: string; page?: number; juz?: number }[];
    }>(
      `https://api.alquran.cloud/v1/ayah/${verseKey}/editions/quran-uthmani,en.sahih`
    );
    if (aqFallback?.data?.[0]?.text) {
      rawTextUthmani = aqFallback.data[0].text.trim();
      pageNumber = aqFallback.data[0].page ?? pageNumber;
      juzNumber = aqFallback.data[0].juz ?? juzNumber;
    }
    if (!translationEn && aqFallback?.data?.[1]?.text) {
      translationEn = aqFallback.data[1].text.trim();
    }
  }

  const rawTafsirHtml =
    tafsirPrimary?.tafsir?.text?.trim() ||
    tafsirCdnFallback?.text?.trim() ||
    "";

  const sanitizedHtml = rawTafsirHtml
    ? sanitizeTafsirHtml(rawTafsirHtml)
    : "";
  const tafsirPlainText = sanitizedHtml
    ? stripHtmlTags(sanitizedHtml)
    : "";

  const words: WordAnalysisItem[] = (verseData?.verse?.words || [])
    .filter((w) => w.char_type_name === "word")
    .map((w) => ({
      position: w.position,
      textUthmani: w.text_uthmani || "",
      transliteration: w.transliteration?.text ?? null,
      translationEn: w.translation?.text ?? null,
      audioUrl: w.audio_url
        ? w.audio_url.startsWith("http")
          ? w.audio_url
          : `https://audio.qurancdn.com/${w.audio_url}`
        : null,
      lineNumber: w.line_number,
    }));

  const asbabEntries: AsbabNuzulEntry[] = [
    ...(CURATED_ARABIC_ASBAB_NUZUL[verseKey] ?? []),
  ];

  if (wahidiData?.text?.trim()) {
    asbabEntries.push({
      sourceNameAr: "أسباب النزول — الإمام أبو الحسن علي بن أحمد الواحدي (الترجمة الإنجليزية)",
      sourceNameEn: "Asbab al-Nuzul — Imam al-Wahidi (d. 468 AH)",
      sourceUrl: "https://cdn.jsdelivr.net/gh/spa5k/tafsir_api",
      reference: `Al-Wahidi Asbab al-Nuzul (${verseKey})`,
      status: "attributed",
      statusLabelAr: "رواية منسوبة في كتاب أسباب النزول للواحدي",
      statusLabelEn: "Attributed in Classical Asbab Literature",
      language: "en",
      text: stripHtmlTags(wahidiData.text),
    });
  }

  return {
    surahNumber: surahMeta.number,
    ayahNumber: safeAyah,
    verseKey,
    surahNameAr: surahMeta.nameAr,
    surahNameEn: surahMeta.englishName,
    totalAyahsInSurah: surahMeta.numberOfAyahs,
    juzNumber,
    pageNumber,
    hizbNumber,
    sajdahNumber,
    textUthmani: rawTextUthmani,
    translationEn,
    translationSourceEn: "Saheeh International (via Quran.com v4)",
    source: sourceMeta,
    tafsirTextHtml: sanitizedHtml,
    tafsirPlainText,
    tafsirAvailable: Boolean(tafsirPlainText),
    tafsirProviderNote: sourceMeta.editionInfo,
    words,
    arabicMorphologyText: morphologyData?.text?.trim() || null,
    arabicIrabText: irabData?.text?.trim() || null,
    gharibText: gharibData?.text?.trim() || null,
    asbabEntries,
  };
}

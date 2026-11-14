import { matchesNormalizedQuery } from "@/lib/audio/normalize";
import type {
  CatalogReciter,
  RecitationStyleId,
  Reciter,
  ReciterMoshafVariant,
  ReciterProviderId,
} from "@/types/islamic";

function ensureTrailingSlash(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}

export const RECITATION_STYLE_OPTIONS: Array<{
  id: RecitationStyleId | "all";
  labelAr: string;
  labelEn: string;
}> = [
  { id: "all", labelAr: "جميع الأساليب", labelEn: "All Styles" },
  { id: "murattal", labelAr: "مرتل", labelEn: "Murattal" },
  { id: "mujawwad", labelAr: "مجود", labelEn: "Mujawwad" },
  { id: "muallim", labelAr: "المعلم", labelEn: "Teaching (Mu'allim)" },
  { id: "historic", labelAr: "الحدر / التاريخية", labelEn: "Historic / Rapid" },
  { id: "other", labelAr: "أساليب متنوعة", labelEn: "Other Styles" },
];

export const ARABIC_ALPHABET_LETTERS = [
  "أ",
  "ب",
  "ت",
  "ث",
  "ج",
  "ح",
  "خ",
  "د",
  "ذ",
  "ر",
  "ز",
  "س",
  "ش",
  "ص",
  "ض",
  "ط",
  "ظ",
  "ع",
  "غ",
  "ف",
  "ق",
  "ك",
  "ل",
  "م",
  "ن",
  "ه",
  "و",
  "ي",
];

/**
 * Converts a dynamically synced CatalogReciter + chosen Mushaf variant into a playable Reciter object.
 */
export function buildPlayerReciter(
  reciter: CatalogReciter,
  variant?: ReciterMoshafVariant
): Reciter {
  const active = variant || reciter.moshafs[0];
  return {
    id: active.rawReciterId,
    slug: reciter.slug,
    nameAr: reciter.nameAr,
    nameEn: reciter.nameEn,
    rewayahAr: active.nameAr,
    rewayahEn: active.nameEn,
    server: active.serverUrl,
    surahTotal: active.surahTotal,
    provider: active.provider,
    moshafId: active.moshafId,
    availableSurahs: active.availableSurahs,
    qdcId: active.qdcId,
    styleAr: active.styleAr,
    styleEn: active.styleEn,
  };
}

export function buildDirectMp3UrlFromVariant(
  variant: ReciterMoshafVariant,
  surahNumber: number
): string | null {
  if (!variant.availableSurahs.includes(surahNumber)) {
    return null;
  }
  if (variant.provider === "mp3quran_v3" || variant.provider === "verified_baseline") {
    const padded = String(surahNumber).padStart(3, "0");
    return `${ensureTrailingSlash(variant.serverUrl)}${padded}.mp3`;
  }
  return null;
}

export function filterReciterCatalog(
  reciters: CatalogReciter[],
  filters: {
    query?: string;
    letter?: string;
    riwayahId?: number | null;
    styleId?: RecitationStyleId | "all";
    surahNumber?: number | null;
    provider?: ReciterProviderId | "all";
    fullOnly?: boolean;
  }
): CatalogReciter[] {
  const q = (filters.query || "").trim();
  const letter = (filters.letter || "").trim();

  return reciters.filter((reciter) => {
    if (letter && letter !== "all" && reciter.letter !== letter) {
      return false;
    }

    if (q) {
      const moshafNames = reciter.moshafs
        .map((m) => `${m.nameAr} ${m.nameEn} ${m.rewayahAr} ${m.rewayahEn}`)
        .join(" ");
      const hay = `${reciter.nameAr} ${reciter.nameEn} ${moshafNames}`;
      if (!matchesNormalizedQuery(hay, q)) return false;
    }

    const matchingMoshaf = reciter.moshafs.some((m) => {
      if (filters.riwayahId && m.rewayahId !== filters.riwayahId) return false;
      if (filters.styleId && filters.styleId !== "all" && m.styleId !== filters.styleId)
        return false;
      if (filters.provider && filters.provider !== "all" && m.provider !== filters.provider)
        return false;
      if (filters.surahNumber && !m.availableSurahs.includes(filters.surahNumber))
        return false;
      if (filters.fullOnly && m.surahTotal < 114) return false;
      return true;
    });

    return matchingMoshaf;
  });
}

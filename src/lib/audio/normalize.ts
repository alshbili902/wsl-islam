/**
 * Arabic & English search normalization utilities for Reciters, Surahs, Riwayat, and Lectures.
 * Strips Arabic diacritics/tatweel and unifies alef/taa/yaa variants cleanly.
 */

const ARABIC_DIACRITICS_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/gu;

export function normalizeArabicText(input: string): string {
  return input
    .trim()
    .replace(ARABIC_DIACRITICS_REGEX, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function normalizeSearchQuery(input: string): string {
  return normalizeArabicText(input).replace(/[-_.,،؛:!؟()[\]]/g, " ").replace(/\s+/g, " ").trim();
}

export function getArabicAlphabetGroup(nameAr: string, apiLetter?: string): string {
  const source = (apiLetter || nameAr || "").trim();
  const firstChar = normalizeArabicText(source).charAt(0);
  if (!firstChar) return "أ";
  if (firstChar === "ا") return "أ";
  if (/[\u0621-\u064A]/.test(firstChar)) return firstChar;
  return "أ";
}

export function slugifyReciterName(nameEn: string, fallbackId: string | number): string {
  const cleaned = nameEn
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return cleaned || `reciter-${fallbackId}`;
}

export function matchesNormalizedQuery(haystack: string, query: string): boolean {
  const normQuery = normalizeSearchQuery(query);
  if (!normQuery) return true;
  const normHay = normalizeSearchQuery(haystack);
  const tokens = normQuery.split(" ").filter(Boolean);
  return tokens.every((t) => normHay.includes(t));
}

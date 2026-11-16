import {
  MUSHAF_CHAPTERS,
  MUSHAF_PAGE_INDEX,
  MUSHAF_TOTAL_PAGES,
} from "@/lib/api/mushaf";
import type { MushafPagePayload } from "@/types/islamic";

export interface MushafLineBlockWord {
  verseKey: string;
  surahNumber: number;
  ayahNumber: number;
  textUthmani: string;
  isEnd: boolean;
  sajdahNumber: number | null;
}

export interface MushafLineBlock {
  surahHeader?: (typeof MUSHAF_CHAPTERS)[number];
  bismillah?: boolean;
  words: MushafLineBlockWord[];
}

export function toArabicDigits(n: number): string {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)] ?? d);
}

/**
 * Looks up the verified Madinah Mushaf page (1..604) containing a given Surah & Ayah.
 */
export function findPageForVerse(surahNumber: number, ayahNumber: number): number {
  const entries = Object.values(MUSHAF_PAGE_INDEX);
  const matchingPage = entries.find((p) => {
    const startsBeforeOrHere =
      p.startSurah < surahNumber ||
      (p.startSurah === surahNumber && p.startAyah <= ayahNumber);
    const endsAfterOrHere =
      p.endSurah > surahNumber ||
      (p.endSurah === surahNumber && p.endAyah >= ayahNumber);
    return startsBeforeOrHere && endsAfterOrHere;
  });

  if (matchingPage) return matchingPage.page;
  const chapter = MUSHAF_CHAPTERS.find((c) => c.number === surahNumber);
  return Math.min(MUSHAF_TOTAL_PAGES, Math.max(1, chapter?.startPage ?? 1));
}

/**
 * Groups verified Uthmani word glyphs into authentic 15-line Madinah Mushaf lines.
 */
export function buildMushafLineBlocks(
  pageData: MushafPagePayload
): Array<[number, MushafLineBlock]> {
  const hasWords = pageData.verses.some((v) => v.words && v.words.length > 0);
  if (!hasWords) return [];

  const linesMap = new Map<number, MushafLineBlock>();

  for (const verse of pageData.verses) {
    const firstLine = verse.words[0]?.lineNumber ?? 1;
    if (verse.ayahNumber === 1) {
      const chapter = MUSHAF_CHAPTERS.find((c) => c.number === verse.surahNumber);
      const slot = linesMap.get(firstLine) ?? { words: [] };
      if (chapter && !slot.surahHeader) {
        slot.surahHeader = chapter;
        slot.bismillah = chapter.bismillahPre;
      }
      linesMap.set(firstLine, slot);
    }

    for (const word of verse.words) {
      const ln = word.lineNumber || 1;
      const slot = linesMap.get(ln) ?? { words: [] };
      slot.words.push({
        verseKey: verse.verseKey,
        surahNumber: verse.surahNumber,
        ayahNumber: verse.ayahNumber,
        textUthmani: word.textUthmani,
        isEnd: word.charType === "end",
        sajdahNumber: verse.sajdahNumber,
      });
      linesMap.set(ln, slot);
    }
  }

  return Array.from(linesMap.entries()).sort((a, b) => a[0] - b[0]);
}

export function formatHizbRubInfo(
  hizbNumber: number,
  rubElHizbNumber: number,
  locale: "ar" | "en"
): string {
  const quarterWithinHizb = ((rubElHizbNumber - 1) % 4) + 1;
  if (locale === "en") {
    const labels = ["1st Quarter", "Half", "3rd Quarter", "Full"];
    return `Hizb ${hizbNumber} (${labels[quarterWithinHizb - 1] || ""})`;
  }
  const arLabels = ["الربع الأول", "النصف", "الثلاثة أرباع", "الحزب"];
  return `الحزب ${toArabicDigits(hizbNumber)} • ${arLabels[quarterWithinHizb - 1] || ""}`;
}

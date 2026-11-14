import type { SurahMeta } from "@/types/islamic";
import surahsRaw from "./generated/surahs.json";

export const SURAHS: SurahMeta[] = surahsRaw as SurahMeta[];

export interface JuzMeta {
  juz: number;
  titleAr: string;
  titleEn: string;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

/**
 * Standard 30-Juz structure of the Madinah Mushaf for Personal Khatmah tracking.
 */
export const JUZ_LIST: JuzMeta[] = [
  { juz: 1, titleAr: "الجزء الأول (الم)", titleEn: "Juz 1 — Alif-Lam-Mim", startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141 },
  { juz: 2, titleAr: "الجزء الثاني (سيقول)", titleEn: "Juz 2 — Sayaqul", startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252 },
  { juz: 3, titleAr: "الجزء الثالث (تلك الرسل)", titleEn: "Juz 3 — Tilka ar-Rusul", startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92 },
  { juz: 4, titleAr: "الجزء الرابع (لن تنالوا)", titleEn: "Juz 4 — Lan Tanalu", startSurah: 3, startAyah: 93, endSurah: 4, endAyah: 23 },
  { juz: 5, titleAr: "الجزء الخامس (والمحصنات)", titleEn: "Juz 5 — Wal-Muhsanat", startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147 },
  { juz: 6, titleAr: "الجزء السادس (لا يحب الله)", titleEn: "Juz 6 — La Yuhibbullahu", startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 81 },
  { juz: 7, titleAr: "الجزء السابع (وإذا سمعوا)", titleEn: "Juz 7 — Wa Idha Sami'u", startSurah: 5, startAyah: 82, endSurah: 6, endAyah: 110 },
  { juz: 8, titleAr: "الجزء الثامن (ولو أننا)", titleEn: "Juz 8 — Wa Law Annana", startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87 },
  { juz: 9, titleAr: "الجزء التاسع (قال الملأ)", titleEn: "Juz 9 — Qala al-Mala'", startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40 },
  { juz: 10, titleAr: "الجزء العاشر (واعلموا)", titleEn: "Juz 10 — Wa'lamu", startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92 },
  { juz: 11, titleAr: "الجزء الحادي عشر (يعتذرون)", titleEn: "Juz 11 — Ya'tadhirun", startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5 },
  { juz: 12, titleAr: "الجزء الثاني عشر (وما من دابة)", titleEn: "Juz 12 — Wa Ma Min Dabbah", startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52 },
  { juz: 13, titleAr: "الجزء الثالث عشر (وما أبرئ)", titleEn: "Juz 13 — Wa Ma Ubarri'", startSurah: 12, startAyah: 53, endSurah: 14, endAyah: 52 },
  { juz: 14, titleAr: "الجزء الرابع عشر (ربما)", titleEn: "Juz 14 — Rubama", startSurah: 15, startAyah: 1, endSurah: 16, endAyah: 128 },
  { juz: 15, titleAr: "الجزء الخامس عشر (سبحان الذي)", titleEn: "Juz 15 — Subhanalladhi", startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74 },
  { juz: 16, titleAr: "الجزء السادس عشر (قال ألم)", titleEn: "Juz 16 — Qala Alam", startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135 },
  { juz: 17, titleAr: "الجزء السابع عشر (اقترب للناس)", titleEn: "Juz 17 — Iqtaraba lin-Nas", startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78 },
  { juz: 18, titleAr: "الجزء الثامن عشر (قد أفلح)", titleEn: "Juz 18 — Qad Aflaha", startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20 },
  { juz: 19, titleAr: "الجزء التاسع عشر (وقال الذين)", titleEn: "Juz 19 — Wa Qala alladhina", startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55 },
  { juz: 20, titleAr: "الجزء العشرون (أمن خلق)", titleEn: "Juz 20 — Amman Khalaqa", startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45 },
  { juz: 21, titleAr: "الجزء الحادي والعشرون (اتل ما أوحي)", titleEn: "Juz 21 — Utlu Ma Uhiya", startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30 },
  { juz: 22, titleAr: "الجزء الثاني والعشرون (ومن يقنت)", titleEn: "Juz 22 — Wa Man Yaqnut", startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27 },
  { juz: 23, titleAr: "الجزء الثالث والعشرون (وما لي)", titleEn: "Juz 23 — Wa Ma Li", startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31 },
  { juz: 24, titleAr: "الجزء الرابع والعشرون (فمن أظلم)", titleEn: "Juz 24 — Faman Azlam", startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46 },
  { juz: 25, titleAr: "الجزء الخامس والعشرون (إليه يرد)", titleEn: "Juz 25 — Ilayhi Yuraddu", startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37 },
  { juz: 26, titleAr: "الجزء السادس والعشرون (حم)", titleEn: "Juz 26 — Ha-Mim", startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30 },
  { juz: 27, titleAr: "الجزء السابع والعشرون (قال فما خطبكم)", titleEn: "Juz 27 — Qala Fama Khatbukum", startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29 },
  { juz: 28, titleAr: "الجزء الثامن والعشرون (قد سمع)", titleEn: "Juz 28 — Qad Sami'a", startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 12 },
  { juz: 29, titleAr: "الجزء التاسع والعشرون (تبارك الذي)", titleEn: "Juz 29 — Tabaraka", startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50 },
  { juz: 30, titleAr: "الجزء الثلاثون (عمّ يتساءلون)", titleEn: "Juz 30 — 'Amma", startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6 },
];

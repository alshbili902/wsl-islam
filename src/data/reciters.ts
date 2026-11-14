import type { Reciter } from "@/types/islamic";

/**
 * Verified full-Quran (114 surahs, Hafs 'an 'Asim) reciters sourced from
 * official MP3Quran.net API v3 (https://mp3quran.net/api/v3/reciters).
 */
export const VERIFIED_RECITERS: Reciter[] = [
  {
    id: 123,
    slug: "mishary-alafasy",
    nameAr: "مشاري راشد العفاسي",
    nameEn: "Mishary Rashid Alafasy",
    rewayahAr: "حفص عن عاصم - مرتل",
    rewayahEn: "Hafs 'an 'Asim — Murattal",
    server: "https://cdn.mp3quran.net/audio/mishary-alafasy/r1/",
    surahTotal: 114,
  },
  {
    id: 54,
    slug: "abdulrahman-sudais",
    nameAr: "عبدالرحمن السديس",
    nameEn: "Abdulrahman Al-Sudais",
    rewayahAr: "حفص عن عاصم - مرتل",
    rewayahEn: "Hafs 'an 'Asim — Murattal",
    server: "https://cdn.mp3quran.net/audio/abdulrahman-sudais/r1/",
    surahTotal: 114,
  },
  {
    id: 92,
    slug: "yasser-dosari",
    nameAr: "ياسر الدوسري",
    nameEn: "Yasser Al-Dosari",
    rewayahAr: "حفص عن عاصم - مرتل",
    rewayahEn: "Hafs 'an 'Asim — Murattal",
    server: "https://cdn.mp3quran.net/audio/yasser-dosari/r1/",
    surahTotal: 114,
  },
  {
    id: 102,
    slug: "maher-muaiqly",
    nameAr: "ماهر المعيقلي",
    nameEn: "Maher Al-Muaiqly",
    rewayahAr: "حفص عن عاصم - مرتل",
    rewayahEn: "Hafs 'an 'Asim — Murattal",
    server: "https://cdn.mp3quran.net/audio/maher-muaiqly/r1/",
    surahTotal: 114,
  },
  {
    id: 31,
    slug: "saud-shuraim",
    nameAr: "سعود الشريم",
    nameEn: "Saud Al-Shuraim",
    rewayahAr: "حفص عن عاصم - مرتل",
    rewayahEn: "Hafs 'an 'Asim — Murattal",
    server: "https://cdn.mp3quran.net/audio/saud-shuraim/r1/",
    surahTotal: 114,
  },
  {
    id: 86,
    slug: "nasser-qatami",
    nameAr: "ناصر القطامي",
    nameEn: "Nasser Al-Qatami",
    rewayahAr: "حفص عن عاصم - مرتل",
    rewayahEn: "Hafs 'an 'Asim — Murattal",
    server: "https://cdn.mp3quran.net/audio/nasser-qatami/r1/",
    surahTotal: 114,
  },
  {
    id: 118,
    slug: "mahmoud-husary",
    nameAr: "محمود خليل الحصري",
    nameEn: "Mahmoud Khalil Al-Husary",
    rewayahAr: "حفص عن عاصم - مرتل",
    rewayahEn: "Hafs 'an 'Asim — Murattal",
    server: "https://cdn.mp3quran.net/audio/mahmoud-husary/r1/",
    surahTotal: 114,
  },
  {
    id: 112,
    slug: "muhammad-minshawi",
    nameAr: "محمد صديق المنشاوي",
    nameEn: "Muhammad Siddiq Al-Minshawi",
    rewayahAr: "حفص عن عاصم - مرتل",
    rewayahEn: "Hafs 'an 'Asim — Murattal",
    server: "https://cdn.mp3quran.net/audio/muhammad-minshawi/r1/",
    surahTotal: 114,
  },
  {
    id: 51,
    slug: "abdulbasit-abdulsamad",
    nameAr: "عبدالباسط عبدالصمد",
    nameEn: "Abdulbasit Abdulsamad",
    rewayahAr: "حفص عن عاصم - مرتل",
    rewayahEn: "Hafs 'an 'Asim — Murattal",
    server: "https://cdn.mp3quran.net/audio/abdulbasit-abdulsamad/r3/",
    surahTotal: 114,
  },
];

export function buildSurahAudioUrl(reciter: Reciter, surahNumber: number): string {
  const padded = String(surahNumber).padStart(3, "0");
  return `${reciter.server}${padded}.mp3`;
}

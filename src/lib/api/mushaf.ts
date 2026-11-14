import mushafMetaRaw from "@/data/generated/mushaf-meta.json";
import type {
  MushafPagePayload,
  MushafPageVerse,
  MushafVerseWord,
} from "@/types/islamic";

export interface MushafChapterMeta {
  number: number;
  nameAr: string;
  nameSimple: string;
  bismillahPre: boolean;
  startPage: number;
  endPage: number;
  versesCount: number;
}

export interface MushafJuzMeta {
  juzNumber: number;
  firstSurah: number;
  firstAyah: number;
  versesCount: number;
  startPage: number;
}

export interface MushafPageIndexItem {
  page: number;
  juz: number;
  hizbQuarter: number;
  startSurah: number;
  startSurahAr: string;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  ayahCount: number;
}

const metaJson = mushafMetaRaw as {
  totalPages: number;
  chapters: MushafChapterMeta[];
  juzs: MushafJuzMeta[];
  pages: Record<string, MushafPageIndexItem>;
};

export const MUSHAF_TOTAL_PAGES = metaJson.totalPages || 604;
export const MUSHAF_CHAPTERS = metaJson.chapters;
export const MUSHAF_JUZS = metaJson.juzs;
export const MUSHAF_PAGE_INDEX = metaJson.pages;

export function getPageIndexInfo(page: number): MushafPageIndexItem | null {
  const safe = Math.min(MUSHAF_TOTAL_PAGES, Math.max(1, Math.trunc(page)));
  return MUSHAF_PAGE_INDEX[String(safe)] ?? null;
}

export interface VerifiedTimestampReciter {
  qdcId: number;
  slug: string;
  nameAr: string;
  nameEn: string;
}

export const MUSHAF_TIMESTAMP_RECITERS: VerifiedTimestampReciter[] = [
  {
    qdcId: 7,
    slug: "mishary-alafasy",
    nameAr: "مشاري راشد العفاسي",
    nameEn: "Mishary Rashid Alafasy",
  },
  {
    qdcId: 6,
    slug: "mahmoud-husary",
    nameAr: "محمود خليل الحصري",
    nameEn: "Mahmoud Khalil Al-Husary",
  },
  {
    qdcId: 8,
    slug: "muhammad-minshawi",
    nameAr: "محمد صديق المنشاوي (مجود)",
    nameEn: "Muhammad Siddiq Al-Minshawi",
  },
  {
    qdcId: 2,
    slug: "abdulbasit-abdulsamad",
    nameAr: "عبدالباسط عبدالصمد (مرتل)",
    nameEn: "Abdulbasit Abdulsamad",
  },
];

function stripFootnotes(raw: string): string {
  return raw
    .replace(/<sup[^>]*>.*?<\/sup>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export async function fetchMushafPage(
  pageNumber: number
): Promise<MushafPagePayload> {
  const safePage = Math.min(604, Math.max(1, Math.trunc(pageNumber)));

  try {
    const url = `https://api.quran.com/api/v4/verses/by_page/${safePage}?words=true&translations=20&per_page=50&word_fields=text_uthmani,line_number,page_number,transliteration,translation&fields=text_uthmani,page_number,hizb_number,juz_number,rub_el_hizb_number,sajdah_number`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const json = (await res.json()) as {
        verses?: {
          verse_key: string;
          text_uthmani: string;
          page_number: number;
          juz_number: number;
          hizb_number: number;
          rub_el_hizb_number: number;
          sajdah_number: number | null;
          translations?: { text?: string }[];
          words?: {
            id: number;
            position: number;
            char_type_name?: string;
            text_uthmani?: string;
            line_number?: number;
            page_number?: number;
            audio_url?: string | null;
            translation?: { text?: string } | null;
            transliteration?: { text?: string } | null;
          }[];
        }[];
      };

      if (Array.isArray(json.verses) && json.verses.length > 0) {
        const verses: MushafPageVerse[] = json.verses.map((v) => {
          const [sStr, aStr] = v.verse_key.split(":");
          const words: MushafVerseWord[] = (v.words || []).map((w) => ({
            id: w.id,
            position: w.position,
            charType: w.char_type_name === "end" ? "end" : "word",
            textUthmani: w.text_uthmani || "",
            lineNumber: w.line_number ?? 1,
            pageNumber: w.page_number ?? safePage,
            translationEn: w.translation?.text ?? null,
            transliteration: w.transliteration?.text ?? null,
            audioUrl: w.audio_url
              ? `https://audio.qurancdn.com/${w.audio_url}`
              : null,
          }));

          return {
            verseKey: v.verse_key,
            surahNumber: Number(sStr),
            ayahNumber: Number(aStr),
            textUthmani: v.text_uthmani,
            translationEn: stripFootnotes(v.translations?.[0]?.text || ""),
            pageNumber: v.page_number,
            juzNumber: v.juz_number,
            hizbNumber: v.hizb_number,
            rubElHizbNumber: v.rub_el_hizb_number,
            sajdahNumber: v.sajdah_number ?? null,
            words,
          };
        });

        const first = verses[0];
        return {
          pageNumber: safePage,
          totalPages: 604,
          juzNumber: first.juzNumber,
          hizbNumber: first.hizbNumber,
          rubElHizbNumber: first.rubElHizbNumber,
          verses,
          sourceName:
            "Quran.com API v4 — Madinah Mushaf 15-Line Uthmani Layout & Saheeh International",
          sourceUrl: "https://api.quran.com/api/v4",
        };
      }
    }
  } catch {
    // Fall back to Al-Quran Cloud verified Uthmani page data below
  }

  // Verified Fallback: Al-Quran Cloud Uthmani Page API
  const [arRes, enRes] = await Promise.all([
    fetch(`https://api.alquran.cloud/v1/page/${safePage}/quran-uthmani`, {
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 86400 },
    }),
    fetch(`https://api.alquran.cloud/v1/page/${safePage}/en.sahih`, {
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 86400 },
    }),
  ]);

  if (!arRes.ok) {
    throw new Error("Unable to load Mushaf page from verified providers");
  }

  const arJson = (await arRes.json()) as {
    data?: {
      ayahs?: {
        numberInSurah: number;
        text: string;
        juz: number;
        hizbQuarter: number;
        page: number;
        sajda: boolean | { id?: number };
        surah: { number: number };
      }[];
    };
  };
  const enJson = enRes.ok
    ? ((await enRes.json()) as {
        data?: { ayahs?: { text: string }[] };
      })
    : null;

  const ayahs = arJson.data?.ayahs ?? [];
  if (ayahs.length === 0) {
    throw new Error("Empty Mushaf page returned");
  }

  const verses: MushafPageVerse[] = ayahs.map((a, idx) => {
    const hizbNumber = Math.ceil(a.hizbQuarter / 4);
    const sajdahNumber =
      typeof a.sajda === "object"
        ? a.sajda.id ?? 1
        : a.sajda
          ? 1
          : null;

    return {
      verseKey: `${a.surah.number}:${a.numberInSurah}`,
      surahNumber: a.surah.number,
      ayahNumber: a.numberInSurah,
      textUthmani: a.text.replace(/^\uFEFF/, "").trim(),
      translationEn: enJson?.data?.ayahs?.[idx]?.text?.trim() ?? "",
      pageNumber: a.page,
      juzNumber: a.juz,
      hizbNumber,
      rubElHizbNumber: a.hizbQuarter,
      sajdahNumber,
      words: [],
    };
  });

  const first = verses[0];
  return {
    pageNumber: safePage,
    totalPages: 604,
    juzNumber: first.juzNumber,
    hizbNumber: first.hizbNumber,
    rubElHizbNumber: first.rubElHizbNumber,
    verses,
    sourceName: "Al-Quran Cloud — Uthmani Page Text & Saheeh International",
    sourceUrl: "https://alquran.cloud/api",
  };
}

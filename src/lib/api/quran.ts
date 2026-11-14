import type { AyahItem, SurahMeta } from "@/types/islamic";
import { SURAHS } from "@/data/surahs";

interface AlQuranEditionResponse {
  code: number;
  status: string;
  data: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: "Meccan" | "Medinan";
    numberOfAyahs: number;
    edition: {
      identifier: string;
    };
    ayahs: {
      number: number;
      text: string;
      numberInSurah: number;
      juz: number;
      page: number;
    }[];
  }[];
}

export interface SurahDetailPayload {
  surah: SurahMeta;
  ayahs: AyahItem[];
  source: string;
}

export async function fetchSurahDetail(
  surahNumber: number
): Promise<SurahDetailPayload> {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    throw new Error("Invalid surah number");
  }

  const meta = SURAHS.find((s) => s.number === surahNumber) ?? SURAHS[0];

  const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih,ar.muyassar`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(10000),
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`Al-Quran Cloud returned HTTP ${response.status}`);
  }

  const json = (await response.json()) as AlQuranEditionResponse;
  if (json.code !== 200 || !Array.isArray(json.data) || json.data.length < 2) {
    throw new Error("Unexpected response format from Al-Quran Cloud");
  }

  const arabicEdition = json.data.find(
    (d) => d.edition?.identifier === "quran-uthmani"
  ) ?? json.data[0];
  const englishEdition = json.data.find(
    (d) => d.edition?.identifier === "en.sahih"
  ) ?? json.data[1];
  const tafsirEdition = json.data.find(
    (d) => d.edition?.identifier === "ar.muyassar"
  );

  const BISMILLAH_PREFIX = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

  const ayahs: AyahItem[] = arabicEdition.ayahs.map((ayah, idx) => {
    let textAr = ayah.text.replace(/^\uFEFF/, "").trim();
    if (
      surahNumber !== 1 &&
      surahNumber !== 9 &&
      ayah.numberInSurah === 1 &&
      textAr.startsWith(BISMILLAH_PREFIX)
    ) {
      textAr = textAr.slice(BISMILLAH_PREFIX.length).trim();
    }

    return {
      number: ayah.number,
      numberInSurah: ayah.numberInSurah,
      textAr,
      textEn: englishEdition.ayahs[idx]?.text?.trim() ?? "",
      tafsirAr: tafsirEdition?.ayahs[idx]?.text?.trim(),
      juz: ayah.juz,
      page: ayah.page,
    };
  });

  return {
    surah: meta,
    ayahs,
    source: "Al-Quran Cloud (quran-uthmani, Sahih International, Al-Tafsir Al-Muyassar)",
  };
}

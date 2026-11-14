import type { HadithItem } from "@/types/islamic";
import {
  BUKHARI_ARABIC_TITLES,
  HADITH_SECTION_INDEX,
  MUSLIM_ARABIC_TITLES,
  NAWAWI_HADITHS,
} from "@/data/hadith-books";

export type HadithCollectionKey = "nawawi" | "bukhari" | "muslim";

interface RawHadithEntry {
  hadithnumber: number;
  arabicnumber?: number | string;
  text: string;
  grades?: { name?: string; grade?: string }[];
  reference?: { book?: number; hadith?: number };
}

interface RawSectionResponse {
  metadata?: {
    name?: string;
    section?: Record<string, string>;
  };
  hadiths?: RawHadithEntry[];
}

export interface HadithSectionMeta {
  id: string;
  titleAr: string;
  titleEn: string;
}

export function getCollectionSections(
  collection: HadithCollectionKey
): HadithSectionMeta[] {
  if (collection === "nawawi") {
    return [
      {
        id: "1",
        titleAr: "الأربعون النووية (42 حديثاً)",
        titleEn: "Forty Hadith of Imam an-Nawawi (42 Hadiths)",
      },
    ];
  }

  const rawSections =
    collection === "bukhari"
      ? HADITH_SECTION_INDEX.bukhari.sections
      : HADITH_SECTION_INDEX.muslim.sections;
  const arMap =
    collection === "bukhari" ? BUKHARI_ARABIC_TITLES : MUSLIM_ARABIC_TITLES;

  return Object.entries(rawSections)
    .filter(([key, title]) => key !== "0" && Boolean(title))
    .map(([key, titleEn]) => ({
      id: key,
      titleAr: arMap[key] ? `${arMap[key]} (${key})` : `الكتاب ${key}: ${titleEn}`,
      titleEn: `${key}. ${titleEn}`,
    }));
}

export async function fetchHadithSection(
  collection: HadithCollectionKey,
  sectionId: string = "1"
): Promise<{
  hadiths: HadithItem[];
  sectionTitleAr: string;
  sectionTitleEn: string;
  source: string;
}> {
  if (collection === "nawawi") {
    return {
      hadiths: NAWAWI_HADITHS.map((h) => ({
        hadithNumber: h.hadithNumber,
        arabicNumber: h.arabicNumber,
        arabicText: h.arabicText,
        englishText: h.englishText,
        referenceBook: `الأربعون النووية — الحديث رقم ${h.hadithNumber}`,
        gradeAr: "متفق عليه / صحيح أو حسن بحسب تخريج الإمام النووي",
        gradeEn: "Compiled by Imam an-Nawawi from authenticated collections",
      })),
      sectionTitleAr: "الأربعون النووية",
      sectionTitleEn: "Forty Hadith of Imam an-Nawawi",
      source: "fawazahmed0/hadith-api (Al-Arba'in an-Nawawiyyah)",
    };
  }

  const cleanSection = String(sectionId).replace(/[^0-9]/g, "") || "1";
  const arUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${collection}/sections/${cleanSection}.min.json`;
  const enUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${collection}/sections/${cleanSection}.min.json`;

  const [arRes, enRes] = await Promise.all([
    fetch(arUrl, {
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 86400 },
    }),
    fetch(enUrl, {
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 86400 },
    }),
  ]);

  if (!arRes.ok) {
    throw new Error(`Hadith CDN returned HTTP ${arRes.status}`);
  }

  const arData = (await arRes.json()) as RawSectionResponse;
  const enData = enRes.ok ? ((await enRes.json()) as RawSectionResponse) : null;

  const enMap = new Map<number, RawHadithEntry>();
  for (const h of enData?.hadiths ?? []) {
    enMap.set(h.hadithnumber, h);
  }

  const arHadiths = (arData.hadiths ?? []).filter(
    (h) => typeof h.text === "string" && h.text.trim().length > 0
  );

  const sectionsList = getCollectionSections(collection);
  const foundMeta = sectionsList.find((s) => s.id === cleanSection);

  const collectionAr = collection === "bukhari" ? "صحيح البخاري" : "صحيح مسلم";
  const collectionEn =
    collection === "bukhari" ? "Sahih al-Bukhari" : "Sahih Muslim";

  const hadiths: HadithItem[] = arHadiths.map((h) => {
    const enMatch = enMap.get(h.hadithnumber);
    const gradeText =
      enMatch?.grades?.find((g) => g.grade)?.grade ??
      h.grades?.find((g) => g.grade)?.grade ??
      "Sahih";

    return {
      hadithNumber: h.hadithnumber,
      arabicNumber: h.arabicnumber ?? h.hadithnumber,
      arabicText: h.text.trim(),
      englishText: enMatch?.text?.trim() ?? "",
      referenceBook: `${collectionAr} — ${foundMeta?.titleAr ?? cleanSection} (#${h.hadithnumber})`,
      gradeAr:
        collection === "bukhari"
          ? "صحيح — رواه البخاري"
          : "صحيح — رواه مسلم",
      gradeEn: `${gradeText} — ${collectionEn}`,
    };
  });

  return {
    hadiths,
    sectionTitleAr: foundMeta?.titleAr ?? collectionAr,
    sectionTitleEn: foundMeta?.titleEn ?? collectionEn,
    source: `fawazahmed0/hadith-api (${collectionEn})`,
  };
}

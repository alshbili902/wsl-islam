import nawawiRaw from "./generated/nawawi.json";
import hadithIndexRaw from "./generated/hadith-index.json";

export interface DailyHadith {
  id: string;
  collectionAr: string;
  collectionEn: string;
  arabicText: string;
  englishText: string;
  referenceAr: string;
  referenceEn: string;
  gradeAr: string;
  gradeEn: string;
}

export const NAWAWI_HADITHS = nawawiRaw;

export const HADITH_SECTION_INDEX = hadithIndexRaw;

/**
 * Arabic labels for key books of Sahih al-Bukhari & Sahih Muslim to ensure
 * authentic bilingual display alongside the jsDelivr Hadith CDN index.
 */
export const BUKHARI_ARABIC_TITLES: Record<string, string> = {
  "1": "كتاب بدء الوحي",
  "2": "كتاب الإيمان",
  "3": "كتاب العلم",
  "4": "كتاب الوضوء",
  "5": "كتاب الغسل",
  "6": "كتاب الحيض",
  "7": "كتاب التيمم",
  "8": "كتاب الصلاة",
  "9": "كتاب مواقيت الصلاة",
  "10": "كتاب الأذان",
  "11": "كتاب الجمعة",
  "12": "كتاب الخوف",
  "13": "كتاب العيدين",
  "14": "كتاب الوتر",
  "15": "كتاب الاستسقاء",
  "16": "كتاب الكسوف",
  "17": "كتاب سجود القرآن",
  "18": "كتاب التقصير",
  "19": "كتاب التهجد",
  "20": "كتاب فضل الصلاة في مسجد مكة والمدينة",
  "21": "كتاب العمل في الصلاة",
  "22": "كتاب السهو",
  "23": "كتاب الجنائز",
  "24": "كتاب الزكاة",
  "25": "كتاب الحج",
  "26": "كتاب العمرة",
  "27": "كتاب المحصر",
  "28": "كتاب جزاء الصيد",
  "29": "كتاب فضائل المدينة",
  "30": "كتاب الصوم",
  "31": "كتاب صلاة التراويح",
  "32": "كتاب فضل ليلة القدر",
  "33": "كتاب الاعتكاف",
  "34": "كتاب البيوع",
  "50": "كتاب الشروط",
  "51": "كتاب الوصايا",
  "56": "كتاب الجهاد والسير",
  "60": "كتاب أحاديث الأنبياء",
  "61": "كتاب المناقب",
  "63": "كتاب مناقب الأنصار",
  "64": "كتاب المغازي",
  "65": "كتاب التفسير",
  "66": "كتاب فضائل القرآن",
  "78": "كتاب الأدب",
  "80": "كتاب الدعوات",
  "81": "كتاب الرقاق",
  "97": "كتاب التوحيد",
};

export const MUSLIM_ARABIC_TITLES: Record<string, string> = {
  "1": "كتاب الإيمان",
  "2": "كتاب الطهارة",
  "3": "كتاب الحيض",
  "4": "كتاب الصلاة",
  "5": "كتاب المساجد ومواضع الصلاة",
  "6": "كتاب صلاة المسافرين وقصرها",
  "7": "كتاب الجمعة",
  "8": "كتاب صلاة العيدين",
  "9": "كتاب صلاة الاستسقاء",
  "10": "كتاب الكسوف",
  "11": "كتاب الجنائز",
  "12": "كتاب الزكاة",
  "13": "كتاب الصيام",
  "14": "كتاب الاعتكاف",
  "15": "كتاب الحج",
  "48": "كتاب الذكر والدعاء والتوبة والاستغفار",
  "49": "كتاب التوبة",
  "52": "كتاب الفتن وأشراط الساعة",
  "53": "كتاب الزهد والرقائق",
  "54": "كتاب التفسير",
};

/**
 * Curated daily hadiths derived verbatim from the Forty Hadith of Imam al-Nawawi
 * and verified Sahihain collections.
 */
export const DAILY_HADITHS: DailyHadith[] = [
  {
    id: "nawawi-1",
    collectionAr: "الأربعون النووية",
    collectionEn: "Forty Hadith of an-Nawawi",
    arabicText: nawawiRaw[0].arabicText,
    englishText: nawawiRaw[0].englishText,
    referenceAr: "رواه البخاري (1) ومسلم (1907) — الأربعون النووية: حديث 1",
    referenceEn: "Sahih al-Bukhari 1, Sahih Muslim 1907 — Nawawi Hadith #1",
    gradeAr: "متفق عليه — صحيح",
    gradeEn: "Muttafaqun 'Alayh (Sahih)",
  },
  {
    id: "nawawi-13",
    collectionAr: "الأربعون النووية",
    collectionEn: "Forty Hadith of an-Nawawi",
    arabicText: nawawiRaw[12].arabicText,
    englishText: nawawiRaw[12].englishText,
    referenceAr: "رواه البخاري (13) ومسلم (45) — الأربعون النووية: حديث 13",
    referenceEn: "Sahih al-Bukhari 13, Sahih Muslim 45 — Nawawi Hadith #13",
    gradeAr: "متفق عليه — صحيح",
    gradeEn: "Muttafaqun 'Alayh (Sahih)",
  },
  {
    id: "nawawi-15",
    collectionAr: "الأربعون النووية",
    collectionEn: "Forty Hadith of an-Nawawi",
    arabicText: nawawiRaw[14].arabicText,
    englishText: nawawiRaw[14].englishText,
    referenceAr: "رواه البخاري (6018) ومسلم (47) — الأربعون النووية: حديث 15",
    referenceEn: "Sahih al-Bukhari 6018, Sahih Muslim 47 — Nawawi Hadith #15",
    gradeAr: "متفق عليه — صحيح",
    gradeEn: "Muttafaqun 'Alayh (Sahih)",
  },
  {
    id: "nawawi-18",
    collectionAr: "الأربعون النووية",
    collectionEn: "Forty Hadith of an-Nawawi",
    arabicText: nawawiRaw[17].arabicText,
    englishText: nawawiRaw[17].englishText,
    referenceAr: "رواه الترمذي (1987) — الأربعون النووية: حديث 18",
    referenceEn: "Al-Tirmidhi 1987 — Nawawi Hadith #18",
    gradeAr: "حديث حسن صحيح",
    gradeEn: "Hasan Sahih",
  },
  {
    id: "nawawi-19",
    collectionAr: "الأربعون النووية",
    collectionEn: "Forty Hadith of an-Nawawi",
    arabicText: nawawiRaw[18].arabicText,
    englishText: nawawiRaw[18].englishText,
    referenceAr: "رواه الترمذي (2516) — الأربعون النووية: حديث 19",
    referenceEn: "Al-Tirmidhi 2516 — Nawawi Hadith #19",
    gradeAr: "حديث حسن صحيح",
    gradeEn: "Hasan Sahih",
  },
  {
    id: "nawawi-26",
    collectionAr: "الأربعون النووية",
    collectionEn: "Forty Hadith of an-Nawawi",
    arabicText: nawawiRaw[25].arabicText,
    englishText: nawawiRaw[25].englishText,
    referenceAr: "رواه البخاري (2989) ومسلم (1009) — الأربعون النووية: حديث 26",
    referenceEn: "Sahih al-Bukhari 2989, Sahih Muslim 1009 — Nawawi Hadith #26",
    gradeAr: "متفق عليه — صحيح",
    gradeEn: "Muttafaqun 'Alayh (Sahih)",
  },
  {
    id: "nawawi-36",
    collectionAr: "الأربعون النووية",
    collectionEn: "Forty Hadith of an-Nawawi",
    arabicText: nawawiRaw[35].arabicText,
    englishText: nawawiRaw[35].englishText,
    referenceAr: "رواه مسلم (2699) — الأربعون النووية: حديث 36",
    referenceEn: "Sahih Muslim 2699 — Nawawi Hadith #36",
    gradeAr: "صحيح — رواه مسلم",
    gradeEn: "Sahih (Muslim)",
  },
];

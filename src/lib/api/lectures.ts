import { VERIFIED_FALLBACK_LECTURES } from "@/data/lectures";
import type { LectureAttachment, LectureCategoryId, LectureItem } from "@/types/islamic";

const ISLAMHOUSE_API_BASE = "https://api3.islamhouse.com/v3/paV29H2gm56kvLPy/main";

interface IslamHouseRawAttachment {
  order?: number;
  size?: string;
  extension_type?: string;
  description?: string;
  url?: string;
}

interface IslamHouseRawItem {
  id: number;
  title?: string;
  type?: string;
  description?: string | null;
  full_description?: string | null;
  source_language?: string;
  translated_language?: string;
  importance_level?: string;
  prepared_by?: Array<{ title?: string; kind?: string }>;
  attachments?: IslamHouseRawAttachment[];
}

function classifyLectureCategory(title: string, description: string): LectureCategoryId {
  const haystack = `${title} ${description}`.toLowerCase();

  if (/قصص الأنبياء|أنبياء الله|قصة نبي|يوسف|موسى|إبراهيم|prophets stories|story of prophet/.test(haystack)) {
    return "prophets_stories";
  }
  if (/تفسير|تدبر|سورة|القرآن الكريم|آيات|quran|tafsir|surah/.test(haystack)) {
    return /تجويد|تلاوة|قراءات|علوم القرآن|tajweed/.test(haystack)
      ? "quran_sciences"
      : "tafsir";
  }
  if (/شرح كتاب|شرح متن|فتح الباري|رياض الصالحين|الأصول الثلاثة|كتاب التوحيد|زاد المستقنع|متن|explanation of|commentary on/.test(haystack)) {
    return "book_explanations";
  }
  if (/دورة علمية|منهجي|طلب العلم|أصول الفقه|القواعد الفقهية|methodical|structured course/.test(haystack)) {
    return "methodical_lessons";
  }
  if (/توحيد|عقيدة|إيمان|أسماء الله|aqeedah|tawheed|creed|faith/.test(haystack)) {
    return "aqeedah";
  }
  if (/حديث|صحيح البخاري|صحيح مسلم|الأربعين|سنة|hadith|sunnah/.test(haystack)) {
    return "hadith";
  }
  if (/سيرة|النبي|المدينة|مكة|صحابة|seerah|prophet|madinah/.test(haystack)) {
    return "seerah";
  }
  if (/فقه|صلاة|زكاة|صيام|حج|طهارة|fiqh|prayer|zakat|hajj|fasting/.test(haystack)) {
    return "fiqh";
  }
  if (/أخلاق|آداب|بر|الوالدين|الرفق|الأسرة|manners|ethics|family/.test(haystack)) {
    return "manners";
  }
  if (/رمضان|العشر|ليلة القدر|التراويح|ramadan/.test(haystack)) {
    return "ramadan";
  }
  if (/تزكية|قلب|خشوع|إخلاص|توكل|توبة|دعاء|heart|repentance|spiritual/.test(haystack)) {
    return "spiritual";
  }
  if (/مسلم جديد|التعريف بالإسلام|أركان الإسلام|new muslim|pillars of islam/.test(haystack)) {
    return "new_muslims";
  }
  if (/محاضرة|درس|علمي|سلسلة|lecture|lesson|seminar/.test(haystack)) {
    return "scholarly_lessons";
  }
  return "general";
}

function mapIslamHouseItem(
  raw: IslamHouseRawItem,
  lang: "ar" | "en"
): LectureItem | null {
  if (!raw || !raw.id || !raw.title) return null;

  const attachments: LectureAttachment[] = [];
  let primaryAudio = "";
  let primaryVideo = "";

  for (const att of raw.attachments || []) {
    if (!att.url) continue;
    const ext = (att.extension_type || "").toUpperCase();
    attachments.push({
      order: typeof att.order === "number" ? att.order : attachments.length,
      title: att.description || raw.title,
      url: att.url,
      extensionType: ext || "FILE",
      sizeLabel: att.size || undefined,
    });
    if (!primaryAudio && (ext === "MP3" || ext === "M4A" || ext === "AUDIO")) {
      primaryAudio = att.url;
    }
    if (!primaryVideo && (ext === "MP4" || ext === "WEBM" || ext === "VIDEO")) {
      primaryVideo = att.url;
    }
  }

  const speaker =
    raw.prepared_by?.find((p) => p.title)?.title?.trim() ||
    (lang === "ar" ? "إعداد الفريق العلمي — إسلام هاوس" : "IslamHouse Scholarly Contributors");

  const desc = (raw.description || raw.full_description || raw.title).trim();
  const isVideo = Boolean(primaryVideo) && !primaryAudio;
  const mediaType = primaryAudio
    ? "audio"
    : primaryVideo
      ? "video"
      : "external";
  const pageUrl = `https://islamhouse.com/${lang}/${
    raw.type === "videos" ? "videos" : "audios"
  }/${raw.id}`;

  return {
    id: `ih-${raw.id}`,
    slug: `ih-${raw.id}`,
    categoryId: classifyLectureCategory(raw.title, desc),
    titleAr: raw.title,
    titleEn: raw.title,
    speakerAr: speaker,
    speakerEn: speaker,
    descriptionAr: desc,
    descriptionEn: desc,
    mediaType,
    mediaUrl: primaryAudio || primaryVideo || pageUrl,
    attachments,
    sourceNameAr: "إسلام هاوس (IslamHouse)",
    sourceNameEn: "IslamHouse",
    sourceUrl: pageUrl,
    language: lang,
    referenceAr: `مصدر موثق: إسلام هاوس (#${raw.id})`,
    referenceEn: `Verified Source: IslamHouse (#${raw.id})`,
    isFeatured: raw.importance_level === "high" || isVideo,
  };
}

async function fetchIslamHouseFeed(
  kind: "audios" | "videos",
  lang: "ar" | "en",
  limit = 18
): Promise<LectureItem[]> {
  try {
    const endpoint = `${ISLAMHOUSE_API_BASE}/${kind}/${lang}/${lang}/1/${limit}/json`;
    const res = await fetch(endpoint, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const payload = (await res.json()) as { data?: IslamHouseRawItem[] };
    const items = (payload.data || [])
      .map((item) => mapIslamHouseItem(item, lang))
      .filter((item): item is LectureItem => Boolean(item));
    return items;
  } catch {
    return [];
  }
}

export async function fetchVerifiedLectures(options?: {
  lang?: "ar" | "en" | "all";
  category?: LectureCategoryId | "all";
  media?: "all" | "audio" | "video" | "external";
  query?: string;
}): Promise<LectureItem[]> {
  const langFilter = options?.lang || "all";

  const feedPromises: Promise<LectureItem[]>[] = [];
  if (langFilter === "ar" || langFilter === "all") {
    feedPromises.push(fetchIslamHouseFeed("audios", "ar", 20));
    feedPromises.push(fetchIslamHouseFeed("videos", "ar", 12));
  }
  if (langFilter === "en" || langFilter === "all") {
    feedPromises.push(fetchIslamHouseFeed("audios", "en", 12));
    feedPromises.push(fetchIslamHouseFeed("videos", "en", 8));
  }

  const results = await Promise.all(feedPromises);
  const seen = new Set<string>();
  const combined: LectureItem[] = [];

  for (const item of [...results.flat(), ...VERIFIED_FALLBACK_LECTURES]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    combined.push(item);
  }

  const q = (options?.query || "").trim().toLowerCase();
  const category = options?.category || "all";
  const media = options?.media || "all";

  return combined.filter((item) => {
    if (langFilter !== "all" && item.language !== langFilter) return false;
    if (category !== "all" && item.categoryId !== category) return false;
    if (media !== "all" && item.mediaType !== media) return false;
    if (q) {
      const hay = `${item.titleAr} ${item.titleEn} ${item.speakerAr} ${item.speakerEn} ${item.descriptionAr}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export async function fetchLectureBySlug(slugOrId: string): Promise<LectureItem | null> {
  const normalized = slugOrId.trim();
  const fallbackMatch = VERIFIED_FALLBACK_LECTURES.find(
    (l) => l.id === normalized || l.slug === normalized
  );

  const numericIdMatch = /^(?:ih-)?(\d+)$/.exec(normalized);
  if (numericIdMatch) {
    const rawId = numericIdMatch[1];
    for (const lang of ["ar", "en"] as const) {
      try {
        const res = await fetch(
          `${ISLAMHOUSE_API_BASE}/get-item/${rawId}/${lang}/json`,
          { next: { revalidate: 3600 } }
        );
        if (!res.ok) continue;
        const json = (await res.json()) as IslamHouseRawItem;
        const mapped = mapIslamHouseItem(json, lang);
        if (mapped) return mapped;
      } catch {
        // continue to fallback
      }
    }
  }

  if (fallbackMatch) return fallbackMatch;

  const list = await fetchVerifiedLectures({ lang: "all" });
  return list.find((l) => l.id === normalized || l.slug === normalized) || null;
}

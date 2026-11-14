import type { Locale, ShareCardPayload, ShareContentKind } from "@/types/islamic";

export function getSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (typeof window !== "undefined") {
    // Prefer configured non-localhost production URL if set, otherwise use active browser origin
    if (configured && !configured.includes("localhost")) {
      return configured.replace(/\/+$/, "");
    }
    return window.location.origin.replace(/\/+$/, "");
  }
  return (configured || "http://localhost:3000").replace(/\/+$/, "");
}

export function getDisplayDomain(): string {
  const origin = getSiteOrigin();
  try {
    return new URL(origin).host;
  } catch {
    return origin.replace(/^https?:\/\//, "");
  }
}

export function buildCanonicalShareUrl(shareUrl?: string): string {
  const origin = getSiteOrigin();
  if (!shareUrl) {
    return typeof window !== "undefined" ? window.location.href : origin;
  }
  if (/^https?:\/\//i.test(shareUrl)) {
    return shareUrl;
  }
  const normalizedPath = shareUrl.startsWith("/") ? shareUrl : `/${shareUrl}`;
  return `${origin}${normalizedPath}`;
}

export const KIND_LABELS: Record<
  ShareContentKind,
  { ar: string; en: string }
> = {
  verse: { ar: "آية كريمة", en: "Noble Quran" },
  surah: { ar: "سورة قرآنية", en: "Quran Surah" },
  hadith: { ar: "حديث نبوي شريف", en: "Prophetic Hadith" },
  adhkar: { ar: "أذكار مأثورة", en: "Authentic Adhkar" },
  dhikr: { ar: "ذِكر مأثور", en: "Remembrance" },
  dua: { ar: "دعاء مبارك", en: "Supplication" },
  article: { ar: "مقال معرفي", en: "Islamic Article" },
  prophet_story: { ar: "قصص الأنبياء", en: "Stories of the Prophets" },
  allah_name: { ar: "أسماء الله الحسنى", en: "Names of Allah" },
  lesson: { ar: "فائدة ودرس علمي", en: "Islamic Lesson" },
  reminder: { ar: "تذكرة إيمانية", en: "Daily Reminder" },
  tasbih: { ar: "إنجاز تسبيح", en: "Tasbih Milestone" },
  tafsir: { ar: "تفسير آية كريمة", en: "Quran Tafsir" },
  lecture: { ar: "محاضرة ودرس علمي", en: "Islamic Lecture" },
  khatmah: { ar: "خطة ختمة القرآن", en: "Quran Khatmah Plan" },
};

export function formatShareText(
  payload: ShareCardPayload,
  options: {
    locale: Locale;
    includeEnglish?: boolean;
  }
): string {
  const { locale, includeEnglish = false } = options;
  const url = buildCanonicalShareUrl(payload.shareUrl);
  const lines: string[] = [];

  if (payload.kind === "verse") {
    lines.push("الآية:");
    lines.push(payload.arabicText);
    if (includeEnglish && payload.englishText) {
      lines.push("");
      lines.push(payload.englishText);
    }
    lines.push("");
    if (payload.surahNameAr) {
      lines.push(`السورة: ${payload.surahNameAr}`);
    }
    if (typeof payload.ayahNumber === "number") {
      lines.push(`رقم الآية: ${payload.ayahNumber}`);
    }
    if (!payload.surahNameAr && payload.referenceAr) {
      lines.push(`المرجع: ${payload.referenceAr}`);
    }
    lines.push(
      `المصدر: ${payload.sourceAr || "القرآن الكريم — مجمع الملك فهد لطباعة المصحف الشريف"}`
    );
  } else if (payload.kind === "surah") {
    if (payload.titleAr || payload.surahNameAr) {
      lines.push(payload.titleAr || `سورة ${payload.surahNameAr}`);
    }
    lines.push(payload.arabicText);
    if (includeEnglish && payload.englishText) {
      lines.push("");
      lines.push(payload.englishText);
    }
    lines.push("");
    if (payload.referenceAr) {
      lines.push(`البيانات: ${payload.referenceAr}`);
    }
    if (payload.sourceAr) {
      lines.push(`المصدر: ${payload.sourceAr}`);
    }
  } else if (payload.kind === "hadith") {
    lines.push("الحديث:");
    lines.push(payload.arabicText);
    if (includeEnglish && payload.englishText) {
      lines.push("");
      lines.push(payload.englishText);
    }
    lines.push("");
    if (payload.sourceAr) {
      lines.push(`المصدر: ${payload.sourceAr}`);
    }
    if (payload.referenceAr) {
      lines.push(`المرجع: ${payload.referenceAr}`);
    }
    if (payload.hadithGradeAr) {
      lines.push(`درجة الحديث: ${payload.hadithGradeAr}`);
    }
  } else if (
    payload.kind === "adhkar" ||
    payload.kind === "dhikr" ||
    payload.kind === "dua"
  ) {
    lines.push(payload.kind === "dua" ? "الدعاء:" : "الذِّكر:");
    if (payload.titleAr) {
      lines.push(payload.titleAr);
    }
    lines.push(payload.arabicText);
    if (includeEnglish && payload.englishText) {
      lines.push("");
      lines.push(payload.englishText);
    }
    lines.push("");
    if (typeof payload.repeatCount === "number" && payload.repeatCount > 0) {
      lines.push(`التكرار المشروع: ${payload.repeatCount}`);
    }
    if (payload.referenceAr) {
      lines.push(`المرجع: ${payload.referenceAr}`);
    }
  } else {
    // Articles, Stories of the Prophets, Names of Allah, Lessons, Reminders, Tasbih
    if (payload.titleAr || payload.titleEn) {
      lines.push(
        locale === "en" && payload.titleEn
          ? payload.titleEn
          : payload.titleAr || payload.titleEn || ""
      );
      lines.push("");
    }
    lines.push(payload.arabicText);
    if (includeEnglish && payload.englishText) {
      lines.push("");
      lines.push(payload.englishText);
    }
    lines.push("");
    if (payload.sourceAr) {
      lines.push(`المصدر: ${payload.sourceAr}`);
    }
    if (payload.referenceAr) {
      lines.push(`المرجع: ${payload.referenceAr}`);
    }
  }

  lines.push("");
  lines.push("وصل الإسلامية");
  lines.push(url);

  return lines.join("\n");
}

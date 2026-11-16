import type { Locale } from "@/types/islamic";

export interface Dictionary {
  brand: {
    name: string;
    shortName: string;
    tagline: string;
    handle: string;
    cta: string;
  };
  nav: {
    home: string;
    quranAndTafsir: string;
    quran: string;
    mushaf: string;
    tafsir: string;
    khatmah: string;
    listen: string;
    allReciters: string;
    listeningLibrary: string;
    prayerTimes: string;
    adhkarAndHadith: string;
    adhkar: string;
    hadith: string;
    namesOfAllah: string;
    knowledgeAndServices: string;
    knowledge: string;
    lectures: string;
    radio: string;
    ramadan: string;
    zakat: string;
    quiz: string;
    calendar: string;
    notifications: string;
    readingSettings: string;
    resources: string;
    updates: string;
    bookmarks: string;
    searchPlaceholder: string;
    searchShortcut: string;
  };
  themes: {
    label: string;
    light: string;
    dark: string;
    night: string;
  };
  common: {
    readMore: string;
    listenNow: string;
    bookmark: string;
    bookmarked: string;
    shareCard: string;
    copy: string;
    copied: string;
    source: string;
    loading: string;
    errorRetry: string;
    browseAll: string;
    backHome: string;
    openExternal: string;
    verses: string;
    meccan: string;
    medinan: string;
  };
  footer: {
    about: string;
    integrityNote: string;
    sectionsTitle: string;
    servicesTitle: string;
    trustedLinksTitle: string;
    contactTitle: string;
    rights: string;
  };
}

export const DICTIONARY: Record<Locale, Dictionary> = {
  ar: {
    brand: {
      name: "وصل الإسلامية",
      shortName: "وصل",
      tagline: "منصة رقمية إسلامية موثوقة للقرآن والسنة والأذكار والمعرفة",
      handle: "@waslofficiall",
      cta: "تصفح المنصة الآن",
    },
    nav: {
      home: "الرئيسية",
      quranAndTafsir: "القرآن والتدبر",
      quran: "القرآن الكريم (السور)",
      mushaf: "المصحف الشريف (604 صفحات)",
      tafsir: "موسوعة التفسير والتدبر",
      khatmah: "مخطط ختمة القرآن",
      listen: "مركز الاستماع",
      allReciters: "جميع قراء القرآن (244+)",
      listeningLibrary: "مكتبة الاستماع الشخصية",
      prayerTimes: "مواقيت الصلاة",
      adhkarAndHadith: "الأذكار والحديث",
      adhkar: "الأذكار والأدعية",
      hadith: "مكتبة الحديث الشريف",
      namesOfAllah: "أسماء الله الحسنى",
      knowledgeAndServices: "المعرفة والخدمات",
      knowledge: "المعرفة الإسلامية",
      lectures: "المحاضرات والدروس",
      radio: "الإذاعات الإسلامية",
      ramadan: "رمضان والختمة",
      zakat: "الزكاة والصدقات",
      quiz: "المسابقة الإسلامية",
      calendar: "التقويم الهجري",
      notifications: "التنبيهات والتذكيرات",
      readingSettings: "إعدادات القراءة والخطوط",
      resources: "المصطلحات والمصادر",
      updates: "سجل التحديثات",
      bookmarks: "المفضلة",
      searchPlaceholder: "ابحث في السور، الأذكار، الأحاديث، المقالات، والأسماء الحسنى...",
      searchShortcut: "بحث سريع",
    },
    themes: {
      label: "المظهر",
      light: "نهاري دافئ",
      dark: "داكن فحمي",
      night: "ليلي هادئ",
    },
    common: {
      readMore: "اقرأ المزيد",
      listenNow: "استمع الآن",
      bookmark: "حفظ",
      bookmarked: "محفوظ",
      shareCard: "بطاقة مشاركة",
      copy: "نسخ",
      copied: "تم النسخ",
      source: "المصدر",
      loading: "جاري التحميل...",
      errorRetry: "تعذر جلب البيانات، يرجى المحاولة مرة أخرى",
      browseAll: "استعراض الكل",
      backHome: "العودة للرئيسية",
      openExternal: "زيارة المنصة الرسمية",
      verses: "آية",
      meccan: "مكية",
      medinan: "مدنية",
    },
    footer: {
      about:
        "وصل الإسلامية منصة إسلامية معاصرة تجمع بين جماليات العمارة الإسلامية وسهولة التجربة الرقمية، مع الالتزام التام بصحة النصوص وتوثيق مصادرها الشرعية.",
      integrityNote:
        "جميع الآيات القرآنية والأحاديث النبوية والأذكار مستمدة من مصادر موثوقة ومعتمدة دون تحريف أو اجتزاء.",
      sectionsTitle: "الأقسام الرئيسية",
      servicesTitle: "الخدمات الإسلامية",
      trustedLinksTitle: "مصادر ومنصات رسمية",
      contactTitle: "الهوية والتواصل",
      rights: "وصل الإسلامية — جميع الحقوق محفوظة لخدمة الكتاب والسنة.",
    },
  },
  en: {
    brand: {
      name: "Wasl Islamic",
      shortName: "Wasl",
      tagline: "A refined, source-verified digital sanctuary for Quran, Sunnah, Adhkar, and Islamic knowledge",
      handle: "@waslofficiall",
      cta: "تصفح المنصة الآن",
    },
    nav: {
      home: "Home",
      quranAndTafsir: "Quran & Tafsir",
      quran: "Holy Quran (Surahs)",
      mushaf: "Digital Mushaf (604 pp.)",
      tafsir: "Tafsir & Reflection",
      khatmah: "Quran Khatmah Planner",
      listen: "Listening Center",
      allReciters: "All Quran Reciters (244+)",
      listeningLibrary: "My Listening Library",
      prayerTimes: "Prayer Times",
      adhkarAndHadith: "Adhkar & Hadith",
      adhkar: "Adhkar & Duas",
      hadith: "Hadith Library",
      namesOfAllah: "99 Names of Allah",
      knowledgeAndServices: "Knowledge & Services",
      knowledge: "Islamic Knowledge",
      lectures: "Lectures & Lessons",
      radio: "Islamic Radio",
      ramadan: "Ramadan & Khatmah",
      zakat: "Zakat & Charity",
      quiz: "Islamic Quiz",
      calendar: "Islamic Calendar",
      notifications: "Smart Reminders",
      readingSettings: "Reading Preferences",
      resources: "Glossary & Sources",
      updates: "Platform Updates",
      bookmarks: "Bookmarks",
      searchPlaceholder: "Search surahs, adhkar, hadiths, articles, or Names of Allah...",
      searchShortcut: "Quick Search",
    },
    themes: {
      label: "Theme",
      light: "Light Ivory",
      dark: "Dark Charcoal",
      night: "Night Sanctuary",
    },
    common: {
      readMore: "Read more",
      listenNow: "Listen now",
      bookmark: "Save",
      bookmarked: "Saved",
      shareCard: "Share Card",
      copy: "Copy",
      copied: "Copied",
      source: "Source",
      loading: "Loading...",
      errorRetry: "Unable to load data. Please retry.",
      browseAll: "Explore all",
      backHome: "Back to Home",
      openExternal: "Visit Official Platform",
      verses: "verses",
      meccan: "Makki",
      medinan: "Madani",
    },
    footer: {
      about:
        "Wasl Islamic unites timeless Islamic architectural aesthetics with a calm, contemporary digital experience grounded strictly in authentic Quranic and Prophetic sources.",
      integrityNote:
        "All Quranic verses, Hadiths, and supplications are sourced exclusively from verified providers and recognized scholarly authorities.",
      sectionsTitle: "Core Sections",
      servicesTitle: "Islamic Services",
      trustedLinksTitle: "Official Institutions",
      contactTitle: "Identity & Connect",
      rights: "Wasl Islamic — Dedicated to authentic Islamic knowledge.",
    },
  },
};

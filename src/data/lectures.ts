import type { LectureCategoryId, LectureItem } from "@/types/islamic";

export interface LectureCategoryMeta {
  id: LectureCategoryId;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export const LECTURE_CATEGORIES: LectureCategoryMeta[] = [
  {
    id: "tafsir",
    nameAr: "التفسير والتدبر",
    nameEn: "Tafsir & Reflection",
    descriptionAr: "دروس في معاني القرآن الكريم وتدبر آياته من مصادر موثوقة.",
    descriptionEn: "Lessons on Quranic exegesis and verse-by-verse reflection.",
  },
  {
    id: "quran_sciences",
    nameAr: "علوم القرآن والتجويد",
    nameEn: "Quranic Sciences & Tajweed",
    descriptionAr: "مقدمات في التجويد والقراءات وفضائل القرآن وجمعه.",
    descriptionEn: "Foundations of Tajweed, Qira'at, and Quranic sciences.",
  },
  {
    id: "aqeedah",
    nameAr: "العقيدة والتوحيد",
    nameEn: "Aqeedah & Tawheed",
    descriptionAr: "أصول الإيمان وأسماء الله الحسنى وصفاته على منهج أهل السنة.",
    descriptionEn: "Core Islamic creed, pillars of Iman, and Tawheed.",
  },
  {
    id: "hadith",
    nameAr: "الحديث وعلومه",
    nameEn: "Hadith & Sunnah",
    descriptionAr: "شروح الأحاديث الصحيحة والأربعين النووية ومصطلح الحديث.",
    descriptionEn: "Explanations of authentic Hadiths and Nawawi's Forty.",
  },
  {
    id: "seerah",
    nameAr: "السيرة النبوية",
    nameEn: "Prophetic Biography (Seerah)",
    descriptionAr: "مواقف ودروس من سيرة النبي محمد ﷺ والمدينة المنورة.",
    descriptionEn: "Lessons and historical events from the Prophet's Seerah.",
  },
  {
    id: "fiqh",
    nameAr: "الفقه والعبادات",
    nameEn: "Fiqh & Worship",
    descriptionAr: "أحكام الطهارة والصلاة والصيام والزكاة والحج بأدلتها.",
    descriptionEn: "Practical rulings of prayer, fasting, Zakat, and Hajj.",
  },
  {
    id: "manners",
    nameAr: "الأخلاق والآداب",
    nameEn: "Islamic Manners & Ethics",
    descriptionAr: "الأدب الإسلامي وبر الوالدين والرفق وحسن الخلق.",
    descriptionEn: "Islamic character, family kindness, and Prophetic ethics.",
  },
  {
    id: "spiritual",
    nameAr: "التزكية والرقائق",
    nameEn: "Heart Softeners & Spirituality",
    descriptionAr: "أعمال القلوب والخشوع والإخلاص والتوكل على الله.",
    descriptionEn: "Sincerity, humility, reliance on Allah, and spiritual growth.",
  },
  {
    id: "ramadan",
    nameAr: "رمضان والمواسم",
    nameEn: "Ramadan & Seasonal Lessons",
    descriptionAr: "محاضرات في استقبال رمضان والقيام والعشر الأواخر.",
    descriptionEn: "Lectures on fasting, Qiyam al-Layl, and seasonal worship.",
  },
  {
    id: "prophets_stories",
    nameAr: "قصص الأنبياء",
    nameEn: "Stories of the Prophets",
    descriptionAr: "دروس موثقة في قصص الأنبياء والرسل والعبر المستفادة من القرآن والسنة.",
    descriptionEn: "Verified audio lessons on the Prophets' stories from the Quran and Sunnah.",
  },
  {
    id: "scholarly_lessons",
    nameAr: "الدروس العلمية",
    nameEn: "Scholarly Lectures & Series",
    descriptionAr: "محاضرات علمية تأصيلية وسلاسل محررة لكبار العلماء والدعاة.",
    descriptionEn: "Grounded scholarly lectures and academic series by recognized scholars.",
  },
  {
    id: "book_explanations",
    nameAr: "شروح الكتب والمتون",
    nameEn: "Classical Book Explanations",
    descriptionAr: "شروح المتون العلمية في العقيدة والحديث والفقه والآداب.",
    descriptionEn: "Systematic audio commentaries on classical Islamic texts and manuals.",
  },
  {
    id: "methodical_lessons",
    nameAr: "الدروس المنهجية",
    nameEn: "Methodical Study Tracks",
    descriptionAr: "مقررات ودروس منهجية متدرجة لطلب العلم الشرعي الرصين.",
    descriptionEn: "Structured progressive courses for methodical Islamic learning.",
  },
  {
    id: "new_muslims",
    nameAr: "التعريف بالإسلام",
    nameEn: "Foundations & New Muslims",
    descriptionAr: "شروح ميسرة لأركان الإسلام وأساسيات الدين باللغتين.",
    descriptionEn: "Clear foundational guides to Islam for learners and newcomers.",
  },
  {
    id: "general",
    nameAr: "موضوعات متنوعة",
    nameEn: "General Islamic Knowledge",
    descriptionAr: "محاضرات ومواد علمية عامة نافعة من منصات موثوقة.",
    descriptionEn: "General verified educational Islamic talks and audiobooks.",
  },
];

export interface ScholarlyPlatformLink {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  url: string;
}

export const CURATED_SCHOLARLY_PLATFORMS: ScholarlyPlatformLink[] = [
  {
    id: "binbaz",
    nameAr: "الموقع الرسمي لسماحة الشيخ ابن باز — المكتبة الصوتية",
    nameEn: "Official Website of Shaykh Ibn Baz — Audio Archive",
    descriptionAr: "أرشيف موثق للفتاوى والشروح العلمية والدروس الصوتية (binbaz.org.sa/audios/kind/2).",
    descriptionEn: "Verified archive of audio lessons, fatwas, and classical commentaries.",
    url: "https://binbaz.org.sa/audios/kind/2",
  },
  {
    id: "binothaimeen",
    nameAr: "مؤسسة الشيخ ابن عثيمين الخيرية",
    nameEn: "Shaykh Al-Uthaymeen Official Foundation",
    descriptionAr: "سلاسل الشروح الفقهية والعقدية والتفسير الصوتي.",
    descriptionEn: "Verified collections in Fiqh, Aqeedah, and Quranic Tafsir.",
    url: "https://binothaimeen.net/",
  },
  {
    id: "islamhouse",
    nameAr: "موقع إسلام هاوس (IslamHouse)",
    nameEn: "IslamHouse Digital Library",
    descriptionAr: "مكتبة علمية متعددة اللغات للصوتيات والمرئيات والكتب الموثقة.",
    descriptionEn: "Multilingual authenticated Islamic audio, video, and book library.",
    url: "https://islamhouse.com/",
  },
  {
    id: "qurancomplex",
    nameAr: "مجمع الملك فهد لطباعة المصحف الشريف",
    nameEn: "King Fahd Glorious Quran Printing Complex",
    descriptionAr: "المصدر الرسمي لطباعة المصحف وتراجم معانيه وبحوث علوم القرآن.",
    descriptionEn: "Official authority for the Madinah Mushaf and Quranic translations.",
    url: "https://qurancomplex.gov.sa/",
  },
];

export const VERIFIED_FALLBACK_LECTURES: LectureItem[] = [
  {
    id: "ih-2844667",
    slug: "ih-2844667",
    categoryId: "seerah",
    titleAr: "كتاب أنا المدينة — قراءة صوتية في فضائل المدينة النبوية ومعالمها",
    titleEn: "Ana Al-Madinah — Audio Reading on the Virtues & Landmarks of Madinah",
    speakerAr: "د. جمال يوسف الهميلي",
    speakerEn: "Dr. Jamal Yusuf Al-Humayli",
    descriptionAr:
      "قراءة صوتية لكتاب أنا المدينة، يبين فضائل المدينة النبوية ويوضح معالمها وأبرز الأحداث التاريخية في السيرة النبوية.",
    descriptionEn:
      "Audio series highlighting the virtues, prophetic landmarks, and key historical events in Madinah.",
    mediaType: "audio",
    mediaUrl:
      "https://d1.islamhouse.com/data/ar/ih_sounds/chain_02/ar_ana_almdinah/ar_01_ana_almdinah.mp3",
    attachments: [
      {
        order: 0,
        title: "الجزء الأول — أنا المدينة",
        url: "https://d1.islamhouse.com/data/ar/ih_sounds/chain_02/ar_ana_almdinah/ar_01_ana_almdinah.mp3",
        extensionType: "MP3",
        sizeLabel: "8.57 MB",
      },
      {
        order: 1,
        title: "الجزء الثاني — أنا المدينة",
        url: "https://d1.islamhouse.com/data/ar/ih_sounds/chain_02/ar_ana_almdinah/ar_02_ana_almdinah.mp3",
        extensionType: "MP3",
        sizeLabel: "9.79 MB",
      },
      {
        order: 2,
        title: "الجزء الثالث — أنا المدينة",
        url: "https://d1.islamhouse.com/data/ar/ih_sounds/chain_02/ar_ana_almdinah/ar_03_ana_almdinah.mp3",
        extensionType: "MP3",
        sizeLabel: "13.57 MB",
      },
      {
        order: 3,
        title: "الجزء الرابع — أنا المدينة",
        url: "https://d1.islamhouse.com/data/ar/ih_sounds/chain_02/ar_ana_almdinah/ar_04_ana_almdinah.mp3",
        extensionType: "MP3",
        sizeLabel: "16.79 MB",
      },
    ],
    sourceNameAr: "إسلام هاوس (IslamHouse)",
    sourceNameEn: "IslamHouse",
    sourceUrl: "https://islamhouse.com/ar/audios/2844667",
    language: "ar",
    referenceAr: "مكتبة الصوتيات الموثقة — إسلام هاوس",
    referenceEn: "Verified Audio Library — IslamHouse",
    isFeatured: true,
  },
  {
    id: "ih-en-salat-foundations",
    slug: "binbaz-arbaeen-nawawiyah",
    categoryId: "hadith",
    titleAr: "شرح الأربعين النووية — موقع سماحة الشيخ ابن باز الرسمي",
    titleEn: "Explanation of An-Nawawi's Forty Hadith — Shaykh Ibn Baz Archive",
    speakerAr: "الشيخ عبدالعزيز بن عبدالله بن باز",
    speakerEn: "Shaykh Abdulaziz bin Baz",
    descriptionAr:
      "دروس علمية موثقة في شرح الأحاديث الجامعة في الأربعين النووية من الأرشيف الرسمي لموقع سماحة الشيخ ابن باز.",
    descriptionEn:
      "Authentic scholarly lessons explaining Imam An-Nawawi's Forty Hadith from the official Ibn Baz archive.",
    mediaType: "external",
    mediaUrl: "https://binbaz.org.sa/categories/132",
    attachments: [],
    sourceNameAr: "الموقع الرسمي للشيخ ابن باز",
    sourceNameEn: "BinBaz.org.sa Official Archive",
    sourceUrl: "https://binbaz.org.sa/categories/132",
    language: "ar",
    referenceAr: "قسم شروح الحديث — binbaz.org.sa",
    referenceEn: "Hadith Explanations — binbaz.org.sa",
    isFeatured: true,
  },
  {
    id: "ih-uthaimeen-tafsir",
    slug: "binothaimeen-tafsir-juz-amma",
    categoryId: "tafsir",
    titleAr: "تفسير جزء عمّ — مؤسسة الشيخ محمد بن صالح العثيمين",
    titleEn: "Tafsir of Juz Amma — Shaykh Ibn Uthaymeen Official Library",
    speakerAr: "الشيخ محمد بن صالح العثيمين",
    speakerEn: "Shaykh Muhammad ibn Salih Al-Uthaymeen",
    descriptionAr:
      "تفسير ميسر وموثق لسور جزء عمّ مع استنباط الفوائد التربوية والعقدية من الموقع الرسمي لمؤسسة الشيخ ابن عثيمين.",
    descriptionEn:
      "Accessible, scholarly Tafsir of Juz Amma from the official Al-Uthaymeen Charitable Foundation.",
    mediaType: "external",
    mediaUrl: "https://binothaimeen.net/",
    attachments: [],
    sourceNameAr: "مؤسسة الشيخ ابن عثيمين الخيرية",
    sourceNameEn: "Al-Uthaymeen Foundation",
    sourceUrl: "https://binothaimeen.net/",
    language: "ar",
    referenceAr: "مكتبة التفسير — binothaimeen.net",
    referenceEn: "Tafsir Archive — binothaimeen.net",
    isFeatured: true,
  },
  {
    id: "binbaz-audios-kind-2",
    slug: "binbaz-scientific-audios-archive",
    categoryId: "book_explanations",
    titleAr: "سلسلة الدروس العلمية وشروح الكتب — المكتبة الصوتية للشيخ ابن باز",
    titleEn: "Scholarly Audio Lessons & Book Commentaries — Shaykh Ibn Baz Archive",
    speakerAr: "الشيخ عبدالعزيز بن عبدالله بن باز",
    speakerEn: "Shaykh Abdulaziz bin Baz",
    descriptionAr:
      "أرشيف الدروس العلمية وشروح المتون والكتب المعتمدة في العقيدة والحديث والفقه من الموقع الرسمي لسماحة الشيخ ابن باز.",
    descriptionEn:
      "Official audio archive of scholarly lectures and classical book commentaries from Shaykh Ibn Baz's official portal.",
    mediaType: "external",
    mediaUrl: "https://binbaz.org.sa/audios/kind/2",
    attachments: [],
    sourceNameAr: "الموقع الرسمي للشيخ ابن باز",
    sourceNameEn: "BinBaz.org.sa Official Audio Library",
    sourceUrl: "https://binbaz.org.sa/audios/kind/2",
    language: "ar",
    referenceAr: "المكتبة الصوتية الرسمية — binbaz.org.sa/audios/kind/2",
    referenceEn: "Official Audio Section — binbaz.org.sa/audios/kind/2",
    isFeatured: true,
  },
];

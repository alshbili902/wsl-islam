import type { GlossaryTerm, ScholarlyResource } from "@/types/islamic";

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    slug: "tawhid",
    termAr: "التوحيد",
    termEn: "Tawhid (Islamic Monotheism)",
    transliteration: "At-Tawhid",
    definitionAr:
      "إفراد الله سبحانه وتعالى بالربوبية والألوهية والأسماء والصفات، وهو أصل دين الإسلام وأساس قبول الأعمال.",
    definitionEn:
      "Affirming the absolute Oneness of Allah in Lordship, Worship, and His Names and Attributes — the foundational pillar of Islam.",
    category: "aqeedah",
    referenceAr: "سورة الإخلاص: 1-4",
    referenceEn: "Surah Al-Ikhlas 112:1-4",
  },
  {
    slug: "sunnah",
    termAr: "السنة النبوية",
    termEn: "The Prophetic Sunnah",
    transliteration: "As-Sunnah",
    definitionAr:
      "كل ما أُثر عن النبي محمد ﷺ من قولٍ أو فعلٍ أو تقريرٍ أو صفة، وهي المصدر الثاني للتشريع بعد القرآن الكريم.",
    definitionEn:
      "The documented sayings, actions, tacit approvals, and noble character of Prophet Muhammad ﷺ, serving as the second primary source of Islamic guidance after the Quran.",
    category: "hadith",
    referenceAr: "سورة الحشر: 7",
    referenceEn: "Surah Al-Hashr 59:7",
  },
  {
    slug: "fiqh",
    termAr: "الفقه",
    termEn: "Fiqh (Islamic Jurisprudence)",
    transliteration: "Al-Fiqh",
    definitionAr:
      "العلم بالأحكام الشرعية العملية المكتسب من أدلتها التفصيلية في القرآن الكريم والسنة النبوية.",
    definitionEn:
      "Understanding practical Islamic rulings derived from their detailed textual evidences in the Quran and Sunnah.",
    category: "worship",
    referenceAr: "صحيح البخاري: 71",
    referenceEn: "Sahih al-Bukhari 71",
  },
  {
    slug: "dhikr",
    termAr: "الذكر",
    termEn: "Dhikr (Remembrance of Allah)",
    transliteration: "Adh-Dhikr",
    definitionAr:
      "استحضار عظمة الله في القلب والثناء عليه باللسان بالتسبيح والتحميد والتهليل والتكبير وتلاوة القرآن والدعاء.",
    definitionEn:
      "Remembering Allah with heart and tongue through glorification, praise, supplication, and Quran recitation.",
    category: "worship",
    referenceAr: "سورة الرعد: 28",
    referenceEn: "Surah Ar-Ra'd 13:28",
  },
  {
    slug: "zakat-nisab",
    termAr: "النِّصاب في الزكاة",
    termEn: "Nisab (Zakat Threshold)",
    transliteration: "An-Nisab",
    definitionAr:
      "الحد الأدنى من المال الذي إذا ملكه المسلم وحال عليه الحول الهجري وجبت فيه الزكاة، ويُقدّر بـ 85 جراماً من الذهب الخالص أو 595 جراماً من الفضة.",
    definitionEn:
      "The minimum threshold of wealth (equivalent to 85g of pure gold or 595g of silver) held for one full lunar year upon which Zakat becomes obligatory.",
    category: "fiqh",
    referenceAr: "الفتاوى الشرعية — هيئة كبار العلماء",
    referenceEn: "Scholarly Consensus on Zakat Thresholds",
  },
  {
    slug: "khatmah",
    termAr: "الختمة",
    termEn: "Khatmah (Complete Quran Reading)",
    transliteration: "Khatmah",
    definitionAr:
      "إتمام قراءة القرآن الكريم كاملاً من سورة الفاتحة إلى سورة الناس بتدبر وترتيل.",
    definitionEn:
      "Completing the recitation of the entire Holy Quran from Surah Al-Fatihah through Surah An-Nas with reflection.",
    category: "quran",
  },
  {
    slug: "makki-madani",
    termAr: "المكي والمدني",
    termEn: "Makki and Madani Surahs",
    transliteration: "Al-Makki wal-Madani",
    definitionAr:
      "المكي ما نزل من القرآن قبل الهجرة النبوية إلى المدينة غالباً، والمدني ما نزل بعدها؛ ويمتاز المكي بترسيخ العقيدة والمدني بتفصيل الأحكام.",
    definitionEn:
      "Makki chapters were revealed prior to the Hijrah (migration to Madinah), focusing on faith and Tawhid; Madani chapters followed the Hijrah, detailing legislation and community life.",
    category: "quran",
  },
  {
    slug: "ihsan",
    termAr: "الإحسان",
    termEn: "Ihsan (Spiritual Excellence)",
    transliteration: "Al-Ihsan",
    definitionAr:
      "أن تعبد الله كأنك تراه، فإن لم تكن تراه فإنه يراك؛ وهو أعلى مراتب الدين في الإخلاص والإتقان.",
    definitionEn:
      "To worship Allah as though you see Him, and knowing that even if you do not see Him, He sees you — the pinnacle of sincerity and excellence.",
    category: "aqeedah",
    referenceAr: "حديث جبريل — صحيح مسلم: 8",
    referenceEn: "Hadith Jibril — Sahih Muslim 8",
  },
  {
    slug: "hijri-calendar",
    termAr: "التقويم الهجري",
    termEn: "Hijri (Islamic Lunar) Calendar",
    transliteration: "At-Taqwim al-Hijri",
    definitionAr:
      "التقويم القمري الإسلامي المؤرخ بهجرة النبي ﷺ من مكة إلى المدينة، ويتكون من اثني عشر شهراً قمرياً.",
    definitionEn:
      "The Islamic lunar calendar anchored to Prophet Muhammad's ﷺ migration (Hijrah) to Madinah, comprising 12 lunar months.",
    category: "calendar",
    referenceAr: "سورة التوبة: 36",
    referenceEn: "Surah At-Tawbah 9:36",
  },
  {
    slug: "sadaqah-jariyah",
    termAr: "الصدقة الجارية",
    termEn: "Sadaqah Jariyah (Ongoing Charity)",
    transliteration: "Sadaqah Jariyah",
    definitionAr:
      "العمل الصالح والإنفاق الذي يستمر نفعه وثوابه بعد موت الإنسان، كالوقف والعلم النافع وسقيا الماء.",
    definitionEn:
      "Enduring acts of charity whose benefit and reward continue even after one's lifetime, such as endowments, water wells, and beneficial knowledge.",
    category: "worship",
    referenceAr: "صحيح مسلم: 1631",
    referenceEn: "Sahih Muslim 1631",
  },
];

export const SCHOLARLY_RESOURCES: ScholarlyResource[] = [
  {
    slug: "binbaz-official",
    category: "scholarly",
    titleAr: "الموقع الرسمي لسماحة الشيخ عبدالعزيز بن باز",
    titleEn: "Official Website of Sheikh Abdulaziz bin Baz",
    descriptionAr:
      "أرشيف علمي موثوق للفتاوى والدروس والشروح الصوتية والكتب والمقالات في العقيدة والفقه والتفسير والحديث.",
    descriptionEn:
      "Verified scholarly archive of fatwas, lectures, books, and audio commentaries by Grand Mufti Sheikh Abdulaziz bin Baz.",
    url: "https://binbaz.org.sa",
    organizationAr: "مؤسسة عبدالعزيز بن باز الخيرية",
    organizationEn: "Abdulaziz Bin Baz Charitable Foundation",
    languageTags: ["ar"],
  },
  {
    slug: "alifta-official",
    category: "fatwa",
    titleAr: "الرئاسة العامة للبحوث العلمية والإفتاء",
    titleEn: "General Presidency of Scholarly Research and Ifta (Saudi Arabia)",
    descriptionAr:
      "البوابة الرسمية لفتاوى اللجنة الدائمة للبحوث العلمية والإفتاء ومجلة البحوث الإسلامية.",
    descriptionEn:
      "Official portal of the Permanent Committee for Scholarly Research and Ifta in the Kingdom of Saudi Arabia.",
    url: "https://www.alifta.gov.sa",
    organizationAr: "المملكة العربية السعودية — الإفتاء",
    organizationEn: "Saudi General Presidency of Ifta",
    languageTags: ["ar", "en", "fr", "ur"],
  },
  {
    slug: "quran-complex",
    category: "quran_official",
    titleAr: "مجمع الملك فهد لطباعة المصحف الشريف",
    titleEn: "King Fahd Glorious Quran Printing Complex",
    descriptionAr:
      "المرجع العالمي المعتمد لطباعة المصحف الشريف، وترجمات معاني القرآن الكريم، والتفسير الميسر.",
    descriptionEn:
      "The premier authority in Madinah for Quran printing, Uthmani text verification, and vetted translations.",
    url: "https://qurancomplex.gov.sa",
    organizationAr: "المدينة المنورة — مجمع الملك فهد",
    organizationEn: "King Fahd Complex, Madinah",
    languageTags: ["ar", "en", "multi"],
  },
  {
    slug: "quranenc",
    category: "multilingual",
    titleAr: "موسوعة القرآن الكريم (QuranEnc)",
    titleEn: "QuranEnc — Multilingual Quran Encyclopedia",
    descriptionAr:
      "ترجمات موثقة ومراجعة لمعاني القرآن الكريم بأكثر من 70 لغة عالمية.",
    descriptionEn:
      "Free, vetted translations of the meanings of the Noble Quran in over 70 world languages.",
    url: "https://quranenc.com",
    organizationAr: "موسوعة القرآن العالمية",
    organizationEn: "IslamHouse / QuranEnc Project",
    languageTags: ["ar", "en", "fr", "es", "id", "ur", "tr"],
  },
  {
    slug: "islamhouse",
    category: "multilingual",
    titleAr: "موقع دار الإسلام (IslamHouse) متعدد اللغات",
    titleEn: "IslamHouse Multilingual Educational Portal",
    descriptionAr:
      "مكتبة دعوية شاملة للكتب والمرئيات والمواد التعريفية بالإسلام بأكثر من 100 لغة.",
    descriptionEn:
      "Comprehensive repository of authenticated books, articles, and guides about Islam in over 100 languages.",
    url: "https://islamhouse.com",
    organizationAr: "المكتب التعاوني للدعوة بالربوة",
    organizationEn: "IslamHouse International",
    languageTags: ["ar", "en", "multi"],
  },
  {
    slug: "ehsan-charity",
    category: "charity",
    titleAr: "منصة إحسان الوطنية للعمل الخيري",
    titleEn: "Ehsan — National Platform for Charitable Work",
    descriptionAr:
      "المنصة الوطنية السعودية الرسمية الموثوقة لإخراج الزكاة والصدقات والكفارات والأضاحي والفرص الخيرية بإشراف الجهات الرسمية.",
    descriptionEn:
      "Saudi Arabia's official national charity platform overseen by government authorities for Zakat, Sadaqah, and verified humanitarian causes.",
    url: "https://ehsan.sa",
    organizationAr: "الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)",
    organizationEn: "Official Saudi National Platform (ehsan.sa)",
    languageTags: ["ar", "en"],
  },
  {
    slug: "jood-eskan",
    category: "charity",
    titleAr: "منصة جود الإسكان الخيرية",
    titleEn: "Jood Eskan Housing Charity Platform",
    descriptionAr:
      "منصة سعودية رسمية موثوقة تهدف إلى إشراك المجتمع في دعم الأسر الأشد حاجة لتوفير المسكن الملائم.",
    descriptionEn:
      "Official Saudi housing charity initiative connecting verified contributions directly to families in housing need.",
    url: "https://joodeskan.sa",
    organizationAr: "مؤسسة الإسكان التنموي الأهلية (سكن)",
    organizationEn: "Sakan Developmental Housing Foundation",
    languageTags: ["ar"],
  },
  {
    slug: "shefa-charity",
    category: "charity",
    titleAr: "منصة شفاء الخيرية للعلاج",
    titleEn: "Shefa Medical Charity Platform",
    descriptionAr:
      "منصة رسمية تابعة لوزارة الصحة وصندوق الوقف الصحي لتغطية تكاليف علاج المرضى غير القادرين.",
    descriptionEn:
      "Official medical charity platform supporting treatment for patients in need under the Health Endowment Fund.",
    url: "https://shefa.sa",
    organizationAr: "صندوق الوقف الصحي — المملكة العربية السعودية",
    organizationEn: "Health Endowment Fund, Saudi Arabia",
    languageTags: ["ar"],
  },
];

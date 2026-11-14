import type { Article, ArticleCategory } from "@/types/islamic";

export const ARTICLE_CATEGORIES: {
  id: ArticleCategory;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
}[] = [
  {
    id: "aqeedah",
    nameAr: "العقيدة وأصول الإيمان",
    nameEn: "Aqeedah & Foundations",
    descriptionAr: "توحيد الله تعالى وأركان الإيمان الستة على هدي الكتاب والسنة.",
    descriptionEn: "Islamic monotheism (Tawhid) and the six articles of faith grounded in Quran and Sunnah.",
  },
  {
    id: "worship",
    nameAr: "العبادات والعمل اليومي",
    nameEn: "Worship & Daily Practice",
    descriptionAr: "فقه الصلاة والزكاة والصيام وأثر العبادات في تزكية النفس.",
    descriptionEn: "Practical guidance on prayer, charity, fasting, and daily spiritual devotion.",
  },
  {
    id: "seerah",
    nameAr: "السيرة النبوية ﷺ",
    nameEn: "Prophetic Seerah ﷺ",
    descriptionAr: "محطات مضيئة من سيرة خاتم الأنبياء محمد صلى الله عليه وسلم.",
    descriptionEn: "Illuminating milestones from the life of Prophet Muhammad ﷺ.",
  },
  {
    id: "prophets",
    nameAr: "قصص الأنبياء",
    nameEn: "Stories of the Prophets",
    descriptionAr: "دروس الثبات والدعوة والتوكل من قصص أنبياء الله عليهم السلام.",
    descriptionEn: "Lessons of faith, perseverance, and trust in Allah from the lives of the Prophets.",
  },
  {
    id: "manners",
    nameAr: "الأخلاق والآداب الإسلامية",
    nameEn: "Islamic Manners & Character",
    descriptionAr: "الصدق والبر والرحمة وحسن الخلق في تعامل المسلم مع الناس.",
    descriptionEn: "Truthfulness, compassion, integrity, and noble conduct in daily life.",
  },
  {
    id: "new_muslims",
    nameAr: "دليل المسلم الجديد",
    nameEn: "New Muslims Guide",
    descriptionAr: "مدخل ميسر وشامل لتعلم أركان الإسلام والطهارة والصلاة بخطوات عملية.",
    descriptionEn: "A welcoming, practical roadmap covering the pillars of Islam, purification, and daily prayer.",
  },
  {
    id: "education",
    nameAr: "التربية والتعليم الإسلامي",
    nameEn: "Islamic Education",
    descriptionAr: "منهجية بناء الأسرة المسلمة وغرس محبة القرآن والعلم النافع.",
    descriptionEn: "Nurturing Islamic values in families, youth, and lifelong learning.",
  },
];

export const ARTICLES: Article[] = [
  {
    slug: "foundations-of-tawhid",
    category: "aqeedah",
    titleAr: "أصول العقيدة الإسلامية: التوحيد وأركان الإيمان الستة",
    titleEn: "Foundations of Islamic Creed: Tawhid and the Six Pillars of Faith",
    summaryAr:
      "بيان مبسط ومؤصل لمعنى التوحيد الخالص وأقسامه، وأركان الإيمان الستة كما وردت في حديث جبريل عليه السلام.",
    summaryEn:
      "A clear, source-grounded overview of pure monotheism (Tawhid) and the six articles of faith taught in Hadith Jibril.",
    readingMinutes: 5,
    isFeatured: true,
    blocks: [
      {
        type: "editorial",
        headingAr: "التوحيد أساس الرسالات السماوية",
        headingEn: "Tawhid: The Core of Every Prophetic Message",
        textAr:
          "العقيدة الإسلامية الصافية تبدأ من إفراد الله سبحانه وتعالى بالعبادة والطاعة، والإيمان الجازم بأنه الخالق المدبر لكل شؤون الكون، المتصف بصفات الكمال والجلال. ومن أصل التوحيد ينبثق سلام القلب واستقامة السلوك، إذ لا يتعلق المؤمن بغير ربه خوفاً ورجاءً وتوكلاً.",
        textEn:
          "Sound Islamic belief begins with devoting worship and obedience exclusively to Allah alone, recognizing Him as the Creator and Sustainer of the universe who possesses absolute perfection. From this certainty springs inner peace and moral clarity.",
      },
      {
        type: "quote",
        quoteType: "quran",
        arabicText: "﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾",
        englishText:
          "Say, 'He is Allah, [who is] One, Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.'",
        referenceAr: "سورة الإخلاص: الآيات 1-4",
        referenceEn: "Surah Al-Ikhlas 112:1-4",
      },
      {
        type: "editorial",
        headingAr: "أركان الإيمان الستة",
        headingEn: "The Six Articles of Faith",
        textAr:
          "لخّص النبي ﷺ أصول الإيمان في حديث جبريل المشهور حين أجابه بقوله: أن تؤمن بالله وملائكته وكتبه ورسله واليوم الآخر وتؤمن بالقدر خيره وشره. فهذه الأركان الستة تمثل التصور الإيماني المتكامل الذي يربط الإنسان بخالقه ومصيره.",
        textEn:
          "Prophet Muhammad ﷺ summarized the articles of faith when asked by Angel Jibril: to believe in Allah, His angels, His revealed scriptures, His messengers, the Last Day, and divine decree (Al-Qadar), both its good and its testing aspects.",
      },
      {
        type: "quote",
        quoteType: "hadith",
        arabicText:
          "«أَنْ تُؤْمِنَ بِاللَّهِ، وَمَلَائِكَتِهِ، وَكُتُبِهِ، وَرُسُلِهِ، وَالْيَوْمِ الْآخِرِ، وَتُؤْمِنَ بِالْقَدَرِ خَيْرِهِ وَشَرِّهِ»",
        englishText:
          "It is to believe in Allah, His angels, His books, His messengers, the Last Day, and to believe in divine decree, its good and its evil.",
        referenceAr: "صحيح مسلم — حديث جبريل (رقم 8)",
        referenceEn: "Sahih Muslim — Hadith Jibril (#8)",
      },
    ],
    sources: [
      {
        nameAr: "موقع سماحة الشيخ عبدالعزيز بن باز — دروس العقيدة",
        nameEn: "Official Website of Sheikh Bin Baz — Aqeedah Lessons",
        url: "https://binbaz.org.sa",
      },
      {
        nameAr: "مجمع الملك فهد لطباعة المصحف الشريف — التفسير الميسر",
        nameEn: "King Fahd Complex — Al-Tafsir Al-Muyassar",
        url: "https://qurancomplex.gov.sa",
      },
    ],
  },
  {
    slug: "khushu-in-prayer",
    category: "worship",
    titleAr: "الخشوع في الصلاة: روح العبادة وطمأنينة النفس",
    titleEn: "Khushu in Prayer: The Spirit of Worship and Inner Serenity",
    summaryAr:
      "كيف يستحضر المسلم قلبه في صلاته اليومية من خلال استشعار معاني الفاتحة والتأني في الأركان.",
    summaryEn:
      "Practical ways to cultivate presence of heart in daily Salah through unhurried stillness and reflection.",
    readingMinutes: 4,
    isFeatured: true,
    blocks: [
      {
        type: "editorial",
        headingAr: "الصلاة صلة بين العبد وربه",
        headingEn: "Prayer as a Direct Connection with Allah",
        textAr:
          "الصلاة عمود الدين وأول ما يُحاسب عليه العبد يوم القيامة. وقد جعلها الله قرة عينٍ للمؤمنين وملاذاً من هموم الدنيا. والخشوع فيها يعني سكون الجوارح وحضور القلب واستشعار الوقوف بين يدي الله تعالى.",
        textEn:
          "Salah is the pillar of Islam and a sanctuary from worldly anxiety. Khushu entails both outward tranquility of posture and inward presence of mind, recognizing that one is conversing directly with the Creator.",
      },
      {
        type: "quote",
        quoteType: "quran",
        arabicText: "﴿قَدْ أَفْلَحَ الْمُؤْمِنُونَ ۝ الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ﴾",
        englishText:
          "Certainly will the believers have succeeded: They who are during their prayer humbly submissive.",
        referenceAr: "سورة المؤمنون: الآيتان 1-2",
        referenceEn: "Surah Al-Mu'minun 23:1-2",
      },
      {
        type: "editorial",
        headingAr: "خطوات عملية لتحقيق الطمأنينة",
        headingEn: "Practical Steps Toward Tranquility",
        textAr:
          "من أعظم ما يعين على الخشوع: إسباغ الوضوء باحتساب الأجر، والتبكير إلى الصلاة أو التهيؤ لها قبل الأذان، وتدبر معاني سورة الفاتحة آيةً آية، والتأني في الركوع والسجود وعدم العجلة في التسبيح والأذكار.",
        textEn:
          "Key habits that nurture Khushu include performing Wudu mindfully, preparing calmly ahead of prayer time, reflecting on the verses of Surah Al-Fatihah, and pausing briefly in every bowing and prostration.",
      },
    ],
    sources: [
      {
        nameAr: "الرئاسة العامة للبحوث العلمية والإفتاء",
        nameEn: "Saudi General Presidency of Scholarly Research and Ifta",
        url: "https://www.alifta.gov.sa",
      },
    ],
  },
  {
    slug: "mercy-in-seerah",
    category: "seerah",
    titleAr: "الرحمة والحكمة في سيرة النبي محمد ﷺ",
    titleEn: "Mercy and Wisdom in the Seerah of Prophet Muhammad ﷺ",
    summaryAr:
      "قراءة في شمائل النبي ﷺ وهديه في التعامل مع أهله وأصحابه والمجتمع، وكيف غيّر العالم بالخلق العظيم.",
    summaryEn:
      "Exploring the Prophet's ﷺ compassion, patience, and leadership in Makkah and Madinah.",
    readingMinutes: 6,
    isFeatured: true,
    blocks: [
      {
        type: "editorial",
        headingAr: "رسالة رحمة للعالمين",
        headingEn: "A Mercy Sent to All Creation",
        textAr:
          "لم تكن بعثة النبي محمد ﷺ حدثاً تاريخياً عابراً، بل كانت إشراقة هدايةٍ ورحمةٍ شملت الإنسان والبيئة والمجتمع. فقد ربّى جيلاً على الصدق والأمانة والعدل والرفق حتى شهد له المخالف قبل الموافق بسمو خلقه.",
        textEn:
          "The mission of Prophet Muhammad ﷺ brought mercy, moral clarity, and dignity to humanity. Even before prophethood he was known as Al-Amin (the Trustworthy), and throughout his life he answered hardship with forbearance.",
      },
      {
        type: "quote",
        quoteType: "quran",
        arabicText: "﴿وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ﴾",
        englishText: "And We have not sent you, [O Muhammad], except as a mercy to the worlds.",
        referenceAr: "سورة الأنبياء: الآية 107",
        referenceEn: "Surah Al-Anbiya 21:107",
      },
      {
        type: "quote",
        quoteType: "hadith",
        arabicText: "«إِنَّمَا بُعِثْتُ لِأُتَمِّمَ صَالِحَ الْأَخْلَاقِ»",
        englishText: "Indeed, I was only sent to perfect righteous character.",
        referenceAr: "مسند أحمد (8952) — والأدب المفرد للبخاري (273)",
        referenceEn: "Musnad Ahmad 8952, Al-Adab Al-Mufrad 273",
      },
    ],
    sources: [
      {
        nameAr: "الرحيق المختوم — المباركفوري",
        nameEn: "Ar-Raheeq Al-Makhtum (The Sealed Nectar)",
      },
      {
        nameAr: "موقع الشيخ عبدالعزيز بن باز — السيرة والشمائل",
        nameEn: "Sheikh Bin Baz Official Archive — Prophetic Biography",
        url: "https://binbaz.org.sa",
      },
    ],
  },
  {
    slug: "prophets-steadfastness",
    category: "prophets",
    titleAr: "قصص الأنبياء: دروس الصبر والتوكل من إبراهيم ويوسف عليهما السلام",
    titleEn: "Stories of the Prophets: Lessons of Patience from Ibrahim and Yusuf",
    summaryAr:
      "تأملات إيمانية في دعوة الخليل إبراهيم عليه السلام، وصبر نبي الله يوسف عليه السلام ويقينه بتدبير الله.",
    summaryEn:
      "Faith-building reflections from the trials, prayers, and unwavering trust of Prophets Ibrahim and Yusuf (peace be upon them).",
    readingMinutes: 5,
    blocks: [
      {
        type: "editorial",
        headingAr: "لماذا قص الله علينا أخبار الأنبياء؟",
        headingEn: "Why the Quran Narrates the Stories of the Prophets",
        textAr:
          "تأتي قصص الأنبياء في القرآن الكريم لتثبيت القلوب وتربية المؤمنين على سنن الله في الابتلاء والنصر. ففي قصة نبي الله إبراهيم عليه السلام نرى قوة الحجة ولين الخطاب واليقين الكامل بكفاية الله، وفي قصة يوسف عليه السلام نرى العفة والعفو عند المقدرة والثقة بأن مع العسر يسراً.",
        textEn:
          "The Quranic accounts of the Prophets serve to steady hearts and illuminate divine wisdom through every season of life. Prophet Ibrahim exemplifies sincere devotion and calm reasoning, while Prophet Yusuf embodies integrity, forgiveness, and serene patience.",
      },
      {
        type: "quote",
        quoteType: "quran",
        arabicText: "﴿لَقَدْ كَانَ فِي قَصَصِهِمْ عِبْرَةٌ لِّأُولِي الْأَلْبَابِ﴾",
        englishText: "There was certainly in their stories a lesson for those of understanding.",
        referenceAr: "سورة يوسف: الآية 111",
        referenceEn: "Surah Yusuf 12:111",
      },
    ],
    sources: [
      {
        nameAr: "تفسير القرآن العظيم — الحافظ ابن كثير",
        nameEn: "Tafsir al-Quran al-Azim — Ibn Kathir",
      },
    ],
  },
  {
    slug: "islamic-ethics-daily-life",
    category: "manners",
    titleAr: "الأخلاق الإسلامية: الصدق والأمانة وحفظ اللسان",
    titleEn: "Islamic Manners: Truthfulness, Trustworthiness, and Guarding the Tongue",
    summaryAr:
      "كيف تترجم القيم الإيمانية إلى سلوك عملي في الأسرة والعمل والتعامل الرقمي المعاصر.",
    summaryEn:
      "Translating faith into everyday integrity across family life, work ethics, and modern digital speech.",
    readingMinutes: 4,
    blocks: [
      {
        type: "editorial",
        headingAr: "ميزان الخلق الحسن",
        headingEn: "The Weight of Noble Character",
        textAr:
          "لا ينفصل الدين في الإسلام عن الخلق الحسن؛ فالمسلم الحق صادقٌ في حديثه، أمينٌ في عمله، رحيمٌ بأهله وجيرانه، متثبتٌ فيما ينقله أو يكتبه. وقد شمل الهدي النبوي آداب الكلام في الواقع وفي كل وسيلة تواصل.",
        textEn:
          "In Islam, devotion and character are inseparable. A sincere believer upholds honesty in speech, fairness in dealings, kindness to family and neighbors, and care before repeating or sharing words.",
      },
      {
        type: "quote",
        quoteType: "hadith",
        arabicText:
          "«مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ»",
        englishText:
          "Whoever believes in Allah and the Last Day should speak what is good or remain silent.",
        referenceAr: "صحيح البخاري (6018) وصحيح مسلم (47)",
        referenceEn: "Sahih al-Bukhari 6018, Sahih Muslim 47",
      },
    ],
    sources: [
      {
        nameAr: "صحيح البخاري — كتاب الأدب",
        nameEn: "Sahih al-Bukhari — Book of Good Manners",
      },
    ],
  },
  {
    slug: "new-muslim-roadmap",
    category: "new_muslims",
    titleAr: "دليل المسلم الجديد: خطواتك الأولى نحو الطمأنينة والعبادة",
    titleEn: "New Muslim Guide: Your First Steps in Faith and Daily Worship",
    summaryAr:
      "خارطة طريق هادئة وعملية لمن اعتنق الإسلام حديثاً أو يتعرف على مبادئ الإسلام الأساسية.",
    summaryEn:
      "A calm, encouraging step-by-step introduction to the Five Pillars, Wudu, and starting your daily prayers.",
    readingMinutes: 7,
    isFeatured: true,
    blocks: [
      {
        type: "editorial",
        headingAr: "مرحباً بك في رحاب الإسلام",
        headingEn: "Welcome to a Journey of Clarity and Peace",
        textAr:
          "الإسلام دين الفطرة واليسر، يقوم على علاقة مباشرة بين الإنسان وخالقه دون وسطاء. تبدأ الخطوة الأولى بالشهادتين: شهادة أن لا إله إلا الله وأن محمداً رسول الله، ثم التدرج الهادئ في تعلم الوضوء والصلاة وبناء الصلة بالقرآن الكريم.",
        textEn:
          "Islam is a faith of clarity, mercy, and ease built on a direct relationship between you and your Creator. Your journey starts with the Shahadah (testimony of faith), followed by learning Wudu and gradually establishing the five daily prayers at a steady, comfortable pace.",
      },
      {
        type: "quote",
        quoteType: "quran",
        arabicText: "﴿يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ﴾",
        englishText: "Allah intends for you ease and does not intend for you hardship.",
        referenceAr: "سورة البقرة: الآية 185",
        referenceEn: "Surah Al-Baqarah 2:185",
      },
      {
        type: "editorial",
        headingAr: "خطوات عملية للأسبوع الأول",
        headingEn: "Practical Focus for Your First Week",
        textAr:
          "لا تشغل نفسك بكل التفاصيل دفعة واحدة: ابدأ بحفظ سورة الفاتحة وتعلم خطوات الوضوء، واستخدم صفحة مواقيت الصلاة لمعرفة أوقات الصلوات الخمس، واجعل لك ورداً يسيراً من الأذكار والقرآن المترجم المعاني.",
        textEn:
          "Avoid feeling overwhelmed by trying to learn everything on day one. Begin with Surah Al-Fatihah and the steps of Wudu, use our Prayer Times section to track the five daily prayers, and read a few verses daily with clear translation.",
      },
    ],
    sources: [
      {
        nameAr: "بوابة دار الإسلام للمسلمين الجدد",
        nameEn: "IslamHouse — New Muslims Resources",
        url: "https://islamhouse.com",
      },
      {
        nameAr: "موسوعة القرآن العالمية (QuranEnc)",
        nameEn: "QuranEnc Translations",
        url: "https://quranenc.com",
      },
    ],
  },
  {
    slug: "nurturing-quran-home",
    category: "education",
    titleAr: "التربية الإسلامية في البيت: بناء بيئة قرآنية مطمئنة",
    titleEn: "Islamic Education at Home: Cultivating a Quran-Centered Family",
    summaryAr:
      "أسس تربوية رفيقة لغرس حب الله ورسوله ﷺ في قلوب الأبناء عبر القدوة والحوار.",
    summaryEn:
      "Gentle, practical ways for parents and educators to nurture love for the Quran and Prophetic character at home.",
    readingMinutes: 5,
    blocks: [
      {
        type: "editorial",
        headingAr: "القدوة قبل التلقين",
        headingEn: "Leading by Living Example",
        textAr:
          "التربية الإسلامية الناجحة تقوم على المحبة والرحمة والقدوة الصالحة قبل التوجيه المباشر. حين يرى الأبناء هدوء الوالدين عند الصلاة، وحرصهما على الذكر والاستماع للقرآن، ينشأ في البيت مناخٌ من السكينة والانتماء الإيماني.",
        textEn:
          "Effective Islamic upbringing flourishes through warmth, patience, and consistent example. When children witness parents welcoming prayer calmly and listening to Quran recitation together, faith becomes a natural source of comfort.",
      },
      {
        type: "quote",
        quoteType: "hadith",
        arabicText: "«خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»",
        englishText: "The best among you are those who learn the Quran and teach it.",
        referenceAr: "صحيح البخاري (5027)",
        referenceEn: "Sahih al-Bukhari 5027",
      },
    ],
    sources: [
      {
        nameAr: "صحيح البخاري — كتاب فضائل القرآن",
        nameEn: "Sahih al-Bukhari — Virtues of the Quran",
      },
    ],
  },
];

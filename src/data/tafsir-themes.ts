export interface TafsirThemeVerse {
  surahNumber: number;
  ayahNumber: number;
  surahNameAr: string;
  surahNameEn: string;
  excerptAr: string;
  excerptEn: string;
  keyFocusAr: string;
  keyFocusEn: string;
}

export interface TafsirTheme {
  id: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  reflectionPromptsAr: string[];
  reflectionPromptsEn: string[];
  verses: TafsirThemeVerse[];
}

export const QURANIC_THEMES: TafsirTheme[] = [
  {
    id: "patience",
    titleAr: "الصبر والثبات",
    titleEn: "Patience (Sabr)",
    summaryAr:
      "الصبر في القرآن الكريم منزلة عظيمة يرتبط بالاستعانة بالله والصلاة واليقين بحسن عاقبة المتقين، وقد قرن الله تعالى معيته بالصابرين ورتّب على صبرهم أجراً بغير حساب.",
    summaryEn:
      "In the Quran, Sabr is steadfastness paired with prayer and trust in Allah's wisdom, accompanied by Allah's promise of His closeness and reward without measure.",
    reflectionPromptsAr: [
      "ما الموقف اليومي الذي أحتاج فيه أن أستبدل التضجر بالاستعانة بالصبر والصلاة؟",
      "كيف يغيّر استحضار قوله تعالى ﴿إِنَّ اللَّهَ مَعَ الصَّابِرِينَ﴾ نظرتي إلى الشدائد؟",
    ],
    reflectionPromptsEn: [
      "Where in my daily routine do I need to replace impatience with prayer and steady composure?",
      "How does remembering 'Allah is with the patient' reshape my response to hardship?",
    ],
    verses: [
      {
        surahNumber: 2,
        ayahNumber: 153,
        surahNameAr: "البقرة",
        surahNameEn: "Al-Baqara",
        excerptAr: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
        excerptEn: "O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.",
        keyFocusAr: "اقتران الصبر بالصلاة ومعية الله الخاصة للصابرين.",
        keyFocusEn: "Seeking aid through patience and prayer together.",
      },
      {
        surahNumber: 39,
        ayahNumber: 10,
        surahNameAr: "الزمر",
        surahNameEn: "Az-Zumar",
        excerptAr: "إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ",
        excerptEn: "Indeed, the patient will be given their reward without account.",
        keyFocusAr: "عظم جزاء الصبر عند الله تعالى.",
        keyFocusEn: "Immeasurable reward promised for steadfast patience.",
      },
      {
        surahNumber: 3,
        ayahNumber: 200,
        surahNameAr: "آل عمران",
        surahNameEn: "Aal-i-Imran",
        excerptAr: "يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُفْلِحُونَ",
        excerptEn: "O you who have believed, persevere and endure and remain stationed and fear Allah that you may be successful.",
        keyFocusAr: "مراتب الصبر والمصابرة والمرابطة لتحقيق الفلاح.",
        keyFocusEn: "Perseverance, endurance, and spiritual vigilance.",
      },
    ],
  },
  {
    id: "gratitude",
    titleAr: "الشكر وحفظ النعم",
    titleEn: "Gratitude (Shukr)",
    summaryAr:
      "الشكر في المنهج القرآني اعترافٌ بالقلب وثناءٌ باللسان واستعمالٌ للنعمة في مرضاة الله، وهو سبب صريح للزيادة والبركة كما قرر الله في كتابه.",
    summaryEn:
      "Quranic gratitude encompasses recognizing Allah's blessings with the heart, praising Him on the tongue, and using those blessings in obedience.",
    reflectionPromptsAr: [
      "ما ثلاث نعمٍ معتادة في يومي غفلتُ عن شكر الله عليها قولاً وعملاً؟",
      "كيف أسخّر نعمةً أنعم الله بها عليّ اليوم في نفع غيري؟",
    ],
    reflectionPromptsEn: [
      "Which three everyday blessings have I taken for granted recently?",
      "How can I put one of Allah's blessings into righteous service today?",
    ],
    verses: [
      {
        surahNumber: 14,
        ayahNumber: 7,
        surahNameAr: "إبراهيم",
        surahNameEn: "Ibrahim",
        excerptAr: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ",
        excerptEn: "If you are grateful, I will surely increase you [in favor].",
        keyFocusAr: "وعد الله الصريح بزيادة النعم لأهل الشكر.",
        keyFocusEn: "The divine promise of increase through gratitude.",
      },
      {
        surahNumber: 2,
        ayahNumber: 152,
        surahNameAr: "البقرة",
        surahNameEn: "Al-Baqara",
        excerptAr: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
        excerptEn: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
        keyFocusAr: "الربط الوثيق بين ذكر الله وشكره.",
        keyFocusEn: "The bond between remembering Allah and thanking Him.",
      },
      {
        surahNumber: 31,
        ayahNumber: 12,
        surahNameAr: "لقمان",
        surahNameEn: "Luqman",
        excerptAr: "وَمَن يَشْكُرْ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِ",
        excerptEn: "Whoever is grateful is grateful for [the benefit of] himself.",
        keyFocusAr: "ثمرة الشكر عائدة على العبد نفسه.",
        keyFocusEn: "Gratitude ultimately benefits the believer's own soul.",
      },
    ],
  },
  {
    id: "repentance",
    titleAr: "التوبة والأوبة إلى الله",
    titleEn: "Repentance (Tawbah)",
    summaryAr:
      "يفتح القرآن الكريم باب الرجاء لكل مذنب بالتوبة النصوح والإنابة الصادقة، مبيّناً سعة مغفرة الله وتحويله سيئات التائبين الصادقين إلى حسنات.",
    summaryEn:
      "The Quran keeps the door of mercy open for every sincere servant who turns back to Allah in genuine repentance.",
    reflectionPromptsAr: [
      "ما الخطوة العملية الصادقة التي يمكنني البدء بها اليوم لإصلاح جانبٍ قصرت فيه؟",
      "هل استحضرت في دعائي اليوم اسم الله التوّاب والغفور بيقينٍ وحسن ظن؟",
    ],
    reflectionPromptsEn: [
      "What sincere, practical step can I take today to mend an area of shortcoming?",
      "How does Allah's vast mercy motivate hope without complacency?",
    ],
    verses: [
      {
        surahNumber: 39,
        ayahNumber: 53,
        surahNameAr: "الزمر",
        surahNameEn: "Az-Zumar",
        excerptAr: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا",
        excerptEn: "Say, 'O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins.'",
        keyFocusAr: "النهي عن القنوط وبيان سعة المغفرة للتائبين.",
        keyFocusEn: "A call away from despair toward Allah's all-encompassing forgiveness.",
      },
      {
        surahNumber: 66,
        ayahNumber: 8,
        surahNameAr: "التحريم",
        surahNameEn: "At-Tahrim",
        excerptAr: "يَا أَيُّهَا الَّذِينَ آمَنُوا تُوبُوا إِلَى اللَّهِ تَوْبَةً نَّصُوحًا",
        excerptEn: "O you who have believed, repent to Allah with sincere repentance.",
        keyFocusAr: "حقيقة التوبة النصوح وأثرها في تكفير السيئات.",
        keyFocusEn: "Sincere repentance and its purifying promise.",
      },
      {
        surahNumber: 25,
        ayahNumber: 70,
        surahNameAr: "الفرقان",
        surahNameEn: "Al-Furqan",
        excerptAr: "إِلَّا مَن تَابَ وَآمَنَ وَعَمِلَ عَمَلًا صَالِحًا فَأُولَٰئِكَ يُبَدِّلُ اللَّهُ سَيِّئَاتِهِمْ حَسَنَاتٍ",
        excerptEn: "Except for those who repent, believe and do righteous work. For them Allah will replace their evil deeds with good.",
        keyFocusAr: "الإيمان والعمل الصالح بعد التوبة.",
        keyFocusEn: "Replacing past wrongs with faith and righteous action.",
      },
    ],
  },
  {
    id: "mercy",
    titleAr: "الرحمة الإلهية والتراحم",
    titleEn: "Mercy (Rahmah)",
    summaryAr:
      "تفتتح سور القرآن بالبسملة الدالة على سعة رحمة الله، وقد وسعت رحمته سبحانه كل شيء، وأثبتها خاصةً للمتقين المؤمنين بآياته.",
    summaryEn:
      "Allah's mercy precedes His wrath and encompasses all creation, promised specifically to the mindful and righteous.",
    reflectionPromptsAr: [
      "كيف أنعكس أثر التراحم في تعاملي مع أهلي وجيراني اليوم؟",
    ],
    reflectionPromptsEn: [
      "How can I embody mercy in my speech and conduct with family and neighbors today?",
    ],
    verses: [
      {
        surahNumber: 7,
        ayahNumber: 156,
        surahNameAr: "الأعراف",
        surahNameEn: "Al-A'raf",
        excerptAr: "وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ ۚ فَسَأَكْتُبُهَا لِلَّذِينَ يَتَّقُونَ",
        excerptEn: "My mercy encompasses all things. So I will decree it [especially] for those who fear Me.",
        keyFocusAr: "عموم الرحمة وخصوصها لأهل التقوى والإيمان.",
        keyFocusEn: "Universal mercy and special favor for the mindful.",
      },
      {
        surahNumber: 21,
        ayahNumber: 107,
        surahNameAr: "الأنبياء",
        surahNameEn: "Al-Anbiya",
        excerptAr: "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ",
        excerptEn: "And We have not sent you, [O Muhammad], except as a mercy to the worlds.",
        keyFocusAr: "رسالة النبي ﷺ رحمة للعالمين.",
        keyFocusEn: "Prophet Muhammad ﷺ as a mercy to all worlds.",
      },
    ],
  },
  {
    id: "paradise",
    titleAr: "الجنة ونعيمها",
    titleEn: "Paradise (Jannah)",
    summaryAr:
      "يصف القرآن الجنة ونعيمها الأبدي شحذاً للهمم في المسابقة إلى الطاعات، وأعظم نعيمها رضوان الله والنظر إلى وجهه الكريم.",
    summaryEn:
      "Quranic descriptions of Paradise inspire believers to strive in goodness, culminating in Allah's eternal pleasure.",
    reflectionPromptsAr: [
      "أي عملٍ خفيٍّ بيني وبين الله أحرص على المداومة عليه طلباً لدار الكرامة؟",
    ],
    reflectionPromptsEn: [
      "What quiet, sincere good deed can I make consistent in pursuit of Jannah?",
    ],
    verses: [
      {
        surahNumber: 3,
        ayahNumber: 133,
        surahNameAr: "آل عمران",
        surahNameEn: "Aal-i-Imran",
        excerptAr: "وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ أُعِدَّتْ لِلْمُتَّقِينَ",
        excerptEn: "And hasten to forgiveness from your Lord and a garden as wide as the heavens and earth, prepared for the righteous.",
        keyFocusAr: "المسارعة إلى المغفرة وصفات المتقين.",
        keyFocusEn: "Hastening toward forgiveness and eternal gardens.",
      },
      {
        surahNumber: 32,
        ayahNumber: 17,
        surahNameAr: "السجدة",
        surahNameEn: "As-Sajdah",
        excerptAr: "فَلَا تَعْلَمُ نَفْسٌ مَّا أُخْفِيَ لَهُم مِّن قُرَّةِ أَعْيُنٍ جَزَاءً بِمَا كَانُوا يَعْمَلُونَ",
        excerptEn: "And no soul knows what has been hidden for them of comfort for eyes as reward for what they used to do.",
        keyFocusAr: "عظم ما أعد الله لأهل قيام الليل والإنفاق.",
        keyFocusEn: "Unseen joy reserved for sincere worshippers.",
      },
    ],
  },
  {
    id: "hereafter",
    titleAr: "اليوم الآخر والميزان",
    titleEn: "The Hereafter (Al-Akhirah)",
    summaryAr:
      "الإيمان باليوم الآخر أصلٌ من أصول الإيمان الستة، يورث استقامة القلب واستحضار الوقوف بين يدي الله والحساب العدل.",
    summaryEn:
      "Belief in the Hereafter anchors moral accountability and turns earthly life into preparation for an eternal abode.",
    reflectionPromptsAr: [
      "إذا قرأت ﴿وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ﴾، فكيف أزن صغائر الأعمال اليوم؟",
    ],
    reflectionPromptsEn: [
      "Reflecting on 'an atom's weight of good', what small act of kindness should I never belittle?",
    ],
    verses: [
      {
        surahNumber: 99,
        ayahNumber: 7,
        surahNameAr: "الزلزلة",
        surahNameEn: "Az-Zalzalah",
        excerptAr: "فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ",
        excerptEn: "So whoever does an atom's weight of good will see it.",
        keyFocusAr: "دقة الحساب والجزاء يوم القيامة.",
        keyFocusEn: "Complete justice down to an atom's weight.",
      },
      {
        surahNumber: 59,
        ayahNumber: 18,
        surahNameAr: "الحشر",
        surahNameEn: "Al-Hashr",
        excerptAr: "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ",
        excerptEn: "O you who have believed, fear Allah. And let every soul look to what it has put forth for tomorrow.",
        keyFocusAr: "محاسبة النفس والاستعداد للقاء الله.",
        keyFocusEn: "Self-reflection and preparing for tomorrow.",
      },
    ],
  },
  {
    id: "faith",
    titleAr: "الإيمان والتوحيد",
    titleEn: "Faith & Tawhid",
    summaryAr:
      "التوحيد والإيمان بالله وملائكته وكتبه ورسله واليوم الآخر والقدر خيره وشره هو الركيزة التي بُعث بها جميع الأنبياء والمرسلين.",
    summaryEn:
      "Pure monotheism (Tawhid) and authentic Iman stand at the very heart of Quranic revelation.",
    reflectionPromptsAr: [
      "كيف ينعكس يقيني بتوحيد الله في طمأنينة قلبي وترك التعلق بغيره؟",
    ],
    reflectionPromptsEn: [
      "How does trusting in Allah's absolute oneness bring tranquility to my heart?",
    ],
    verses: [
      {
        surahNumber: 2,
        ayahNumber: 255,
        surahNameAr: "البقرة",
        surahNameEn: "Al-Baqara",
        excerptAr: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
        excerptEn: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of all existence.",
        keyFocusAr: "أعظم آية في كتاب الله: آية الكرسي في التوحيد والصفات.",
        keyFocusEn: "Ayat al-Kursi: the greatest verse affirming Allah's majesty.",
      },
      {
        surahNumber: 112,
        ayahNumber: 1,
        surahNameAr: "الإخلاص",
        surahNameEn: "Al-Ikhlas",
        excerptAr: "قُلْ هُوَ اللَّهُ أَحَدٌ * اللَّهُ الصَّمَدُ",
        excerptEn: "Say, 'He is Allah, [who is] One, Allah, the Eternal Refuge.'",
        keyFocusAr: "خالص التوحيد وتنزيه الله عن الشريك والمثيل.",
        keyFocusEn: "Absolute purity of monotheism.",
      },
    ],
  },
  {
    id: "prayer",
    titleAr: "الصلاة والخشوع",
    titleEn: "Prayer & Khushu",
    summaryAr:
      "الصلاة عمود الدين وصلة العبد بربه، وقد جعل القرآن الخشوع فيها أول صفات المؤمنين المفلحين وأمر بالمحافظة عليها وذكر الله قائماً وقاعداً.",
    summaryEn:
      "Salah is the pillar of faith and direct communion with Allah, beginning the traits of the successful believers in Surah Al-Mu'minun.",
    reflectionPromptsAr: [
      "ما الذي يشغلني قبل الدخول في الصلاة ويمكنني إبعاده لأحضر قلبي فيها؟",
    ],
    reflectionPromptsEn: [
      "What distraction before Salah can I set aside to cultivate greater presence of heart?",
    ],
    verses: [
      {
        surahNumber: 23,
        ayahNumber: 1,
        surahNameAr: "المؤمنون",
        surahNameEn: "Al-Mu'minun",
        excerptAr: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ * الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ",
        excerptEn: "Certainly will the believers have succeeded: They who are during their prayer humbly submissive.",
        keyFocusAr: "الخشوع في الصلاة مفتاح الفلاح.",
        keyFocusEn: "Humility in prayer as the first mark of success.",
      },
      {
        surahNumber: 29,
        ayahNumber: 45,
        surahNameAr: "العنكبوت",
        surahNameEn: "Al-Ankabut",
        excerptAr: "وَأَقِمِ الصَّلَاةَ ۖ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ ۗ وَلَذِكْرُ اللَّهِ أَكْبَرُ",
        excerptEn: "And establish prayer. Indeed, prayer prohibits immorality and wrongdoing.",
        keyFocusAr: "الأثر التربوي والأخلاقي لإقامة الصلاة.",
        keyFocusEn: "How establishing prayer guards conduct and elevates the soul.",
      },
    ],
  },
  {
    id: "justice",
    titleAr: "العدل والقسط",
    titleEn: "Justice & Equity",
    summaryAr:
      "أمر الله بالعدل والإحسان حتى مع الخصوم، ونهى أن يحمل بغضُ قومٍ المسلمَ على ترك القسط والإنصاف في القول والشهادة والحكم.",
    summaryEn:
      "Islam commands uncompromising fairness in speech, testimony, and judgment — even toward those one disagrees with.",
    reflectionPromptsAr: [
      "كيف ألتزم الإنصاف والعدل في كلامي وحكمي على الآخرين اليوم؟",
    ],
    reflectionPromptsEn: [
      "Where am I called to speak and act with scrupulous fairness today?",
    ],
    verses: [
      {
        surahNumber: 5,
        ayahNumber: 8,
        surahNameAr: "المائدة",
        surahNameEn: "Al-Ma'idah",
        excerptAr: "يَا أَيُّهَا الَّذِينَ آمَنُوا كُونُوا قَوَّامِينَ لِلَّهِ شُهَدَاءَ بِالْقِسْطِ ۖ وَلَا يَجْرِمَنَّكُمْ شَنَآنُ قَوْمٍ عَلَىٰ أَلَّا تَعْدِلُوا ۚ اعْدِلُوا هُوَ أَقْرَبُ لِلتَّقْوَىٰ",
        excerptEn: "O you who have believed, be persistently standing firm for Allah, witnesses in justice, and do not let the hatred of a people prevent you from being just.",
        keyFocusAr: "العدل المطلق أقرب للتقوى ولو مع المخالف.",
        keyFocusEn: "Justice as closest to piety regardless of personal sentiment.",
      },
      {
        surahNumber: 16,
        ayahNumber: 90,
        surahNameAr: "النحل",
        surahNameEn: "An-Nahl",
        excerptAr: "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ وَإِيتَاءِ ذِي الْقُرْبَىٰ",
        excerptEn: "Indeed, Allah orders justice and good conduct and giving to relatives.",
        keyFocusAr: "الآية الجامعة لأصول العدل والإحسان وصلة الأرحام.",
        keyFocusEn: "A foundational verse encompassing justice, excellence, and kinship.",
      },
    ],
  },
  {
    id: "character",
    titleAr: "حسن الخلق والقول الحسن",
    titleEn: "Good Character (Akhlaq)",
    summaryAr:
      "دعا القرآن إلى دفع السيئة بالحسنة، وخفض الجناح، واجتناب الغيبة والتنابز، وحفظ اللسان، مؤكداً أن الخلق العظيم هو هدي الأنبياء.",
    summaryEn:
      "Quranic ethics nurture gentle speech, dignity, pardoning others, and guarding the tongue.",
    reflectionPromptsAr: [
      "ما الكلمة الطيبة التي يمكنني أن أصلح بها قلباً أو أدفع بها جفوةً اليوم؟",
    ],
    reflectionPromptsEn: [
      "What kind or reconciling word can I offer today in the spirit of 'repel evil with what is better'?",
    ],
    verses: [
      {
        surahNumber: 41,
        ayahNumber: 34,
        surahNameAr: "فصلت",
        surahNameEn: "Fussilat",
        excerptAr: "ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ فَإِذَا الَّذِي بَيْنَكَ وَبَيْنَهُ عَدَاوَةٌ كَأَنَّهُ وَلِيٌّ حَمِيمٌ",
        excerptEn: "Repel [evil] by that [deed] which is better; and thereupon the one whom between you and him is enmity [will become] as though he was a devoted friend.",
        keyFocusAr: "أثر الحِلم ودفع الإساءة بالإحسان.",
        keyFocusEn: "Transforming hostility through noble response.",
      },
      {
        surahNumber: 68,
        ayahNumber: 4,
        surahNameAr: "القلم",
        surahNameEn: "Al-Qalam",
        excerptAr: "وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ",
        excerptEn: "And indeed, you are of a great moral character.",
        keyFocusAr: "شهادة الله لنبيه ﷺ بالخلق العظيم.",
        keyFocusEn: "Allah's testimony to the noble character of the Prophet ﷺ.",
      },
    ],
  },
];

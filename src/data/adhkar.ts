import type { AdhkarCategoryId, DhikrItem } from "@/types/islamic";
import quranDuasRaw from "./generated/quran-duas.json";

export interface AdhkarCategoryMeta {
  id: AdhkarCategoryId;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export const ADHKAR_CATEGORIES: AdhkarCategoryMeta[] = [
  {
    id: "morning",
    nameAr: "أذكار الصباح",
    nameEn: "Morning Adhkar",
    descriptionAr: "الأذكار المأثورة ما بين صلاة الفجر وطلوع الشمس للتحصين والبركة.",
    descriptionEn: "Authentic Prophetic remembrances recited after Fajr for protection and blessing.",
  },
  {
    id: "evening",
    nameAr: "أذكار المساء",
    nameEn: "Evening Adhkar",
    descriptionAr: "الأذكار المأثورة ما بين صلاة العصر والمغرب لحفظ المسلم وطمأنينته.",
    descriptionEn: "Authentic Prophetic remembrances recited from Asr into the evening.",
  },
  {
    id: "after_prayer",
    nameAr: "أذكار بعد الصلاة",
    nameEn: "After-Prayer Adhkar",
    descriptionAr: "ما يُقال دُبُر الصلوات المكتوبات من استغفار وتسبيح ودعاء.",
    descriptionEn: "Remembrances and tasbih recited immediately following the obligatory prayers.",
  },
  {
    id: "sleep",
    nameAr: "أذكار النوم",
    nameEn: "Before Sleeping",
    descriptionAr: "أذكار وآيات تُقرأ عند إرادة النوم اتباعاً للهدي النبوي.",
    descriptionEn: "Supplications and verses recited upon retiring to sleep.",
  },
  {
    id: "waking",
    nameAr: "أذكار الاستيقاظ",
    nameEn: "Upon Waking",
    descriptionAr: "ما يفتتح به المسلم يومه عند استيقاظه من منامه.",
    descriptionEn: "Remembrance of Allah upon waking up to begin the day with gratitude.",
  },
  {
    id: "daily",
    nameAr: "أدعية يومية",
    nameEn: "Daily Supplications",
    descriptionAr: "أدعية المسجد والخروج والدخول والهم والكرب وتيسير الأمور.",
    descriptionEn: "Everyday supplications for leaving home, entering the mosque, and seeking relief.",
  },
  {
    id: "travel",
    nameAr: "أدعية السفر",
    nameEn: "Travel Supplications",
    descriptionAr: "دعاء الركوب والسفر والرجوع منه وحفظ الأهل والمال.",
    descriptionEn: "Authentic supplications for embarking on a journey and returning safely.",
  },
  {
    id: "protection",
    nameAr: "الوقاية والشفاء",
    nameEn: "Protection & Healing",
    descriptionAr: "أدعية الرقية الشرعية وطلب العافية والشفاء من السقم.",
    descriptionEn: "Prophetic supplications seeking Allah's protection, well-being, and healing.",
  },
  {
    id: "quranic",
    nameAr: "أدعية قرآنية",
    nameEn: "Quranic Supplications",
    descriptionAr: "جوامع الدعاء من كتاب الله تعالى بلفظها القرآني المبارك.",
    descriptionEn: "Comprehensive supplications verbatim from the Noble Quran.",
  },
];

const quranicDuaItems: DhikrItem[] = quranDuasRaw.map((item) => ({
  id: `quran-dua-${item.ref.replace(":", "-")}`,
  category: "quranic",
  arabicText: item.arabicText,
  englishTranslation: item.englishText,
  referenceAr: `${item.surahNameAr} — الآية ${item.ayahNumber}`,
  referenceEn: `Surah ${item.surahNameEn} (${item.surahNumber}:${item.ayahNumber})`,
  repeatCount: 1,
}));

const propheticAdhkar: DhikrItem[] = [
  // Morning Adhkar
  {
    id: "morning-ayat-kursi",
    category: "morning",
    arabicText:
      "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    englishTranslation:
      "Allah — there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep...",
    virtueAr: "من قالها حين يصبح أُجير من الجن حتى يمسي.",
    virtueEn: "Whoever recites it in the morning is protected from jinn until evening.",
    referenceAr: "سورة البقرة: 255 — رواه الحاكم والنسائي (حصن المسلم)",
    referenceEn: "Surah Al-Baqarah 2:255 — Al-Nasa'i / Al-Hakim (Hisn al-Muslim)",
    repeatCount: 1,
  },
  {
    id: "morning-muawwidhat",
    category: "morning",
    arabicText:
      "قراءة المعوذات: ﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾، و﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ﴾، و﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ﴾ (ثلاث مرات).",
    englishTranslation:
      "Recite Surah Al-Ikhlas (112), Surah Al-Falaq (113), and Surah An-Nas (114) three times each.",
    virtueAr: "من قالها حين يصبح وحين يمسي ثلاث مرات كفته من كل شيء.",
    virtueEn: "Reciting them three times in the morning and evening suffices against all harm.",
    referenceAr: "سنن أبي داود (5082) والترمذي (3575)",
    referenceEn: "Sunan Abi Dawud 5082, Al-Tirmidhi 3575",
    repeatCount: 3,
  },
  {
    id: "morning-asbahna",
    category: "morning",
    arabicText:
      "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.",
    englishTranslation:
      "We have reached the morning and at this very time all sovereignty belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without partner...",
    referenceAr: "صحيح مسلم (2723)",
    referenceEn: "Sahih Muslim 2723",
    repeatCount: 1,
  },
  {
    id: "morning-sayyid-istighfar",
    category: "morning",
    arabicText:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
    englishTranslation:
      "O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant, and I abide to Your covenant and promise as best I can...",
    virtueAr: "سيد الاستغفار: من قالها موقناً بها حين يصبح فمات من يومه فهو من أهل الجنة.",
    virtueEn: "Master Supplication for Forgiveness — promised Paradise for one who recites it with conviction.",
    referenceAr: "صحيح البخاري (6306)",
    referenceEn: "Sahih al-Bukhari 6306",
    repeatCount: 1,
  },
  {
    id: "morning-raditu",
    category: "morning",
    arabicText:
      "رَضِيتُ بِاللَّهِ رَبَّاً، وَبِالْإِسْلَامِ دِيناً، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيَّاً.",
    englishTranslation:
      "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet.",
    referenceAr: "سنن أبي داود (5072) والترمذي (3389)",
    referenceEn: "Sunan Abi Dawud 5072, Al-Tirmidhi 3389",
    repeatCount: 3,
  },
  {
    id: "morning-bismillah-la-yadurr",
    category: "morning",
    arabicText:
      "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.",
    englishTranslation:
      "In the Name of Allah, with whose Name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing.",
    referenceAr: "سنن أبي داود (5088) والترمذي (3388)",
    referenceEn: "Sunan Abi Dawud 5088, Al-Tirmidhi 3388",
    repeatCount: 3,
  },
  {
    id: "morning-hayyu-qayyum",
    category: "morning",
    arabicText:
      "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.",
    englishTranslation:
      "O Ever-Living, O Sustainer of all, in Your mercy I seek relief; rectify all of my affairs and do not leave me to myself even for the blink of an eye.",
    referenceAr: "المستدرك على الصحيحين (2000) — حصن المسلم",
    referenceEn: "Al-Mustadrak 2000 (Hisn al-Muslim)",
    repeatCount: 1,
  },
  {
    id: "morning-subhanallah-bihamdih",
    category: "morning",
    arabicText: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
    englishTranslation: "Glory be to Allah and praise be to Him.",
    virtueAr: "من قالها مائة مرة حين يصبح وحين يمسي لم يأتِ أحد يوم القيامة بأفضل مما جاء به إلا أحد قال مثل ما قال أو زاد عليه.",
    virtueEn: "Whoever says it 100 times morning and evening has no one bring better on the Day of Judgment except one who says as much or more.",
    referenceAr: "صحيح مسلم (2692)",
    referenceEn: "Sahih Muslim 2692",
    repeatCount: 100,
  },

  // Evening Adhkar
  {
    id: "evening-amsayna",
    category: "evening",
    arabicText:
      "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.",
    englishTranslation:
      "We have reached the evening and at this very time all sovereignty belongs to Allah, and all praise is for Allah...",
    referenceAr: "صحيح مسلم (2723)",
    referenceEn: "Sahih Muslim 2723",
    repeatCount: 1,
  },
  {
    id: "evening-sayyid-istighfar",
    category: "evening",
    arabicText:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
    englishTranslation:
      "O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant...",
    referenceAr: "صحيح البخاري (6306)",
    referenceEn: "Sahih al-Bukhari 6306",
    repeatCount: 1,
  },
  {
    id: "evening-bismillah-la-yadurr",
    category: "evening",
    arabicText:
      "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.",
    englishTranslation:
      "In the Name of Allah, with whose Name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing.",
    referenceAr: "سنن أبي داود (5088) والترمذي (3388)",
    referenceEn: "Sunan Abi Dawud 5088, Al-Tirmidhi 3388",
    repeatCount: 3,
  },
  {
    id: "evening-kalimat-tammat",
    category: "evening",
    arabicText: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.",
    englishTranslation: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    referenceAr: "صحيح مسلم (2708)",
    referenceEn: "Sahih Muslim 2708",
    repeatCount: 3,
  },
  {
    id: "evening-hasbi-allah",
    category: "evening",
    arabicText:
      "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.",
    englishTranslation:
      "Sufficient for me is Allah; there is no deity except Him. On Him I have relied, and He is the Lord of the Great Throne.",
    referenceAr: "سورة التوبة: 129 — سنن أبي داود (5081)",
    referenceEn: "Surah At-Tawbah 9:129 — Sunan Abi Dawud 5081",
    repeatCount: 7,
  },

  // After-Prayer Adhkar
  {
    id: "prayer-istighfar-salam",
    category: "after_prayer",
    arabicText:
      "أَسْتَغْفِرُ اللَّهَ (ثلاثاً)، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ.",
    englishTranslation:
      "I seek Allah's forgiveness (three times). O Allah, You are Peace and from You comes peace; Blessed are You, O Possessor of Majesty and Honor.",
    referenceAr: "صحيح مسلم (591)",
    referenceEn: "Sahih Muslim 591",
    repeatCount: 1,
  },
  {
    id: "prayer-la-ilaha-illallah",
    category: "after_prayer",
    arabicText:
      "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ.",
    englishTranslation:
      "None has the right to be worshipped except Allah alone, without partner; to Him belongs all sovereignty and praise, and He is over all things omnipotent. O Allah, none can withhold what You give...",
    referenceAr: "صحيح البخاري (844) وصحيح مسلم (593)",
    referenceEn: "Sahih al-Bukhari 844, Sahih Muslim 593",
    repeatCount: 1,
  },
  {
    id: "prayer-tasbih-33",
    category: "after_prayer",
    arabicText: "سُبْحَانَ اللَّهِ (33 مرة).",
    englishTranslation: "Glory be to Allah (SubhanAllah) — 33 times.",
    referenceAr: "صحيح مسلم (597)",
    referenceEn: "Sahih Muslim 597",
    repeatCount: 33,
  },
  {
    id: "prayer-tahmid-33",
    category: "after_prayer",
    arabicText: "الْحَمْدُ لِلَّهِ (33 مرة).",
    englishTranslation: "All praise is due to Allah (Alhamdulillah) — 33 times.",
    referenceAr: "صحيح مسلم (597)",
    referenceEn: "Sahih Muslim 597",
    repeatCount: 33,
  },
  {
    id: "prayer-takbir-33",
    category: "after_prayer",
    arabicText: "اللَّهُ أَكْبَرُ (33 مرة)، ثم تمام المائة: لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
    englishTranslation:
      "Allah is the Greatest (Allahu Akbar) — 33 times, completed to 100 with: There is no deity worthy of worship except Allah alone without partner...",
    referenceAr: "صحيح مسلم (597)",
    referenceEn: "Sahih Muslim 597",
    repeatCount: 34,
  },
  {
    id: "prayer-ayat-kursi",
    category: "after_prayer",
    arabicText:
      "قراءة آية الكرسي دُبُر كل صلاة مكتوبة: ﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...﴾",
    englishTranslation:
      "Reciting Ayat al-Kursi (Surah Al-Baqarah 2:255) after every obligatory prayer.",
    virtueAr: "من قرأها دبر كل صلاة مكتوبة لم يمنعه من دخول الجنة إلا أن يموت.",
    virtueEn: "Whoever recites it after every obligatory prayer, nothing prevents them from Paradise except death.",
    referenceAr: "السنن الكبرى للنسائي (9928) — صححه ابن حبان",
    referenceEn: "Al-Nasa'i al-Kubra 9928",
    repeatCount: 1,
  },

  // Before Sleeping
  {
    id: "sleep-bismika",
    category: "sleep",
    arabicText: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.",
    englishTranslation:
      "In Your Name, my Lord, I lie down and in Your Name I rise. If You should take my soul, then have mercy upon it, and if You return it, then protect it as You protect Your righteous servants.",
    referenceAr: "صحيح البخاري (6320) وصحيح مسلم (2714)",
    referenceEn: "Sahih al-Bukhari 6320, Sahih Muslim 2714",
    repeatCount: 1,
  },
  {
    id: "sleep-allahumma-bismika",
    category: "sleep",
    arabicText: "اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا.",
    englishTranslation: "O Allah, in Your Name I die and I live.",
    referenceAr: "صحيح البخاري (6324)",
    referenceEn: "Sahih al-Bukhari 6324",
    repeatCount: 1,
  },
  {
    id: "sleep-qini-adhabak",
    category: "sleep",
    arabicText: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.",
    englishTranslation: "O Allah, protect me from Your punishment on the Day You resurrect Your servants.",
    referenceAr: "سنن أبي داود (5045) والترمذي (3398)",
    referenceEn: "Sunan Abi Dawud 5045, Al-Tirmidhi 3398",
    repeatCount: 3,
  },
  {
    id: "sleep-tasbih-fatimah",
    category: "sleep",
    arabicText: "سُبْحَانَ اللَّهِ (33)، والْحَمْدُ لِلَّهِ (33)، واللَّهُ أَكْبَرُ (34) عند المنام.",
    englishTranslation: "Recite SubhanAllah (33), Alhamdulillah (33), and Allahu Akbar (34) before sleep.",
    referenceAr: "صحيح البخاري (3705) وصحيح مسلم (2727)",
    referenceEn: "Sahih al-Bukhari 3705, Sahih Muslim 2727",
    repeatCount: 1,
  },

  // Upon Waking
  {
    id: "waking-hamd",
    category: "waking",
    arabicText: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ.",
    englishTranslation: "All praise is for Allah who gave us life after causing us to die, and to Him is the resurrection.",
    referenceAr: "صحيح البخاري (6312)",
    referenceEn: "Sahih al-Bukhari 6312",
    repeatCount: 1,
  },
  {
    id: "waking-afani",
    category: "waking",
    arabicText:
      "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ.",
    englishTranslation:
      "All praise is for Allah who granted well-being to my body, returned my soul to me, and permitted me to remember Him.",
    referenceAr: "سنن الترمذي (3401)",
    referenceEn: "Sunan al-Tirmidhi 3401",
    repeatCount: 1,
  },

  // Daily Supplications
  {
    id: "daily-leaving-home",
    category: "daily",
    arabicText:
      "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ.",
    englishTranslation:
      "In the Name of Allah, I place my trust in Allah, and there is no power nor strength except through Allah.",
    referenceAr: "سنن أبي داود (5095) والترمذي (3426)",
    referenceEn: "Sunan Abi Dawud 5095, Al-Tirmidhi 3426",
    repeatCount: 1,
  },
  {
    id: "daily-entering-mosque",
    category: "daily",
    arabicText: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ.",
    englishTranslation: "O Allah, open for me the gates of Your mercy.",
    referenceAr: "صحيح مسلم (713)",
    referenceEn: "Sahih Muslim 713",
    repeatCount: 1,
  },
  {
    id: "daily-leaving-mosque",
    category: "daily",
    arabicText: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ.",
    englishTranslation: "O Allah, indeed I ask You of Your bounty.",
    referenceAr: "صحيح مسلم (713)",
    referenceEn: "Sahih Muslim 713",
    repeatCount: 1,
  },
  {
    id: "daily-relief-distress",
    category: "daily",
    arabicText:
      "لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ.",
    englishTranslation:
      "None has the right to be worshipped except Allah, the Magnificent, the Forbearing; none has the right to be worshipped except Allah, Lord of the Great Throne...",
    referenceAr: "صحيح البخاري (6346) وصحيح مسلم (2730)",
    referenceEn: "Sahih al-Bukhari 6346, Sahih Muslim 2730",
    repeatCount: 1,
  },

  // Travel Supplications
  {
    id: "travel-safar",
    category: "travel",
    arabicText:
      "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، ﴿سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ ۝ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ﴾ اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ.",
    englishTranslation:
      "Allahu Akbar (three times). Glory to Him who has subjected this to us, and we could never have it [under our control]; and indeed, to our Lord we will surely return. O Allah, we ask You on this journey for righteousness and piety...",
    referenceAr: "صحيح مسلم (1342)",
    referenceEn: "Sahih Muslim 1342",
    repeatCount: 1,
  },
  {
    id: "travel-return",
    category: "travel",
    arabicText: "آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ.",
    englishTranslation: "Returning, repenting, worshipping, and praising our Lord.",
    referenceAr: "صحيح البخاري (1797) وصحيح مسلم (1344)",
    referenceEn: "Sahih al-Bukhari 1797, Sahih Muslim 1344",
    repeatCount: 1,
  },

  // Protection & Healing
  {
    id: "protection-shifa",
    category: "protection",
    arabicText:
      "أَذْهِبِ الْبَاسَ رَبَّ النَّاسِ، اشْفِ وَأَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَماً.",
    englishTranslation:
      "Remove the affliction, O Lord of mankind, and heal — for You are the Healer; there is no healing except Your healing, a healing that leaves behind no illness.",
    referenceAr: "صحيح البخاري (5743) وصحيح مسلم (2191)",
    referenceEn: "Sahih al-Bukhari 5743, Sahih Muslim 2191",
    repeatCount: 3,
  },
  {
    id: "protection-pain-hand",
    category: "protection",
    arabicText:
      "بِسْمِ اللَّهِ (ثلاثاً)، أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ (سبع مرات).",
    englishTranslation:
      "In the Name of Allah (3 times). I seek refuge in Allah and His power from the evil of what I find and fear (7 times).",
    referenceAr: "صحيح مسلم (2202)",
    referenceEn: "Sahih Muslim 2202",
    repeatCount: 7,
  },
  {
    id: "protection-afiyah",
    category: "protection",
    arabicText:
      "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي.",
    englishTranslation:
      "O Allah, I ask You for well-being in this world and the Hereafter. O Allah, I ask You for pardon and well-being in my religion, my worldly affairs, my family, and my wealth...",
    referenceAr: "سنن أبي داود (5074) وابن ماجه (3871)",
    referenceEn: "Sunan Abi Dawud 5074, Ibn Majah 3871",
    repeatCount: 1,
  },
];

export const ALL_ADHKAR: DhikrItem[] = [...propheticAdhkar, ...quranicDuaItems];

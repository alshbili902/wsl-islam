export interface RamadanAdhkarItem {
  id: string;
  titleAr: string;
  titleEn: string;
  arabicText: string;
  englishTranslation: string;
  referenceAr: string;
  referenceEn: string;
}

export const RAMADAN_ADHKAR: RamadanAdhkarItem[] = [
  {
    id: "hilal-dua",
    titleAr: "دعاء رؤية الهلال",
    titleEn: "Supplication Upon Sighting the Crescent Moon",
    arabicText:
      "اللَّهُ أَكْبَرُ، اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْأَمْنِ وَالْإِيمَانِ، وَالسَّلَامَةِ وَالْإِسْلَامِ، وَالتَّوْفِيقِ لِمَا تُحِبُّ رَبَّنَا وَتَرْضَى، رَبُّنَا وَرَبُّكَ اللَّهُ.",
    englishTranslation:
      "Allah is the Greatest. O Allah, let this crescent appear over us with security and faith, safety and Islam, and guidance to what You love and are pleased with. Our Lord and your Lord is Allah.",
    referenceAr: "سنن الترمذي (3451) والدارمي (1730)",
    referenceEn: "Sunan al-Tirmidhi 3451, al-Darimi 1730",
  },
  {
    id: "iftar-dua",
    titleAr: "دعاء عند الإفطار",
    titleEn: "Supplication Upon Breaking the Fast",
    arabicText: "ذَهَبَ الظَّمَأُ، وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ.",
    englishTranslation:
      "The thirst has gone, the veins are quenched, and the reward is confirmed, if Allah wills.",
    referenceAr: "سنن أبي داود (2357)",
    referenceEn: "Sunan Abi Dawud 2357",
  },
  {
    id: "laylatul-qadr-dua",
    titleAr: "دعاء ليلة القدر",
    titleEn: "Supplication for Laylat al-Qadr",
    arabicText: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي.",
    englishTranslation:
      "O Allah, You are Pardoning and love to pardon, so pardon me.",
    referenceAr: "سنن الترمذي (3513) وابن ماجه (3850)",
    referenceEn: "Sunan al-Tirmidhi 3513, Ibn Majah 3850",
  },
  {
    id: "eid-takbeer",
    titleAr: "صيغة التكبير في العيد",
    titleEn: "Eid Takbeer",
    arabicText:
      "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، وَلِلَّهِ الْحَمْدُ.",
    englishTranslation:
      "Allah is the Greatest, Allah is the Greatest. There is no deity worthy of worship except Allah. Allah is the Greatest, Allah is the Greatest, and to Allah belongs all praise.",
    referenceAr: "مصنف ابن أبي شيبة — المأثور عن الصحابة",
    referenceEn: "Musannaf Ibn Abi Shaybah (Authenticated Practice of the Companions)",
  },
];

export const EID_SUNNAHS = [
  {
    titleAr: "الاغتسال والتطيب ولبس أحسن الثياب",
    titleEn: "Performing Ghusl and Wearing Clean, Fine Attire",
    descAr: "يُسن للمسلم التزين يوم العيد والاغتسال قبل الخروج إلى صلاة العيد.",
    descEn: "Taking a bath, applying pleasant scent, and wearing one's best garments before Eid prayer.",
    refAr: "الموطأ (428) وصحيح البخاري (948)",
    refEn: "Al-Muwatta 428, Sahih al-Bukhari 948",
  },
  {
    titleAr: "الأكل قبل الخروج في عيد الفطر",
    titleEn: "Eating Dates Before Eid al-Fitr Prayer",
    descAr: "كان النبي ﷺ لا يغدو يوم الفطر حتى يأكل تمراتٍ وتراً.",
    descEn: "The Prophet ﷺ would not go out for Eid al-Fitr prayer until he had eaten an odd number of dates.",
    refAr: "صحيح البخاري (953)",
    refEn: "Sahih al-Bukhari 953",
  },
  {
    titleAr: "التكبير وإظهار الفرح والتهنئة",
    titleEn: "Reciting Takbeer and Sharing Greetings",
    descAr: "الإكثار من التكبير من غروب شمس ليلة العيد إلى صلاته، وتبادل التهنئة: تقبل الله منا ومنكم.",
    descEn: "Reciting Takbeer aloud and greeting fellow believers: 'May Allah accept from us and from you.'",
    refAr: "سورة البقرة: 185",
    refEn: "Surah Al-Baqarah 2:185",
  },
  {
    titleAr: "مخالفة الطريق إلى المصلى",
    titleEn: "Taking Different Routes to and from Eid Prayer",
    descAr: "كان النبي ﷺ إذا كان يوم عيد خالف الطريق؛ ذهب من طريق وعاد من آخر.",
    descEn: "The Prophet ﷺ used to go to the Eid prayer by one route and return by another.",
    refAr: "صحيح البخاري (986)",
    refEn: "Sahih al-Bukhari 986",
  },
];

export const DAILY_REMINDERS = [
  {
    id: "rem-1",
    titleAr: "حافظ على أذكار الصباح والمساء",
    titleEn: "Keep Your Morning & Evening Adhkar",
    textAr: "بضع دقائق بعد الفجر وبعد العصر تمنحك حصناً وطمأنينةً وذكرى طيبة طوال اليوم.",
    textEn: "A few quiet minutes after Fajr and Asr fill the entire day with remembrance and protection.",
    href: "/adhkar",
  },
  {
    id: "rem-2",
    titleAr: "وردك اليومي من القرآن الكريم",
    titleEn: "Your Daily Portion of the Quran",
    textAr: "قليلٌ دائم خيرٌ من كثيرٍ منقطع؛ خصّص وقتاً ثابتاً لقراءة ولو صفحة واحدة بتدبر.",
    textEn: "Consistent small steps endure — dedicate a steady moment daily to read and reflect on even one page.",
    href: "/quran",
  },
  {
    id: "rem-3",
    titleAr: "الصلاة على النبي ﷺ يوم الجمعة وفي كل وقت",
    titleEn: "Send Blessings Upon Prophet Muhammad ﷺ",
    textAr: "«مَنْ صَلَّى عَلَيَّ وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ عَشْراً» — صحيح مسلم (408).",
    textEn: "'Whoever sends one blessing upon me, Allah sends ten blessings upon him.' — Sahih Muslim 408.",
    href: "/hadith",
  },
  {
    id: "rem-4",
    titleAr: "تفقّد صدقة اليوم لو بشيء يسير",
    titleEn: "Offer Charity, Even a Small Act of Kindness",
    textAr: "الكلمة الطيبة والتبسم والإحسان للناس وإخراج الصدقة عبر المنصات الرسمية الموثوقة من أحب الأعمال.",
    textEn: "A kind word, gentle smile, and verified charity through trusted platforms bring enduring reward.",
    href: "/zakat",
  },
];

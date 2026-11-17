export type CharityCategoryId =
  | "general"
  | "housing"
  | "endowment"
  | "relief"
  | "zakat";

export interface CharityCategoryDef {
  id: CharityCategoryId;
  labelAr: string;
  labelEn: string;
}

export interface OfficialCharityPlatform {
  id: string;
  nameAr: string;
  nameEn: string;
  officialUrl: string;
  officialDomain: string;
  descriptionAr: string;
  descriptionEn: string;
  specializationAr: string;
  specializationEn: string;
  supervisingEntityAr: string;
  supervisingEntityEn: string;
  officialStatusNoteAr: string;
  officialStatusNoteEn: string;
  categories: CharityCategoryId[];
  logoLightPath?: string;
  logoDarkPath?: string;
  monogramAr: string;
  accentHex: string;
}

export const CHARITY_CATEGORIES: CharityCategoryDef[] = [
  {
    id: "general",
    labelAr: "التبرع العام",
    labelEn: "General Donations",
  },
  {
    id: "housing",
    labelAr: "الإسكان",
    labelEn: "Housing Support",
  },
  {
    id: "endowment",
    labelAr: "الأوقاف",
    labelEn: "Endowments (Waqf)",
  },
  {
    id: "relief",
    labelAr: "الإغاثة والعمل الإنساني",
    labelEn: "Humanitarian Relief",
  },
  {
    id: "zakat",
    labelAr: "الزكاة والصدقة",
    labelEn: "Zakat & Sadaqah",
  },
];

export const OFFICIAL_CHARITY_PLATFORMS: OfficialCharityPlatform[] = [
  {
    id: "ehsan",
    nameAr: "منصة إحسان",
    nameEn: "Ehsan Platform",
    officialUrl: "https://ehsan.sa/",
    officialDomain: "ehsan.sa",
    descriptionAr:
      "المنصة الوطنية للعمل الخيري، وتتيح المساهمة في مجالات خيرية وتنموية متعددة، بما فيها الزكاة والتبرعات العامة والأوقاف والحملات والتبرع الدوري.",
    descriptionEn:
      "Saudi Arabia's national charity platform enabling contributions across charitable, developmental, Zakat, Waqf, campaign, and recurring donation channels.",
    specializationAr: "العمل الخيري والتنموي الشامل",
    specializationEn: "Comprehensive Charitable & Developmental Giving",
    supervisingEntityAr:
      "تطوير وإشراف الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا) بمتابعة لجنة إشرافية رسمية",
    supervisingEntityEn:
      "Developed & supervised by SDAIA with an official multi-agency supervisory committee",
    officialStatusNoteAr: "منصة وطنية للعمل الخيري",
    officialStatusNoteEn: "National Charity Platform",
    categories: ["general", "zakat", "endowment"],
    logoLightPath: "/charity/ehsan.svg",
    logoDarkPath: "/charity/ehsan.svg",
    monogramAr: "إحسان",
    accentHex: "#0f6e4f",
  },
  {
    id: "donations-sa",
    nameAr: "المنصة الوطنية للتبرعات - تبرع",
    nameEn: "National Donations Platform (Tabarru)",
    officialUrl: "https://donations.sa/",
    officialDomain: "donations.sa",
    descriptionAr:
      "منصة وطنية تتيح الوصول إلى فرص التبرع والصدقة والزكاة وغيرها من المبادرات الخيرية.",
    descriptionEn:
      "A national donations platform providing direct access to verified charity, Sadaqah, Zakat, and social support initiatives.",
    specializationAr: "فرص التبرع والصدقة والزكاة والمبادرات الخيرية",
    specializationEn: "Verified Charitable Opportunities, Sadaqah & Zakat",
    supervisingEntityAr:
      "تعمل بإشراف وزارة الموارد البشرية والتنمية الاجتماعية",
    supervisingEntityEn:
      "Operates under the supervision of the Ministry of Human Resources and Social Development",
    officialStatusNoteAr: "منصة وطنية بإشراف وزاري",
    officialStatusNoteEn: "Ministry-Supervised National Platform",
    categories: ["general", "zakat"],
    monogramAr: "تبرع",
    accentHex: "#0d7c66",
  },
  {
    id: "jood-eskan",
    nameAr: "منصة جود الإسكان",
    nameEn: "Jood Eskan",
    officialUrl: "https://joodeskan.sa/",
    officialDomain: "joodeskan.sa",
    descriptionAr:
      "منصة متخصصة في دعم الأسر الأشد حاجة من خلال المساهمات السكنية، مثل توفير المسكن ودعم الإيجار والترميم وصندوق جود الوقفي.",
    descriptionEn:
      "A dedicated housing charity platform supporting families in greatest need through home provision, rent assistance, renovation, and the Jood Endowment Fund.",
    specializationAr: "الدعم السكني وصندوق جود الوقفي",
    specializationEn: "Housing Support & Jood Endowment Fund",
    supervisingEntityAr:
      "إحدى مبادرات الإسكان التنموي بإشراف مؤسسة الإسكان التنموي الأهلية (سكن)",
    supervisingEntityEn:
      "Developmental Housing initiative overseen by the National Developmental Housing Foundation (Sakan)",
    officialStatusNoteAr: "مبادرة وطنية للإسكان التنموي",
    officialStatusNoteEn: "National Developmental Housing Initiative",
    categories: ["housing", "endowment"],
    logoLightPath: "/charity/jood.png",
    logoDarkPath: "/charity/jood.png",
    monogramAr: "جود",
    accentHex: "#1b7a5e",
  },
  {
    id: "waqfy",
    nameAr: "منصة وقفي",
    nameEn: "Waqfy Platform",
    officialUrl: "https://waqfy.sa/",
    officialDomain: "waqfy.sa",
    descriptionAr:
      "منصة متخصصة في دعم المشاريع والمنتجات الوقفية والتنموية من خلال المساهمات الرقمية.",
    descriptionEn:
      "A specialized digital crowdfunding platform supporting sustainable Waqf endowments and developmental non-profit projects.",
    specializationAr: "دعم المشاريع والمنتجات الوقفية",
    specializationEn: "Waqf Endowments & Sustainable Projects",
    supervisingEntityAr: "الهيئة العامة للأوقاف",
    supervisingEntityEn: "General Authority for Awqaf (Saudi Arabia)",
    officialStatusNoteAr: "بإشراف الهيئة العامة للأوقاف",
    officialStatusNoteEn: "Supervised by General Authority for Awqaf",
    categories: ["endowment", "general"],
    logoLightPath: "/charity/waqfy.png",
    logoDarkPath: "/charity/waqfy.png",
    monogramAr: "وقفي",
    accentHex: "#9b7a2f",
  },
  {
    id: "sahem",
    nameAr: "منصة ساهم",
    nameEn: "Sahem Platform (KSrelief)",
    officialUrl: "https://sahem.ksrelief.org/",
    officialDomain: "sahem.ksrelief.org",
    descriptionAr:
      "منصة التبرع الإلكترونية التابعة لمركز الملك سلمان للإغاثة والأعمال الإنسانية، وتتيح المساهمة في البرامج الإنسانية والإغاثية حول العالم.",
    descriptionEn:
      "The official electronic donation portal of the King Salman Humanitarian Aid and Relief Center (KSrelief) supporting global relief programs.",
    specializationAr: "البرامج الإغاثية والإنسانية حول العالم",
    specializationEn: "Global Humanitarian Aid & Relief Programs",
    supervisingEntityAr:
      "مركز الملك سلمان للإغاثة والأعمال الإنسانية",
    supervisingEntityEn:
      "King Salman Humanitarian Aid and Relief Center (KSrelief)",
    officialStatusNoteAr: "تابع لمركز الملك سلمان للإغاثة",
    officialStatusNoteEn: "Affiliated with KSrelief",
    categories: ["relief", "zakat"],
    logoLightPath: "/charity/sahem.svg",
    logoDarkPath: "/charity/sahem-light.svg",
    monogramAr: "ساهم",
    accentHex: "#0b6a53",
  },
];

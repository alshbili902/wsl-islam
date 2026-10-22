export interface RadioStation {
  id: string;
  name: string;
  category: string;
  description: string;
  streamUrl: string;
}

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'cairo',
    name: 'إذاعة القرآن الكريم - القاهرة',
    category: 'رسمية',
    description: 'البث المباشر لأعرق إذاعة قرآنية في العالم الإسلامي على مدار 24 ساعة',
    streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
  },
  {
    id: 'tarateel',
    name: 'إذاعة التلاوات والتراتيل الخاشعة',
    category: 'تلاوات',
    description: 'روائع التلاوات الخاشعة المتواصلة بأصوات نخبة من أندى القراء',
    streamUrl: 'https://backup.qurango.net/radio/tarateel',
  },
  {
    id: 'husary',
    name: 'المصحف المرتل - محمود خليل الحصري',
    category: 'قراء',
    description: 'التلاوة المتقنة برواية حفص عن عاصم لشيخ المقارئ المصرية',
    streamUrl: 'https://backup.qurango.net/radio/mahmoud_khalil_alhussary',
  },
  {
    id: 'ajmy',
    name: 'تلاوات أحمد بن علي العجمي',
    category: 'قراء',
    description: 'المصحف المرتل برواية حفص بصوت القارئ أحمد بن علي العجمي',
    streamUrl: 'https://backup.qurango.net/radio/ahmad_alajmy',
  },
  {
    id: 'ghamdi',
    name: 'تلاوات سعد الغامدي',
    category: 'قراء',
    description: 'تلاوة عطرة لكامل المصحف الشريف بصوت الشيخ سعد الغامدي',
    streamUrl: 'https://backup.qurango.net/radio/saad_alghamdi',
  },
  {
    id: 'idrees',
    name: 'تلاوات إدريس أبكر',
    category: 'قراء',
    description: 'تلاوات خاشعة ومؤثرة بصوت الشيخ إدريس أبكر',
    streamUrl: 'https://backup.qurango.net/radio/idrees_abkr',
  },
  {
    id: 'shatri',
    name: 'تلاوات أبو بكر الشاطري',
    category: 'قراء',
    description: 'المصحف المرتل برواية حفص عن عاصم بصوت الشيخ أبو بكر الشاطري',
    streamUrl: 'https://backup.qurango.net/radio/shaik_abu_bakr_al_shatri',
  },
  {
    id: 'roqiah',
    name: 'إذاعة الرقية الشرعية',
    category: 'رقية وأذكار',
    description: 'بث متواصل لآيات الرقية الشرعية من الكتاب والسنة بصوت كبار القراء',
    streamUrl: 'https://backup.qurango.net/radio/roqiah',
  },
  {
    id: 'athkar',
    name: 'إذاعة الأذكار النبوية اليومية',
    category: 'رقية وأذكار',
    description: 'أذكار الصباح والمساء واليوم والليلة لحفظ وتحصين المسلم',
    streamUrl: 'https://backup.qurango.net/radio/athkar_masa',
  },
  {
    id: 'mukhtasar',
    name: 'المختصر في تفسير القرآن الكريم',
    category: 'علمية',
    description: 'شرح ميسر وتدبر لمعاني آيات الذكر الحكيم عبر البث المباشر',
    streamUrl: 'https://backup.qurango.net/radio/mukhtasartafsir',
  },
  {
    id: 'fatwa',
    name: 'إذاعة الفتاوى الشرعية',
    category: 'علمية',
    description: 'إجابات وفتاوى كبار علماء الأمة في مختلف شؤون العبادات والمعاملات',
    streamUrl: 'https://backup.qurango.net/radio/fatwa',
  },
];

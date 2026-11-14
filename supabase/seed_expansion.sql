-- Wasl Islamic — Seed Data for Expansion Features 1, 2, 4, 5, 6
-- Idempotent inserts/upserts strictly referencing real verified Islamic sources.

-- 1. Tafsir & Linguistic Reference Sources
INSERT INTO public.tafsir_sources (
  id, slug, provider, provider_source_id, name_ar, name_en, author_ar, author_en,
  language, category, description_ar, description_en, source_url, edition_info, is_active, sort_order
) VALUES
  (
    '14', 'ar-tafsir-ibn-kathir', 'quran_com_v4', '14',
    'تفسير ابن كثير', 'Tafsir Ibn Kathir',
    'الإمام الحافظ عماد الدين إسماعيل بن كثير (ت ٧٧٤هـ)', 'Imam Ismail ibn Umar ibn Kathir (d. 774 AH)',
    'ar', 'tafsir',
    'تفسير القرآن العظيم بالمأثور عن النبي ﷺ والصحابة والتابعين مع العناية باللغة والأسانيد.',
    'Classical narration-based exegesis grounded in Quranic cross-references, authentic Hadith, and Athar.',
    'https://api.quran.com/api/v4/resources/tafsirs',
    'تفسير القرآن العظيم — Quran.com API v4',
    TRUE, 10
  ),
  (
    '91', 'ar-tafseer-al-saddi', 'quran_com_v4', '91',
    'تفسير السعدي', 'Tafsir al-Sa''di',
    'العلامة الشيخ عبدالرحمن بن ناصر السعدي (ت ١٣٧٦هـ)', 'Sheikh Abdurrahman ibn Nasir al-Sa''di (d. 1376 AH)',
    'ar', 'tafsir',
    'تيسير الكريم الرحمن في تفسير كلام المنان: أسلوب ميسر يجمع بين وضوح المعنى والهدايات الإيمانية.',
    'Taysir al-Karim al-Rahman: lucid contemporary commentary highlighting faith guidance and clarity.',
    'https://api.quran.com/api/v4/resources/tafsirs',
    'تيسير الكريم الرحمن — Quran.com API v4',
    TRUE, 20
  ),
  (
    '15', 'ar-tafsir-al-tabari', 'quran_com_v4', '15',
    'تفسير الطبري', 'Tafsir al-Tabari',
    'الإمام أبو جعفر محمد بن جرير الطبري (ت ٣١٠هـ)', 'Imam Muhammad ibn Jarir al-Tabari (d. 310 AH)',
    'ar', 'tafsir',
    'جامع البيان عن تأويل آي القرآن: عمدة كتب التفسير بالمأثور ومرجع القراءات وأقوال السلف.',
    'Jami'' al-Bayan: foundational encyclopedic work of early Islamic exegesis.',
    'https://api.quran.com/api/v4/resources/tafsirs',
    'جامع البيان — Quran.com API v4',
    TRUE, 30
  ),
  (
    '90', 'ar-tafseer-al-qurtubi', 'quran_com_v4', '90',
    'تفسير القرطبي', 'Tafsir al-Qurtubi',
    'الإمام أبو عبدالله محمد بن أحمد القرطبي (ت ٦٧١هـ)', 'Imam Abu Abdullah al-Qurtubi (d. 671 AH)',
    'ar', 'tafsir',
    'الجامع لأحكام القرآن: مرجع رصين في استنباط الأحكام الفقهية واللغة وأسباب النزول.',
    'Al-Jami'' li Ahkam al-Quran: renowned reference for juristic rulings and Arabic rhetoric.',
    'https://api.quran.com/api/v4/resources/tafsirs',
    'الجامع لأحكام القرآن — Quran.com API v4',
    TRUE, 40
  ),
  (
    '94', 'ar-tafsir-al-baghawi', 'quran_com_v4', '94',
    'تفسير البغوي', 'Tafsir al-Baghawi',
    'الإمام محيي السنة الحسين بن مسعود البغوي (ت ٥١٦هـ)', 'Imam al-Husayn al-Baghawi (d. 516 AH)',
    'ar', 'tafsir',
    'معالم التنزيل: تفسير وسط مختصر يجمع المأثور الصحيح بعيداً عن الإسهاب.',
    'Ma''alim al-Tanzil: concise narration-based commentary valued for clarity.',
    'https://api.quran.com/api/v4/resources/tafsirs',
    'معالم التنزيل — Quran.com API v4',
    TRUE, 50
  ),
  (
    '16', 'ar-tafsir-muyassar', 'quran_com_v4', '16',
    'التفسير الميسر', 'Al-Tafsir Al-Muyassar',
    'نخبة من العلماء — مجمع الملك فهد لطباعة المصحف الشريف', 'King Fahd Glorious Quran Complex Scholars',
    'ar', 'tafsir',
    'تفسير موجز معتمد صادر عن مجمع الملك فهد لطباعة المصحف الشريف بالمدينة المنورة.',
    'Concise authoritative commentary published by King Fahd Glorious Quran Complex.',
    'https://api.quran.com/api/v4/resources/tafsirs',
    'التفسير الميسر — مجمع الملك فهد',
    TRUE, 60
  ),
  (
    '169', 'en-tafisr-ibn-kathir', 'quran_com_v4', '169',
    'تفسير ابن كثير (إنجليزي)', 'Tafsir Ibn Kathir (Abridged EN)',
    'الإمام ابن كثير (اختصار وترجمة دار السلام)', 'Imam Ibn Kathir (Darussalam Abridged)',
    'en', 'tafsir',
    'النسخة الإنجليزية المختصرة المعتمدة من تفسير الحافظ ابن كثير.',
    'English abridged edition of Tafsir Ibn Kathir.',
    'https://api.quran.com/api/v4/resources/tafsirs',
    'Darussalam English Abridgement — Quran.com API v4',
    TRUE, 70
  ),
  (
    'tahlil-kalimat', 'tahlil-kalimat-al-qur-an', 'spa5k_cdn', 'tahlil-kalimat-al-qur-an',
    'تحليل وجذور كلمات القرآن', 'Quranic Word Morphology & Roots',
    'التحليل الصرفي واللغوي لمفردات القرآن', 'Arabic Morphological & Root Reference',
    'ar', 'morphology',
    'بيان الجذر اللغوي والتحليل الصرفي لمفردات الآية.',
    'Verified Arabic lexical root and morphological breakdown.',
    'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/tahlil-kalimat-al-qur-an',
    'Tafsir API Verified Morphology',
    TRUE, 80
  ),
  (
    'al-irab-al-muyassar', 'al-i-rab-al-muyassar', 'spa5k_cdn', 'al-i-rab-al-muyassar',
    'الإعراب الميسر', 'Al-I''rab Al-Muyassar',
    'قاعدة بيانات الإعراب الميسر', 'Simplified Quranic Syntax Reference',
    'ar', 'irab',
    'إعراب ميسر للآيات لبيان المعنى النحوي الدقيق.',
    'Accessible Arabic grammatical parsing per verse.',
    'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/al-i-rab-al-muyassar',
    'Tafsir API Verified Syntax',
    TRUE, 90
  ),
  (
    'asseraj-gharib', 'asseraj-fi-bayan-gharib-alquran', 'spa5k_cdn', 'asseraj-fi-bayan-gharib-alquran',
    'السراج في بيان غريب القرآن', 'Al-Siraj on Rare Quranic Words',
    'الدكتور محمد بن عبدالعزيز الخضيري', 'Dr. Muhammad ibn Abdulaziz Al-Khudayri',
    'ar', 'gharib',
    'شرح موجز للألفاظ الغريبة في القرآن الكريم.',
    'Concise lexical explanation of rare Quranic vocabulary.',
    'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/asseraj-fi-bayan-gharib-alquran',
    'Tafsir API Verified Gharib Edition',
    TRUE, 100
  ),
  (
    'asbab-wahidi', 'en-asbab-al-nuzul-by-al-wahidi', 'spa5k_cdn', 'en-asbab-al-nuzul-by-al-wahidi',
    'أسباب النزول للواحدي (إنجليزي)', 'Asbab al-Nuzul by al-Wahidi',
    'الإمام أبو الحسن علي بن أحمد الواحدي (ت ٤٦٨هـ)', 'Imam Ali ibn Ahmad al-Wahidi (d. 468 AH)',
    'en', 'asbab',
    'مرويات أسباب النزول المصنفة في كتاب الإمام الواحدي.',
    'Classical collection of occasions of revelation.',
    'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/en-asbab-al-nuzul-by-al-wahidi',
    'Tafsir API / Royal Aal al-Bayt Institute',
    TRUE, 110
  )
ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  description_ar = EXCLUDED.description_ar,
  description_en = EXCLUDED.description_en,
  source_url = EXCLUDED.source_url,
  edition_info = EXCLUDED.edition_info,
  is_active = EXCLUDED.is_active;

-- 2. Lecture Categories
INSERT INTO public.lecture_categories (id, name_ar, name_en, description_ar, description_en, sort_order) VALUES
  ('tafsir', 'التفسير والتدبر', 'Tafsir & Reflection', 'دروس في معاني القرآن الكريم وتدبر آياته من مصادر موثوقة.', 'Lessons on Quranic exegesis and verse-by-verse reflection.', 10),
  ('quran_sciences', 'علوم القرآن والتجويد', 'Quranic Sciences & Tajweed', 'مقدمات في التجويد والقراءات وفضائل القرآن وجمعه.', 'Foundations of Tajweed, Qira''at, and Quranic sciences.', 20),
  ('aqeedah', 'العقيدة والتوحيد', 'Aqeedah & Tawheed', 'أصول الإيمان وأسماء الله الحسنى وصفاته على منهج أهل السنة.', 'Core Islamic creed, pillars of Iman, and Tawheed.', 30),
  ('hadith', 'الحديث وعلومه', 'Hadith & Sunnah', 'شروح الأحاديث الصحيحة والأربعين النووية ومصطلح الحديث.', 'Explanations of authentic Hadiths and Nawawi''s Forty.', 40),
  ('seerah', 'السيرة النبوية', 'Prophetic Biography (Seerah)', 'مواقف ودروس من سيرة النبي محمد ﷺ والمدينة المنورة.', 'Lessons and historical events from the Prophet''s Seerah.', 50),
  ('fiqh', 'الفقه والعبادات', 'Fiqh & Worship', 'أحكام الطهارة والصلاة والصيام والزكاة والحج بأدلتها.', 'Practical rulings of prayer, fasting, Zakat, and Hajj.', 60),
  ('manners', 'الأخلاق والآداب', 'Islamic Manners & Ethics', 'الأدب الإسلامي وبر الوالدين والرفق وحسن الخلق.', 'Islamic character, family kindness, and Prophetic ethics.', 70),
  ('spiritual', 'التزكية والرقائق', 'Heart Softeners & Spirituality', 'أعمال القلوب والخشوع والإخلاص والتوكل على الله.', 'Sincerity, humility, reliance on Allah, and spiritual growth.', 80),
  ('ramadan', 'رمضان والمواسم', 'Ramadan & Seasonal Lessons', 'محاضرات في استقبال رمضان والقيام والعشر الأواخر.', 'Lectures on fasting, Qiyam al-Layl, and seasonal worship.', 90),
  ('new_muslims', 'التعريف بالإسلام', 'Foundations & New Muslims', 'شروح ميسرة لأركان الإسلام وأساسيات الدين باللغتين.', 'Clear foundational guides to Islam for learners and newcomers.', 100),
  ('general', 'موضوعات متنوعة', 'General Islamic Knowledge', 'محاضرات ومواد علمية عامة نافعة من منصات موثوقة.', 'General verified educational Islamic talks and audiobooks.', 110)
ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  description_ar = EXCLUDED.description_ar,
  description_en = EXCLUDED.description_en;

-- 3. Curated Baseline Verified Lectures (supplemented live from IslamHouse API v3)
INSERT INTO public.lectures (
  id, slug, category_id, title_ar, title_en, speaker_ar, speaker_en,
  description_ar, description_en, media_type, media_url,
  source_name_ar, source_name_en, source_url, language,
  reference_ar, reference_en, is_featured, is_active
) VALUES
  (
    'ih-2844667', 'ih-2844667', 'seerah',
    'كتاب أنا المدينة — قراءة صوتية في فضائل المدينة النبوية ومعالمها',
    'Ana Al-Madinah — Audio Reading on the Virtues & Landmarks of Madinah',
    'د. جمال يوسف الهميلي', 'Dr. Jamal Yusuf Al-Humayli',
    'قراءة صوتية لكتاب أنا المدينة، يبين فضائل المدينة النبوية ويوضح معالمها وأبرز الأحداث التاريخية في السيرة النبوية.',
    'Audio series highlighting the virtues, prophetic landmarks, and key historical events in Madinah.',
    'audio',
    'https://d1.islamhouse.com/data/ar/ih_sounds/chain_02/ar_ana_almdinah/ar_01_ana_almdinah.mp3',
    'إسلام هاوس (IslamHouse)', 'IslamHouse',
    'https://islamhouse.com/ar/audios/2844667', 'ar',
    'مكتبة الصوتيات الموثقة — إسلام هاوس', 'Verified Audio Library — IslamHouse',
    TRUE, TRUE
  ),
  (
    'ih-en-salat-foundations', 'binbaz-arbaeen-nawawiyah', 'hadith',
    'شرح الأربعين النووية — موقع سماحة الشيخ ابن باز الرسمي',
    'Explanation of An-Nawawi''s Forty Hadith — Shaykh Ibn Baz Archive',
    'الشيخ عبدالعزيز بن عبدالله بن باز', 'Shaykh Abdulaziz bin Baz',
    'دروس علمية موثقة في شرح الأحاديث الجامعة في الأربعين النووية من الأرشيف الرسمي لموقع سماحة الشيخ ابن باز.',
    'Authentic scholarly lessons explaining Imam An-Nawawi''s Forty Hadith from the official Ibn Baz archive.',
    'external',
    'https://binbaz.org.sa/categories/132',
    'الموقع الرسمي للشيخ ابن باز', 'BinBaz.org.sa Official Archive',
    'https://binbaz.org.sa/categories/132', 'ar',
    'قسم شروح الحديث — binbaz.org.sa', 'Hadith Explanations — binbaz.org.sa',
    TRUE, TRUE
  ),
  (
    'ih-uthaimeen-tafsir', 'binothaimeen-tafsir-juz-amma', 'tafsir',
    'تفسير جزء عمّ — مؤسسة الشيخ محمد بن صالح العثيمين',
    'Tafsir of Juz Amma — Shaykh Ibn Uthaymeen Official Library',
    'الشيخ محمد بن صالح العثيمين', 'Shaykh Muhammad ibn Salih Al-Uthaymeen',
    'تفسير ميسر وموثق لسور جزء عمّ مع استنباط الفوائد التربوية والعقدية من الموقع الرسمي لمؤسسة الشيخ ابن عثيمين.',
    'Accessible, scholarly Tafsir of Juz Amma from the official Al-Uthaymeen Charitable Foundation.',
    'external',
    'https://binothaimeen.net/',
    'مؤسسة الشيخ ابن عثيمين الخيرية', 'Al-Uthaymeen Foundation',
    'https://binothaimeen.net/', 'ar',
    'مكتبة التفسير — binothaimeen.net', 'Tafsir Archive — binothaimeen.net',
    TRUE, TRUE
  )
ON CONFLICT (id) DO UPDATE SET
  title_ar = EXCLUDED.title_ar,
  title_en = EXCLUDED.title_en,
  media_url = EXCLUDED.media_url,
  is_active = EXCLUDED.is_active;

-- 4. Source Verification Metadata Governance Table
INSERT INTO public.source_verification_metadata (
  feature_area, content_type, source_name, source_url, exact_reference, edition_info, verification_status
) VALUES
  ('mushaf', 'Madinah 15-Line Uthmani Mushaf', 'Quran.com API v4 & King Fahd Complex', 'https://api.quran.com/api/v4/verses/by_page/1', 'Mushaf Al-Madinah 604-page pagination', 'Uthmani Script (King Fahd Complex standard)', 'verified'),
  ('mushaf', 'Verse-Synced Audio Segments', 'Quran.com QDC Audio API', 'https://api.quran.com/api/v4/chapter_recitations/7/1?segments=true', 'Reciters 7 (Alafasy), 6 (Husary), 8 (Minshawi), 2 (Abdulbasit)', 'Verified millisecond ayah timing segments', 'verified'),
  ('tafsir', 'Classical Arabic Tafsirs', 'Quran.com API v4 Resources', 'https://api.quran.com/api/v4/resources/tafsirs', 'Ibn Kathir (14), Tabari (15), Sa''di (91), Qurtubi (90), Baghawi (94), Muyassar (16)', 'Digital scholarly editions', 'verified'),
  ('tafsir', 'Morphology, Syntax & Asbab al-Nuzul', 'Spa5k Tafsir API', 'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main', 'tahlil-kalimat-al-qur-an, al-i-rab-al-muyassar, asseraj-fi-bayan-gharib-alquran, en-asbab-al-nuzul-by-al-wahidi', 'Classical narrations with explicit authenticity disclaimers', 'attributed'),
  ('lectures', 'Verified Islamic Audio & Video Lessons', 'IslamHouse API v3 & Official Scholar Archives', 'https://api3.islamhouse.com/v3/paV29H2gm56kvLPy/main/audios/ar/ar/1/25/json', 'IslamHouse Multilingual Audio/Video Catalog', 'Direct verified MP3/MP4 URLs + institutional links', 'verified'),
  ('notifications', 'Prayer Time Astronomical Calculation', 'Adhan Library (Umm al-Qura & regional methods)', 'https://github.com/batoulapps/adhan-js', 'UmmAlQura / MWL / Egyptian / Dubai / Qatar / Kuwait / ISNA / Karachi', 'Deterministic client + server Web Push verification', 'verified')
ON CONFLICT (feature_area, source_url, exact_reference) DO UPDATE SET
  verification_status = EXCLUDED.verification_status,
  last_reviewed_at = NOW();

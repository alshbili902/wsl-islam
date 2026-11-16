export type Locale = "ar" | "en";
export type ThemeMode = "light" | "dark" | "night";

export interface SurahMeta {
  number: number;
  nameAr: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

export interface AyahItem {
  number: number;
  numberInSurah: number;
  textAr: string;
  textEn: string;
  tafsirAr?: string;
  juz: number;
  page: number;
}

export interface DailyVerse {
  ref: string;
  surahNumber: number;
  surahNameAr: string;
  surahNameEn: string;
  ayahNumber: number;
  arabicText: string;
  englishText: string;
}

export interface Reciter {
  id: number;
  slug: string;
  nameAr: string;
  nameEn: string;
  rewayahAr: string;
  rewayahEn: string;
  server: string;
  surahTotal: number;
  provider?: ReciterProviderId;
  moshafId?: string;
  availableSurahs?: number[];
  qdcId?: number;
  styleAr?: string;
  styleEn?: string;
}

export type RadioCategory =
  | "official"
  | "quran"
  | "sunnah"
  | "tafsir"
  | "knowledge"
  | "reciters";

export interface RadioStation {
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: RadioCategory;
  streamUrl: string;
  fallbackUrl?: string;
  streamType: "mp3" | "hls";
  needsProxy?: boolean;
  sourceOrgAr: string;
  sourceOrgEn: string;
  isFeatured?: boolean;
}

export type AdhkarCategoryId =
  | "morning"
  | "evening"
  | "after_prayer"
  | "sleep"
  | "waking"
  | "daily"
  | "travel"
  | "protection"
  | "quranic";

export interface DhikrItem {
  id: string;
  category: AdhkarCategoryId;
  arabicText: string;
  englishTranslation: string;
  virtueAr?: string;
  virtueEn?: string;
  referenceAr: string;
  referenceEn: string;
  repeatCount: number;
}

export interface HadithItem {
  hadithNumber: number;
  arabicNumber?: number | string;
  arabicText: string;
  englishText: string;
  referenceBook?: string;
  gradeAr?: string;
  gradeEn?: string;
}

export type ArticleCategory =
  | "aqeedah"
  | "worship"
  | "seerah"
  | "prophets"
  | "manners"
  | "new_muslims"
  | "education";

export type ArticleBlock =
  | {
      type: "editorial";
      headingAr?: string;
      headingEn?: string;
      textAr: string;
      textEn: string;
    }
  | {
      type: "quote";
      quoteType: "quran" | "hadith" | "scholar";
      arabicText: string;
      englishText: string;
      referenceAr: string;
      referenceEn: string;
    };

export interface Article {
  slug: string;
  category: ArticleCategory;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  readingMinutes: number;
  isFeatured?: boolean;
  blocks: ArticleBlock[];
  sources: {
    nameAr: string;
    nameEn: string;
    url?: string;
  }[];
}

export interface AllahName {
  number: number;
  arabic: string;
  transliteration: string;
  meaningAr: string;
  meaningEn: string;
  referenceAr: string;
}

export type QuizDifficulty = "beginner" | "intermediate" | "advanced";
export type QuizCategory = "quran" | "hadith" | "seerah" | "fiqh" | "prophets" | "aqeedah";

export interface QuizQuestion {
  id: string;
  difficulty: QuizDifficulty;
  category: QuizCategory;
  questionAr: string;
  questionEn: string;
  optionsAr: [string, string, string, string];
  optionsEn: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanationAr: string;
  explanationEn: string;
  referenceAr: string;
  referenceEn: string;
}

export interface CityLocation {
  id: string;
  nameAr: string;
  nameEn: string;
  countryAr: string;
  countryEn: string;
  latitude: number;
  longitude: number;
  timezone: string;
  defaultMethodId: PrayerMethodId;
}

export type PrayerMethodId =
  | "UmmAlQura"
  | "MuslimWorldLeague"
  | "Egyptian"
  | "NorthAmerica"
  | "Karachi"
  | "Dubai"
  | "Qatar"
  | "Kuwait"
  | "Singapore"
  | "Turkey";

export interface BookmarkItem {
  id: string;
  type: "verse" | "hadith" | "dhikr" | "article" | "tafsir" | "mushaf" | "lecture";
  titleAr: string;
  titleEn: string;
  arabicText: string;
  englishText?: string;
  referenceAr: string;
  referenceEn: string;
  note?: string;
  url: string;
  savedAt: string;
}

export type ShareContentKind =
  | "verse"
  | "surah"
  | "hadith"
  | "adhkar"
  | "dhikr"
  | "dua"
  | "article"
  | "prophet_story"
  | "allah_name"
  | "lesson"
  | "reminder"
  | "tasbih"
  | "tafsir"
  | "lecture"
  | "khatmah";

export interface ShareCardPayload {
  kind: ShareContentKind;
  titleAr?: string;
  titleEn?: string;
  arabicText: string;
  englishText?: string;
  referenceAr: string;
  referenceEn: string;
  sourceAr?: string;
  sourceEn?: string;
  surahNameAr?: string;
  surahNameEn?: string;
  surahNumber?: number;
  ayahNumber?: number;
  hadithGradeAr?: string;
  hadithGradeEn?: string;
  repeatCount?: number;
  shareUrl?: string;
}

export interface GlossaryTerm {
  slug: string;
  termAr: string;
  termEn: string;
  transliteration: string;
  definitionAr: string;
  definitionEn: string;
  category: string;
  referenceAr?: string;
  referenceEn?: string;
}

export interface ScholarlyResource {
  slug: string;
  category: "scholarly" | "quran_official" | "charity" | "multilingual" | "fatwa";
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  url: string;
  organizationAr: string;
  organizationEn: string;
  languageTags: string[];
}

// ---------- Feature 1: Tafsir & Reflection Encyclopedia ----------
export interface TafsirSourceMeta {
  id: string;
  slug: string;
  provider: "quran_com_v4" | "spa5k_cdn" | "alquran_cloud";
  providerSourceId: string;
  nameAr: string;
  nameEn: string;
  authorAr: string;
  authorEn: string;
  language: "ar" | "en";
  category: "tafsir" | "gharib" | "irab" | "morphology" | "asbab";
  descriptionAr: string;
  descriptionEn: string;
  sourceUrl: string;
  editionInfo: string;
}

export interface WordAnalysisItem {
  position: number;
  textUthmani: string;
  transliteration: string | null;
  translationEn: string | null;
  audioUrl: string | null;
  lineNumber?: number;
}

export interface AsbabNuzulEntry {
  sourceNameAr: string;
  sourceNameEn: string;
  sourceUrl: string;
  reference: string;
  status: "verified" | "disputed_noted" | "attributed";
  statusLabelAr: string;
  statusLabelEn: string;
  text: string;
  language: "ar" | "en";
}

// ---------- Feature 2: Digital Mushaf ----------
export interface MushafVerseWord {
  id: number;
  position: number;
  charType: "word" | "end";
  textUthmani: string;
  lineNumber: number;
  pageNumber: number;
  translationEn: string | null;
  transliteration: string | null;
  audioUrl: string | null;
}

export interface MushafPageVerse {
  verseKey: string;
  surahNumber: number;
  ayahNumber: number;
  textUthmani: string;
  translationEn: string;
  pageNumber: number;
  juzNumber: number;
  hizbNumber: number;
  rubElHizbNumber: number;
  sajdahNumber: number | null;
  words: MushafVerseWord[];
}

export interface MushafPagePayload {
  pageNumber: number;
  totalPages: number;
  juzNumber: number;
  hizbNumber: number;
  rubElHizbNumber: number;
  verses: MushafPageVerse[];
  sourceName: string;
  sourceUrl: string;
}

// ---------- Feature 3: Khatmah Planner ----------
export type KhatmahPresetId = "7d" | "15d" | "30d" | "60d" | "custom";

export interface KhatmahAssignment {
  dayIndex: number;
  sessionIndex: number;
  scheduledDate: string;
  startPage: number;
  endPage: number;
  pageCount: number;
  completed: boolean;
  completedAt?: string;
}

export interface KhatmahPlan {
  id: string;
  name: string;
  preset: KhatmahPresetId;
  startDate: string;
  targetDays: number;
  pagesPerDay: number;
  sessionsPerDay: 1 | 2 | 5;
  preferredTime: string;
  activeWeekdays: number[]; // 0=Sun..6=Sat
  startPage: number;
  currentPage: number;
  status: "active" | "paused" | "completed";
  assignments: KhatmahAssignment[];
  createdAt: string;
  updatedAt: string;
}

// ---------- Feature 4: Smart Islamic Notifications ----------
export interface NotificationPreferencesState {
  masterEnabled: boolean;
  prayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
    leadMinutes: 0 | 5 | 10 | 15 | 30;
  };
  quran: {
    morningEnabled: boolean;
    morningTime: string;
    afternoonEnabled: boolean;
    afternoonTime: string;
    eveningEnabled: boolean;
    eveningTime: string;
    khatmahEnabled: boolean;
    khatmahTime: string;
    customEnabled: boolean;
    customTime: string;
    customLabelAr: string;
    customLabelEn: string;
  };
  adhkar: {
    morningEnabled: boolean;
    morningTime: string;
    eveningEnabled: boolean;
    eveningTime: string;
    afterPrayerEnabled: boolean;
    bedtimeEnabled: boolean;
    bedtimeTime: string;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

// ---------- Feature 5: Islamic Lectures & Lessons ----------
export type LectureCategoryId =
  | "tafsir"
  | "quran_sciences"
  | "aqeedah"
  | "hadith"
  | "seerah"
  | "prophets_stories"
  | "fiqh"
  | "manners"
  | "spiritual"
  | "scholarly_lessons"
  | "book_explanations"
  | "methodical_lessons"
  | "ramadan"
  | "new_muslims"
  | "general";

export interface LectureAttachment {
  order: number;
  title: string;
  url: string;
  extensionType: string;
  sizeLabel?: string;
}

export interface LectureItem {
  id: string;
  slug: string;
  categoryId: LectureCategoryId;
  titleAr: string;
  titleEn: string;
  speakerAr: string;
  speakerEn: string;
  descriptionAr: string;
  descriptionEn: string;
  mediaType: "audio" | "video" | "external";
  mediaUrl: string;
  attachments: LectureAttachment[];
  sourceNameAr: string;
  sourceNameEn: string;
  sourceUrl: string;
  publishedLabel?: string;
  durationLabel?: string;
  language: "ar" | "en";
  referenceAr?: string;
  referenceEn?: string;
  isFeatured?: boolean;
}

// ---------- Feature 6: Advanced Reading Preferences ----------
export type ReadingFontFamily = "amiri" | "ibm-plex" | "naskh-system";
export type ReadingPaperTheme =
  | "default"
  | "warm-ivory"
  | "classic-white"
  | "soft-beige"
  | "dark-charcoal"
  | "midnight-emerald";
export type ReadingColumnWidth = "narrow" | "medium" | "wide";

export interface ReadingPreferencesState {
  fontFamily: ReadingFontFamily;
  fontSizeScale: number; // 0.85 .. 1.45
  quranFontSizePx: number; // 20 .. 40
  fontWeight: 400 | 500 | 600 | 700;
  lineHeight: number; // 1.7 .. 2.4
  wordSpacingPx: number; // 0 .. 6
  textAlign: "start" | "justify";
  columnWidth: ReadingColumnWidth;
  mushafZoom: number; // 0.9 .. 1.3
  verseHighlight: boolean;
  showTranslation: boolean;
  showTafsirPanel: boolean;
  readingSurface: ReadingPaperTheme;
  highContrast: boolean;
  reducedMotion: boolean;
}

// ---------- Listening Center: Dynamic Reciter Catalog, Player & Library ----------
export type ReciterProviderId = "mp3quran_v3" | "quran_com_v4" | "verified_baseline";

export type RecitationStyleId =
  | "murattal"
  | "mujawwad"
  | "muallim"
  | "historic"
  | "other";

export interface CatalogRiwayah {
  id: number;
  nameAr: string;
  nameEn: string;
}

export interface ReciterMoshafVariant {
  moshafId: string;
  provider: ReciterProviderId;
  rawReciterId: number;
  rawMoshafId: number;
  nameAr: string;
  nameEn: string;
  rewayahId: number;
  rewayahAr: string;
  rewayahEn: string;
  styleId: RecitationStyleId;
  styleAr: string;
  styleEn: string;
  serverUrl: string;
  surahTotal: number;
  availableSurahs: number[];
  hasVerseTiming?: boolean;
  qdcId?: number;
  updatedAt?: string;
}

export interface CatalogReciter {
  slug: string;
  mp3quranId?: number;
  qdcId?: number;
  nameAr: string;
  nameEn: string;
  normalizedAr: string;
  normalizedEn: string;
  letter: string;
  updatedAt?: string;
  moshafs: ReciterMoshafVariant[];
  riwayatIds: number[];
  totalSurahsMax: number;
}

export interface ReciterCatalogSnapshot {
  reciters: CatalogReciter[];
  riwayat: CatalogRiwayah[];
  stats: {
    mp3quranReciters: number;
    qdcChapterReciters: number;
    totalReciters: number;
    totalMoshafVariants: number;
    riwayatCount: number;
    syncedAt: string;
    sourceStatus: {
      mp3quran: "ok" | "cached" | "unavailable";
      qdc: "ok" | "cached" | "unavailable";
      supabaseCache: "hit" | "bypass" | "unavailable";
    };
    isStaleFallback?: boolean;
  };
}

export interface AudioQueueItem {
  id: string;
  kind: "quran" | "lecture";
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  surahNumber?: number;
  reciter?: Reciter;
  lecture?: LectureItem;
  attachmentIndex?: number;
  attachmentTitle?: string;
  audioUrl: string;
  durationLabel?: string;
}

export interface UserPlaylist {
  id: string;
  name: string;
  items: AudioQueueItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ListeningHistoryEntry {
  id: string;
  kind: "quran" | "lecture";
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  href: string;
  surahNumber?: number;
  reciterSlug?: string;
  moshafId?: string;
  lectureSlug?: string;
  positionSeconds?: number;
  durationSeconds?: number;
  playedAt: string;
}

export interface ListeningPreferencesState {
  preferredReciterSlug?: string;
  preferredMoshafId?: string;
  preferredRiwayahId?: number;
  preferredStyleId?: RecitationStyleId;
  favoriteReciterSlugs: string[];
  favoriteSurahs: Array<{
    surahNumber: number;
    reciterSlug: string;
    moshafId?: string;
  }>;
  favoriteLectureIds: string[];
  recentSearches: string[];
}

// ---------- Automated Release Announcements & Changelog History ----------
export type ReleaseCategoryId =
  | "new_feature"
  | "improvement"
  | "bug_fix"
  | "performance"
  | "security"
  | "ui_ux"
  | "content"
  | "maintenance";

export interface ReleaseCategoryGroup {
  category: ReleaseCategoryId;
  labelAr: string;
  labelEn: string;
  items: string[];
}

export type ReleaseStatus = "pending" | "published" | "failed" | "skipped";

export interface PlatformRelease {
  id: string;
  commitSha: string;
  previousCommitSha?: string | null;
  releaseVersion: string;
  titleAr: string;
  summaryAr: string;
  categories: ReleaseCategoryGroup[];
  highlightsCount: number;
  releaseStatus: ReleaseStatus;
  deployedAt: string;
}

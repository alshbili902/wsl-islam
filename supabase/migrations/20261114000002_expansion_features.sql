-- Wasl Islamic (وصل الإسلامية) — Advanced Quran & Islamic Learning Expansion Schema
-- Adds catalog metadata, trusted Tafsir & Lecture sources, and Web Push subscription storage.
-- Public Islamic catalogs are read-only; anonymous personal progress stays local in browser storage.

-- 1. Verified Tafsir & Linguistic Reference Sources
CREATE TABLE IF NOT EXISTS public.tafsir_sources (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('quran_com_v4', 'spa5k_cdn', 'alquran_cloud')),
  provider_source_id TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  author_ar TEXT NOT NULL,
  author_en TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'ar',
  category TEXT NOT NULL CHECK (category IN ('tafsir', 'gharib', 'irab', 'morphology', 'asbab')),
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  source_url TEXT NOT NULL,
  edition_info TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 100,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tafsir_sources_active ON public.tafsir_sources (is_active, sort_order);

-- 2. Islamic Lecture Categories
CREATE TABLE IF NOT EXISTS public.lecture_categories (
  id TEXT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 100
);

-- 3. Verified Islamic Lectures & Educational Media
CREATE TABLE IF NOT EXISTS public.lectures (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.lecture_categories(id) ON DELETE RESTRICT,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  speaker_ar TEXT NOT NULL,
  speaker_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('audio', 'video', 'external')),
  media_url TEXT NOT NULL,
  source_name_ar TEXT NOT NULL,
  source_name_en TEXT NOT NULL,
  source_url TEXT NOT NULL,
  published_label TEXT,
  duration_label TEXT,
  language TEXT NOT NULL DEFAULT 'ar',
  reference_ar TEXT,
  reference_en TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lectures_category ON public.lectures (category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_lectures_featured ON public.lectures (is_featured, is_active);

-- 4. Browser Web Push Subscriptions & Notification Preferences
-- Strictly private: RLS enables zero public SELECT/INSERT/UPDATE/DELETE access.
-- All subscription reads/writes execute strictly through validated server API routes using the service-role client.
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'ar' CHECK (locale IN ('ar', 'en')),
  timezone TEXT NOT NULL DEFAULT 'Asia/Riyadh',
  city_id TEXT NOT NULL DEFAULT 'makkah',
  latitude DOUBLE PRECISION NOT NULL DEFAULT 21.4225,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 39.8262,
  calculation_method TEXT NOT NULL DEFAULT 'UmmAlQura',
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_notified JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON public.push_subscriptions (is_active);

-- 5. Source Verification Governance Metadata
CREATE TABLE IF NOT EXISTS public.source_verification_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_area TEXT NOT NULL CHECK (feature_area IN ('tafsir', 'mushaf', 'khatmah', 'notifications', 'lectures', 'themes')),
  content_type TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  exact_reference TEXT NOT NULL,
  edition_info TEXT,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'attributed', 'disputed_noted')),
  last_reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (feature_area, source_url, exact_reference)
);

-- Enable Row Level Security across all new tables
ALTER TABLE public.tafsir_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecture_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_verification_metadata ENABLE ROW LEVEL SECURITY;

-- Public read-only access for verified educational catalogs
CREATE POLICY "Public read active tafsir_sources"
  ON public.tafsir_sources FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Public read lecture_categories"
  ON public.lecture_categories FOR SELECT
  USING (TRUE);

CREATE POLICY "Public read active lectures"
  ON public.lectures FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Public read source_verification_metadata"
  ON public.source_verification_metadata FOR SELECT
  USING (TRUE);

-- Note: push_subscriptions intentionally has NO public RLS policies so subscribers' endpoints/keys
-- and reminder preferences are never publicly queryable via the Supabase anon key.

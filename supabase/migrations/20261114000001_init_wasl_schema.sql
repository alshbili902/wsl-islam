-- Wasl Islamic (وصل الإسلامية) — Production Database Schema
-- Designed for PostgreSQL / Supabase with strict Row Level Security (RLS).
-- Public visitors access verified content without registration or login.

-- 1. Islamic Radio Stations
CREATE TABLE IF NOT EXISTS public.radio_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('official', 'quran', 'sunnah', 'tafsir', 'knowledge', 'reciters')),
  stream_url TEXT NOT NULL,
  fallback_url TEXT,
  stream_type TEXT NOT NULL CHECK (stream_type IN ('mp3', 'hls')),
  needs_proxy BOOLEAN NOT NULL DEFAULT FALSE,
  source_org_ar TEXT NOT NULL,
  source_org_en TEXT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_radio_stations_category ON public.radio_stations (category);
CREATE INDEX IF NOT EXISTS idx_radio_stations_featured ON public.radio_stations (is_featured, sort_order);

-- 2. Islamic Knowledge & Educational Articles
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN (
      'aqeedah',
      'worship',
      'seerah',
      'prophets',
      'manners',
      'new_muslims',
      'education',
      'general'
    )
  ),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  summary_ar TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  content_blocks JSONB NOT NULL,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  reading_minutes INTEGER NOT NULL DEFAULT 4,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles (category);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON public.articles (is_featured, published_at DESC);

-- 3. Verified Islamic Quiz Questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id TEXT PRIMARY KEY,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category TEXT NOT NULL CHECK (category IN ('quran', 'hadith', 'seerah', 'fiqh', 'prophets', 'aqeedah')),
  question_ar TEXT NOT NULL,
  question_en TEXT NOT NULL,
  options_ar JSONB NOT NULL,
  options_en JSONB NOT NULL,
  correct_index INTEGER NOT NULL CHECK (correct_index >= 0 AND correct_index <= 3),
  explanation_ar TEXT NOT NULL,
  explanation_en TEXT NOT NULL,
  reference_ar TEXT NOT NULL,
  reference_en TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON public.quiz_questions (difficulty, category);

-- 4. Scholarly & Multi-Language Resources
CREATE TABLE IF NOT EXISTS public.scholarly_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('scholarly', 'quran_official', 'charity', 'multilingual', 'fatwa')),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  url TEXT NOT NULL,
  organization_ar TEXT NOT NULL,
  organization_en TEXT NOT NULL,
  language_tags TEXT[] NOT NULL DEFAULT ARRAY['ar'],
  sort_order INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scholarly_resources_category ON public.scholarly_resources (category, sort_order);

-- 5. Islamic Glossary Terms
CREATE TABLE IF NOT EXISTS public.glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  term_ar TEXT NOT NULL,
  term_en TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  definition_ar TEXT NOT NULL,
  definition_en TEXT NOT NULL,
  category TEXT NOT NULL,
  reference_ar TEXT,
  reference_en TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_glossary_terms_category ON public.glossary_terms (category);

-- 6. Content Reference & Verification Log
CREATE TABLE IF NOT EXISTS public.content_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_key TEXT NOT NULL,
  source_name_ar TEXT NOT NULL,
  source_name_en TEXT NOT NULL,
  source_url TEXT NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (entity_type, entity_key, source_url)
);

-- 7. Application Configuration
CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS): Read-only public access, zero public mutations
ALTER TABLE public.radio_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarly_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active radio_stations"
  ON public.radio_stations FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Public read published articles"
  ON public.articles FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Public read active quiz_questions"
  ON public.quiz_questions FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Public read active scholarly_resources"
  ON public.scholarly_resources FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Public read glossary_terms"
  ON public.glossary_terms FOR SELECT
  USING (TRUE);

CREATE POLICY "Public read content_references"
  ON public.content_references FOR SELECT
  USING (TRUE);

CREATE POLICY "Public read app_config"
  ON public.app_config FOR SELECT
  USING (TRUE);

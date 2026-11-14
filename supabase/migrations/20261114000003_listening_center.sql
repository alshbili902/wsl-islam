-- Wasl Islamic (وصل الإسلامية) — Listening Center Dynamic Catalog Schema
-- Stores synchronized Quran reciters, Mushaf recording variants, and Riwayat from verified upstream providers.
-- Read-only to anonymous visitors via RLS; updates happen strictly server-side using the service role key.

CREATE TABLE IF NOT EXISTS public.quran_riwayat (
  id INTEGER PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quran_reciters_catalog (
  slug TEXT PRIMARY KEY,
  mp3quran_id INTEGER,
  qdc_id INTEGER,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  normalized_ar TEXT NOT NULL,
  normalized_en TEXT NOT NULL,
  letter TEXT NOT NULL,
  source_updated_at TIMESTAMPTZ,
  moshafs JSONB NOT NULL DEFAULT '[]'::jsonb,
  riwayat_ids INTEGER[] NOT NULL DEFAULT '{}'::integer[],
  total_surahs_max INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reciters_catalog_letter ON public.quran_reciters_catalog (letter, is_active);
CREATE INDEX IF NOT EXISTS idx_reciters_catalog_norm_ar ON public.quran_reciters_catalog (normalized_ar);
CREATE INDEX IF NOT EXISTS idx_reciters_catalog_mp3id ON public.quran_reciters_catalog (mp3quran_id);

CREATE TABLE IF NOT EXISTS public.catalog_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ok', 'partial', 'failed')),
  reciters_count INTEGER NOT NULL DEFAULT 0,
  moshaf_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.quran_riwayat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quran_reciters_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_sync_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read quran_riwayat"
  ON public.quran_riwayat FOR SELECT
  USING (TRUE);

CREATE POLICY "Public read active quran_reciters_catalog"
  ON public.quran_reciters_catalog FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Public read catalog_sync_runs"
  ON public.catalog_sync_runs FOR SELECT
  USING (TRUE);

-- Wasl Islamic (وصل الإسلامية) — Upgrade Automated Release Verification & Tracking
-- Adds strict deployment verification state, release notes, deployment_id, published_at, and is_published.
-- Enforces RLS so public visitors NEVER read pending, failed, rejected, or unverified releases.

ALTER TABLE public.platform_releases
  ADD COLUMN IF NOT EXISTS release_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS deployment_id TEXT,
  ADD COLUMN IF NOT EXISTS deployment_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verification_error TEXT,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT FALSE;

-- Cleanly widen status constraints so superseded/rejected commits stay auditable without deleting rows
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'platform_releases'
      AND constraint_name = 'platform_releases_release_status_check'
  ) THEN
    ALTER TABLE public.platform_releases
      DROP CONSTRAINT platform_releases_release_status_check;
  END IF;
END $$;

ALTER TABLE public.platform_releases
  ADD CONSTRAINT platform_releases_release_status_check
    CHECK (release_status IN ('pending', 'published', 'failed', 'skipped', 'rejected', 'superseded'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'platform_releases'
      AND constraint_name = 'platform_releases_deployment_status_check'
  ) THEN
    ALTER TABLE public.platform_releases
      ADD CONSTRAINT platform_releases_deployment_status_check
      CHECK (deployment_status IN ('pending', 'building', 'deployed', 'failed', 'skipped', 'superseded'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'platform_releases'
      AND constraint_name = 'platform_releases_verification_status_check'
  ) THEN
    ALTER TABLE public.platform_releases
      ADD CONSTRAINT platform_releases_verification_status_check
      CHECK (verification_status IN ('pending', 'verified', 'failed', 'rejected', 'skipped'));
  END IF;
END $$;

-- Backfill any pre-existing published records safely
UPDATE public.platform_releases
SET
  is_published = TRUE,
  verification_status = 'verified',
  deployment_status = 'deployed',
  published_at = COALESCE(published_at, deployed_at, created_at)
WHERE release_status = 'published'
  AND is_published = FALSE;

CREATE INDEX IF NOT EXISTS idx_platform_releases_verified_published
  ON public.platform_releases (published_at DESC)
  WHERE is_published = TRUE AND verification_status = 'verified';

CREATE INDEX IF NOT EXISTS idx_platform_releases_commit_sha
  ON public.platform_releases (commit_sha);

ALTER TABLE public.platform_releases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published platform_releases" ON public.platform_releases;
CREATE POLICY "Public read published platform_releases"
  ON public.platform_releases FOR SELECT
  USING (is_published = TRUE AND verification_status = 'verified');

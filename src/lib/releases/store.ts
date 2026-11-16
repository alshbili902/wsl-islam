import { normalizeReleaseRow } from "@/lib/releases/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PlatformRelease } from "@/types/islamic";

const UPGRADED_COLUMNS =
  "id, commit_sha, previous_commit_sha, release_version, title_ar, summary_ar, release_notes, categories, highlights_count, release_status, deployment_target, deployment_id, deployment_status, deployment_check_id, verification_status, deployed_at, published_at, is_published";

const LEGACY_COLUMNS =
  "id, commit_sha, previous_commit_sha, release_version, title_ar, summary_ar, categories, highlights_count, release_status, deployed_at";

/**
 * Fetches ONLY verified, published production releases from Supabase.
 * Enforces both RLS and explicit query + row-level verification filters.
 */
export async function fetchPublishedReleases(limit = 30): Promise<PlatformRelease[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  try {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const { data, error } = await supabase
      .from("platform_releases")
      .select(UPGRADED_COLUMNS)
      .eq("is_published", true)
      .eq("verification_status", "verified")
      .eq("release_status", "published")
      .order("published_at", { ascending: false })
      .limit(safeLimit);

    if (!error && Array.isArray(data)) {
      return data
        .map((row) => normalizeReleaseRow(row))
        .filter((item): item is PlatformRelease => item !== null);
    }

    // Graceful compatibility if SQL migration 20261116000005 has not been executed yet:
    // still requires RLS + release_status = 'published' strictly.
    if (error && (error.code === "42703" || /column .* does not exist/i.test(error.message))) {
      const legacy = await supabase
        .from("platform_releases")
        .select(LEGACY_COLUMNS)
        .eq("release_status", "published")
        .order("deployed_at", { ascending: false })
        .limit(safeLimit);

      if (legacy.error || !Array.isArray(legacy.data)) {
        return [];
      }
      return legacy.data
        .map((row) => normalizeReleaseRow(row))
        .filter((item): item is PlatformRelease => item !== null);
    }

    return [];
  } catch {
    return [];
  }
}

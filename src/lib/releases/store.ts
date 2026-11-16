import { normalizeReleaseRow } from "@/lib/releases/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PlatformRelease } from "@/types/islamic";

/**
 * Fetches only verified published releases from Supabase.
 * RLS policy enforces `release_status = 'published'` at the database layer as well.
 */
export async function fetchPublishedReleases(limit = 30): Promise<PlatformRelease[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  try {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const { data, error } = await supabase
      .from("platform_releases")
      .select(
        "id, commit_sha, previous_commit_sha, release_version, title_ar, summary_ar, categories, highlights_count, release_status, deployed_at"
      )
      .eq("release_status", "published")
      .order("deployed_at", { ascending: false })
      .limit(safeLimit);

    if (error || !Array.isArray(data)) {
      return [];
    }

    return data
      .map((row) => normalizeReleaseRow(row))
      .filter((item): item is PlatformRelease => item !== null);
  } catch {
    return [];
  }
}

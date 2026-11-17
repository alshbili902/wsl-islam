import { normalizeReleaseRow } from "@/lib/releases/schema";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import type { PlatformRelease } from "@/types/islamic";

const UPGRADED_COLUMNS =
  "id, commit_sha, previous_commit_sha, release_version, title_ar, summary_ar, release_notes, categories, highlights_count, release_status, deployment_target, deployment_id, deployment_status, deployment_check_id, verification_status, deployed_at, published_at, is_published";

const LEGACY_COLUMNS =
  "id, commit_sha, previous_commit_sha, release_version, title_ar, summary_ar, categories, highlights_count, release_status, deployed_at";

const SAFE_VISITOR_ID_RE = /^[a-z0-9_-]{8,64}$/i;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

    // Graceful compatibility when SQL migration 20261116000005 is not yet applied:
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

/**
 * Fetches release IDs dismissed by an anonymous visitor ID when persisted in Supabase.
 * Fails open to empty array if DB table or service role is absent so client fallback handles it.
 */
export async function fetchDismissedReleaseIds(visitorId: string): Promise<string[]> {
  if (!visitorId || !SAFE_VISITOR_ID_RE.test(visitorId)) return [];
  const admin = createSupabaseAdminClient();
  if (!admin) return [];

  try {
    const { data, error } = await admin
      .from("platform_release_dismissals")
      .select("release_id")
      .eq("visitor_id", visitorId)
      .order("dismissed_at", { ascending: false })
      .limit(60);

    if (error || !Array.isArray(data)) return [];
    return data
      .map((row) => String((row as { release_id?: string }).release_id || ""))
      .filter((id) => UUID_RE.test(id));
  } catch {
    return [];
  }
}

/**
 * Records release dismissals for an anonymous visitor cleanly in Supabase.
 */
export async function recordVisitorDismissals(
  visitorId: string,
  releaseIds: string[]
): Promise<{ ok: boolean; persisted: boolean }> {
  if (!visitorId || !SAFE_VISITOR_ID_RE.test(visitorId)) {
    return { ok: false, persisted: false };
  }
  const cleanIds = Array.from(new Set(releaseIds.filter((id) => UUID_RE.test(id)))).slice(
    0,
    25
  );
  if (cleanIds.length === 0) {
    return { ok: true, persisted: false };
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return { ok: true, persisted: false };
  }

  try {
    const rows = cleanIds.map((releaseId) => ({
      visitor_id: visitorId,
      release_id: releaseId,
      dismissed_at: new Date().toISOString(),
    }));
    const { error } = await admin
      .from("platform_release_dismissals")
      .upsert(rows, { onConflict: "visitor_id,release_id" });

    if (error) {
      return { ok: true, persisted: false };
    }
    return { ok: true, persisted: true };
  } catch {
    return { ok: true, persisted: false };
  }
}

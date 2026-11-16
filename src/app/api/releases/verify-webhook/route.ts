import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROD_VERSION_URL = "https://waslislam.fun/api/version";
const EXPECTED_PROJECT = "wslislam";

interface WebhookPayload {
  commitSha?: string;
  commit_sha?: string;
  deploymentId?: string;
  deployment_id?: string;
  projectName?: string;
  project_name?: string;
  environment?: string;
  status?: string;
  deploymentUrl?: string;
  deployment_url?: string;
}

function timingSafeMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function verifyAuthorizedRequest(request: Request, rawBody: string): boolean {
  const secret = process.env.RELEASE_WEBHOOK_SECRET || "";
  if (!secret || secret.length < 16) return false;

  const authHeader = request.headers.get("authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token && timingSafeMatch(token, secret)) {
      return true;
    }
  }

  const sigHeader = (request.headers.get("x-wasl-release-signature") || "").trim();
  if (sigHeader.startsWith("sha256=")) {
    const expectedHmac =
      "sha256=" +
      crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    if (timingSafeMatch(sigHeader, expectedHmac)) {
      return true;
    }
  }

  return false;
}

async function verifyLiveProductionCommit(expectedCommitSha: string): Promise<{
  ok: boolean;
  reason?: string;
  observedCommitSha?: string | null;
  observedEnvironment?: string | null;
}> {
  const baseUrl =
    (process.env.RELEASE_VERIFY_BASE_URL || PROD_VERSION_URL).replace(/\/$/, "");
  const versionUrl = baseUrl.endsWith("/api/version")
    ? `${baseUrl}?t=${Date.now()}`
    : `${baseUrl}/api/version?t=${Date.now()}`;

  try {
    const res = await fetch(versionUrl, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        "User-Agent": "wasl-islamic-release-webhook-verifier",
      },
    });
    if (!res.ok) {
      return { ok: false, reason: `Live version endpoint HTTP ${res.status}` };
    }
    const data = (await res.json()) as {
      commitSha?: string | null;
      environment?: string | null;
    };
    const observedSha =
      typeof data.commitSha === "string" ? data.commitSha.trim().toLowerCase() : null;
    const observedEnv =
      typeof data.environment === "string" ? data.environment.trim() : null;

    if (observedEnv !== "production") {
      return {
        ok: false,
        reason: `Expected live environment 'production', got '${observedEnv || "unknown"}'`,
        observedCommitSha: observedSha,
        observedEnvironment: observedEnv,
      };
    }

    if (!observedSha || observedSha !== expectedCommitSha) {
      return {
        ok: false,
        reason: `Live commit '${observedSha || "none"}' does not match candidate '${expectedCommitSha.slice(0, 7)}'`,
        observedCommitSha: observedSha,
        observedEnvironment: observedEnv,
      };
    }

    return {
      ok: true,
      observedCommitSha: observedSha,
      observedEnvironment: observedEnv,
    };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Live verification failed",
    };
  }
}

export async function POST(request: Request) {
  let rawBody = "";
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!verifyAuthorizedRequest(request, rawBody)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: WebhookPayload;
  try {
    body = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
  }

  const commitSha = String(body.commitSha || body.commit_sha || "")
    .trim()
    .toLowerCase();
  const projectName = String(body.projectName || body.project_name || "")
    .trim()
    .toLowerCase();
  const environment = String(body.environment || "")
    .trim()
    .toLowerCase();
  const deployStatus = String(body.status || "")
    .trim()
    .toLowerCase();
  const deploymentId = String(body.deploymentId || body.deployment_id || "").trim();

  if (!/^[a-f0-9]{7,40}$/i.test(commitSha)) {
    return NextResponse.json({ error: "Invalid commitSha" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase admin client not configured" },
      { status: 503 }
    );
  }

  const { data: existing, error: fetchErr } = await admin
    .from("platform_releases")
    .select(
      "id, commit_sha, release_version, is_published, verification_status, release_status, created_at"
    )
    .eq("commit_sha", commitSha)
    .maybeSingle();

  if (fetchErr || !existing) {
    return NextResponse.json(
      { ok: false, published: false, reason: "Candidate release not found" },
      { status: 404 }
    );
  }

  // Idempotent guard: already verified & published
  if (existing.is_published && existing.verification_status === "verified") {
    return NextResponse.json({
      ok: true,
      published: true,
      deduplicated: true,
      commitSha,
      version: existing.release_version,
    });
  }

  // Guard 1: Must belong to production wslislam project + production environment
  if (projectName !== EXPECTED_PROJECT || environment !== "production") {
    await admin
      .from("platform_releases")
      .update({
        verification_status: "rejected",
        verification_error: `Rejected non-production target (${projectName || "unknown"}/${environment || "unknown"})`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    return NextResponse.json(
      { ok: false, published: false, reason: "Non-production deployment ignored" },
      { status: 422 }
    );
  }

  // Guard 2: Failed/cancelled Cloudflare build stays unpublished
  if (deployStatus !== "success" && deployStatus !== "deployed") {
    await admin
      .from("platform_releases")
      .update({
        deployment_status: "failed",
        verification_status: "failed",
        release_status: "failed",
        is_published: false,
        verification_error: `Cloudflare deployment reported status: ${deployStatus || "unknown"}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    return NextResponse.json(
      { ok: false, published: false, reason: "Deployment did not succeed" },
      { status: 422 }
    );
  }

  // Guard 3: Out-of-order delayed event check — never publish an older release after a newer verified release
  const { data: newerPublished } = await admin
    .from("platform_releases")
    .select("id, commit_sha, release_version, published_at, created_at")
    .eq("is_published", true)
    .eq("verification_status", "verified")
    .gt("created_at", existing.created_at)
    .limit(1);

  if (Array.isArray(newerPublished) && newerPublished.length > 0) {
    await admin
      .from("platform_releases")
      .update({
        deployment_status: "superseded",
        verification_status: "rejected",
        release_status: "superseded",
        is_published: false,
        verification_error: `Superseded by newer published release (${newerPublished[0].release_version})`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    return NextResponse.json({
      ok: true,
      published: false,
      superseded: true,
      reason: "Superseded by newer published release",
    });
  }

  // Guard 4: Strict live domain commit verification against https://waslislam.fun/api/version
  const liveCheck = await verifyLiveProductionCommit(commitSha);
  if (!liveCheck.ok) {
    await admin
      .from("platform_releases")
      .update({
        verification_status: "failed",
        is_published: false,
        verification_error: liveCheck.reason || "Live domain verification failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    return NextResponse.json(
      { ok: false, published: false, reason: liveCheck.reason },
      { status: 409 }
    );
  }

  const nowIso = new Date().toISOString();
  const { error: promoteErr } = await admin
    .from("platform_releases")
    .update({
      is_published: true,
      verification_status: "verified",
      deployment_status: "deployed",
      release_status: "published",
      deployment_id: deploymentId || null,
      published_at: nowIso,
      deployed_at: nowIso,
      verification_error: null,
      updated_at: nowIso,
    })
    .eq("id", existing.id)
    .eq("is_published", false);

  if (promoteErr) {
    return NextResponse.json(
      { error: "Failed to promote verified release" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    published: true,
    commitSha,
    version: existing.release_version,
    publishedAt: nowIso,
  });
}

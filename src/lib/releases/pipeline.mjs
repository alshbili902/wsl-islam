import { analyzeGitChanges } from "./classifier-core.mjs";

const PROD_GITHUB_REPO = "alshbili902/wslislam";
const EXPECTED_PROJECT = "wslislam";
const DEFAULT_PROD_VERSION_URL = "https://waslislam.fun/api/version";

function buildSupabaseHeaders(serviceKey, prefer = "return=representation") {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

export function parseCloudflareSummaryIds(summary = "") {
  const buildMatch = String(summary).match(/Build ID:\s*\[?([a-f0-9-]{8,64})\]?/i);
  const versionMatch = String(summary).match(/Version ID:\s*([a-f0-9-]{8,64})/i);
  const scriptMatch = String(summary).match(/Script:\s*\[?([a-z0-9_-]+)\]?/i);
  return {
    buildId: buildMatch?.[1] || null,
    versionId: versionMatch?.[1] || null,
    scriptName: scriptMatch?.[1]?.toLowerCase() || null,
  };
}

export async function fetchLatestVerifiedRelease({
  supabaseUrl,
  serviceKey,
  fetchImpl = fetch,
}) {
  const res = await fetchImpl(
    `${supabaseUrl}/rest/v1/platform_releases?is_published=eq.true&verification_status=eq.verified&select=id,commit_sha,release_version,published_at,created_at&order=published_at.desc&limit=1`,
    { headers: buildSupabaseHeaders(serviceKey, "") }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

export async function fetchCandidateByCommit({
  supabaseUrl,
  serviceKey,
  commitSha,
  fetchImpl = fetch,
}) {
  const res = await fetchImpl(
    `${supabaseUrl}/rest/v1/platform_releases?commit_sha=eq.${encodeURIComponent(commitSha)}&select=id,commit_sha,release_version,is_published,verification_status,release_status,deployment_status,created_at&limit=1`,
    { headers: buildSupabaseHeaders(serviceKey, "") }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

/**
 * Stage A: Analyzes git changes across previous..current and persists an
 * UNPUBLISHED pending candidate (`is_published = false`, `verification_status = 'pending'`).
 */
export async function prepareAndStoreCandidateRelease({
  supabaseUrl,
  serviceKey,
  currSha,
  prevSha = "",
  changedFiles = [],
  fetchImpl = fetch,
}) {
  const normalizedCurr = String(currSha || "").trim().toLowerCase();
  const normalizedPrev = String(prevSha || "").trim().toLowerCase();

  const existing = await fetchCandidateByCommit({
    supabaseUrl,
    serviceKey,
    commitSha: normalizedCurr,
    fetchImpl,
  });

  if (existing && existing.is_published === true && existing.verification_status === "verified") {
    return {
      action: "already_published",
      candidate: existing,
    };
  }

  const latestVerified = await fetchLatestVerifiedRelease({
    supabaseUrl,
    serviceKey,
    fetchImpl,
  });
  const previousVersion = latestVerified?.release_version || "1.0.0";

  const analysis = analyzeGitChanges({
    files: changedFiles,
    previousVersion,
  });

  if (!analysis.meaningful) {
    return {
      action: "skipped_internal",
      analysis,
    };
  }

  const nowIso = new Date().toISOString();
  const candidateRecord = {
    commit_sha: normalizedCurr,
    previous_commit_sha: normalizedPrev || latestVerified?.commit_sha || null,
    release_version: analysis.releaseVersion,
    title_ar: analysis.titleAr,
    summary_ar: analysis.summaryAr,
    release_notes: analysis.releaseNotes,
    categories: analysis.categories,
    highlights_count: analysis.highlightsCount,
    release_status: "pending",
    deployment_target: "cloudflare",
    deployment_status: "pending",
    verification_status: "pending",
    verification_error: null,
    is_published: false,
    published_at: null,
    deployed_at: null,
    updated_at: nowIso,
  };

  if (existing) {
    const patchRes = await fetchImpl(
      `${supabaseUrl}/rest/v1/platform_releases?id=eq.${encodeURIComponent(existing.id)}`,
      {
        method: "PATCH",
        headers: buildSupabaseHeaders(serviceKey),
        body: JSON.stringify(candidateRecord),
      }
    );
    if (!patchRes.ok) {
      throw new Error(`Failed updating pending candidate (${patchRes.status}): ${await patchRes.text()}`);
    }
    const updated = await patchRes.json();
    return {
      action: "candidate_ready",
      analysis,
      candidate: updated?.[0] || { ...existing, ...candidateRecord },
    };
  }

  const insertRes = await fetchImpl(`${supabaseUrl}/rest/v1/platform_releases`, {
    method: "POST",
    headers: buildSupabaseHeaders(serviceKey),
    body: JSON.stringify(candidateRecord),
  });
  if (!insertRes.ok) {
    throw new Error(`Failed inserting pending candidate (${insertRes.status}): ${await insertRes.text()}`);
  }
  const inserted = await insertRes.json();
  return {
    action: "candidate_ready",
    analysis,
    candidate: inserted?.[0] || candidateRecord,
  };
}

/**
 * Stage B: Waits asynchronously for Cloudflare Workers Builds (`wslislam`) to complete
 * successfully on the production repository commit.
 */
export async function waitForCloudflareDeployment({
  commitSha,
  repo = PROD_GITHUB_REPO,
  expectedProject = EXPECTED_PROJECT,
  githubToken = "",
  cfApiToken = "",
  cfAccountId = "",
  timeoutSec = 420,
  pollIntervalMs = 8000,
  fetchImpl = fetch,
  sleepImpl = (ms) => new Promise((r) => setTimeout(r, ms)),
  onLog = () => {},
}) {
  const deadline = Date.now() + timeoutSec * 1000;
  const ghHeaders = {
    Accept: "application/vnd.github+json",
    "User-Agent": "wasl-islamic-release-verifier",
  };
  if (githubToken) {
    ghHeaders.Authorization = `Bearer ${githubToken}`;
  }

  let attempt = 0;
  while (Date.now() <= deadline) {
    attempt += 1;
    try {
      const checkRes = await fetchImpl(
        `https://api.github.com/repos/${repo}/commits/${encodeURIComponent(commitSha)}/check-runs`,
        { headers: ghHeaders }
      );
      if (checkRes.ok) {
        const data = await checkRes.json();
        const runs = Array.isArray(data.check_runs) ? data.check_runs : [];
        const cfRun = runs.find(
          (r) =>
            r?.app?.slug === "cloudflare-workers-and-pages" ||
            /workers builds|cloudflare/i.test(r?.name || "")
        );

        if (cfRun) {
          const parsed = parseCloudflareSummaryIds(cfRun.output?.summary || "");
          if (parsed.scriptName && parsed.scriptName !== expectedProject) {
            return {
              verified: false,
              deploymentStatus: "failed",
              reason: `Cloudflare build script '${parsed.scriptName}' does not match production '${expectedProject}'`,
            };
          }

          if (cfRun.status === "completed") {
            if (cfRun.conclusion === "success") {
              // Optional direct Cloudflare Workers deployment API cross-check when token provided
              if (cfApiToken && cfAccountId) {
                const cfOk = await verifyCloudflareWorkersApi({
                  cfApiToken,
                  cfAccountId,
                  scriptName: expectedProject,
                  fetchImpl,
                });
                if (!cfOk.verified) {
                  return cfOk;
                }
              }

              return {
                verified: true,
                deploymentStatus: "deployed",
                deploymentId: parsed.buildId || parsed.versionId || String(cfRun.id || ""),
                checkId: String(cfRun.id || ""),
                detailsUrl: cfRun.details_url || cfRun.html_url || "",
              };
            }

            return {
              verified: false,
              deploymentStatus: "failed",
              checkId: String(cfRun.id || ""),
              detailsUrl: cfRun.details_url || cfRun.html_url || "",
              reason: `Cloudflare production build finished with conclusion: ${cfRun.conclusion || "unknown"}`,
            };
          }

          if (attempt % 2 === 1) {
            onLog(`Cloudflare build for ${commitSha.slice(0, 7)} is ${cfRun.status}...`);
          }
        } else if (attempt === 1) {
          onLog(`Waiting for Cloudflare Workers Builds check on ${repo}@${commitSha.slice(0, 7)}...`);
        }
      }
    } catch (err) {
      onLog(`Cloudflare check poll warning: ${err?.message || err}`);
    }

    if (Date.now() + pollIntervalMs > deadline) break;
    await sleepImpl(pollIntervalMs);
  }

  return {
    verified: false,
    deploymentStatus: "failed",
    reason: `Timed out after ${timeoutSec}s waiting for Cloudflare production build confirmation`,
  };
}

export async function verifyCloudflareWorkersApi({
  cfApiToken,
  cfAccountId,
  scriptName = EXPECTED_PROJECT,
  fetchImpl = fetch,
}) {
  try {
    const res = await fetchImpl(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(cfAccountId)}/workers/scripts/${encodeURIComponent(scriptName)}/deployments`,
      {
        headers: {
          Authorization: `Bearer ${cfApiToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) {
      return {
        verified: false,
        deploymentStatus: "failed",
        reason: `Cloudflare API check failed (${res.status})`,
      };
    }
    const payload = await res.json();
    const deployments = payload?.result?.deployments;
    if (payload?.success !== true || !Array.isArray(deployments) || deployments.length === 0) {
      return {
        verified: false,
        deploymentStatus: "failed",
        reason: "Cloudflare API returned no active deployments for wslislam",
      };
    }
    return { verified: true };
  } catch (err) {
    return {
      verified: false,
      deploymentStatus: "failed",
      reason: `Cloudflare API verification error: ${err?.message || err}`,
    };
  }
}

/**
 * Stage C: Polls `https://waslislam.fun/api/version` to confirm the live domain
 * is actively serving production traffic built from the exact `commitSha`.
 */
export async function verifyLiveProductionVersion({
  commitSha,
  versionEndpointUrl = DEFAULT_PROD_VERSION_URL,
  timeoutSec = 90,
  pollIntervalMs = 6000,
  fetchImpl = fetch,
  sleepImpl = (ms) => new Promise((r) => setTimeout(r, ms)),
  onLog = () => {},
}) {
  const expectedSha = String(commitSha || "").trim().toLowerCase();
  const deadline = Date.now() + timeoutSec * 1000;
  let lastReason = "Live production version check did not run";

  while (Date.now() <= deadline) {
    try {
      const separator = versionEndpointUrl.includes("?") ? "&" : "?";
      const res = await fetchImpl(`${versionEndpointUrl}${separator}t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache",
          "User-Agent": "wasl-islamic-live-verifier",
        },
      });
      if (!res.ok) {
        lastReason = `Live version endpoint returned HTTP ${res.status}`;
      } else {
        const data = await res.json();
        const observedSha =
          typeof data?.commitSha === "string"
            ? data.commitSha.trim().toLowerCase()
            : "";
        const observedEnv =
          typeof data?.environment === "string" ? data.environment.trim() : "";

        if (observedEnv !== "production") {
          lastReason = `Expected production environment, got '${observedEnv || "unknown"}'`;
        } else if (observedSha !== expectedSha) {
          lastReason = `Live domain serves commit '${observedSha.slice(0, 7) || "none"}' instead of '${expectedSha.slice(0, 7)}'`;
        } else {
          return {
            verified: true,
            observedCommitSha: observedSha,
            observedEnvironment: observedEnv,
          };
        }
      }
    } catch (err) {
      lastReason = `Live version endpoint request error: ${err?.message || err}`;
    }

    onLog(`Live verification pending: ${lastReason}`);
    if (Date.now() + pollIntervalMs > deadline) break;
    await sleepImpl(pollIntervalMs);
  }

  return {
    verified: false,
    reason: lastReason,
  };
}

/**
 * Out-of-order guard: returns true if a NEWER verified release is already published.
 */
export async function isCandidateSuperseded({
  supabaseUrl,
  serviceKey,
  candidate,
  isAncestorFn = () => false,
  fetchImpl = fetch,
}) {
  const latest = await fetchLatestVerifiedRelease({
    supabaseUrl,
    serviceKey,
    fetchImpl,
  });
  if (!latest || latest.commit_sha === candidate.commit_sha) {
    return { superseded: false };
  }

  // Git ancestry check (candidate is ancestor of already-published newer release)
  if (isAncestorFn(candidate.commit_sha, latest.commit_sha)) {
    return {
      superseded: true,
      latestVersion: latest.release_version,
      latestCommitSha: latest.commit_sha,
    };
  }

  // Chronological guard fallback
  if (
    candidate.created_at &&
    latest.created_at &&
    Date.parse(latest.created_at) > Date.parse(candidate.created_at)
  ) {
    return {
      superseded: true,
      latestVersion: latest.release_version,
      latestCommitSha: latest.commit_sha,
    };
  }

  return { superseded: false };
}

/**
 * Stage D: Promotes an existing pending candidate ONLY if every verification check succeeded,
 * or safely marks it failed / rejected with `is_published = false`.
 */
export async function finalizeCandidateStatus({
  supabaseUrl,
  serviceKey,
  commitSha,
  verified,
  superseded = false,
  deploymentId = null,
  checkId = null,
  detailsUrl = null,
  errorReason = null,
  fetchImpl = fetch,
}) {
  const nowIso = new Date().toISOString();
  const patch = verified
    ? {
        is_published: true,
        verification_status: "verified",
        deployment_status: "deployed",
        release_status: "published",
        deployment_id: deploymentId || checkId || null,
        deployment_check_id: checkId || null,
        deployment_url: detailsUrl || null,
        published_at: nowIso,
        deployed_at: nowIso,
        verification_error: null,
        updated_at: nowIso,
      }
    : superseded
      ? {
          is_published: false,
          verification_status: "rejected",
          deployment_status: "superseded",
          release_status: "superseded",
          verification_error: errorReason || "Superseded by newer production release",
          updated_at: nowIso,
        }
      : {
          is_published: false,
          verification_status: "failed",
          deployment_status: "failed",
          release_status: "failed",
          deployment_id: deploymentId || null,
          deployment_check_id: checkId || null,
          deployment_url: detailsUrl || null,
          verification_error: errorReason || "Production verification failed",
          updated_at: nowIso,
        };

  const url = verified
    ? `${supabaseUrl}/rest/v1/platform_releases?commit_sha=eq.${encodeURIComponent(commitSha)}&is_published=eq.false`
    : `${supabaseUrl}/rest/v1/platform_releases?commit_sha=eq.${encodeURIComponent(commitSha)}`;

  const res = await fetchImpl(url, {
    method: "PATCH",
    headers: buildSupabaseHeaders(serviceKey),
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    throw new Error(`Failed finalizing candidate (${res.status}): ${await res.text()}`);
  }
  const rows = await res.json();
  return rows?.[0] || patch;
}

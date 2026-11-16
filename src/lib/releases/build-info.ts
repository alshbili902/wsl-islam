export type RuntimeDeployEnvironment = "production" | "preview" | "local";

export interface PublicBuildInfo {
  commitSha: string | null;
  shortSha: string | null;
  branch: string | null;
  environment: RuntimeDeployEnvironment;
  buildTimestamp: string | null;
  deploymentId: string | null;
}

const HEX_SHA_RE = /^[a-f0-9]{7,40}$/i;

function firstValidSha(candidates: Array<string | undefined>): string | null {
  for (const raw of candidates) {
    if (typeof raw === "string") {
      const cleaned = raw.trim().toLowerCase();
      if (HEX_SHA_RE.test(cleaned)) {
        return cleaned;
      }
    }
  }
  return null;
}

/**
 * Resolves the safe, non-secret build metadata injected at build time or provided
 * by Cloudflare Workers/Pages runtime variables.
 */
export function getPublicBuildInfo(requestUrl?: string): PublicBuildInfo {
  const commitSha = firstValidSha([
    process.env.WORKERS_CI_COMMIT_SHA,
    process.env.CF_PAGES_COMMIT_SHA,
    process.env.NEXT_PUBLIC_BUILD_COMMIT_SHA,
  ]);

  const branch =
    (
      process.env.WORKERS_CI_BRANCH ||
      process.env.CF_PAGES_BRANCH ||
      process.env.NEXT_PUBLIC_BUILD_BRANCH ||
      ""
    ).trim() || null;

  const deploymentId =
    (
      process.env.WORKERS_CI_BUILD_UUID ||
      process.env.CF_PAGES_DEPLOYMENT_ID ||
      process.env.NEXT_PUBLIC_CF_DEPLOYMENT_ID ||
      ""
    ).trim() || null;

  const buildTimestamp =
    (process.env.NEXT_PUBLIC_BUILD_TIMESTAMP || "").trim() || null;

  let environment: RuntimeDeployEnvironment = "local";
  if (requestUrl) {
    try {
      const hostname = new URL(requestUrl).hostname.toLowerCase();
      if (
        hostname === "waslislam.fun" ||
        hostname === "www.waslislam.fun"
      ) {
        environment =
          !branch || branch === "main" ? "production" : "preview";
      } else if (
        hostname.endsWith(".workers.dev") ||
        hostname.endsWith(".pages.dev")
      ) {
        environment = "preview";
      }
    } catch {
      environment = "local";
    }
  } else if (process.env.NODE_ENV === "production" && branch === "main") {
    environment = "production";
  }

  return {
    commitSha,
    shortSha: commitSha ? commitSha.slice(0, 7) : null,
    branch,
    environment,
    buildTimestamp,
    deploymentId,
  };
}

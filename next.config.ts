import { execSync } from "node:child_process";
import type { NextConfig } from "next";

function resolveSafeCommitSha(): string {
  const candidates = [
    process.env.WORKERS_CI_COMMIT_SHA,
    process.env.CF_PAGES_COMMIT_SHA,
    process.env.GITHUB_SHA,
    process.env.NEXT_PUBLIC_BUILD_COMMIT_SHA,
  ];
  for (const val of candidates) {
    if (typeof val === "string" && /^[a-f0-9]{7,40}$/i.test(val.trim())) {
      return val.trim().toLowerCase();
    }
  }
  try {
    const sha = execSync("git rev-parse HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (/^[a-f0-9]{7,40}$/i.test(sha)) {
      return sha.toLowerCase();
    }
  } catch {
    // Build directory may omit .git in some CI environments
  }
  return "";
}

function resolveSafeBranch(): string {
  const candidates = [
    process.env.WORKERS_CI_BRANCH,
    process.env.CF_PAGES_BRANCH,
    process.env.GITHUB_REF_NAME,
    process.env.NEXT_PUBLIC_BUILD_BRANCH,
  ];
  for (const val of candidates) {
    if (typeof val === "string" && val.trim() && val.trim() !== "HEAD") {
      return val.trim();
    }
  }
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (branch && branch !== "HEAD") {
      return branch;
    }
  } catch {
    // Fallback cleanly
  }
  return "";
}

const buildCommitSha = resolveSafeCommitSha();
const buildBranch = resolveSafeBranch();
const buildTimestamp =
  process.env.NEXT_PUBLIC_BUILD_TIMESTAMP || new Date().toISOString();
const cfDeploymentId =
  process.env.WORKERS_CI_BUILD_UUID ||
  process.env.CF_PAGES_DEPLOYMENT_ID ||
  "";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.8.121"],
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BUILD_COMMIT_SHA: buildCommitSha,
    NEXT_PUBLIC_BUILD_BRANCH: buildBranch,
    NEXT_PUBLIC_BUILD_TIMESTAMP: buildTimestamp,
    NEXT_PUBLIC_CF_DEPLOYMENT_ID: cfDeploymentId,
  },
};

export default nextConfig;

#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  fetchLatestVerifiedRelease,
  finalizeCandidateStatus,
  isCandidateSuperseded,
  prepareAndStoreCandidateRelease,
  verifyLiveProductionVersion,
  waitForCloudflareDeployment,
} from "../src/lib/releases/pipeline.mjs";

const REPO_ROOT = process.cwd();
const PROD_GITHUB_REPO = "alshbili902/wslislam";
const PROD_VERSION_URL = "https://waslislam.fun/api/version";

function loadEnvLocal() {
  const envPath = path.join(REPO_ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const map = {};
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx > 0) {
      map[trimmed.slice(0, idx).trim()] = trimmed
        .slice(idx + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
    }
  }
  return map;
}

function runGit(args) {
  return execFileSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  }).trim();
}

function isCommitAncestor(ancestorSha, descendantSha) {
  if (!ancestorSha || !descendantSha || ancestorSha === descendantSha) return false;
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", ancestorSha, descendantSha], {
      cwd: REPO_ROOT,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function parseArgs(argv) {
  const opts = {
    prev: "",
    curr: "",
    dryRun: false,
    cfTimeoutSec: 420,
    liveTimeoutSec: 90,
    skipLiveCheck: false,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--prev" && argv[i + 1]) opts.prev = argv[++i];
    else if (arg === "--curr" && argv[i + 1]) opts.curr = argv[++i];
    else if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--cf-timeout" && argv[i + 1]) {
      const n = Number(argv[++i]);
      if (Number.isFinite(n) && n >= 1) opts.cfTimeoutSec = n;
    } else if (arg === "--live-timeout" && argv[i + 1]) {
      const n = Number(argv[++i]);
      if (Number.isFinite(n) && n >= 1) opts.liveTimeoutSec = n;
    } else if (arg === "--skip-live-check") opts.skipLiveCheck = true;
  }
  return opts;
}

function collectChangedFiles(prevSha, currSha) {
  const ZERO_SHA = "0000000000000000000000000000000000000000";
  const hasRange = prevSha && prevSha !== ZERO_SHA && prevSha !== currSha;
  const rangeArgs = hasRange
    ? ["diff", "--name-status", "--no-renames", `${prevSha}..${currSha}`]
    : ["diff-tree", "--no-commit-id", "--name-status", "-r", currSha];

  const rawList = runGit(rangeArgs);
  if (!rawList) return [];

  const files = [];
  for (const line of rawList.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const parts = line.split(/\t/);
    const status = (parts[0] || "M").trim().charAt(0);
    const filePath = (parts[1] || "").trim();
    if (!filePath) continue;

    let diff = "";
    try {
      const diffArgs = hasRange
        ? ["diff", "-U3", `${prevSha}..${currSha}`, "--", filePath]
        : ["show", "--format=", "-U3", currSha, "--", filePath];
      diff = runGit(diffArgs).slice(0, 24000);
    } catch {
      diff = "";
    }

    let sourceSnippet = "";
    const absPath = path.join(REPO_ROOT, filePath);
    if (status !== "D" && fs.existsSync(absPath) && /\.(tsx?|jsx?|mjs)$/i.test(filePath)) {
      try {
        sourceSnippet = fs.readFileSync(absPath, "utf8").slice(0, 6000);
      } catch {
        sourceSnippet = "";
      }
    }

    files.push({ path: filePath, status, diff, sourceSnippet });
  }
  return files;
}

async function main() {
  const opts = parseArgs(process.argv);
  const envLocal = loadEnvLocal();

  const currSha = (
    opts.curr ||
    process.env.GITHUB_SHA ||
    runGit(["rev-parse", "HEAD"])
  ).toLowerCase();

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || envLocal.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || envLocal.SUPABASE_SERVICE_ROLE_KEY;
  const githubToken =
    process.env.GITHUB_TOKEN || process.env.GH_TOKEN || envLocal.GH_TOKEN || "";
  const cfApiToken =
    process.env.CLOUDFLARE_API_TOKEN || envLocal.CLOUDFLARE_API_TOKEN || "";
  const cfAccountId =
    process.env.CLOUDFLARE_ACCOUNT_ID || envLocal.CLOUDFLARE_ACCOUNT_ID || "";
  const versionUrl =
    process.env.RELEASE_VERIFY_VERSION_URL || PROD_VERSION_URL;

  if (!opts.dryRun && (!supabaseUrl || !serviceKey)) {
    console.log(
      "Release verification halted: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured."
    );
    process.exit(1);
  }

  // Resolve diff baseline from latest verified production release if available
  let prevSha = opts.prev || "";
  if (!opts.dryRun && supabaseUrl && serviceKey) {
    const latestVerified = await fetchLatestVerifiedRelease({
      supabaseUrl,
      serviceKey,
    });
    if (latestVerified?.commit_sha && isCommitAncestor(latestVerified.commit_sha, currSha)) {
      prevSha = latestVerified.commit_sha;
    }
  }
  if (!prevSha) {
    try {
      prevSha = runGit(["rev-parse", `${currSha}^`]);
    } catch {
      prevSha = "";
    }
  }

  const changedFiles = collectChangedFiles(prevSha, currSha);

  if (opts.dryRun) {
    const { analyzeGitChanges } = await import("../src/lib/releases/classifier-core.mjs");
    const analysis = analyzeGitChanges({
      files: changedFiles,
      previousVersion: "1.0.0",
    });
    console.log("DRY RUN ANALYSIS:");
    console.log(
      JSON.stringify(
        {
          prevSha: prevSha || null,
          currSha,
          analyzedFileCount: changedFiles.length,
          analysis,
        },
        null,
        2
      )
    );
    return;
  }

  // Stage A: Persist unpublished pending candidate release before waiting for Cloudflare
  console.log(
    `[Stage A] Analyzing diff ${(prevSha || "root").slice(0, 7)}..${currSha.slice(0, 7)}...`
  );
  const stageA = await prepareAndStoreCandidateRelease({
    supabaseUrl,
    serviceKey,
    currSha,
    prevSha,
    changedFiles,
  });

  if (stageA.action === "already_published") {
    console.log(
      `[Idempotent] Commit ${currSha.slice(0, 7)} already published as v${stageA.candidate.release_version}.`
    );
    return;
  }

  if (stageA.action === "skipped_internal") {
    console.log(
      `[Stage A] Commit ${currSha.slice(0, 7)} contains internal/non-visitor changes only — skipped.`
    );
    return;
  }

  const candidate = stageA.candidate;
  console.log(
    `[Stage A] Stored UNPUBLISHED pending candidate v${candidate.release_version} (${currSha.slice(0, 7)}).`
  );

  // Stage B: Wait asynchronously for Cloudflare Workers Builds (`wslislam`)
  console.log("[Stage B] Waiting for Cloudflare Workers Builds production status...");
  const stageB = await waitForCloudflareDeployment({
    commitSha: currSha,
    repo: PROD_GITHUB_REPO,
    githubToken,
    cfApiToken,
    cfAccountId,
    timeoutSec: opts.cfTimeoutSec,
    onLog: (msg) => console.log(`[Stage B] ${msg}`),
  });

  if (!stageB.verified) {
    await finalizeCandidateStatus({
      supabaseUrl,
      serviceKey,
      commitSha: currSha,
      verified: false,
      checkId: stageB.checkId,
      detailsUrl: stageB.detailsUrl,
      errorReason: stageB.reason,
    });
    console.error(`[Stage B FAILED] Kept unpublished: ${stageB.reason}`);
    process.exit(1);
  }
  console.log(
    `[Stage B OK] Cloudflare production build succeeded (deploymentId=${stageB.deploymentId}).`
  );

  // Out-of-order delayed event check before live verification/publish
  const orderCheck = await isCandidateSuperseded({
    supabaseUrl,
    serviceKey,
    candidate,
    isAncestorFn: isCommitAncestor,
  });
  if (orderCheck.superseded) {
    await finalizeCandidateStatus({
      supabaseUrl,
      serviceKey,
      commitSha: currSha,
      verified: false,
      superseded: true,
      errorReason: `Superseded by newer published release v${orderCheck.latestVersion}`,
    });
    console.log(
      `[Out-of-Order Guard] Candidate ${currSha.slice(0, 7)} superseded by v${orderCheck.latestVersion} — kept unpublished.`
    );
    return;
  }

  // Stage C: Verify https://waslislam.fun/api/version serves exact commitSha in production
  if (!opts.skipLiveCheck) {
    console.log(`[Stage C] Verifying live production domain at ${versionUrl}...`);
    const stageC = await verifyLiveProductionVersion({
      commitSha: currSha,
      versionEndpointUrl: versionUrl,
      timeoutSec: opts.liveTimeoutSec,
      onLog: (msg) => console.log(`[Stage C] ${msg}`),
    });

    if (!stageC.verified) {
      await finalizeCandidateStatus({
        supabaseUrl,
        serviceKey,
        commitSha: currSha,
        verified: false,
        deploymentId: stageB.deploymentId,
        checkId: stageB.checkId,
        detailsUrl: stageB.detailsUrl,
        errorReason: stageC.reason,
      });
      console.error(`[Stage C FAILED] Kept unpublished: ${stageC.reason}`);
      process.exit(1);
    }
    console.log(
      `[Stage C OK] Live domain confirmed commit ${stageC.observedCommitSha.slice(0, 7)} in '${stageC.observedEnvironment}'.`
    );
  }

  // Stage D: Atomic promote to published & verified
  const published = await finalizeCandidateStatus({
    supabaseUrl,
    serviceKey,
    commitSha: currSha,
    verified: true,
    deploymentId: stageB.deploymentId,
    checkId: stageB.checkId,
    detailsUrl: stageB.detailsUrl,
  });

  console.log(
    `[Stage D PUBLISHED] Release v${published.release_version || candidate.release_version} verified & published!`
  );
}

main().catch((err) => {
  console.error("Release pipeline error:", err?.stack || err);
  process.exit(1);
});

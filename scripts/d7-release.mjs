#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { analyzeGitChanges } from "../src/lib/releases/classifier-core.mjs";

const REPO_ROOT = process.cwd();
const LOG_DIR = path.join(REPO_ROOT, ".release-logs");
const GITHUB_PROD_REPO = "alshbili902/wslislam";

function loadEnvLocal() {
  const envPath = path.join(REPO_ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const map = {};
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx > 0) {
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      map[k] = v;
    }
  }
  return map;
}

function appendLog(filename, message) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    const line = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(path.join(LOG_DIR, filename), line, "utf8");
  } catch {
    // Logging itself must never crash D7
  }
}

function runGit(args) {
  return execFileSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: 12 * 1024 * 1024,
  }).trim();
}

function parseArgs(argv) {
  const opts = {
    prev: "",
    curr: "",
    dryRun: false,
    verifyTimeoutSec: 360,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--prev" && argv[i + 1]) {
      opts.prev = argv[++i];
    } else if (arg === "--curr" && argv[i + 1]) {
      opts.curr = argv[++i];
    } else if (arg === "--dry-run") {
      opts.dryRun = true;
    } else if (arg === "--verify-timeout" && argv[i + 1]) {
      const n = Number(argv[++i]);
      if (Number.isFinite(n) && n >= 1) opts.verifyTimeoutSec = n;
    }
  }
  return opts;
}

function collectChangedFiles(prevSha, currSha) {
  const rangeArgs =
    prevSha && prevSha !== currSha
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
      const diffArgs =
        prevSha && prevSha !== currSha
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

async function fetchLatestPublishedVersion(supabaseUrl, serviceKey) {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/platform_releases?release_status=eq.published&select=release_version&order=deployed_at.desc&limit=1`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    );
    if (!res.ok) return "1.0.0";
    const rows = await res.json();
    if (Array.isArray(rows) && rows[0]?.release_version) {
      return rows[0].release_version;
    }
  } catch {
    // Fallback baseline cleanly
  }
  return "1.0.0";
}

async function checkReleaseExists(supabaseUrl, serviceKey, commitSha) {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/platform_releases?commit_sha=eq.${encodeURIComponent(commitSha)}&select=id,release_status,release_version`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

async function verifyCloudflareDeployment(commitSha, timeoutSec, env) {
  const deadline = Date.now() + timeoutSec * 1000;
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "wasl-islamic-release-verifier",
  };
  if (env.GH_TOKEN || process.env.GH_TOKEN) {
    headers.Authorization = `Bearer ${env.GH_TOKEN || process.env.GH_TOKEN}`;
  }

  let attempt = 0;
  while (Date.now() < deadline) {
    attempt += 1;
    try {
      const url = `https://api.github.com/repos/${GITHUB_PROD_REPO}/commits/${commitSha}/check-runs`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        const runs = Array.isArray(data.check_runs) ? data.check_runs : [];
        const cfRun = runs.find(
          (r) =>
            r?.app?.slug === "cloudflare-workers-and-pages" ||
            /workers builds|cloudflare|pages/i.test(r?.name || "")
        );

        if (cfRun) {
          if (cfRun.status === "completed") {
            if (cfRun.conclusion === "success") {
              return {
                verified: true,
                checkId: String(cfRun.id || ""),
                detailsUrl: cfRun.details_url || cfRun.html_url || "",
              };
            }
            return {
              verified: false,
              reason: `Cloudflare build finished with conclusion: ${cfRun.conclusion || "unknown"}`,
              checkId: String(cfRun.id || ""),
              detailsUrl: cfRun.details_url || cfRun.html_url || "",
            };
          }
          if (attempt % 2 === 1) {
            console.log(`Waiting for Cloudflare production build (${cfRun.status})...`);
          }
        } else if (attempt === 1) {
          console.log("Waiting for Cloudflare Workers build check to appear on GitHub...");
        }
      }
    } catch (err) {
      appendLog("release-errors.log", `Cloudflare poll warning (${commitSha}): ${err?.message || err}`);
    }

    await new Promise((r) => setTimeout(r, 8000));
  }

  return {
    verified: false,
    reason: `Timed out after ${timeoutSec}s waiting for Cloudflare build confirmation`,
  };
}

async function publishReleaseToSupabase(supabaseUrl, serviceKey, record) {
  const existing = await checkReleaseExists(supabaseUrl, serviceKey, record.commit_sha);
  if (existing) {
    if (existing.release_status === "published") {
      return { deduplicated: true, release: existing };
    }
    const patchRes = await fetch(
      `${supabaseUrl}/rest/v1/platform_releases?commit_sha=eq.${encodeURIComponent(record.commit_sha)}`,
      {
        method: "PATCH",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(record),
      }
    );
    if (!patchRes.ok) {
      throw new Error(`Supabase patch failed (${patchRes.status})`);
    }
    const updated = await patchRes.json();
    return { deduplicated: false, release: updated?.[0] || record };
  }

  const insertRes = await fetch(`${supabaseUrl}/rest/v1/platform_releases`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(record),
  });
  if (!insertRes.ok) {
    const errText = await insertRes.text();
    throw new Error(`Supabase insert failed (${insertRes.status}): ${errText}`);
  }
  const inserted = await insertRes.json();
  return { deduplicated: false, release: inserted?.[0] || record };
}

async function main() {
  const opts = parseArgs(process.argv);
  const env = loadEnvLocal();

  const currSha = opts.curr || runGit(["rev-parse", "HEAD"]);
  const prevSha = opts.prev || "";

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!opts.dryRun && (!supabaseUrl || !serviceKey)) {
    appendLog("release-errors.log", `Missing Supabase credentials for commit ${currSha}. Skipping publish.`);
    console.log("Release changelog skipped: Supabase service credentials not configured.");
    return;
  }

  if (!opts.dryRun) {
    const already = await checkReleaseExists(supabaseUrl, serviceKey, currSha);
    if (already && already.release_status === "published") {
      console.log(`Release for commit ${currSha.slice(0, 7)} is already published (${already.release_version}). Skipping duplicate.`);
      return;
    }
  }

  const changedFiles = collectChangedFiles(prevSha, currSha);
  const previousVersion = !opts.dryRun
    ? await fetchLatestPublishedVersion(supabaseUrl, serviceKey)
    : "1.0.0";

  const analysis = analyzeGitChanges({
    files: changedFiles,
    previousVersion,
  });

  if (!analysis.meaningful) {
    appendLog("release-history.log", `SKIPPED internal-only commit ${currSha.slice(0, 7)} (no visitor-facing changes).`);
    console.log("Internal maintenance only — no visitor announcement needed.");
    return;
  }

  if (opts.dryRun) {
    console.log("DRY RUN GENERATED CHANGELOG:");
    console.log(JSON.stringify(analysis, null, 2));
    return;
  }

  // Strictly verify Cloudflare production build succeeded before publishing!
  const deployConfirm = await verifyCloudflareDeployment(currSha, opts.verifyTimeoutSec, env);
  if (!deployConfirm.verified) {
    appendLog(
      "release-errors.log",
      `UNPUBLISHED commit ${currSha.slice(0, 7)}: ${deployConfirm.reason}`
    );
    console.log(`Announcement NOT published (${deployConfirm.reason}).`);
    return;
  }

  const nowIso = new Date().toISOString();
  const payload = {
    commit_sha: currSha,
    previous_commit_sha: prevSha || null,
    release_version: analysis.releaseVersion,
    title_ar: analysis.titleAr,
    summary_ar: analysis.summaryAr,
    categories: analysis.categories,
    highlights_count: analysis.highlightsCount,
    release_status: "published",
    deployment_target: "cloudflare",
    deployment_check_id: deployConfirm.checkId || null,
    deployment_url: deployConfirm.detailsUrl || null,
    deployed_at: nowIso,
    updated_at: nowIso,
  };

  const result = await publishReleaseToSupabase(supabaseUrl, serviceKey, payload);
  appendLog(
    "release-history.log",
    `PUBLISHED v${analysis.releaseVersion} (${currSha.slice(0, 7)}) — ${analysis.highlightsCount} highlights (dedup=${result.deduplicated}).`
  );
  console.log(`Published release v${analysis.releaseVersion} (${analysis.highlightsCount} updates) after Cloudflare verification.`);
}

main().catch((err) => {
  appendLog("release-errors.log", `Release automation error: ${err?.stack || err}`);
  console.error("Changelog automation encountered a handled error (deployment unaffected).");
  process.exit(0);
});

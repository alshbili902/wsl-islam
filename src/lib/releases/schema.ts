import type {
  PlatformRelease,
  ReleaseCategoryGroup,
  ReleaseCategoryId,
  ReleaseDeploymentStatus,
  ReleaseStatus,
  ReleaseVerificationStatus,
} from "@/types/islamic";

export interface ReleaseCategoryMeta {
  id: ReleaseCategoryId;
  labelAr: string;
  labelEn: string;
  badgeClass: string;
}

export const RELEASE_CATEGORY_META: Record<ReleaseCategoryId, ReleaseCategoryMeta> = {
  new_feature: {
    id: "new_feature",
    labelAr: "إضافات جديدة",
    labelEn: "New Features",
    badgeClass:
      "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  },
  improvement: {
    id: "improvement",
    labelAr: "تحسينات",
    labelEn: "Improvements",
    badgeClass:
      "bg-amber-500/12 text-amber-800 dark:text-amber-300 border-amber-500/30",
  },
  bug_fix: {
    id: "bug_fix",
    labelAr: "إصلاحات",
    labelEn: "Bug Fixes",
    badgeClass:
      "bg-sky-500/12 text-sky-700 dark:text-sky-300 border-sky-500/30",
  },
  performance: {
    id: "performance",
    labelAr: "تحسينات الأداء",
    labelEn: "Performance",
    badgeClass:
      "bg-teal-500/12 text-teal-700 dark:text-teal-300 border-teal-500/30",
  },
  security: {
    id: "security",
    labelAr: "تحسينات الأمان",
    labelEn: "Security",
    badgeClass:
      "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  },
  // Legacy aliases map gracefully into "improvement" when rendering historical rows
  ui_ux: {
    id: "improvement",
    labelAr: "تحسينات",
    labelEn: "Improvements",
    badgeClass:
      "bg-amber-500/12 text-amber-800 dark:text-amber-300 border-amber-500/30",
  },
  content: {
    id: "improvement",
    labelAr: "تحسينات",
    labelEn: "Improvements",
    badgeClass:
      "bg-amber-500/12 text-amber-800 dark:text-amber-300 border-amber-500/30",
  },
  maintenance: {
    id: "maintenance",
    labelAr: "صيانة داخلية",
    labelEn: "Internal Maintenance",
    badgeClass:
      "bg-neutral-500/10 text-neutral-600 dark:text-neutral-300 border-neutral-500/25",
  },
};

export const PUBLIC_RELEASE_CATEGORIES: ReleaseCategoryId[] = [
  "new_feature",
  "improvement",
  "bug_fix",
  "performance",
  "security",
];

export const VALID_RELEASE_CATEGORIES = new Set<ReleaseCategoryId>(
  Object.keys(RELEASE_CATEGORY_META) as ReleaseCategoryId[]
);

const SENSITIVE_PATTERNS: RegExp[] = [
  /postgres(ql)?:\/\/[^\s]+/gi,
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
  /(SUPABASE_SERVICE_ROLE_KEY|VAPID_PRIVATE_KEY|PUSH_CRON_SECRET|RELEASE_WEBHOOK_SECRET|CLOUDFLARE_API_TOKEN|GITHUB_TOKEN|DATABASE_URL|API_KEY|SECRET|TOKEN|PASSWORD)\s*[:=]\s*\S+/gi,
  /[A-Za-z]:\\Users\\[^\s"'`]+/gi,
  /\/Users\/[^\s"'`]+/gi,
  /\/home\/[^\s"'`]+/gi,
  /\b(src|supabase|scripts|\.github)\/[A-Za-z0-9_./-]+\.(tsx?|jsx?|mjs|cjs|sql|json|ps1|ya?ml)\b/gi,
  /<script[\s\S]*?<\/script>/gi,
  /<[^>]+>/g,
];

/**
 * Strips any accidental code paths, environment variables, tokens, or HTML tags
 * before storing or rendering release copy for public visitors.
 */
export function sanitizeReleaseText(input: unknown, maxLength = 360): string {
  if (typeof input !== "string") return "";
  let cleaned = input.replace(/[\u0000-\u001F\u007F]/g, " ").trim();
  for (const pattern of SENSITIVE_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength - 1).trim() + "…";
  }
  return cleaned;
}

function canonicalizeCategory(catId: ReleaseCategoryId): ReleaseCategoryId {
  if (catId === "ui_ux" || catId === "content") return "improvement";
  return catId;
}

export function normalizeReleaseRow(raw: unknown): PlatformRelease | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;

  const id = typeof row.id === "string" ? row.id.trim() : "";
  const commitSha =
    typeof row.commit_sha === "string"
      ? row.commit_sha.trim()
      : typeof row.commitSha === "string"
        ? row.commitSha.trim()
        : "";
  const releaseVersion = sanitizeReleaseText(
    row.release_version ?? row.releaseVersion ?? row.version ?? "",
    32
  );
  const titleAr = sanitizeReleaseText(
    row.title_ar ?? row.titleAr ?? row.title ?? "",
    160
  );
  const summaryAr = sanitizeReleaseText(
    row.summary_ar ?? row.summaryAr ?? row.summary ?? "",
    420
  );

  if (!id || !commitSha || !releaseVersion || !titleAr || !summaryAr) {
    return null;
  }

  const statusRaw = String(
    row.release_status ?? row.releaseStatus ?? ""
  ) as ReleaseStatus;

  // Enforce strict published + verified gating whenever verification fields exist
  const hasIsPublishedField =
    "is_published" in row || "isPublished" in row;
  const isPublished = hasIsPublishedField
    ? Boolean(row.is_published ?? row.isPublished)
    : statusRaw === "published";

  const hasVerificationField =
    "verification_status" in row || "verificationStatus" in row;
  const verificationStatus = (
    hasVerificationField
      ? String(row.verification_status ?? row.verificationStatus ?? "pending")
      : statusRaw === "published"
        ? "verified"
        : "pending"
  ) as ReleaseVerificationStatus;

  if (!isPublished || verificationStatus !== "verified" || statusRaw !== "published") {
    return null;
  }

  const deploymentStatus = String(
    row.deployment_status ?? row.deploymentStatus ?? "deployed"
  ) as ReleaseDeploymentStatus;

  const rawCategories = Array.isArray(row.categories) ? row.categories : [];
  const mergedBuckets = new Map<ReleaseCategoryId, Set<string>>();

  for (const catEntry of rawCategories) {
    if (!catEntry || typeof catEntry !== "object") continue;
    const catObj = catEntry as Record<string, unknown>;
    const rawCatId = String(catObj.category || "") as ReleaseCategoryId;
    if (!VALID_RELEASE_CATEGORIES.has(rawCatId)) continue;
    const catId = canonicalizeCategory(rawCatId);
    if (catId === "maintenance") continue;

    const itemsRaw = Array.isArray(catObj.items) ? catObj.items : [];
    if (!mergedBuckets.has(catId)) {
      mergedBuckets.set(catId, new Set());
    }
    const bucket = mergedBuckets.get(catId)!;
    for (const rawItem of itemsRaw) {
      const sanitized = sanitizeReleaseText(rawItem, 220);
      if (sanitized.length >= 4 && bucket.size < 6) {
        bucket.add(sanitized);
      }
    }
  }

  const categories: ReleaseCategoryGroup[] = [];
  for (const catId of PUBLIC_RELEASE_CATEGORIES) {
    const itemsSet = mergedBuckets.get(catId);
    if (!itemsSet || itemsSet.size === 0) continue;
    const meta = RELEASE_CATEGORY_META[catId];
    categories.push({
      category: catId,
      labelAr: meta.labelAr,
      labelEn: meta.labelEn,
      items: Array.from(itemsSet),
    });
  }

  if (categories.length === 0) {
    return null;
  }

  const rawNotes = Array.isArray(row.release_notes)
    ? row.release_notes
    : Array.isArray(row.releaseNotes)
      ? row.releaseNotes
      : [];
  const parsedNotes = rawNotes
    .map((n) => sanitizeReleaseText(n, 220))
    .filter((n) => n.length >= 4);
  const releaseNotes =
    parsedNotes.length > 0
      ? parsedNotes
      : categories.flatMap((g) => g.items).slice(0, 12);

  const publishedAt =
    typeof row.published_at === "string" && row.published_at
      ? row.published_at
      : typeof row.publishedAt === "string" && row.publishedAt
        ? row.publishedAt
        : typeof row.deployed_at === "string" && row.deployed_at
          ? row.deployed_at
          : typeof row.deployedAt === "string" && row.deployedAt
            ? row.deployedAt
            : "";
  if (!publishedAt || Number.isNaN(Date.parse(publishedAt))) {
    return null;
  }

  return {
    id,
    commitSha,
    previousCommitSha:
      typeof row.previous_commit_sha === "string"
        ? row.previous_commit_sha
        : null,
    releaseVersion,
    titleAr,
    summaryAr,
    releaseNotes,
    categories,
    highlightsCount: categories.reduce((sum, g) => sum + g.items.length, 0),
    releaseStatus: "published",
    verificationStatus: "verified",
    deploymentStatus,
    deploymentId:
      typeof row.deployment_id === "string"
        ? row.deployment_id
        : typeof row.deployment_check_id === "string"
          ? row.deployment_check_id
          : null,
    isPublished: true,
    publishedAt,
    deployedAt: publishedAt,
  };
}

/**
 * Merges multiple unseen releases chronologically into one clear visitor summary
 * so returning visitors never suffer stacked popup modals.
 */
export function buildAggregatedReleaseSummary(releases: PlatformRelease[]): {
  isAggregated: boolean;
  releaseCount: number;
  versionLabel: string;
  titleAr: string;
  summaryAr: string;
  deployedAt: string;
  publishedAt: string;
  categories: ReleaseCategoryGroup[];
} {
  if (releases.length === 1) {
    const single = releases[0];
    return {
      isAggregated: false,
      releaseCount: 1,
      versionLabel: single.releaseVersion,
      titleAr: single.titleAr,
      summaryAr: single.summaryAr,
      deployedAt: single.deployedAt,
      publishedAt: single.publishedAt,
      categories: single.categories,
    };
  }

  const sortedNewestFirst = [...releases].sort(
    (a, b) => Date.parse(b.publishedAt || b.deployedAt) - Date.parse(a.publishedAt || a.deployedAt)
  );
  const newest = sortedNewestFirst[0];
  const oldest = sortedNewestFirst[sortedNewestFirst.length - 1];

  const grouped = new Map<ReleaseCategoryId, Set<string>>();
  for (const rel of sortedNewestFirst) {
    for (const cat of rel.categories) {
      const catId = canonicalizeCategory(cat.category);
      if (catId === "maintenance") continue;
      if (!grouped.has(catId)) {
        grouped.set(catId, new Set());
      }
      const bucket = grouped.get(catId)!;
      for (const item of cat.items) {
        if (bucket.size < 6) {
          bucket.add(item);
        }
      }
    }
  }

  const mergedCategories: ReleaseCategoryGroup[] = [];
  for (const catId of PUBLIC_RELEASE_CATEGORIES) {
    const itemsSet = grouped.get(catId);
    if (!itemsSet || itemsSet.size === 0) continue;
    const meta = RELEASE_CATEGORY_META[catId];
    mergedCategories.push({
      category: catId,
      labelAr: meta.labelAr,
      labelEn: meta.labelEn,
      items: Array.from(itemsSet),
    });
  }

  return {
    isAggregated: true,
    releaseCount: releases.length,
    versionLabel: `${oldest.releaseVersion} ← ${newest.releaseVersion}`,
    titleAr: `ملخص ${releases.length} تحديثات جديدة في وصل الإسلامية`,
    summaryAr: `تم نشر ${releases.length} إصدارات موثقة منذ زيارتك الأخيرة، شملت تحسينات وإضافات متنوعة لخدمتك وتيسير تصفحك للمنصة.`,
    deployedAt: newest.deployedAt,
    publishedAt: newest.publishedAt,
    categories: mergedCategories,
  };
}

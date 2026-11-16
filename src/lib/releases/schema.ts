import type {
  PlatformRelease,
  ReleaseCategoryGroup,
  ReleaseCategoryId,
  ReleaseStatus,
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
    labelAr: "ميزات جديدة",
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
    labelAr: "إصلاح أخطاء",
    labelEn: "Bug Fixes",
    badgeClass:
      "bg-sky-500/12 text-sky-700 dark:text-sky-300 border-sky-500/30",
  },
  performance: {
    id: "performance",
    labelAr: "تحسين الأداء",
    labelEn: "Performance",
    badgeClass:
      "bg-teal-500/12 text-teal-700 dark:text-teal-300 border-teal-500/30",
  },
  security: {
    id: "security",
    labelAr: "تحديثات الأمان",
    labelEn: "Security",
    badgeClass:
      "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  },
  ui_ux: {
    id: "ui_ux",
    labelAr: "تحسينات الواجهة والتجربة",
    labelEn: "UI / UX Changes",
    badgeClass:
      "bg-purple-500/12 text-purple-700 dark:text-purple-300 border-purple-500/30",
  },
  content: {
    id: "content",
    labelAr: "تحديثات المحتوى",
    labelEn: "Content Updates",
    badgeClass:
      "bg-amber-600/12 text-amber-800 dark:text-amber-200 border-amber-600/30",
  },
  maintenance: {
    id: "maintenance",
    labelAr: "صيانة داخلية",
    labelEn: "Internal Maintenance",
    badgeClass:
      "bg-neutral-500/10 text-neutral-600 dark:text-neutral-300 border-neutral-500/25",
  },
};

export const VALID_RELEASE_CATEGORIES = new Set<ReleaseCategoryId>(
  Object.keys(RELEASE_CATEGORY_META) as ReleaseCategoryId[]
);

const SENSITIVE_PATTERNS: RegExp[] = [
  /postgres(ql)?:\/\/[^\s]+/gi,
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
  /(SUPABASE_SERVICE_ROLE_KEY|VAPID_PRIVATE_KEY|PUSH_CRON_SECRET|DATABASE_URL|API_KEY|SECRET|TOKEN|PASSWORD)\s*[:=]\s*\S+/gi,
  /[A-Za-z]:\\Users\\[^\s"'`]+/gi,
  /\/Users\/[^\s"'`]+/gi,
  /\/home\/[^\s"'`]+/gi,
  /\b(src|supabase|scripts)\/[A-Za-z0-9_./-]+\.(tsx?|jsx?|mjs|cjs|sql|json|ps1)\b/gi,
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
    row.release_version ?? row.releaseVersion ?? "",
    32
  );
  const titleAr = sanitizeReleaseText(row.title_ar ?? row.titleAr ?? "", 160);
  const summaryAr = sanitizeReleaseText(
    row.summary_ar ?? row.summaryAr ?? "",
    420
  );
  const statusRaw = String(
    row.release_status ?? row.releaseStatus ?? ""
  ) as ReleaseStatus;

  if (!id || !commitSha || !releaseVersion || !titleAr || !summaryAr) {
    return null;
  }
  if (statusRaw !== "published") {
    return null;
  }

  const rawCategories = Array.isArray(row.categories) ? row.categories : [];
  const categories: ReleaseCategoryGroup[] = [];

  for (const catEntry of rawCategories) {
    if (!catEntry || typeof catEntry !== "object") continue;
    const catObj = catEntry as Record<string, unknown>;
    const catId = String(catObj.category || "") as ReleaseCategoryId;
    if (!VALID_RELEASE_CATEGORIES.has(catId)) continue;
    // Never expose internal-only maintenance entries in public visitor cards
    if (catId === "maintenance") continue;

    const meta = RELEASE_CATEGORY_META[catId];
    const itemsRaw = Array.isArray(catObj.items) ? catObj.items : [];
    const items = Array.from(
      new Set(
        itemsRaw
          .map((item) => sanitizeReleaseText(item, 220))
          .filter((text) => text.length >= 4)
      )
    ).slice(0, 6);

    if (items.length > 0) {
      categories.push({
        category: catId,
        labelAr: meta.labelAr,
        labelEn: meta.labelEn,
        items,
      });
    }
  }

  if (categories.length === 0) {
    return null;
  }

  const deployedAt =
    typeof row.deployed_at === "string" && row.deployed_at
      ? row.deployed_at
      : typeof row.deployedAt === "string" && row.deployedAt
        ? row.deployedAt
        : "";
  if (!deployedAt || Number.isNaN(Date.parse(deployedAt))) {
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
    categories,
    highlightsCount: categories.reduce((sum, g) => sum + g.items.length, 0),
    releaseStatus: "published",
    deployedAt,
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
      categories: single.categories,
    };
  }

  const sortedNewestFirst = [...releases].sort(
    (a, b) => Date.parse(b.deployedAt) - Date.parse(a.deployedAt)
  );
  const newest = sortedNewestFirst[0];
  const oldest = sortedNewestFirst[sortedNewestFirst.length - 1];

  const grouped = new Map<ReleaseCategoryId, Set<string>>();
  for (const rel of sortedNewestFirst) {
    for (const cat of rel.categories) {
      if (cat.category === "maintenance") continue;
      if (!grouped.has(cat.category)) {
        grouped.set(cat.category, new Set());
      }
      const bucket = grouped.get(cat.category)!;
      for (const item of cat.items) {
        if (bucket.size < 6) {
          bucket.add(item);
        }
      }
    }
  }

  const orderedIds: ReleaseCategoryId[] = [
    "new_feature",
    "improvement",
    "content",
    "ui_ux",
    "performance",
    "bug_fix",
    "security",
  ];

  const mergedCategories: ReleaseCategoryGroup[] = [];
  for (const catId of orderedIds) {
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
    summaryAr: `تم نشر ${releases.length} إصدارات جديدة منذ زيارتك الأخيرة، شملت تحسينات وميزات متنوعة لخدمتك وتيسير تصفحك للمنصة.`,
    deployedAt: newest.deployedAt,
    categories: mergedCategories,
  };
}

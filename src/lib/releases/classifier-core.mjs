// Pure ESM zero-dependency intelligent Git diff analyzer & Arabic changelog classifier.
// Shared identically by the D7 release automation script and Next.js verification tests.

export const CATEGORY_DEFINITIONS = {
  new_feature: { category: "new_feature", labelAr: "ميزات جديدة", labelEn: "New Features" },
  improvement: { category: "improvement", labelAr: "تحسينات", labelEn: "Improvements" },
  bug_fix: { category: "bug_fix", labelAr: "إصلاح أخطاء", labelEn: "Bug Fixes" },
  performance: { category: "performance", labelAr: "تحسين الأداء", labelEn: "Performance" },
  security: { category: "security", labelAr: "تحديثات الأمان", labelEn: "Security" },
  ui_ux: { category: "ui_ux", labelAr: "تحسينات الواجهة والتجربة", labelEn: "UI / UX Changes" },
  content: { category: "content", labelAr: "تحديثات المحتوى", labelEn: "Content Updates" },
  maintenance: { category: "maintenance", labelAr: "صيانة داخلية", labelEn: "Internal Maintenance" },
};

const SENSITIVE_SCRUB_PATTERNS = [
  /postgres(ql)?:\/\/[^\s"'`]+/gi,
  /eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}(\.[A-Za-z0-9_-]+)?/g,
  /(SUPABASE_SERVICE_ROLE_KEY|VAPID_PRIVATE_KEY|PUSH_CRON_SECRET|DATABASE_URL|API_KEY|SECRET|TOKEN|PASSWORD)\s*[:=]\s*\S+/gi,
  /[A-Za-z]:\\Users\\[^\s"'`]+/gi,
  /\/(Users|home)\/[^\s"'`]+/gi,
  /\b(src|supabase|scripts)\/[A-Za-z0-9_./-]+\.(tsx?|jsx?|mjs|cjs|sql|json|ps1)\b/gi,
  /<script[\s\S]*?<\/script>/gi,
  /<[^>]+>/g,
];

export function sanitizePublicArabicText(text, maxLength = 240) {
  if (typeof text !== "string") return "";
  let out = text.replace(/[\u0000-\u001F\u007F]/g, " ").trim();
  for (const regex of SENSITIVE_SCRUB_PATTERNS) {
    out = out.replace(regex, "");
  }
  out = out.replace(/\s+/g, " ").trim();
  if (out.length > maxLength) {
    out = `${out.slice(0, maxLength - 1).trim()}…`;
  }
  return out;
}

const IGNORED_PATH_PATTERNS = [
  /(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml)$/i,
  /\.tsbuildinfo$/i,
  /^next-env\.d\.ts$/i,
  /^\.next\//i,
  /^\.gitignore$/i,
  /^\.env/i,
  /^\.release-logs\//i,
  /^\.release-pending\.json$/i,
  /^AGENTS\.md$/i,
  /^README\.md$/i,
  /^eslint\.config\./i,
  /^tsconfig\.json$/i,
  /^postcss\.config\./i,
  /^scripts\//i,
  /^supabase\//i,
  /^\.github\//i,
  /^src\/types\//i,
];

function isInternalMaintenancePath(filePath) {
  const norm = filePath.replace(/\\/g, "/");
  if (IGNORED_PATH_PATTERNS.some((re) => re.test(norm))) return true;
  if (/^package\.json$/i.test(norm)) return true;
  if (/^src\/lib\/(supabase|releases\/store|releases\/classifier-core)/i.test(norm)) {
    return true;
  }
  return false;
}

function isTrivialFormattingOrCommentDiff(diffText) {
  if (!diffText || !diffText.trim()) return true;
  const lines = diffText.split(/\r?\n/);
  const added = [];
  const removed = [];

  for (const line of lines) {
    if (
      line.startsWith("+++") ||
      line.startsWith("---") ||
      line.startsWith("@@") ||
      line.startsWith("diff --git") ||
      line.startsWith("index ")
    ) {
      continue;
    }
    const clean = line
      .slice(1)
      .replace(/\/\/.*$/g, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\s+/g, "");
    if (!clean) continue;
    if (line.startsWith("+")) added.push(clean);
    else if (line.startsWith("-")) removed.push(clean);
  }

  if (added.length === 0 && removed.length === 0) return true;
  if (added.length === removed.length && added.join("\n") === removed.join("\n")) {
    return true;
  }
  return false;
}

const DOMAIN_CATALOG = [
  {
    id: "updates",
    match: /(updates|ReleaseAnnouncement|releases)/i,
    labelAr: "سجل التحديثات وإعلانات المنصة",
    featureDescAr: "إضافة نافذة إعلانات التحديثات الذكية وصفحة سجل الإصدارات لعرض كل جديد للزوار تلقائياً.",
  },
  {
    id: "listen",
    match: /(listen|reciter|AudioProvider|PersistentAudioBar|audio\/(catalog|normalize))/i,
    labelAr: "مركز الاستماع والمشغّل الصوتي",
    featureDescAr: "تطوير مركز الاستماع الشامل وتوسيع فهرس القراء والروايات والمشغّل الصوتي المستمر.",
  },
  {
    id: "mushaf",
    match: /(mushaf|quran)/i,
    labelAr: "القرآن الكريم والمصحف الرقمي",
    featureDescAr: "تطوير تجربة تصفح القرآن الكريم والمصحف الشريف وتلاوة السور.",
  },
  {
    id: "tafsir",
    match: /tafsir/i,
    labelAr: "موسوعة التفسير والتدبر",
    featureDescAr: "توسيع أدوات موسوعة التفسير والتدبر وعرض معاني الآيات.",
  },
  {
    id: "khatmah",
    match: /khatmah/i,
    labelAr: "مخطط ختمة القرآن",
    featureDescAr: "تحديث أدوات مخطط الختمة اليومية ومتابعة الورد القرآني.",
  },
  {
    id: "lectures",
    match: /lecture/i,
    labelAr: "مكتبة المحاضرات والدروس",
    featureDescAr: "تطوير وتوسيع تصنيفات ومكتبة المحاضرات والدروس الإسلامية الموثقة.",
  },
  {
    id: "adhkar",
    match: /(adhkar|dua)/i,
    labelAr: "الأذكار والأدعية اليومية",
    featureDescAr: "تطوير عرض الأذكار والأدعية المأثورة وتجربة القراءة والتسبيح.",
  },
  {
    id: "hadith",
    match: /hadith/i,
    labelAr: "مكتبة الحديث الشريف",
    featureDescAr: "تحديث عرض وبحث الأحاديث النبوية الموثقة وتخريجها.",
  },
  {
    id: "prayer",
    match: /(prayer|adhan|calendar|ramadan)/i,
    labelAr: "مواقيت الصلاة والتقويم والمواسم",
    featureDescAr: "تحسين دقة عرض مواقيت الصلاة والتقويم الهجري والمواسم الدينية.",
  },
  {
    id: "notifications",
    match: /(notification|push)/i,
    labelAr: "التنبيهات والتذكيرات الذكية",
    featureDescAr: "تحسين منظومة التذكيرات الذكية وتنبيهات الأذكار والصلاة.",
  },
  {
    id: "share",
    match: /(share|WaslShare|ShareCard)/i,
    labelAr: "مشاركة المحتوى كصورة ونص",
    featureDescAr: "تطوير نظام بطاقات المشاركة البصرية والنصية للمحتوى الإسلامي.",
  },
  {
    id: "reading",
    match: /(reading-settings|ReadingPreferences)/i,
    labelAr: "إعدادات القراءة والخطوط",
    featureDescAr: "تحسين تخصيص الخطوط والأحجام وأنماط الورق للقراءة المريحة.",
  },
  {
    id: "zakat",
    match: /zakat/i,
    labelAr: "حاسبة الزكاة والصدقات",
    featureDescAr: "تحديث وتبسيط حساب الزكاة والأبواب المرافقة لها.",
  },
  {
    id: "quiz",
    match: /quiz/i,
    labelAr: "المسابقة الإسلامية التفاعلية",
    featureDescAr: "تحديث أسئلة وتجربة المسابقة الإسلامية المعرفية.",
  },
  {
    id: "knowledge",
    match: /(knowledge|articles|resources|glossary|names-of-allah)/i,
    labelAr: "المعرفة الإسلامية والمصادر",
    featureDescAr: "توسيع المقالات المعرفية وأسماء الله الحسنى والمصادر الموثقة.",
  },
  {
    id: "radio",
    match: /radio/i,
    labelAr: "الإذاعات الإسلامية المباشرة",
    featureDescAr: "تحسين بث واستقرار الإذاعات القرآنية والإسلامية المباشرة.",
  },
  {
    id: "navigation",
    match: /(Header|Footer|GlobalSearchModal|dictionary|layout\.tsx)/i,
    labelAr: "التنقل والبحث العام",
    featureDescAr: "تسهيل التنقل والوصول السريع بين أقسام المنصة عبر القوائم والبحث الموحد.",
  },
  {
    id: "branding",
    match: /(brand|WaslLogo|IslamicVisuals|globals\.css|public\/branding)/i,
    labelAr: "الهوية البصرية والمظهر",
    featureDescAr: "تحسينات على الهوية البصرية والألوان الإسلامية وتناسق العرض.",
  },
];

function detectDomain(filePath, diffText) {
  const norm = filePath.replace(/\\/g, "/");
  for (const dom of DOMAIN_CATALOG) {
    if (dom.match.test(norm)) return dom;
  }
  for (const dom of DOMAIN_CATALOG) {
    if (diffText && dom.match.test(diffText)) return dom;
  }
  return {
    id: "platform",
    labelAr: "منصة وصل الإسلامية",
    featureDescAr: "تطوير وتحديث تجربة الاستخدام في منصة وصل الإسلامية.",
  };
}

function extractReadableArabicTitle(diffText, sourceSnippet = "") {
  const combined = `${diffText}\n${sourceSnippet}`;
  // Look for Arabic metadata title or h1/h2 JSX prose cleanly without code tokens
  const matches = [
    ...combined.matchAll(/title\s*:\s*["'`]([^"'`\n]{6,90})["'`]/g),
    ...combined.matchAll(/<h1[^>]*>\s*([^<>{}\n]{5,90})\s*<\/h1>/g),
    ...combined.matchAll(/nameAr\s*:\s*["'`]([^"'`\n]{4,70})["'`]/g),
  ];

  for (const m of matches) {
    const raw = (m[1] || "").split("—")[0].split("|")[0].trim();
    if (/[\u0600-\u06FF]/.test(raw) && !/[{}=$<>\\/]/.test(raw)) {
      return sanitizePublicArabicText(raw, 80);
    }
  }
  return null;
}

function collectAddedRemovedLines(diffText) {
  const added = [];
  const removed = [];
  for (const line of (diffText || "").split(/\r?\n/)) {
    if (
      line.startsWith("+++") ||
      line.startsWith("---") ||
      line.startsWith("@@")
    ) {
      continue;
    }
    if (line.startsWith("+")) added.push(line.slice(1));
    else if (line.startsWith("-")) removed.push(line.slice(1));
  }
  return { addedText: added.join("\n"), removedText: removed.join("\n") };
}

function classifySingleChange(file) {
  const normPath = file.path.replace(/\\/g, "/");
  const status = (file.status || "M").toUpperCase();

  if (isInternalMaintenancePath(normPath) || isTrivialFormattingOrCommentDiff(file.diff)) {
    return {
      category: "maintenance",
      domainId: "internal",
      bulletAr: null,
    };
  }

  const domain = detectDomain(normPath, file.diff);
  const { addedText, removedText } = collectAddedRemovedLines(file.diff);
  const addedLower = addedText.toLowerCase();
  const isNewPage = /^src\/app\/.*\/page\.tsx$/i.test(normPath) && status === "A";
  const isNewComponent = /^src\/components\/.*\.tsx$/i.test(normPath) && status === "A";
  const isNewApi = /^src\/app\/api\/.*\/route\.ts$/i.test(normPath) && status === "A";
  const isDataFile = /^src\/data\//i.test(normPath) || /dictionary\.ts$/i.test(normPath);
  const isCssOrVisual = /(globals\.css|Header|Footer|Modal|Visuals|Logo|public\/)/i.test(normPath);

  const arabicTitle = extractReadableArabicTitle(addedText, file.sourceSnippet || "");

  // 1. Security hardening checks (always generalized safely, never leaking internals)
  if (
    /(sanitize|escapeHtml|RLS|ROW LEVEL SECURITY|Content-Security-Policy|X-Content-Type-Options|validate[A-Z]|rejectUnauthorized|SAFE_PROTOCOLS)/i.test(
      addedText
    )
  ) {
    return {
      category: "security",
      domainId: domain.id,
      bulletAr: `تعزيز موثوقية وحماية البيانات وسلامة العرض في ${domain.labelAr}.`,
    };
  }

  // 2. Genuine New Features
  if (isNewPage || isNewApi || (isNewComponent && addedText.length > 400)) {
    const bullet = arabicTitle
      ? `إضافة ${arabicTitle} ضمن ${domain.labelAr} لتوسيع الخدمات المتاحة للزوار.`
      : domain.featureDescAr;
    return {
      category: "new_feature",
      domainId: domain.id,
      bulletAr: bullet,
    };
  }

  // 3. Bug Fixes (real fix patterns, error handling, null guards, corrected routes/fields)
  const hasFixSignal =
    /(catch\s*\(|if\s*\(!|Array\.isArray|Number\.isFinite|\?\?|\?\.)/.test(addedText) &&
    removedText.length > 0 &&
    /(error|fail|fallback|status\s*:\s*4\d\d|return null|unavailable|missing|fix)/i.test(
      addedLower
    );
  const hasDirectCorrection =
    removedText.trim().length > 0 &&
    addedText.trim().length > 0 &&
    /(href=|url|src=|surah|ayah|notFound|404|errorMessage)/i.test(addedText) &&
    addedText.split("\n").length <= 35;

  if (hasFixSignal || (hasDirectCorrection && !isNewComponent && !isDataFile)) {
    return {
      category: "bug_fix",
      domainId: domain.id,
      bulletAr: `معالجة مشكلات في العرض والاستجابة وضمان استقرار العمل في ${domain.labelAr}.`,
    };
  }

  // 4. Performance improvements
  if (
    /(useMemo|useCallback|revalidate\s*=|CACHE_TTL|Cache-Control|loading="lazy"|PAGE_SIZE|slice\(0,\s*visibleCount\)|dynamic\()/i.test(
      addedText
    ) &&
    !/useMemo|useCallback|revalidate/.test(removedText)
  ) {
    return {
      category: "performance",
      domainId: domain.id,
      bulletAr: `تحسين سرعة التحميل وكفاءة استرجاع وعرض المحتوى في ${domain.labelAr}.`,
    };
  }

  // 5. Content Updates
  if (isDataFile || /public\/(data|branding)/i.test(normPath)) {
    return {
      category: "content",
      domainId: domain.id,
      bulletAr: `تحديث وإثراء المحتوى والبيانات الموثقة في ${domain.labelAr}.`,
    };
  }

  // 6. UI / UX improvements
  if (
    isCssOrVisual ||
    /(aria-|role=|reducedMotion|animate|transition-|sm:|md:|lg:|grid-cols|rounded-)/i.test(
      addedText
    )
  ) {
    return {
      category: "ui_ux",
      domainId: domain.id,
      bulletAr: `تحسين تصميم الواجهة وتجربة التصفح على الجوال وسطح المكتب في ${domain.labelAr}.`,
    };
  }

  // 7. Feature / Functional Improvements on existing user-facing code
  if (/^src\/(app|components)\//i.test(normPath) || /^src\/lib\/(audio|prayer|quran|tafsir|api|khatmah|share)/i.test(normPath)) {
    return {
      category: "improvement",
      domainId: domain.id,
      bulletAr: `تطوير وتحسين خصائص التصفح والتفاعل في ${domain.labelAr}.`,
    };
  }

  return {
    category: "maintenance",
    domainId: "internal",
    bulletAr: null,
  };
}

export function bumpSemanticVersion(previousVersion, categories) {
  const clean = String(previousVersion || "1.0.0").replace(/[^0-9.]/g, "");
  const parts = clean.split(".").map((n) => Number.parseInt(n, 10));
  let major = Number.isFinite(parts[0]) ? parts[0] : 1;
  let minor = Number.isFinite(parts[1]) ? parts[1] : 0;
  let patch = Number.isFinite(parts[2]) ? parts[2] : 0;

  if (major === 0 && minor <= 1) {
    // Move baseline from initial scaffold 0.1.0 cleanly to 1.0.0+ releases
    major = 1;
    minor = 0;
    patch = 0;
  }

  const catIds = new Set(categories.map((c) => c.category));
  if (catIds.has("new_feature")) {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }
  return `${major}.${minor}.${patch}`;
}

/**
 * Analyzes an entire Git commit diff set into a validated, sanitized release payload.
 * Returns `meaningful: false` when only internal maintenance/formatting/lockfiles changed.
 */
export function analyzeGitChanges({ files = [], previousVersion = "1.0.0" }) {
  const buckets = new Map();

  for (const file of files) {
    if (!file || typeof file.path !== "string") continue;
    const result = classifySingleChange(file);
    if (!result.bulletAr || result.category === "maintenance") {
      continue;
    }

    const sanitizedBullet = sanitizePublicArabicText(result.bulletAr, 220);
    if (!sanitizedBullet) continue;

    if (!buckets.has(result.category)) {
      buckets.set(result.category, new Set());
    }
    const set = buckets.get(result.category);
    if (set.size < 5) {
      set.add(sanitizedBullet);
    }
  }

  const orderedCategories = [
    "new_feature",
    "improvement",
    "content",
    "ui_ux",
    "performance",
    "bug_fix",
    "security",
  ];

  const categories = [];
  for (const catId of orderedCategories) {
    const set = buckets.get(catId);
    if (!set || set.size === 0) continue;
    const def = CATEGORY_DEFINITIONS[catId];
    categories.push({
      category: def.category,
      labelAr: def.labelAr,
      labelEn: def.labelEn,
      items: Array.from(set),
    });
  }

  if (categories.length === 0) {
    return {
      meaningful: false,
      releaseVersion: previousVersion,
      titleAr: "",
      summaryAr: "",
      categories: [],
      highlightsCount: 0,
    };
  }

  const releaseVersion = bumpSemanticVersion(previousVersion, categories);
  const hasNewFeature = categories.some((c) => c.category === "new_feature");
  const hasBugFix = categories.some((c) => c.category === "bug_fix");
  const hasContent = categories.some((c) => c.category === "content");

  let titleAr = `تحديث وتحسينات جديدة في وصل الإسلامية (الإصدار ${releaseVersion})`;
  if (hasNewFeature) {
    titleAr = `ميزات وتحديثات جديدة في وصل الإسلامية (${releaseVersion})`;
  } else if (hasBugFix && categories.length === 1) {
    titleAr = `تحديث الاستقرار وإصلاح الأخطاء (${releaseVersion})`;
  } else if (hasContent && categories.length === 1) {
    titleAr = `تحديث المحتوى العلمي في وصل الإسلامية (${releaseVersion})`;
  }

  const sectionSummaryNames = categories.map((c) => c.labelAr).join("، ");
  const summaryAr = sanitizePublicArabicText(
    `تم إطلاق الإصدار ${releaseVersion} بنجاح، وتضمّن ${sectionSummaryNames} لتقديم تجربة إسلامية رقمية أكثر دقة وسلاسة للزوار.`,
    320
  );

  return {
    meaningful: true,
    releaseVersion,
    titleAr: sanitizePublicArabicText(titleAr, 150),
    summaryAr,
    categories,
    highlightsCount: categories.reduce((sum, c) => sum + c.items.length, 0),
  };
}

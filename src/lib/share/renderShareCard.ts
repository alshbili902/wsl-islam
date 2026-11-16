import QRCode from "qrcode";
import {
  buildCanonicalShareUrl,
  getDisplayDomain,
  KIND_LABELS,
} from "@/lib/share/formatShareText";
import type { Locale, ShareCardPayload, ShareContentKind } from "@/types/islamic";

export type ShareTemplateId =
  | "classic-emerald"
  | "ivory-emerald"
  | "dark-emerald"
  | "minimal-arabic"
  | "geometric-islamic";

export type ShareAppearance = "light" | "dark" | "night";
export type ShareAspectRatio = "square" | "story" | "portrait";

export type ShareContentArchitecture =
  | "quran"
  | "hadith"
  | "dua"
  | "adhkar"
  | "allah_name"
  | "editorial";

export interface ShareTemplateMeta {
  id: ShareTemplateId;
  nameAr: string;
  nameEn: string;
  isDarkSurface: boolean;
  bgStart: string;
  bgMid: string;
  bgEnd: string;
  textColor: string;
  subtextColor: string;
  accentColor: string;
  accentSoft: string;
  borderColor: string;
  badgeBg: string;
  qrColor: string;
  qrBg: string;
  patternOpacity: number;
  showCornerOrnaments: boolean;
  showInnerFrame: boolean;
  swatchGradient: string;
}

export const SHARE_TEMPLATES: Record<ShareTemplateId, ShareTemplateMeta> = {
  "classic-emerald": {
    id: "classic-emerald",
    nameAr: "زمردي وذهبي",
    nameEn: "Classic Emerald",
    isDarkSurface: true,
    bgStart: "#0c523b",
    bgMid: "#083a2a",
    bgEnd: "#052319",
    textColor: "#faf7f0",
    subtextColor: "#d5e7de",
    accentColor: "#e5c16c",
    accentSoft: "rgba(229, 193, 108, 0.16)",
    borderColor: "rgba(229, 193, 108, 0.42)",
    badgeBg: "rgba(255, 255, 255, 0.07)",
    qrColor: "#073325",
    qrBg: "#faf7f0",
    patternOpacity: 0.06,
    showCornerOrnaments: false,
    showInnerFrame: true,
    swatchGradient: "linear-gradient(135deg, #0c523b, #052319)",
  },
  "ivory-emerald": {
    id: "ivory-emerald",
    nameAr: "عاجي نقي",
    nameEn: "Clean Ivory",
    isDarkSurface: false,
    bgStart: "#fdfaf3",
    bgMid: "#faf5e9",
    bgEnd: "#f2ead7",
    textColor: "#13231d",
    subtextColor: "#465b52",
    accentColor: "#0d5c43",
    accentSoft: "rgba(13, 92, 67, 0.09)",
    borderColor: "rgba(182, 135, 44, 0.38)",
    badgeBg: "rgba(13, 92, 67, 0.08)",
    qrColor: "#0d5c43",
    qrBg: "#ffffff",
    patternOpacity: 0.045,
    showCornerOrnaments: false,
    showInnerFrame: true,
    swatchGradient: "linear-gradient(135deg, #fdfaf3, #f2ead7)",
  },
  "dark-emerald": {
    id: "dark-emerald",
    nameAr: "ليلي فاخر",
    nameEn: "Premium Night",
    isDarkSurface: true,
    bgStart: "#051611",
    bgMid: "#092119",
    bgEnd: "#04120d",
    textColor: "#f3ecdc",
    subtextColor: "#a8c7b9",
    accentColor: "#ecc977",
    accentSoft: "rgba(236, 201, 119, 0.14)",
    borderColor: "rgba(236, 201, 119, 0.42)",
    badgeBg: "rgba(236, 201, 119, 0.09)",
    qrColor: "#051611",
    qrBg: "#f3ecdc",
    patternOpacity: 0.05,
    showCornerOrnaments: false,
    showInnerFrame: true,
    swatchGradient: "linear-gradient(135deg, #051611, #092119)",
  },
  "minimal-arabic": {
    id: "minimal-arabic",
    nameAr: "خط عربي هادئ",
    nameEn: "Minimal Type",
    isDarkSurface: false,
    bgStart: "#faf7f0",
    bgMid: "#faf7f0",
    bgEnd: "#f7f3e8",
    textColor: "#14261f",
    subtextColor: "#54685f",
    accentColor: "#9c701b",
    accentSoft: "rgba(182, 135, 44, 0.12)",
    borderColor: "rgba(19, 35, 29, 0.16)",
    badgeBg: "rgba(182, 135, 44, 0.09)",
    qrColor: "#14261f",
    qrBg: "#ffffff",
    patternOpacity: 0.015,
    showCornerOrnaments: false,
    showInnerFrame: false,
    swatchGradient: "linear-gradient(135deg, #faf7f0, #efe8d8)",
  },
  "geometric-islamic": {
    id: "geometric-islamic",
    nameAr: "زخرفة هندسية",
    nameEn: "Geometric Royal",
    isDarkSurface: true,
    bgStart: "#073427",
    bgMid: "#06261d",
    bgEnd: "#041812",
    textColor: "#faf6ea",
    subtextColor: "#bcd4c9",
    accentColor: "#e6c16e",
    accentSoft: "rgba(230, 193, 110, 0.16)",
    borderColor: "rgba(230, 193, 110, 0.52)",
    badgeBg: "rgba(230, 193, 110, 0.1)",
    qrColor: "#06261d",
    qrBg: "#faf6ea",
    patternOpacity: 0.09,
    showCornerOrnaments: true,
    showInnerFrame: true,
    swatchGradient: "linear-gradient(135deg, #073427, #041812)",
  },
};

export function resolveContentArchitecture(
  kind: ShareContentKind
): ShareContentArchitecture {
  if (kind === "verse" || kind === "tafsir") return "quran";
  if (kind === "hadith") return "hadith";
  if (kind === "dua") return "dua";
  if (kind === "adhkar" || kind === "dhikr" || kind === "tasbih") return "adhkar";
  if (kind === "allah_name") return "allah_name";
  return "editorial";
}

export const ARCHITECTURE_LABELS: Record<
  ShareContentArchitecture,
  { ar: string; en: string; defaultTemplate: ShareTemplateId }
> = {
  quran: {
    ar: "قالب الآيات والمصحف الشريف",
    en: "Quranic Mihrab Architecture",
    defaultTemplate: "classic-emerald",
  },
  hadith: {
    ar: "قالب الحديث الكلاسيكي الموثّق",
    en: "Classical Hadith Manuscript",
    defaultTemplate: "ivory-emerald",
  },
  dua: {
    ar: "قالب الدعاء الروحاني الهادئ",
    en: "Serene Supplication Style",
    defaultTemplate: "dark-emerald",
  },
  adhkar: {
    ar: "قالب الأذكار والتكرار الميسّر",
    en: "Minimal Adhkar Layout",
    defaultTemplate: "minimal-arabic",
  },
  allah_name: {
    ar: "القالب الملكي لأسماء الله الحسنى",
    en: "Royal Name Rosette",
    defaultTemplate: "geometric-islamic",
  },
  editorial: {
    ar: "القالب التحريري للمقالات والدروس",
    en: "Editorial Knowledge Layout",
    defaultTemplate: "ivory-emerald",
  },
};

/**
 * Adapts a chosen card template cleanly to any of the 3 appearance polarities
 * (light ivory, dark charcoal, or premium deep night emerald).
 */
export function resolveAppearancePalette(
  templateId: ShareTemplateId,
  appearance?: ShareAppearance
): ShareTemplateMeta {
  const base = SHARE_TEMPLATES[templateId];
  if (!appearance) return base;

  if (appearance === "light") {
    if (!base.isDarkSurface) return base;
    return {
      ...base,
      isDarkSurface: false,
      bgStart: "#fdfaf3",
      bgMid: "#f8f2e4",
      bgEnd: "#efe5cf",
      textColor: "#13231d",
      subtextColor: "#465b52",
      accentColor: templateId === "geometric-islamic" ? "#9c701b" : "#0d5c43",
      accentSoft: "rgba(13, 92, 67, 0.08)",
      borderColor: "rgba(182, 135, 44, 0.42)",
      badgeBg: "rgba(13, 92, 67, 0.08)",
      qrColor: "#0d5c43",
      qrBg: "#ffffff",
      patternOpacity: Math.min(base.patternOpacity, 0.05),
    };
  }

  if (appearance === "dark") {
    return {
      ...base,
      isDarkSurface: true,
      bgStart: "#151b18",
      bgMid: "#111614",
      bgEnd: "#0b0f0d",
      textColor: "#f3efe6",
      subtextColor: "#b4c3bc",
      accentColor: "#e5c16c",
      accentSoft: "rgba(229, 193, 108, 0.14)",
      borderColor: "rgba(229, 193, 108, 0.36)",
      badgeBg: "rgba(255, 255, 255, 0.07)",
      qrColor: "#111614",
      qrBg: "#faf7f0",
      patternOpacity: base.patternOpacity,
    };
  }

  // appearance === "night"
  return {
    ...base,
    isDarkSurface: true,
    bgStart: "#041b13",
    bgMid: "#06271c",
    bgEnd: "#03120d",
    textColor: "#faf6ea",
    subtextColor: "#a8c7b9",
    accentColor: "#ecc977",
    accentSoft: "rgba(236, 201, 119, 0.16)",
    borderColor: "rgba(236, 201, 119, 0.46)",
    badgeBg: "rgba(236, 201, 119, 0.09)",
    qrColor: "#041b13",
    qrBg: "#faf6ea",
    patternOpacity: Math.max(base.patternOpacity, 0.055),
  };
}

export interface RenderedSlide {
  blob: Blob;
  objectUrl: string;
  width: number;
  height: number;
  pageNumber: number;
  totalPages: number;
}

const imageCache = new Map<string, Promise<HTMLImageElement>>();

function loadImageCached(src: string): Promise<HTMLImageElement> {
  const existing = imageCache.get(src);
  if (existing) return existing;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => {
      imageCache.delete(src);
      reject(err);
    };
    img.src = src;
  });

  imageCache.set(src, promise);
  return promise;
}

function resolveProjectFonts(): {
  serifArabic: string;
  sansArabic: string;
  sansLatin: string;
} {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return {
      serifArabic: '"Amiri", Georgia, serif',
      sansArabic: '"IBM Plex Sans Arabic", system-ui, sans-serif',
      sansLatin: '"Plus Jakarta Sans", system-ui, sans-serif',
    };
  }

  const probe = document.createElement("span");
  probe.className = "font-quran";
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.textContent = "بِسْمِ اللَّهِ";
  document.body.appendChild(probe);
  const serifArabic =
    window.getComputedStyle(probe).fontFamily || '"Amiri", Georgia, serif';
  document.body.removeChild(probe);

  const sansArabic =
    window.getComputedStyle(document.body).fontFamily ||
    '"IBM Plex Sans Arabic", system-ui, sans-serif';

  return {
    serifArabic,
    sansArabic,
    sansLatin: sansArabic,
  };
}

async function ensureFontsReady(fonts: {
  serifArabic: string;
  sansArabic: string;
}): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  try {
    await Promise.allSettled([
      document.fonts.load(`400 44px ${fonts.serifArabic}`, "بسم الله الرحمن الرحيم"),
      document.fonts.load(`700 72px ${fonts.serifArabic}`, "الله الرحمن الرحيم"),
      document.fonts.load(`600 28px ${fonts.sansArabic}`, "وصل الإسلامية"),
      document.fonts.ready,
    ]);
  } catch {
    // Proceed gracefully
  }
}

function wrapParagraphs(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  direction: "rtl" | "ltr"
): string[] {
  ctx.direction = direction;
  const paragraphs = text.split(/\r?\n/);
  const lines: string[] = [];

  for (const rawPara of paragraphs) {
    const para = rawPara.trim();
    if (!para) {
      if (lines.length > 0 && lines[lines.length - 1] !== "") {
        lines.push("");
      }
      continue;
    }

    const words = para.split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        currentLine = candidate;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          let chunk = "";
          for (const ch of word) {
            if (ctx.measureText(chunk + ch).width <= maxWidth) {
              chunk += ch;
            } else {
              if (chunk) lines.push(chunk);
              chunk = ch;
            }
          }
          currentLine = chunk;
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawRubElHizb(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  strokeColor: string,
  lineWidth = 2
) {
  const half = size / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;

  ctx.strokeRect(-half, -half, size, size);
  ctx.rotate(Math.PI / 4);
  ctx.strokeRect(-half, -half, size, size);

  ctx.beginPath();
  ctx.arc(0, 0, size * 0.16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawMihrabArch(
  ctx: CanvasRenderingContext2D,
  width: number,
  topY: number,
  bottomY: number,
  padX: number,
  strokeColor: string
) {
  ctx.save();
  ctx.strokeStyle = strokeColor;
  ctx.globalAlpha = 0.28;
  ctx.lineWidth = 2;

  const left = padX - 18;
  const right = width - padX + 18;
  const midX = width / 2;
  const springY = topY + 120;

  ctx.beginPath();
  ctx.moveTo(left, bottomY);
  ctx.lineTo(left, springY);
  ctx.quadraticCurveTo(left + 45, topY + 28, midX, topY);
  ctx.quadraticCurveTo(right - 45, topY + 28, right, springY);
  ctx.lineTo(right, bottomY);
  ctx.stroke();
  ctx.restore();
}

function drawGeometricLattice(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  opacity: number
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  const cell = 132;
  const cols = Math.ceil(width / cell) + 1;
  const rows = Math.ceil(height / cell) + 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * cell + (r % 2 === 0 ? 0 : cell / 2);
      const cy = r * cell;
      drawRubElHizb(ctx, cx, cy, cell * 0.42, color, 1.5);
    }
  }
  ctx.restore();
}

function drawPillBadge(
  ctx: CanvasRenderingContext2D,
  label: string,
  cx: number,
  y: number,
  font: string,
  bgColor: string,
  borderColor: string,
  textColor: string,
  dir: "rtl" | "ltr" = "rtl"
): number {
  ctx.save();
  ctx.font = font;
  ctx.direction = dir;
  const measuredW = ctx.measureText(label).width;
  const pillW = Math.min(820, measuredW + 48);
  const pillH = 44;
  const pillX = cx - pillW / 2;

  drawRoundedRectPath(ctx, pillX, y, pillW, pillH, 22);
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, cx, y + pillH / 2 + 1);
  ctx.restore();
  return pillH;
}

function pickArabicFontSize(charLen: number): {
  fontSize: number;
  lineHeight: number;
} {
  if (charLen <= 90) return { fontSize: 52, lineHeight: 98 };
  if (charLen <= 220) return { fontSize: 45, lineHeight: 88 };
  if (charLen <= 480) return { fontSize: 38, lineHeight: 74 };
  if (charLen <= 850) return { fontSize: 34, lineHeight: 66 };
  return { fontSize: 31, lineHeight: 60 };
}

function paginateLines(lines: string[], maxLinesPerPage: number): string[][] {
  if (lines.length <= maxLinesPerPage) return [lines];
  const pages: string[][] = [];
  let idx = 0;
  while (idx < lines.length) {
    const slice = lines.slice(idx, idx + maxLinesPerPage);
    while (slice.length > 0 && slice[0] === "") slice.shift();
    while (slice.length > 0 && slice[slice.length - 1] === "") slice.pop();
    if (slice.length > 0) {
      pages.push(slice);
    }
    idx += maxLinesPerPage;
  }
  return pages.length > 0 ? pages : [lines];
}

export async function renderShareCardSlides(options: {
  payload: ShareCardPayload;
  templateId: ShareTemplateId;
  appearance?: ShareAppearance;
  ratio: ShareAspectRatio;
  includeEnglish: boolean;
  showLogo?: boolean;
  showQr?: boolean;
  locale: Locale;
}): Promise<RenderedSlide[]> {
  const {
    payload,
    templateId,
    appearance,
    ratio,
    includeEnglish,
    showLogo = true,
    showQr = true,
    locale,
  } = options;

  const theme = resolveAppearancePalette(templateId, appearance);
  const architecture = resolveContentArchitecture(payload.kind);
  const fonts = resolveProjectFonts();
  await ensureFontsReady(fonts);

  const logoSrc = theme.isDarkSurface
    ? "/branding/wasl-logo-dark.png"
    : "/branding/wasl-logo-light.png";

  const canonicalUrl = buildCanonicalShareUrl(payload.shareUrl);
  const displayDomain = getDisplayDomain();

  const [logoImg, qrDataUrl] = await Promise.all([
    showLogo ? loadImageCached(logoSrc) : Promise.resolve(null),
    showQr
      ? QRCode.toDataURL(canonicalUrl, {
          width: 260,
          margin: 3, // Generous quiet zone for reliable phone scanning
          errorCorrectionLevel: "M",
          color: {
            dark: theme.qrColor,
            light: theme.qrBg,
          },
        })
      : Promise.resolve(null),
  ]);

  const qrImg = qrDataUrl ? await loadImageCached(qrDataUrl) : null;

  const width = 1080;
  const isStory = ratio === "story" || ratio === "portrait";
  const baseMinHeight = isStory ? 1920 : 1080;
  const maxSingleCardHeight = isStory ? 1920 : 1440;
  const padX = 88;
  const contentWidth = width - padX * 2;
  const headerBlockH = 164;
  const footerBlockH = 196;

  const measureCanvas = document.createElement("canvas");
  measureCanvas.width = width;
  measureCanvas.height = 100;
  const mCtx = measureCanvas.getContext("2d");
  if (!mCtx) {
    throw new Error("Canvas 2D context unavailable");
  }

  // Handle Allah's Names layout split cleanly (Prominent Divine Name + verified meaning)
  let primaryArabicBody = payload.arabicText;
  let royalDivineName = "";
  if (architecture === "allah_name") {
    const split = payload.arabicText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (split.length >= 2) {
      royalDivineName = split[0];
      primaryArabicBody = split.slice(1).join("\n");
    } else {
      royalDivineName = payload.titleAr || split[0] || "";
    }
  }

  // Quranic bracket polish only if not already enclosed
  if (
    payload.kind === "verse" &&
    !primaryArabicBody.includes("﴿") &&
    !primaryArabicBody.includes("﴾")
  ) {
    primaryArabicBody = `﴿${primaryArabicBody}﴾`;
  }

  const { fontSize: arFontSize, lineHeight: arLineHeight } = pickArabicFontSize(
    primaryArabicBody.length
  );

  // Title lines (excluding royal divine name already elevated)
  let titleLines: string[] = [];
  const rawTitleText =
    architecture === "allah_name"
      ? ""
      : payload.titleAr || payload.titleEn || "";
  if (rawTitleText) {
    mCtx.font = `700 ${architecture === "editorial" ? 38 : 34}px ${fonts.sansArabic}`;
    titleLines = wrapParagraphs(
      mCtx,
      rawTitleText,
      contentWidth - (architecture === "editorial" ? 56 : 40),
      "rtl"
    );
  }

  // Main Arabic lines
  mCtx.font = `400 ${arFontSize}px ${fonts.serifArabic}`;
  const arLines = wrapParagraphs(
    mCtx,
    primaryArabicBody,
    contentWidth - (architecture === "editorial" ? 52 : 36),
    "rtl"
  );

  // English translation lines (strictly only when verified translation exists & enabled)
  const enFontSize = 24;
  const enLineHeight = 38;
  let enLines: string[] = [];
  if (includeEnglish && payload.englishText) {
    mCtx.font = `400 ${enFontSize}px ${fonts.sansLatin}`;
    enLines = wrapParagraphs(
      mCtx,
      payload.englishText,
      contentWidth - 60,
      "ltr"
    );
  }

  // Mandatory attribution lines (never removed for Quran or Hadith)
  const metaParts: string[] = [];
  if (payload.referenceAr) metaParts.push(payload.referenceAr);
  if (payload.sourceAr && payload.sourceAr !== payload.referenceAr) {
    metaParts.push(payload.sourceAr);
  }
  const metaString = metaParts.join("  •  ");
  let metaLines: string[] = [];
  if (metaString) {
    mCtx.font = `600 25px ${fonts.sansArabic}`;
    metaLines = wrapParagraphs(mCtx, metaString, contentWidth - 40, "rtl");
  }

  const topCrestH =
    architecture === "allah_name" && royalDivineName
      ? 188
      : architecture === "quran" && (payload.surahNameAr || payload.ayahNumber)
        ? 68
        : architecture === "hadith"
          ? 56
          : 0;

  const extraBottomBadgeH =
    (architecture === "hadith" && payload.hadithGradeAr) ||
    (architecture === "adhkar" &&
      typeof payload.repeatCount === "number" &&
      payload.repeatCount > 0)
      ? 64
      : 0;

  const titleH = titleLines.length > 0 ? titleLines.length * 50 + 28 : 0;
  const enH = enLines.length > 0 ? enLines.length * enLineHeight + 36 : 0;
  const metaH = metaLines.length > 0 ? metaLines.length * 40 + 36 : 0;

  const availableBodyHForMax =
    maxSingleCardHeight -
    headerBlockH -
    footerBlockH -
    topCrestH -
    titleH -
    enH -
    metaH -
    extraBottomBadgeH -
    90;
  const maxLinesPerSlide = Math.max(
    5,
    Math.floor(availableBodyHForMax / arLineHeight)
  );

  const pages = paginateLines(arLines, maxLinesPerSlide);
  const totalPages = pages.length;
  const slides: RenderedSlide[] = [];

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const pageArLines = pages[pageIdx];
    const isLastPage = pageIdx === totalPages - 1;

    const bodyArH = pageArLines.length * arLineHeight;
    const pageTitleH = pageIdx === 0 ? titleH : 0;
    const pageCrestH = pageIdx === 0 ? topCrestH : 0;
    const pageEnH = isLastPage ? enH : 0;
    const pageExtraBadgeH = isLastPage ? extraBottomBadgeH : 0;
    const pageMetaH = metaH;

    const neededHeight =
      headerBlockH +
      pageCrestH +
      pageTitleH +
      bodyArH +
      pageEnH +
      pageExtraBadgeH +
      pageMetaH +
      footerBlockH +
      96;
    const canvasHeight = Math.max(baseMinHeight, Math.ceil(neededHeight));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");

    // 1. Background Surface
    const grad = ctx.createLinearGradient(0, 0, width, canvasHeight);
    grad.addColorStop(0, theme.bgStart);
    grad.addColorStop(0.55, theme.bgMid);
    grad.addColorStop(1, theme.bgEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, canvasHeight);

    const glow = ctx.createRadialGradient(
      width * 0.5,
      canvasHeight * (architecture === "allah_name" ? 0.34 : 0.25),
      40,
      width * 0.5,
      canvasHeight * 0.34,
      width * 0.72
    );
    glow.addColorStop(0, theme.accentSoft);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, canvasHeight);

    // 2. Islamic Geometric Lattice Pattern
    drawGeometricLattice(
      ctx,
      width,
      canvasHeight,
      theme.accentColor,
      architecture === "adhkar"
        ? Math.min(theme.patternOpacity, 0.025)
        : theme.patternOpacity
    );

    // 3. Architecture-Specific Frames & Ornaments
    if (architecture === "quran") {
      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = 2.5;
      drawRoundedRectPath(ctx, 32, 32, width - 64, canvasHeight - 64, 34);
      ctx.stroke();
      drawMihrabArch(
        ctx,
        width,
        186,
        canvasHeight - footerBlockH - 22,
        padX,
        theme.accentColor
      );
    } else if (architecture === "hadith") {
      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = 2.5;
      drawRoundedRectPath(ctx, 32, 32, width - 64, canvasHeight - 64, 24);
      ctx.stroke();

      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1.4;
      drawRoundedRectPath(ctx, 48, 48, width - 96, canvasHeight - 96, 16);
      ctx.stroke();
      // Manuscript rosettes on top corners
      drawRubElHizb(ctx, 74, 74, 32, theme.accentColor, 1.8);
      drawRubElHizb(ctx, width - 74, 74, 32, theme.accentColor, 1.8);
      ctx.restore();
    } else if (architecture === "editorial") {
      ctx.fillStyle = theme.accentColor;
      ctx.fillRect(padX, 46, contentWidth, 4);
      ctx.fillRect(padX, canvasHeight - 48, contentWidth, 3);
    } else if (theme.showInnerFrame) {
      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = 2.5;
      drawRoundedRectPath(ctx, 32, 32, width - 64, canvasHeight - 64, 34);
      ctx.stroke();

      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 1.25;
      drawRoundedRectPath(ctx, 46, 46, width - 92, canvasHeight - 92, 26);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.fillStyle = theme.accentColor;
      ctx.fillRect(padX, 46, contentWidth, 3);
      ctx.fillRect(padX, canvasHeight - 48, contentWidth, 3);
    }

    if (theme.showCornerOrnaments || architecture === "allah_name") {
      ctx.save();
      ctx.globalAlpha = 0.5;
      drawRubElHizb(ctx, 76, 76, 34, theme.accentColor, 2);
      drawRubElHizb(ctx, width - 76, 76, 34, theme.accentColor, 2);
      drawRubElHizb(ctx, 76, canvasHeight - 76, 34, theme.accentColor, 2);
      drawRubElHizb(ctx, width - 76, canvasHeight - 76, 34, theme.accentColor, 2);
      ctx.restore();
    }

    // 4. Header: Optional Wasl Logo & Content Kind Badge
    if (logoImg) {
      const logoH = 56;
      const logoW = Math.round(
        logoH * (logoImg.width / Math.max(1, logoImg.height))
      );
      ctx.drawImage(logoImg, width - padX - logoW, 74, logoW, logoH);
    }

    const kindLabelBase = KIND_LABELS[payload.kind][locale === "en" ? "en" : "ar"];
    const badgeLabel =
      totalPages > 1
        ? `${kindLabelBase} • ${pageIdx + 1}/${totalPages}`
        : kindLabelBase;

    ctx.save();
    ctx.font = `600 22px ${fonts.sansArabic}`;
    ctx.direction = locale === "en" ? "ltr" : "rtl";
    const badgeTextW = ctx.measureText(badgeLabel).width;
    const pillW = Math.min(380, badgeTextW + 46);
    const pillH = 44;
    const pillX = logoImg ? padX : width / 2 - pillW / 2;
    const pillY = 80;

    drawRoundedRectPath(ctx, pillX, pillY, pillW, pillH, 22);
    ctx.fillStyle = theme.badgeBg;
    ctx.fill();
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = theme.accentColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeLabel, pillX + pillW / 2, pillY + pillH / 2 + 1);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = theme.borderColor;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padX, 154);
    ctx.lineTo(width - padX, 154);
    ctx.stroke();
    ctx.restore();

    // 5. Centered Middle Content Zone
    const bodyTop = 180;
    const bodyBottom = canvasHeight - footerBlockH - 22;
    const totalContentH =
      pageCrestH + pageTitleH + bodyArH + pageEnH + pageExtraBadgeH + pageMetaH;
    let cursorY =
      bodyTop + Math.max(20, (bodyBottom - bodyTop - totalContentH) / 2);

    // 5a. Architecture Crest (Royal Rosette / Surah-Ayah Badge / Hadith Label)
    if (pageIdx === 0 && architecture === "allah_name" && royalDivineName) {
      drawRubElHizb(ctx, width / 2, cursorY + 72, 146, theme.accentColor, 2.2);
      ctx.save();
      ctx.font = `700 88px ${fonts.serifArabic}`;
      ctx.fillStyle = theme.accentColor;
      ctx.direction = "rtl";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(royalDivineName, width / 2, cursorY + 72);
      ctx.restore();
      cursorY += 188;
    } else if (
      pageIdx === 0 &&
      architecture === "quran" &&
      (payload.surahNameAr || payload.ayahNumber)
    ) {
      const quranBadge = [
        payload.surahNameAr,
        typeof payload.ayahNumber === "number" ? `الآية ${payload.ayahNumber}` : "",
      ]
        .filter(Boolean)
        .join("  •  ");
      drawPillBadge(
        ctx,
        quranBadge,
        width / 2,
        cursorY,
        `700 22px ${fonts.sansArabic}`,
        theme.badgeBg,
        theme.borderColor,
        theme.accentColor,
        "rtl"
      );
      cursorY += 68;
    } else if (pageIdx === 0 && architecture === "hadith") {
      const collectionLabel =
        payload.sourceAr || payload.referenceAr || "الحديث النبوي الشريف";
      drawPillBadge(
        ctx,
        collectionLabel,
        width / 2,
        cursorY,
        `700 22px ${fonts.sansArabic}`,
        theme.badgeBg,
        theme.borderColor,
        theme.accentColor,
        "rtl"
      );
      cursorY += 56;
    }

    // 5b. Title (Editorial right-aligned or Centered)
    if (pageIdx === 0 && titleLines.length > 0) {
      ctx.save();
      ctx.font = `700 ${architecture === "editorial" ? 38 : 34}px ${fonts.sansArabic}`;
      ctx.fillStyle = theme.accentColor;
      ctx.direction = "rtl";
      ctx.textAlign = architecture === "editorial" ? "right" : "center";
      ctx.textBaseline = "top";
      const titleX = architecture === "editorial" ? width - padX : width / 2;
      for (const line of titleLines) {
        ctx.fillText(line, titleX, cursorY);
        cursorY += 50;
      }
      cursorY += 24;
      ctx.restore();
    }

    // 5c. Main Arabic Body
    const isEditorial = architecture === "editorial";
    if (isEditorial) {
      // Gold editorial quote bar along right margin
      ctx.save();
      ctx.fillStyle = theme.accentColor;
      ctx.globalAlpha = 0.75;
      ctx.fillRect(width - padX - 4, cursorY + 8, 5, Math.max(40, bodyArH - 16));
      ctx.restore();
    }

    ctx.save();
    ctx.font = `400 ${arFontSize}px ${fonts.serifArabic}`;
    ctx.fillStyle = theme.textColor;
    ctx.direction = "rtl";
    ctx.textAlign = isEditorial ? "right" : "center";
    ctx.textBaseline = "top";
    const bodyX = isEditorial ? width - padX - 28 : width / 2;
    for (const line of pageArLines) {
      if (line !== "") {
        ctx.fillText(line, bodyX, cursorY);
      }
      cursorY += arLineHeight;
    }
    ctx.restore();

    // 5d. Optional Verified English Translation
    if (isLastPage && enLines.length > 0) {
      cursorY += 20;
      ctx.save();
      ctx.font = `400 ${enFontSize}px ${fonts.sansLatin}`;
      ctx.fillStyle = theme.subtextColor;
      ctx.direction = "ltr";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (const line of enLines) {
        if (line !== "") {
          ctx.fillText(line, width / 2, cursorY);
        }
        cursorY += enLineHeight;
      }
      ctx.restore();
    }

    // 5e. Hadith Authenticity Grade OR Adhkar Repetition Badge
    if (isLastPage && architecture === "hadith" && payload.hadithGradeAr) {
      cursorY += 16;
      drawPillBadge(
        ctx,
        `درجة الحديث: ${payload.hadithGradeAr}`,
        width / 2,
        cursorY,
        `600 22px ${fonts.sansArabic}`,
        theme.accentSoft,
        theme.borderColor,
        theme.accentColor,
        "rtl"
      );
      cursorY += 54;
    } else if (
      isLastPage &&
      architecture === "adhkar" &&
      typeof payload.repeatCount === "number" &&
      payload.repeatCount > 0
    ) {
      cursorY += 16;
      drawPillBadge(
        ctx,
        `التكرار المشروع: ${payload.repeatCount} ${payload.repeatCount === 1 ? "مرة" : "مرات"}`,
        width / 2,
        cursorY,
        `600 22px ${fonts.sansArabic}`,
        theme.accentSoft,
        theme.borderColor,
        theme.accentColor,
        "rtl"
      );
      cursorY += 54;
    }

    // 5f. Mandatory Reference & Source
    if (metaLines.length > 0) {
      cursorY += 20;
      ctx.save();
      ctx.font = `600 25px ${fonts.sansArabic}`;
      ctx.fillStyle = theme.accentColor;
      ctx.direction = "rtl";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (const line of metaLines) {
        ctx.fillText(line, width / 2, cursorY);
        cursorY += 40;
      }
      ctx.restore();
    }

    // 6. Footer (Divider + Platform Info + Optional QR Code)
    const footerTop = canvasHeight - footerBlockH;
    ctx.save();
    ctx.strokeStyle = theme.borderColor;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padX, footerTop);
    ctx.lineTo(width - padX, footerTop);
    ctx.stroke();
    ctx.restore();

    if (qrImg) {
      const qrBoxSize = 124;
      const qrX = padX;
      const qrY = footerTop + 28;
      ctx.save();
      drawRoundedRectPath(ctx, qrX, qrY, qrBoxSize, qrBoxSize, 18);
      ctx.fillStyle = theme.qrBg;
      ctx.fill();
      ctx.drawImage(qrImg, qrX + 8, qrY + 8, qrBoxSize - 16, qrBoxSize - 16);
      ctx.restore();
    }

    ctx.save();
    ctx.direction = "rtl";
    ctx.textAlign = qrImg ? "right" : "center";
    ctx.textBaseline = "top";
    const footerTextX = qrImg ? width - padX : width / 2;

    ctx.font = `700 28px ${fonts.sansArabic}`;
    ctx.fillStyle = theme.accentColor;
    ctx.fillText("وصل الإسلامية", footerTextX, footerTop + 42);

    ctx.direction = "ltr";
    ctx.font = `600 22px ${fonts.sansLatin}`;
    ctx.fillStyle = theme.subtextColor;
    ctx.fillText(
      showLogo
        ? `@waslofficiall  •  ${displayDomain}`
        : displayDomain,
      footerTextX,
      footerTop + 86
    );
    ctx.restore();

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error("Failed to encode PNG"));
      }, "image/png");
    });

    slides.push({
      blob,
      objectUrl: URL.createObjectURL(blob),
      width,
      height: canvasHeight,
      pageNumber: pageIdx + 1,
      totalPages,
    });
  }

  return slides;
}

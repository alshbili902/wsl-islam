import QRCode from "qrcode";
import {
  buildCanonicalShareUrl,
  getDisplayDomain,
  KIND_LABELS,
} from "@/lib/share/formatShareText";
import type { Locale, ShareCardPayload } from "@/types/islamic";

export type ShareTemplateId =
  | "classic-emerald"
  | "ivory-emerald"
  | "dark-emerald"
  | "minimal-arabic"
  | "geometric-islamic";

export type ShareAspectRatio = "square" | "portrait";

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
    badgeBg: "rgba(255, 255, 255, 0.06)",
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
    badgeBg: "rgba(13, 92, 67, 0.07)",
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
    nameEn: "Premium Dark",
    isDarkSurface: true,
    bgStart: "#051611",
    bgMid: "#092119",
    bgEnd: "#04120d",
    textColor: "#f3ecdc",
    subtextColor: "#a8c7b9",
    accentColor: "#ecc977",
    accentSoft: "rgba(236, 201, 119, 0.14)",
    borderColor: "rgba(236, 201, 119, 0.42)",
    badgeBg: "rgba(236, 201, 119, 0.08)",
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
    borderColor: "rgba(19, 35, 29, 0.14)",
    badgeBg: "rgba(182, 135, 44, 0.08)",
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
    nameEn: "Geometric Art",
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
    patternOpacity: 0.095,
    showCornerOrnaments: true,
    showInnerFrame: true,
    swatchGradient: "linear-gradient(135deg, #073427, #041812)",
  },
};

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
      document.fonts.load(`400 44px ${fonts.serifArabic}`, "بسم الله"),
      document.fonts.load(`700 44px ${fonts.serifArabic}`, "بسم الله"),
      document.fonts.load(`600 28px ${fonts.sansArabic}`, "وصل الإسلامية"),
      document.fonts.ready,
    ]);
  } catch {
    // Proceed cleanly if FontFaceSet.load throws on custom fallback strings
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
          // Extremely long single unbroken token: split by character chunks
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

function pickArabicFontSize(charLen: number): {
  fontSize: number;
  lineHeight: number;
} {
  if (charLen <= 120) return { fontSize: 50, lineHeight: 96 };
  if (charLen <= 260) return { fontSize: 44, lineHeight: 86 };
  if (charLen <= 520) return { fontSize: 38, lineHeight: 74 };
  if (charLen <= 850) return { fontSize: 34, lineHeight: 66 };
  return { fontSize: 31, lineHeight: 60 };
}

function paginateLines(lines: string[], maxLinesPerPage: number): string[][] {
  if (lines.length <= maxLinesPerPage) return [lines];
  const pages: string[][] = [];
  let idx = 0;
  while (idx < lines.length) {
    const slice = lines.slice(idx, idx + maxLinesPerPage);
    // Trim leading/trailing empty spacer lines on page breaks
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
  ratio: ShareAspectRatio;
  includeEnglish: boolean;
  locale: Locale;
}): Promise<RenderedSlide[]> {
  const { payload, templateId, ratio, includeEnglish, locale } = options;
  const theme = SHARE_TEMPLATES[templateId];
  const fonts = resolveProjectFonts();
  await ensureFontsReady(fonts);

  const logoSrc = theme.isDarkSurface
    ? "/branding/wasl-logo-dark.png"
    : "/branding/wasl-logo-light.png";

  const canonicalUrl = buildCanonicalShareUrl(payload.shareUrl);
  const displayDomain = getDisplayDomain();

  const [logoImg, qrDataUrl] = await Promise.all([
    loadImageCached(logoSrc),
    QRCode.toDataURL(canonicalUrl, {
      width: 220,
      margin: 1,
      color: {
        dark: theme.qrColor,
        light: theme.qrBg,
      },
    }),
  ]);
  const qrImg = await loadImageCached(qrDataUrl);

  const width = 1080;
  const baseMinHeight = ratio === "square" ? 1080 : 1350;
  const maxSingleCardHeight = 1860;
  const padX = 88;
  const contentWidth = width - padX * 2;
  const headerBlockH = 165;
  const footerBlockH = 195;

  // Measure text on a scratch canvas first
  const measureCanvas = document.createElement("canvas");
  measureCanvas.width = width;
  measureCanvas.height = 100;
  const mCtx = measureCanvas.getContext("2d");
  if (!mCtx) {
    throw new Error("Canvas 2D context unavailable");
  }

  const { fontSize: arFontSize, lineHeight: arLineHeight } = pickArabicFontSize(
    payload.arabicText.length
  );

  // Title lines (if present)
  let titleLines: string[] = [];
  const titleText = payload.titleAr || payload.titleEn || "";
  if (titleText) {
    mCtx.font = `700 34px ${fonts.sansArabic}`;
    titleLines = wrapParagraphs(mCtx, titleText, contentWidth - 40, "rtl");
  }

  // Arabic main content lines
  mCtx.font = `400 ${arFontSize}px ${fonts.serifArabic}`;
  const arLines = wrapParagraphs(
    mCtx,
    payload.arabicText,
    contentWidth - 36,
    "rtl"
  );

  // English translation lines (if toggled on)
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

  // Reference & metadata lines
  const metaParts: string[] = [];
  if (payload.referenceAr) metaParts.push(payload.referenceAr);
  if (payload.sourceAr && payload.sourceAr !== payload.referenceAr) {
    metaParts.push(payload.sourceAr);
  }
  if (payload.hadithGradeAr) {
    metaParts.push(`الدرجة: ${payload.hadithGradeAr}`);
  }
  if (typeof payload.repeatCount === "number" && payload.repeatCount > 0) {
    metaParts.push(`التكرار: ${payload.repeatCount}`);
  }
  const metaString = metaParts.join("  •  ");
  let metaLines: string[] = [];
  if (metaString) {
    mCtx.font = `600 25px ${fonts.sansArabic}`;
    metaLines = wrapParagraphs(mCtx, metaString, contentWidth - 40, "rtl");
  }

  const titleH = titleLines.length > 0 ? titleLines.length * 48 + 26 : 0;
  const enH = enLines.length > 0 ? enLines.length * enLineHeight + 34 : 0;
  const metaH = metaLines.length > 0 ? metaLines.length * 40 + 36 : 0;

  // Determine how many lines fit inside maxSingleCardHeight before paginating
  const availableBodyHForMax =
    maxSingleCardHeight - headerBlockH - footerBlockH - titleH - enH - metaH - 80;
  const maxLinesPerSlide = Math.max(
    6,
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
    const pageEnH = isLastPage ? enH : 0;
    const pageMetaH = metaH;

    const neededHeight =
      headerBlockH + pageTitleH + bodyArH + pageEnH + pageMetaH + footerBlockH + 90;
    const canvasHeight = Math.max(baseMinHeight, Math.ceil(neededHeight));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");

    // 1. Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, canvasHeight);
    grad.addColorStop(0, theme.bgStart);
    grad.addColorStop(0.55, theme.bgMid);
    grad.addColorStop(1, theme.bgEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, canvasHeight);

    // Subtle radial ambient glow
    const glow = ctx.createRadialGradient(
      width * 0.5,
      canvasHeight * 0.25,
      40,
      width * 0.5,
      canvasHeight * 0.3,
      width * 0.72
    );
    glow.addColorStop(0, theme.accentSoft);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, canvasHeight);

    // 2. Islamic Geometric Lattice Pattern
    drawGeometricLattice(ctx, width, canvasHeight, theme.accentColor, theme.patternOpacity);

    // 3. Ornamental Frames
    if (theme.showInnerFrame) {
      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = 2.5;
      drawRoundedRectPath(ctx, 32, 32, width - 64, canvasHeight - 64, 34);
      ctx.stroke();

      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1.25;
      drawRoundedRectPath(ctx, 46, 46, width - 92, canvasHeight - 92, 26);
      ctx.stroke();
      ctx.restore();
    } else {
      // Minimalist top and bottom accent bars
      ctx.fillStyle = theme.accentColor;
      ctx.fillRect(padX, 46, contentWidth, 3);
      ctx.fillRect(padX, canvasHeight - 48, contentWidth, 3);
    }

    // Corner Rub el Hizb medallions for Geometric Islamic template
    if (theme.showCornerOrnaments) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      drawRubElHizb(ctx, 76, 76, 36, theme.accentColor, 2);
      drawRubElHizb(ctx, width - 76, 76, 36, theme.accentColor, 2);
      drawRubElHizb(ctx, 76, canvasHeight - 76, 36, theme.accentColor, 2);
      drawRubElHizb(ctx, width - 76, canvasHeight - 76, 36, theme.accentColor, 2);
      ctx.restore();
    }

    // 4. Header: Official Wasl Logo (left/right RTL balanced) & Content Kind Pill
    const logoH = 58;
    const logoW = Math.round(logoH * (logoImg.width / Math.max(1, logoImg.height)));
    ctx.drawImage(logoImg, width - padX - logoW, 74, logoW, logoH);

    // Content kind badge pill on the opposite side
    const badgeLabel =
      totalPages > 1
        ? `${KIND_LABELS[payload.kind][locale === "en" ? "en" : "ar"]} • ${pageIdx + 1}/${totalPages}`
        : KIND_LABELS[payload.kind][locale === "en" ? "en" : "ar"];

    ctx.save();
    ctx.font = `600 22px ${fonts.sansArabic}`;
    ctx.direction = locale === "en" ? "ltr" : "rtl";
    const badgeTextW = ctx.measureText(badgeLabel).width;
    const pillW = Math.min(360, badgeTextW + 46);
    const pillH = 46;
    const pillX = padX;
    const pillY = 80;

    drawRoundedRectPath(ctx, pillX, pillY, pillW, pillH, 23);
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

    // Subtle header divider
    ctx.save();
    ctx.strokeStyle = theme.borderColor;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padX, 158);
    ctx.lineTo(width - padX, 158);
    ctx.stroke();
    ctx.restore();

    // 5. Center Content vertically inside the middle zone
    const bodyTop = 180;
    const bodyBottom = canvasHeight - footerBlockH - 20;
    const totalContentH = pageTitleH + bodyArH + pageEnH + pageMetaH;
    let cursorY =
      bodyTop + Math.max(24, (bodyBottom - bodyTop - totalContentH) / 2);

    // Title (Slide 1 only)
    if (pageIdx === 0 && titleLines.length > 0) {
      ctx.save();
      ctx.font = `700 34px ${fonts.sansArabic}`;
      ctx.fillStyle = theme.accentColor;
      ctx.direction = "rtl";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (const line of titleLines) {
        ctx.fillText(line, width / 2, cursorY);
        cursorY += 48;
      }
      cursorY += 22;
      ctx.restore();
    }

    // Complete Arabic Text
    ctx.save();
    ctx.font = `400 ${arFontSize}px ${fonts.serifArabic}`;
    ctx.fillStyle = theme.textColor;
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (const line of pageArLines) {
      if (line !== "") {
        ctx.fillText(line, width / 2, cursorY);
      }
      cursorY += arLineHeight;
    }
    ctx.restore();

    // Optional English Translation (final slide)
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

    // Reference & Source
    if (metaLines.length > 0) {
      cursorY += 24;
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

    // 6. Branded Footer (Divider + Official Brand Info + QR Code)
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

    // QR Badge on the left side
    const qrBoxSize = 112;
    const qrX = padX;
    const qrY = footerTop + 34;
    ctx.save();
    drawRoundedRectPath(ctx, qrX, qrY, qrBoxSize, qrBoxSize, 16);
    ctx.fillStyle = theme.qrBg;
    ctx.fill();
    ctx.drawImage(qrImg, qrX + 8, qrY + 8, qrBoxSize - 16, qrBoxSize - 16);
    ctx.restore();

    // Brand Name, Handle, Domain on the right side
    ctx.save();
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";

    ctx.font = `700 28px ${fonts.sansArabic}`;
    ctx.fillStyle = theme.accentColor;
    ctx.fillText("وصل الإسلامية", width - padX, footerTop + 42);

    ctx.direction = "ltr";
    ctx.font = `600 22px ${fonts.sansLatin}`;
    ctx.fillStyle = theme.subtextColor;
    ctx.fillText(`@waslofficiall  •  ${displayDomain}`, width - padX, footerTop + 86);
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

/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FileText,
  Image as ImageIcon,
  Link2,
  Loader2,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { useWasl } from "@/components/providers/WaslProvider";
import {
  buildCanonicalShareUrl,
  formatShareText,
  KIND_LABELS,
} from "@/lib/share/formatShareText";
import {
  renderShareCardSlides,
  SHARE_TEMPLATES,
  type RenderedSlide,
  type ShareAspectRatio,
  type ShareTemplateId,
} from "@/lib/share/renderShareCard";

type ShareTab = "image" | "text";

interface StatusFeedback {
  tone: "success" | "info" | "error";
  message: string;
}

async function copyTextWithFallback(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall back to legacy execCommand below
    }
  }

  if (typeof document !== "undefined") {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
  return false;
}

function getDefaultTemplateForTheme(
  resolvedTheme: "light" | "dark" | "night"
): ShareTemplateId {
  if (resolvedTheme === "night") return "dark-emerald";
  if (resolvedTheme === "dark") return "classic-emerald";
  return "ivory-emerald";
}

function detectShareCapabilities() {
  if (typeof window === "undefined") {
    return {
      nativeShareText: false,
      nativeShareFile: false,
      clipboardImage: false,
    };
  }

  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
  };

  const nativeShareText = typeof nav.share === "function";
  let nativeShareFile = false;
  if (
    nativeShareText &&
    typeof nav.canShare === "function" &&
    typeof File !== "undefined"
  ) {
    try {
      const probe = new File([new Uint8Array([0])], "wasl-probe.png", {
        type: "image/png",
      });
      nativeShareFile = nav.canShare({ files: [probe] });
    } catch {
      nativeShareFile = false;
    }
  }

  const clipboardImage =
    typeof nav.clipboard?.write === "function" &&
    typeof window.ClipboardItem !== "undefined";

  return {
    nativeShareText,
    nativeShareFile,
    clipboardImage,
  };
}

export function ShareCardModal() {
  const { sharePayload, closeShareCard, locale, resolvedTheme } = useWasl();

  if (!sharePayload) return null;

  const modalKey = `${sharePayload.kind}|${sharePayload.referenceAr}|${sharePayload.arabicText.slice(0, 48)}|${locale}`;

  return (
    <ShareCardModalInner
      key={modalKey}
      sharePayload={sharePayload}
      closeShareCard={closeShareCard}
      locale={locale}
      resolvedTheme={resolvedTheme}
    />
  );
}

interface ShareCardModalInnerProps {
  sharePayload: NonNullable<ReturnType<typeof useWasl>["sharePayload"]>;
  closeShareCard: () => void;
  locale: "ar" | "en";
  resolvedTheme: "light" | "dark" | "night";
}

function ShareCardModalInner({
  sharePayload,
  closeShareCard,
  locale,
  resolvedTheme,
}: ShareCardModalInnerProps) {
  const [activeTab, setActiveTab] = useState<ShareTab>("image");
  const [templateId, setTemplateId] = useState<ShareTemplateId>(() =>
    getDefaultTemplateForTheme(resolvedTheme)
  );
  const [ratio, setRatio] = useState<ShareAspectRatio>("square");
  const [showEnglish, setShowEnglish] = useState(
    () => locale === "en" && Boolean(sharePayload.englishText)
  );

  const [slidesState, setSlidesState] = useState<{
    key: string;
    slides: RenderedSlide[];
    error: string | null;
  }>({
    key: "",
    slides: [],
    error: null,
  });
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<StatusFeedback | null>(null);

  const capabilities = useMemo(() => detectShareCapabilities(), []);
  const slidesRef = useRef<RenderedSlide[]>([]);

  const revokeSlides = useCallback((list: RenderedSlide[]) => {
    for (const s of list) {
      try {
        URL.revokeObjectURL(s.objectUrl);
      } catch {
        // Ignore
      }
    }
  }, []);

  // Keyboard Escape handler
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeShareCard();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeShareCard]);

  const renderKey = `${templateId}|${ratio}|${showEnglish ? 1 : 0}|${locale}|${sharePayload.kind}|${sharePayload.arabicText.length}|${sharePayload.referenceAr}`;
  const rendering = slidesState.key !== renderKey;
  const slides = slidesState.slides;
  const renderError = slidesState.key === renderKey ? slidesState.error : null;

  // Render real PNG slides whenever image options change
  useEffect(() => {
    let cancelled = false;

    renderShareCardSlides({
      payload: sharePayload,
      templateId,
      ratio,
      includeEnglish: showEnglish,
      locale,
    })
      .then((rendered) => {
        if (cancelled) {
          revokeSlides(rendered);
          return;
        }
        revokeSlides(slidesRef.current);
        slidesRef.current = rendered;
        setSlidesState({ key: renderKey, slides: rendered, error: null });
        setActiveSlideIndex((idx) =>
          Math.min(idx, Math.max(0, rendered.length - 1))
        );
      })
      .catch(() => {
        if (!cancelled) {
          setSlidesState((prev) => ({
            key: renderKey,
            slides: prev.slides,
            error:
              locale === "ar"
                ? "تعذر إنشاء معاينة الصورة في هذا المتصفح."
                : "Could not render image preview in this browser.",
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sharePayload, templateId, ratio, showEnglish, locale, renderKey, revokeSlides]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      revokeSlides(slidesRef.current);
      slidesRef.current = [];
    };
  }, [revokeSlides]);

  const formattedText = useMemo(() => {
    return formatShareText(sharePayload, {
      locale,
      includeEnglish: showEnglish,
    });
  }, [sharePayload, locale, showEnglish]);

  const canonicalUrl = useMemo(() => {
    return buildCanonicalShareUrl(sharePayload.shareUrl);
  }, [sharePayload]);

  const activeSlide = slides[activeSlideIndex] ?? null;

  const triggerDownloadSlide = (slide: RenderedSlide) => {
    const link = document.createElement("a");
    const suffix =
      slide.totalPages > 1 ? `-p${slide.pageNumber}of${slide.totalPages}` : "";
    link.download = `wasl-${sharePayload.kind}${suffix}-${Date.now()}.png`;
    link.href = slide.objectUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadImage = () => {
    if (!activeSlide) return;
    setFeedback(null);
    try {
      triggerDownloadSlide(activeSlide);
      setFeedback({
        tone: "success",
        message:
          locale === "ar"
            ? "تم تنزيل الصورة بصيغة PNG بنجاح"
            : "PNG image downloaded successfully",
      });
    } catch {
      setFeedback({
        tone: "error",
        message:
          locale === "ar"
            ? "تعذر تنزيل الصورة في هذا المتصفح."
            : "Failed to download PNG image.",
      });
    }
  };

  const handleDownloadAllSlides = () => {
    if (slides.length === 0) return;
    setFeedback(null);
    slides.forEach((s, idx) => {
      window.setTimeout(() => triggerDownloadSlide(s), idx * 180);
    });
    setFeedback({
      tone: "success",
      message:
        locale === "ar"
          ? `تم تنزيل جميع الشرائح (${slides.length} صور PNG)`
          : `Downloading all ${slides.length} PNG slides`,
    });
  };

  const handleShareImageNative = async () => {
    if (!capabilities.nativeShareFile || slides.length === 0) return;
    setBusyAction("share-image");
    setFeedback(null);
    try {
      const files = slides.map(
        (s) =>
          new File(
            [s.blob],
            `wasl-${sharePayload.kind}${s.totalPages > 1 ? `-${s.pageNumber}` : ""}.png`,
            { type: "image/png" }
          )
      );

      if (navigator.canShare && !navigator.canShare({ files })) {
        setFeedback({
          tone: "error",
          message:
            locale === "ar"
              ? "مشاركة ملفات الصور غير مدعومة على هذا المتصفح. يمكنك تنزيل الصورة مباشرة."
              : "Sharing image files is not supported on this browser. Please download the PNG instead.",
        });
        return;
      }

      await navigator.share({
        title: "وصل الإسلامية — Wasl Islamic",
        text: `${sharePayload.referenceAr}\nوصل الإسلامية @waslofficiall`,
        files,
      });

      setFeedback({
        tone: "success",
        message:
          locale === "ar"
            ? "تمت مشاركة الصورة بنجاح"
            : "Image shared successfully",
      });
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      if (name === "AbortError") {
        setFeedback({
          tone: "info",
          message:
            locale === "ar" ? "تم إلغاء المشاركة." : "Share cancelled.",
        });
      } else {
        setFeedback({
          tone: "error",
          message:
            locale === "ar"
              ? "تعذرت مشاركة الملف على هذا الجهاز. يمكنك تنزيل الصورة ومشاركتها."
              : "Could not share file on this device. Please download the PNG instead.",
        });
      }
    } finally {
      setBusyAction(null);
    }
  };

  const handleCopyImage = async () => {
    if (!capabilities.clipboardImage || !activeSlide) return;
    setBusyAction("copy-image");
    setFeedback(null);
    try {
      await navigator.clipboard.write([
        new window.ClipboardItem({ "image/png": activeSlide.blob }),
      ]);
      setFeedback({
        tone: "success",
        message:
          locale === "ar"
            ? "تم نسخ الصورة إلى الحافظة بنجاح"
            : "Image copied to clipboard",
      });
    } catch {
      setFeedback({
        tone: "error",
        message:
          locale === "ar"
            ? "لم يسمح المتصفح بنسخ الصورة للحافظة. استخدم زر التنزيل."
            : "Browser blocked image clipboard access. Use Download PNG instead.",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleCopyText = async () => {
    setBusyAction("copy-text");
    setFeedback(null);
    const ok = await copyTextWithFallback(formattedText);
    setBusyAction(null);
    if (ok) {
      setFeedback({
        tone: "success",
        message:
          locale === "ar"
            ? "تم نسخ النص الكامل مع المرجع والرابط"
            : "Formatted text & reference copied to clipboard",
      });
    } else {
      setFeedback({
        tone: "error",
        message:
          locale === "ar"
            ? "تعذر النسخ التلقائي. يمكنك تحديد النص ونسخه يدوياً."
            : "Automatic copy blocked. Please select and copy the text manually.",
      });
    }
  };

  const handleCopyUrl = async () => {
    setBusyAction("copy-url");
    setFeedback(null);
    const ok = await copyTextWithFallback(canonicalUrl);
    setBusyAction(null);
    if (ok) {
      setFeedback({
        tone: "success",
        message:
          locale === "ar"
            ? "تم نسخ رابط المصدر بنجاح"
            : "Source link copied to clipboard",
      });
    } else {
      setFeedback({
        tone: "error",
        message:
          locale === "ar"
            ? "تعذر نسخ الرابط في هذا المتصفح."
            : "Could not copy link in this browser.",
      });
    }
  };

  const handleShareTextNative = async () => {
    if (!capabilities.nativeShareText) return;
    setBusyAction("share-text");
    setFeedback(null);
    try {
      await navigator.share({
        title: "وصل الإسلامية — Wasl Islamic",
        text: formattedText,
        url: canonicalUrl,
      });
      setFeedback({
        tone: "success",
        message:
          locale === "ar"
            ? "تمت مشاركة النص بنجاح"
            : "Text shared successfully",
      });
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      if (name === "AbortError") {
        setFeedback({
          tone: "info",
          message:
            locale === "ar" ? "تم إلغاء المشاركة." : "Share cancelled.",
        });
      } else {
        setFeedback({
          tone: "error",
          message:
            locale === "ar"
              ? "تعذرت المشاركة عبر النظام. يمكنك نسخ النص بدلاً من ذلك."
              : "Native share failed. Please use Copy Text instead.",
        });
      }
    } finally {
      setBusyAction(null);
    }
  };

  const kindLabel =
    KIND_LABELS[sharePayload.kind][locale === "en" ? "en" : "ar"];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeShareCard}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label={locale === "ar" ? "مشاركة المحتوى" : "Share Islamic Content"}
      >
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="wasl-surface relative w-full max-w-4xl rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 max-h-[92dvh] overflow-y-auto shadow-2xl"
        >
          {/* Mobile bottom-sheet handle */}
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[var(--border-strong)] sm:hidden" />

          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3.5 mb-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-gold-soft)] text-[var(--brand-gold)]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold truncate">
                  {locale === "ar" ? "مشاركة المحتوى" : "Share Content"}
                </h2>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {kindLabel}
                  {sharePayload.referenceAr ? ` • ${sharePayload.referenceAr}` : ""}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeShareCard}
              aria-label={locale === "ar" ? "إغلاق" : "Close"}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-alt)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mode Switcher Tabs: Image vs Text */}
          <div
            role="tablist"
            aria-label={locale === "ar" ? "طريقة المشاركة" : "Sharing Mode"}
            className="grid grid-cols-2 gap-2 rounded-2xl bg-[var(--bg-surface-alt)] p-1.5 border border-[var(--border-subtle)] mb-5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "image"}
              onClick={() => {
                setActiveTab("image");
                setFeedback(null);
              }}
              className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === "image"
                  ? "bg-[var(--bg-surface)] text-[var(--brand-emerald)] shadow-sm border border-[var(--border-subtle)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              <span>{locale === "ar" ? "مشاركة كصورة" : "Share as Image"}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "text"}
              onClick={() => {
                setActiveTab("text");
                setFeedback(null);
              }}
              className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === "text"
                  ? "bg-[var(--bg-surface)] text-[var(--brand-emerald)] shadow-sm border border-[var(--border-subtle)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>{locale === "ar" ? "مشاركة كنص" : "Share as Text"}</span>
            </button>
          </div>

          {activeTab === "image" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Real PNG Image Preview */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center bg-[var(--bg-surface-alt)] rounded-2xl p-4 sm:p-5 border border-[var(--border-subtle)] min-h-[320px]">
                {rendering && !activeSlide ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-sm text-[var(--text-muted)]">
                    <Loader2 className="h-7 w-7 animate-spin text-[var(--brand-emerald)]" />
                    <span>
                      {locale === "ar"
                        ? "جاري تصميم البطاقة عالية الدقة..."
                        : "Rendering high-resolution PNG..."}
                    </span>
                  </div>
                ) : renderError ? (
                  <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-red-500">
                    <AlertCircle className="h-7 w-7" />
                    <p>{renderError}</p>
                  </div>
                ) : activeSlide ? (
                  <div className="w-full space-y-3">
                    <div className="relative flex justify-center">
                      <img
                        src={activeSlide.objectUrl}
                        alt={
                          locale === "ar"
                            ? "معاينة بطاقة المشاركة"
                            : "Share card PNG preview"
                        }
                        className="max-h-[440px] w-auto rounded-2xl shadow-xl object-contain border border-[var(--border-subtle)]"
                      />
                      {rendering ? (
                        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/25 backdrop-blur-[1px]">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      ) : null}
                    </div>

                    {slides.length > 1 ? (
                      <div className="flex items-center justify-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveSlideIndex((i) => Math.max(0, i - 1))
                          }
                          disabled={activeSlideIndex === 0}
                          aria-label={
                            locale === "ar" ? "الشريحة السابقة" : "Previous slide"
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] disabled:opacity-40"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <span className="text-xs font-mono font-semibold text-[var(--text-secondary)]">
                          {activeSlide.pageNumber} / {activeSlide.totalPages}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveSlideIndex((i) =>
                              Math.min(slides.length - 1, i + 1)
                            )
                          }
                          disabled={activeSlideIndex === slides.length - 1}
                          aria-label={
                            locale === "ar" ? "الشريحة التالية" : "Next slide"
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] disabled:opacity-40"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {/* Image Controls */}
              <div className="lg:col-span-5 space-y-5">
                {/* 5 Official Templates */}
                <div>
                  <p className="text-sm font-semibold mb-2.5">
                    {locale === "ar" ? "قوالب وصل الرسمية" : "Card Templates"}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
                    {(Object.keys(SHARE_TEMPLATES) as ShareTemplateId[]).map(
                      (key) => {
                        const tpl = SHARE_TEMPLATES[key];
                        const selected = templateId === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setTemplateId(key)}
                            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all min-h-[44px] ${
                              selected
                                ? "border-[var(--brand-gold)] bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)] font-semibold"
                                : "border-[var(--border-subtle)] hover:bg-[var(--bg-surface-alt)]"
                            }`}
                          >
                            <span
                              className="h-5 w-5 shrink-0 rounded-full border border-white/25 shadow-inner"
                              style={{ background: tpl.swatchGradient }}
                            />
                            <span className="truncate">
                              {locale === "ar" ? tpl.nameAr : tpl.nameEn}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div>
                  <p className="text-sm font-semibold mb-2">
                    {locale === "ar" ? "مقاس الصورة" : "Dimensions"}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRatio("square")}
                      className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                        ratio === "square"
                          ? "border-[var(--brand-gold)] bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)] font-semibold"
                          : "border-[var(--border-subtle)] hover:bg-[var(--bg-surface-alt)]"
                      }`}
                    >
                      {locale === "ar" ? "مربع (1:1)" : "Square (1:1)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRatio("portrait")}
                      className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                        ratio === "portrait"
                          ? "border-[var(--brand-gold)] bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)] font-semibold"
                          : "border-[var(--border-subtle)] hover:bg-[var(--bg-surface-alt)]"
                      }`}
                    >
                      {locale === "ar" ? "عمودي (ستوري)" : "Portrait (Story)"}
                    </button>
                  </div>
                </div>

                {sharePayload.englishText ? (
                  <label className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] px-4 py-3 cursor-pointer min-h-[44px]">
                    <span className="text-sm font-medium">
                      {locale === "ar"
                        ? "تضمين الترجمة الإنجليزية"
                        : "Include English translation"}
                    </span>
                    <input
                      type="checkbox"
                      checked={showEnglish}
                      onChange={(e) => setShowEnglish(e.target.checked)}
                      className="h-4 w-4 accent-[var(--brand-emerald)]"
                    />
                  </label>
                ) : null}

                {/* Image Action Buttons */}
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={
                      slides.length > 1
                        ? handleDownloadAllSlides
                        : handleDownloadImage
                    }
                    disabled={rendering || !activeSlide}
                    className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-emerald)] hover:bg-[var(--brand-emerald-strong)] text-white font-semibold py-3 px-4 transition-colors disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    <span>
                      {slides.length > 1
                        ? locale === "ar"
                          ? `تحميل جميع الصور (${slides.length} PNG)`
                          : `Download All (${slides.length} PNGs)`
                        : locale === "ar"
                          ? "تحميل الصورة (PNG)"
                          : "Download PNG Image"}
                    </span>
                  </button>

                  {capabilities.nativeShareFile ? (
                    <button
                      type="button"
                      onClick={handleShareImageNative}
                      disabled={
                        rendering || !activeSlide || busyAction === "share-image"
                      }
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--brand-gold)]/50 bg-[var(--brand-gold-soft)] hover:bg-[var(--brand-gold)]/20 font-semibold py-2.5 px-4 transition-colors text-sm disabled:opacity-50"
                    >
                      <Share2 className="h-4 w-4 text-[var(--brand-gold)]" />
                      <span>
                        {locale === "ar"
                          ? "مشاركة الصورة مباشرة"
                          : "Share Image via Device"}
                      </span>
                    </button>
                  ) : null}

                  {capabilities.clipboardImage ? (
                    <button
                      type="button"
                      onClick={handleCopyImage}
                      disabled={
                        rendering || !activeSlide || busyAction === "copy-image"
                      }
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] hover:bg-[var(--bg-surface-alt)] font-medium py-2.5 px-4 transition-colors text-sm disabled:opacity-50"
                    >
                      <Copy className="h-4 w-4" />
                      <span>
                        {locale === "ar" ? "نسخ الصورة" : "Copy Image"}
                      </span>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            /* Tab B: Share as Formatted Text */
            <div className="space-y-4">
              {sharePayload.englishText ? (
                <label className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] px-4 py-3 cursor-pointer min-h-[44px]">
                  <span className="text-sm font-medium">
                    {locale === "ar"
                      ? "تضمين الترجمة الإنجليزية في النص"
                      : "Include English translation in text"}
                  </span>
                  <input
                    type="checkbox"
                    checked={showEnglish}
                    onChange={(e) => setShowEnglish(e.target.checked)}
                    className="h-4 w-4 accent-[var(--brand-emerald)]"
                  />
                </label>
              ) : null}

              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] p-4 sm:p-5 max-h-[42dvh] overflow-y-auto">
                <pre
                  dir="rtl"
                  className="whitespace-pre-wrap break-words font-sans text-sm sm:text-base leading-relaxed text-[var(--text-primary)] select-all"
                >
                  {formattedText}
                </pre>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyText}
                  disabled={busyAction === "copy-text"}
                  className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-emerald)] hover:bg-[var(--brand-emerald-strong)] text-white font-semibold py-2.5 px-4 transition-colors text-sm"
                >
                  <Copy className="h-4 w-4" />
                  <span>
                    {locale === "ar" ? "نسخ النص كاملاً" : "Copy Full Text"}
                  </span>
                </button>

                {capabilities.nativeShareText ? (
                  <button
                    type="button"
                    onClick={handleShareTextNative}
                    disabled={busyAction === "share-text"}
                    className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--brand-gold)]/50 bg-[var(--brand-gold-soft)] hover:bg-[var(--brand-gold)]/20 font-semibold py-2.5 px-4 transition-colors text-sm"
                  >
                    <Share2 className="h-4 w-4 text-[var(--brand-gold)]" />
                    <span>
                      {locale === "ar"
                        ? "مشاركة عبر الجهاز"
                        : "Native Share"}
                    </span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={handleCopyUrl}
                  disabled={busyAction === "copy-url"}
                  className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] hover:bg-[var(--bg-surface-alt)] font-medium py-2.5 px-4 transition-colors text-sm"
                >
                  <Link2 className="h-4 w-4" />
                  <span>
                    {locale === "ar" ? "نسخ رابط المصدر" : "Copy Source URL"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Accurate Status Feedback */}
          {feedback ? (
            <div
              role="status"
              className={`mt-4 flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold ${
                feedback.tone === "success"
                  ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : feedback.tone === "error"
                    ? "border-red-500/35 bg-red-500/10 text-red-600 dark:text-red-400"
                    : "border-[var(--border-strong)] bg-[var(--bg-surface-alt)] text-[var(--text-secondary)]"
              }`}
            >
              {feedback.tone === "success" ? (
                <Check className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

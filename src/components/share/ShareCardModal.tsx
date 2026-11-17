/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link2,
  Loader2,
  Lock,
  MessageCircle,
  Moon,
  QrCode,
  Send,
  Share2,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { useWasl } from "@/components/providers/WaslProvider";
import { CopyImageSuccessToast } from "@/components/share/CopyImageSuccessToast";
import {
  buildCanonicalShareUrl,
  buildSocialShareLinks,
  formatShareText,
  KIND_LABELS,
} from "@/lib/share/formatShareText";
import {
  ARCHITECTURE_LABELS,
  renderShareCardSlides,
  resolveContentArchitecture,
  SHARE_TEMPLATES,
  type RenderedSlide,
  type ShareAppearance,
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
      const probe = new File(["wasl"], "probe.png", { type: "image/png" });
      nativeShareFile = nav.canShare({ files: [probe] });
    } catch {
      nativeShareFile = false;
    }
  }

  const clipboardImage =
    typeof navigator.clipboard?.write === "function" &&
    typeof window.ClipboardItem !== "undefined";

  return {
    nativeShareText,
    nativeShareFile,
    clipboardImage,
  };
}

const COPY_TOAST_DURATION_MS = 2600;

export function ShareCardModal() {
  const { sharePayload, closeShareCard, locale, resolvedTheme } = useWasl();

  const [copyToastVisible, setCopyToastVisible] = useState(false);
  const [copyToastKey, setCopyToastKey] = useState(0);
  const copyToastVisibleRef = useRef(false);
  const copyToastTimerRef = useRef<number | null>(null);

  const dismissCopyToast = useCallback(() => {
    if (copyToastTimerRef.current !== null) {
      window.clearTimeout(copyToastTimerRef.current);
      copyToastTimerRef.current = null;
    }
    copyToastVisibleRef.current = false;
    setCopyToastVisible(false);
  }, []);

  const triggerCopyImageSuccessToast = useCallback(() => {
    if (copyToastTimerRef.current !== null) {
      window.clearTimeout(copyToastTimerRef.current);
    }
    if (!copyToastVisibleRef.current) {
      copyToastVisibleRef.current = true;
      setCopyToastKey((prev) => prev + 1);
      setCopyToastVisible(true);
    }
    copyToastTimerRef.current = window.setTimeout(() => {
      copyToastTimerRef.current = null;
      copyToastVisibleRef.current = false;
      setCopyToastVisible(false);
    }, COPY_TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (copyToastTimerRef.current !== null) {
        window.clearTimeout(copyToastTimerRef.current);
      }
    };
  }, []);

  const modalKey = sharePayload
    ? `${sharePayload.kind}|${sharePayload.referenceAr}|${sharePayload.arabicText.slice(0, 48)}|${locale}`
    : "";

  return (
    <>
      {sharePayload ? (
        <ShareCardModalInner
          key={modalKey}
          sharePayload={sharePayload}
          closeShareCard={closeShareCard}
          locale={locale}
          resolvedTheme={resolvedTheme}
          onImageCopiedSuccess={triggerCopyImageSuccessToast}
        />
      ) : null}

      <CopyImageSuccessToast
        visible={copyToastVisible}
        instanceKey={copyToastKey}
        locale={locale}
        onDismiss={dismissCopyToast}
      />
    </>
  );
}

interface ShareCardModalInnerProps {
  sharePayload: NonNullable<ReturnType<typeof useWasl>["sharePayload"]>;
  closeShareCard: () => void;
  locale: "ar" | "en";
  resolvedTheme: "light" | "dark" | "night";
  onImageCopiedSuccess: () => void;
}

function ShareCardModalInner({
  sharePayload,
  closeShareCard,
  locale,
  resolvedTheme,
  onImageCopiedSuccess,
}: ShareCardModalInnerProps) {
  const reducedMotion = useReducedMotion();
  const architecture = useMemo(
    () => resolveContentArchitecture(sharePayload.kind),
    [sharePayload.kind]
  );
  const archMeta = ARCHITECTURE_LABELS[architecture];

  const [activeTab, setActiveTab] = useState<ShareTab>("image");
  const [templateId, setTemplateId] = useState<ShareTemplateId>(
    archMeta.defaultTemplate
  );
  const [appearance, setAppearance] = useState<ShareAppearance>(resolvedTheme);
  const [ratio, setRatio] = useState<ShareAspectRatio>("square");
  const [showLogo, setShowLogo] = useState(true);
  const [showQr, setShowQr] = useState(true);
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

  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
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

  // Initial focus + Escape key handler
  useEffect(() => {
    closeBtnRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeShareCard();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeShareCard]);

  const renderKey = `${templateId}|${appearance}|${ratio}|${showLogo ? 1 : 0}|${showQr ? 1 : 0}|${showEnglish ? 1 : 0}|${locale}|${sharePayload.kind}|${sharePayload.arabicText.length}|${sharePayload.referenceAr}`;
  const rendering = slidesState.key !== renderKey;
  const slides = slidesState.slides;
  const renderError = slidesState.key === renderKey ? slidesState.error : null;

  useEffect(() => {
    let cancelled = false;

    renderShareCardSlides({
      payload: sharePayload,
      templateId,
      appearance,
      ratio,
      includeEnglish: showEnglish,
      showLogo,
      showQr,
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
  }, [
    sharePayload,
    templateId,
    appearance,
    ratio,
    showLogo,
    showQr,
    showEnglish,
    locale,
    renderKey,
    revokeSlides,
  ]);

  // Clean up Blob URLs on unmount
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

  const socialLinks = useMemo(() => {
    return buildSocialShareLinks({
      payload: sharePayload,
      formattedText,
      canonicalUrl,
    });
  }, [sharePayload, formattedText, canonicalUrl]);

  const activeSlide = slides[activeSlideIndex] ?? null;

  const triggerDownloadSlide = (slide: RenderedSlide) => {
    const link = document.createElement("a");
    const suffix =
      slide.totalPages > 1 ? `-p${slide.pageNumber}of${slide.totalPages}` : "";
    link.download = `wasl-${sharePayload.kind}-${ratio}${suffix}-${Date.now()}.png`;
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
            ? "تم تنزيل الصورة عالية الدقة (PNG) بنجاح"
            : "High-resolution PNG image downloaded successfully",
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
    if (!capabilities.nativeShareFile || slides.length === 0) {
      handleDownloadImage();
      return;
    }
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
        triggerDownloadSlide(activeSlide!);
        setFeedback({
          tone: "info",
          message:
            locale === "ar"
              ? "مشاركة ملفات الصور غير مدعومة مباشرة؛ تم تنزيل الصورة لجهازك."
              : "Direct file share is not supported here; PNG downloaded as fallback.",
        });
        return;
      }

      await navigator.share({
        title: "وصل الإسلامية — Wasl Islamic",
        text: `${sharePayload.referenceAr}\n${canonicalUrl}`,
        files,
      });

      setFeedback({
        tone: "success",
        message:
          locale === "ar"
            ? "تمت مشاركة البطاقة المصورة بنجاح"
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
      onImageCopiedSuccess();
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
            ? "تم نسخ رابط المحتوى الموثق بنجاح"
            : "Canonical content URL copied to clipboard",
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
              ? "تعذرت المشاركة عبر النظام. يمكنك نسخ النص أو استخدام أزرار المنصات."
              : "Native share failed. Please copy text or use platform buttons.",
        });
      }
    } finally {
      setBusyAction(null);
    }
  };

  const kindLabel =
    KIND_LABELS[sharePayload.kind][locale === "en" ? "en" : "ar"];

  const hasMandatoryAttribution =
    sharePayload.kind === "verse" ||
    sharePayload.kind === "surah" ||
    sharePayload.kind === "hadith" ||
    sharePayload.kind === "tafsir";

  return (
    <AnimatePresence>
      <motion.div
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
        onClick={closeShareCard}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm sm:p-5 overflow-y-auto overflow-x-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wasl-share-dialog-title"
      >
        <motion.div
          dir={locale === "en" ? "ltr" : "rtl"}
          initial={
            reducedMotion ? { opacity: 1 } : { opacity: 0, y: 24, scale: 0.98 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={
            reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }
          }
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="wasl-surface relative w-full max-w-5xl rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 max-h-[94dvh] overflow-y-auto overflow-x-hidden shadow-2xl"
        >
          {/* Mobile bottom-sheet handle */}
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[var(--border-strong)] sm:hidden" />

          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3.5 mb-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-gold-soft)] text-[var(--brand-gold)]">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="wasl-share-dialog-title"
                    className="text-base sm:text-lg font-bold truncate"
                  >
                    {locale === "ar"
                      ? "مشاركة بطاقة وصل الإسلامية"
                      : "Share Content Card"}
                  </h2>
                  <span className="rounded-full bg-[var(--brand-emerald-soft)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--brand-emerald)]">
                    {locale === "ar" ? archMeta.ar : archMeta.en}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                  {kindLabel}
                  {sharePayload.referenceAr ? ` • ${sharePayload.referenceAr}` : ""}
                </p>
              </div>
            </div>

            <button
              ref={closeBtnRef}
              type="button"
              onClick={closeShareCard}
              aria-label={locale === "ar" ? "إغلاق نافذة المشاركة" : "Close Share Modal"}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-alt)] transition-colors cursor-pointer"
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
              className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "image"
                  ? "bg-[var(--bg-surface)] text-[var(--brand-emerald)] shadow-sm border border-[var(--border-subtle)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              <span>{locale === "ar" ? "بطاقة مصورة (PNG)" : "Share as Image"}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "text"}
              onClick={() => {
                setActiveTab("text");
                setFeedback(null);
              }}
              className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "text"
                  ? "bg-[var(--bg-surface)] text-[var(--brand-emerald)] shadow-sm border border-[var(--border-subtle)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>{locale === "ar" ? "نص منسّق وروابط" : "Share Text & Links"}</span>
            </button>
          </div>

          {activeTab === "image" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Live Rendered PNG Preview */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center bg-[var(--bg-surface-alt)] rounded-2xl p-4 sm:p-5 border border-[var(--border-subtle)] min-h-[340px]">
                {rendering && !activeSlide ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-sm text-[var(--text-muted)]">
                    <Loader2 className="h-7 w-7 animate-spin text-[var(--brand-emerald)]" />
                    <span>
                      {locale === "ar"
                        ? "جاري تصميم البطاقة بدقة عالية..."
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
                        className="max-h-[460px] w-auto rounded-2xl shadow-xl object-contain border border-[var(--border-subtle)]"
                      />
                      {rendering ? (
                        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/25 backdrop-blur-[1px]">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-muted)] px-1">
                      <span className="font-mono">
                        {activeSlide.width} × {activeSlide.height} px (PNG)
                      </span>
                      {slides.length > 1 ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveSlideIndex((i) => Math.max(0, i - 1))
                            }
                            disabled={activeSlideIndex === 0}
                            aria-label={
                              locale === "ar" ? "الشريحة السابقة" : "Previous slide"
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] disabled:opacity-40 cursor-pointer"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          <span className="font-mono font-semibold text-[var(--text-secondary)]">
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
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] disabled:opacity-40 cursor-pointer"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Live Customization & Actions Panel */}
              <div className="lg:col-span-6 space-y-4">
                {/* 1. Templates */}
                <div>
                  <p className="text-xs font-bold text-[var(--text-secondary)] mb-2">
                    {locale === "ar" ? "القوالب الرسمية" : "Card Templates"}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.keys(SHARE_TEMPLATES) as ShareTemplateId[]).map(
                      (key) => {
                        const tpl = SHARE_TEMPLATES[key];
                        const selected = templateId === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setTemplateId(key);
                              setAppearance(tpl.isDarkSurface ? "night" : "light");
                            }}
                            className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-xs font-medium transition-all min-h-[42px] cursor-pointer ${
                              selected
                                ? "border-[var(--brand-gold)] bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)] font-semibold"
                                : "border-[var(--border-subtle)] hover:bg-[var(--bg-surface-alt)]"
                            }`}
                          >
                            <span
                              className="h-4 w-4 shrink-0 rounded-full border border-white/25 shadow-inner"
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

                {/* 2. Appearance (Light / Dark / Night) */}
                <div>
                  <p className="text-xs font-bold text-[var(--text-secondary)] mb-2">
                    {locale === "ar" ? "مظهر البطاقة" : "Card Appearance"}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        {
                          id: "light" as const,
                          ar: "نهاري",
                          en: "Light",
                          icon: <Sun className="h-3.5 w-3.5 text-amber-500" />,
                        },
                        {
                          id: "dark" as const,
                          ar: "داكن",
                          en: "Dark",
                          icon: <Moon className="h-3.5 w-3.5" />,
                        },
                        {
                          id: "night" as const,
                          ar: "ليلي فاخر",
                          en: "Night",
                          icon: <Sparkles className="h-3.5 w-3.5 text-[var(--brand-gold)]" />,
                        },
                      ]
                    ).map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setAppearance(mode.id)}
                        className={`inline-flex items-center justify-center gap-1.5 min-h-[40px] rounded-xl border px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                          appearance === mode.id
                            ? "border-[var(--brand-gold)] bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)] font-semibold"
                            : "border-[var(--border-subtle)] hover:bg-[var(--bg-surface-alt)]"
                        }`}
                      >
                        {mode.icon}
                        <span>{locale === "ar" ? mode.ar : mode.en}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Dimensions: Square (1:1) vs Story (9:16) */}
                <div>
                  <p className="text-xs font-bold text-[var(--text-secondary)] mb-2">
                    {locale === "ar" ? "مقاس التصدير" : "Export Format"}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRatio("square")}
                      className={`min-h-[42px] rounded-xl border px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                        ratio === "square"
                          ? "border-[var(--brand-gold)] bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)] font-semibold"
                          : "border-[var(--border-subtle)] hover:bg-[var(--bg-surface-alt)]"
                      }`}
                    >
                      {locale === "ar" ? "منشور مربع (1:1)" : "Square Post (1:1)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRatio("story")}
                      className={`min-h-[42px] rounded-xl border px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                        ratio === "story" || ratio === "portrait"
                          ? "border-[var(--brand-gold)] bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)] font-semibold"
                          : "border-[var(--border-subtle)] hover:bg-[var(--bg-surface-alt)]"
                      }`}
                    >
                      {locale === "ar" ? "ستوري عمودي (9:16)" : "Vertical Story (9:16)"}
                    </button>
                  </div>
                </div>

                {/* 4. Custom Toggles (Logo / QR / Translation) */}
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] px-3 py-2.5 cursor-pointer min-h-[42px]">
                    <span className="text-xs font-medium">
                      {locale === "ar" ? "شعار وصل" : "Show Logo"}
                    </span>
                    <input
                      type="checkbox"
                      checked={showLogo}
                      onChange={(e) => setShowLogo(e.target.checked)}
                      className="h-4 w-4 accent-[var(--brand-emerald)]"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] px-3 py-2.5 cursor-pointer min-h-[42px]">
                    <span className="text-xs font-medium inline-flex items-center gap-1">
                      <QrCode className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
                      {locale === "ar" ? "رمز QR" : "QR Code"}
                    </span>
                    <input
                      type="checkbox"
                      checked={showQr}
                      onChange={(e) => setShowQr(e.target.checked)}
                      className="h-4 w-4 accent-[var(--brand-emerald)]"
                    />
                  </label>
                </div>

                {sharePayload.englishText ? (
                  <label className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] px-3.5 py-2.5 cursor-pointer min-h-[42px]">
                    <span className="text-xs font-medium">
                      {locale === "ar"
                        ? "تضمين الترجمة الموثقة"
                        : "Include Verified Translation"}
                    </span>
                    <input
                      type="checkbox"
                      checked={showEnglish}
                      onChange={(e) => setShowEnglish(e.target.checked)}
                      className="h-4 w-4 accent-[var(--brand-emerald)]"
                    />
                  </label>
                ) : null}

                {hasMandatoryAttribution && (
                  <div className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/60 px-3 py-2 text-[11px] text-[var(--text-muted)]">
                    <Lock className="h-3.5 w-3.5 shrink-0 text-[var(--brand-gold)]" />
                    <span>
                      {locale === "ar"
                        ? "المرجع الشرعي والمصدر ثابتان ولا يمكن إخفاؤهما حفاظاً على توثيق النص."
                        : "Verified Quranic/Hadith attribution is protected and always preserved."}
                    </span>
                  </div>
                )}

                {/* 5. Primary Export & Share Buttons */}
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={
                        slides.length > 1
                          ? handleDownloadAllSlides
                          : handleDownloadImage
                      }
                      disabled={rendering || !activeSlide}
                      className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-emerald)] hover:bg-[var(--brand-emerald-strong)] text-white text-xs sm:text-sm font-semibold py-2.5 px-4 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>
                        {slides.length > 1
                          ? locale === "ar"
                            ? `تنزيل (${slides.length} PNG)`
                            : `Download (${slides.length} PNG)`
                          : locale === "ar"
                            ? "تنزيل الصورة (PNG)"
                            : "Download PNG"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareImageNative}
                      disabled={
                        rendering || !activeSlide || busyAction === "share-image"
                      }
                      className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--brand-gold)]/50 bg-[var(--brand-gold-soft)] hover:bg-[var(--brand-gold)]/20 text-xs sm:text-sm font-semibold py-2.5 px-4 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Share2 className="h-4 w-4 text-[var(--brand-gold)]" />
                      <span>
                        {capabilities.nativeShareFile
                          ? locale === "ar"
                            ? "مشاركة عبر الجهاز"
                            : "Share Image"
                          : locale === "ar"
                            ? "تنزيل للمشاركة"
                            : "Save to Share"}
                      </span>
                    </button>
                  </div>

                  {capabilities.clipboardImage ? (
                    <button
                      type="button"
                      onClick={handleCopyImage}
                      disabled={
                        rendering || !activeSlide || busyAction === "copy-image"
                      }
                      className="w-full min-h-[40px] inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] hover:bg-[var(--bg-surface-alt)] font-medium py-2 px-4 transition-colors text-xs cursor-pointer disabled:opacity-50"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>
                        {locale === "ar" ? "نسخ الصورة للحافظة" : "Copy Image"}
                      </span>
                    </button>
                  ) : null}

                  {/* Direct Social Share Row */}
                  <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
                    <p className="text-[11px] font-semibold text-[var(--text-muted)]">
                      {locale === "ar"
                        ? "مشاركة النص والرابط الموثق مباشرة:"
                        : "Share verified text & link via:"}
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      <a
                        href={socialLinks.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>{locale === "ar" ? "واتساب" : "WhatsApp"}</span>
                      </a>
                      <a
                        href={socialLinks.telegramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-500/35 bg-sky-500/10 px-2.5 py-2 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-500/20 transition-colors"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>{locale === "ar" ? "تيليجرام" : "Telegram"}</span>
                      </a>
                      <a
                        href={socialLinks.xUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 py-2 text-xs font-semibold hover:bg-[var(--bg-surface-alt)] transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>إكس (X)</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyText}
                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-2 text-xs font-medium hover:bg-[var(--bg-surface-alt)] cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>{locale === "ar" ? "نسخ النص" : "Copy Text"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyUrl}
                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-2 text-xs font-medium hover:bg-[var(--bg-surface-alt)] cursor-pointer"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        <span>{locale === "ar" ? "الرابط" : "Copy Link"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Tab B: Share Formatted Text & Direct Platforms */
            <div className="space-y-4">
              {sharePayload.englishText ? (
                <label className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] px-4 py-3 cursor-pointer min-h-[44px]">
                  <span className="text-sm font-medium">
                    {locale === "ar"
                      ? "تضمين الترجمة الموثقة في النص"
                      : "Include verified translation in text"}
                  </span>
                  <input
                    type="checkbox"
                    checked={showEnglish}
                    onChange={(e) => setShowEnglish(e.target.checked)}
                    className="h-4 w-4 accent-[var(--brand-emerald)]"
                  />
                </label>
              ) : null}

              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] p-4 sm:p-5 max-h-[38dvh] overflow-y-auto">
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
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-emerald)] hover:bg-[var(--brand-emerald-strong)] text-white font-semibold py-2.5 px-4 transition-colors text-sm cursor-pointer"
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
                    className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--brand-gold)]/50 bg-[var(--brand-gold-soft)] hover:bg-[var(--brand-gold)]/20 font-semibold py-2.5 px-4 transition-colors text-sm cursor-pointer"
                  >
                    <Share2 className="h-4 w-4 text-[var(--brand-gold)]" />
                    <span>
                      {locale === "ar" ? "مشاركة عبر الجهاز" : "Native Share"}
                    </span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={handleCopyUrl}
                  disabled={busyAction === "copy-url"}
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] hover:bg-[var(--bg-surface-alt)] font-medium py-2.5 px-4 transition-colors text-sm cursor-pointer"
                >
                  <Link2 className="h-4 w-4" />
                  <span>
                    {locale === "ar" ? "نسخ رابط المحتوى" : "Copy Link"}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <a
                  href={socialLinks.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[42px] inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{locale === "ar" ? "مشاركة واتساب" : "WhatsApp"}</span>
                </a>
                <a
                  href={socialLinks.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[42px] inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/35 bg-sky-500/10 px-3 py-2 text-xs sm:text-sm font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-500/20"
                >
                  <Send className="h-4 w-4" />
                  <span>{locale === "ar" ? "مشاركة تيليجرام" : "Telegram"}</span>
                </a>
                <a
                  href={socialLinks.xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[42px] inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-xs sm:text-sm font-semibold hover:bg-[var(--bg-surface-alt)]"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>{locale === "ar" ? "مشاركة إكس (X)" : "Share on X"}</span>
                </a>
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

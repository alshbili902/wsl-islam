"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bookmark,
  Check,
  Copy,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import { useWasl } from "@/components/providers/WaslProvider";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageShell } from "@/components/ui/MotionPrimitives";
import { GeometricLattice } from "@/components/brand/IslamicVisuals";
import { WaslShare } from "@/components/share/WaslShare";
import { ADHKAR_CATEGORIES, ALL_ADHKAR } from "@/data/adhkar";
import type { AdhkarCategoryId, DhikrItem } from "@/types/islamic";

const ADHKAR_COUNTS_KEY = "wasl-adhkar-daily-counts-v1";

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

export function AdhkarClient() {
  const { locale, isBookmarked, toggleBookmark } = useWasl();
  const searchParams = useSearchParams();

  const paramCat = searchParams.get("cat") as AdhkarCategoryId | null;
  const initialCategory: AdhkarCategoryId = useMemo(() => {
    if (paramCat && ADHKAR_CATEGORIES.some((c) => c.id === paramCat)) {
      return paramCat;
    }
    return "morning";
  }, [paramCat]);

  const [activeCategory, setActiveCategory] =
    useState<AdhkarCategoryId>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (paramCat && ADHKAR_CATEGORIES.some((c) => c.id === paramCat)) {
      const id = window.setTimeout(() => setActiveCategory(paramCat), 0);
      return () => window.clearTimeout(id);
    }
  }, [paramCat]);

  // Hydrate today's local counter state
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(ADHKAR_COUNTS_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as {
          date: string;
          counts: Record<string, number>;
        };
        if (parsed.date === getTodayKey() && parsed.counts) {
          setCounts(parsed.counts);
        }
      } catch {
        // Ignore storage parse error
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const persistCounts = (next: Record<string, number>) => {
    try {
      localStorage.setItem(
        ADHKAR_COUNTS_KEY,
        JSON.stringify({ date: getTodayKey(), counts: next })
      );
    } catch {
      // Storage unavailable
    }
  };

  const handleIncrement = (item: DhikrItem) => {
    setCounts((prev) => {
      const current = prev[item.id] ?? 0;
      if (current >= item.repeatCount) return prev;
      const next = { ...prev, [item.id]: current + 1 };
      persistCounts(next);
      return next;
    });
  };

  const handleResetItem = (id: string) => {
    setCounts((prev) => {
      const next = { ...prev };
      delete next[id];
      persistCounts(next);
      return next;
    });
  };

  const categoryMeta = useMemo(
    () =>
      ADHKAR_CATEGORIES.find((c) => c.id === activeCategory) ??
      ADHKAR_CATEGORIES[0],
    [activeCategory]
  );

  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return ALL_ADHKAR.filter(
        (d) =>
          d.arabicText.includes(searchQuery.trim()) ||
          d.englishTranslation.toLowerCase().includes(q) ||
          d.referenceAr.toLowerCase().includes(q) ||
          d.referenceEn.toLowerCase().includes(q)
      );
    }
    return ALL_ADHKAR.filter((d) => d.category === activeCategory);
  }, [activeCategory, searchQuery]);

  const categoryProgress = useMemo(() => {
    const inCat = ALL_ADHKAR.filter((d) => d.category === activeCategory);
    const completed = inCat.filter(
      (d) => (counts[d.id] ?? 0) >= d.repeatCount
    ).length;
    return {
      total: inCat.length,
      completed,
      pct: inCat.length > 0 ? Math.round((completed / inCat.length) * 100) : 0,
    };
  }, [activeCategory, counts]);

  const handleResetCategory = () => {
    const idsInCategory = new Set(
      ALL_ADHKAR.filter((d) => d.category === activeCategory).map((d) => d.id)
    );
    setCounts((prev) => {
      const next: Record<string, number> = {};
      for (const [k, v] of Object.entries(prev)) {
        if (!idsInCategory.has(k)) next[k] = v;
      }
      persistCounts(next);
      return next;
    });
  };

  const handleCopy = async (item: DhikrItem) => {
    const text =
      locale === "ar"
        ? `${item.arabicText}\n\n[${item.referenceAr}]`
        : `${item.arabicText}\n\n${item.englishTranslation}\n\n[${item.referenceEn}]`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(item.id);
      window.setTimeout(() => {
        setCopiedId((curr) => (curr === item.id ? null : curr));
      }, 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <PageShell className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { labelAr: "الأذكار والأدعية", labelEn: "Adhkar & Supplications" },
        ]}
      />

      {/* Hero Header */}
      <section className="wasl-surface relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-6 shadow-sm">
        <GeometricLattice className="opacity-[0.04]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--wasl-border)] bg-[var(--wasl-bg)]/80 px-3 py-1 text-xs font-medium text-[var(--wasl-primary)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--wasl-accent)]" />
              <span>
                {locale === "ar"
                  ? "مأثورات صحيحة بأسانيدها وتكرارها المشروع"
                  : "Authenticated Remembrances & Quranic Supplications"}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[var(--wasl-text)] sm:text-4xl">
              {locale === "ar"
                ? "حصن المسلم: الأذكار والأدعية"
                : "Daily Adhkar & Supplications"}
            </h1>
            <p className="text-sm leading-relaxed text-[var(--wasl-text-muted)]">
              {locale === "ar"
                ? categoryMeta.descriptionAr
                : categoryMeta.descriptionEn}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:min-w-[290px]">
            {/* Search Box */}
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-3.5 h-4 w-4 text-[var(--wasl-text-muted)]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  locale === "ar"
                    ? "ابحث في جميع الأذكار والأدعية..."
                    : "Search across all adhkar & duas..."
                }
                className="w-full rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] py-2.5 ps-10 pe-4 text-sm text-[var(--wasl-text)] placeholder:text-[var(--wasl-text-muted)] focus:border-[var(--wasl-primary)] focus:outline-none"
              />
            </div>

            {/* Category Progress Summary */}
            {!searchQuery.trim() && (
              <div className="rounded-2xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)]/80 p-3.5">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-[var(--wasl-text)]">
                    {locale === "ar" ? categoryMeta.nameAr : categoryMeta.nameEn}
                  </span>
                  <span className="font-mono font-bold text-[var(--wasl-primary)]">
                    {categoryProgress.completed} / {categoryProgress.total}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--wasl-border)]">
                  <div
                    className="h-full rounded-full bg-[var(--wasl-primary)] transition-all duration-300"
                    style={{ width: `${categoryProgress.pct}%` }}
                  />
                </div>
                {categoryProgress.completed > 0 && (
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleResetCategory}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--wasl-text-muted)] hover:text-[var(--wasl-primary)]"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>
                        {locale === "ar"
                          ? "تصفير عداد هذا القسم"
                          : "Reset section progress"}
                      </span>
                    </button>

                    <WaslShare
                      variant="pill"
                      label={locale === "ar" ? "مشاركة الإنجاز" : "Share Progress"}
                      payload={{
                        kind: "tasbih",
                        titleAr: `إنجاز ${categoryMeta.nameAr}`,
                        titleEn: `${categoryMeta.nameEn} Progress`,
                        arabicText: `أتممت بفضل الله ${categoryProgress.completed} من أصل ${categoryProgress.total} في ${categoryMeta.nameAr} (${categoryProgress.pct}٪). سبحان الله وبحمده، سبحان الله العظيم.`,
                        englishText: `Completed ${categoryProgress.completed} of ${categoryProgress.total} in ${categoryMeta.nameEn} (${categoryProgress.pct}%).`,
                        referenceAr: `${categoryMeta.nameAr} — وصل الإسلامية`,
                        referenceEn: `${categoryMeta.nameEn} — Wasl Islamic`,
                        shareUrl: `/adhkar?cat=${activeCategory}`,
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 9 Category Tabs */}
      {!searchQuery.trim() && (
        <div
          role="tablist"
          aria-label={locale === "ar" ? "تصنيفات الأذكار" : "Adhkar categories"}
          className="mb-8 flex flex-wrap gap-2"
        >
          {ADHKAR_CATEGORIES.map((cat) => {
            const active = cat.id === activeCategory;
            const catItems = ALL_ADHKAR.filter((d) => d.category === cat.id);
            const doneCount = catItems.filter(
              (d) => (counts[d.id] ?? 0) >= d.repeatCount
            ).length;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs sm:text-sm font-semibold transition ${
                  active
                    ? "border-[var(--wasl-primary)] bg-[var(--wasl-primary)] text-white shadow-sm"
                    : "border-[var(--wasl-border)] bg-[var(--wasl-surface)] text-[var(--wasl-text)] hover:border-[var(--wasl-primary)]/50"
                }`}
              >
                <span>{locale === "ar" ? cat.nameAr : cat.nameEn}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-[var(--wasl-bg)] text-[var(--wasl-text-muted)]"
                  }`}
                >
                  {doneCount}/{catItems.length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Dhikr Cards Grid */}
      {visibleItems.length === 0 ? (
        <div className="wasl-surface rounded-3xl p-10 text-center">
          <p className="text-sm text-[var(--wasl-text-muted)]">
            {locale === "ar"
              ? "لم يتم العثور على أذكار مطابقة لعبارة البحث."
              : "No matching supplications were found for your search."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {visibleItems.map((item) => {
            const currentCount = counts[item.id] ?? 0;
            const isCompleted = currentCount >= item.repeatCount;
            const bookmarkId = `dhikr:${item.id}`;
            const saved = isBookmarked(bookmarkId);
            const catLabel = ADHKAR_CATEGORIES.find((c) => c.id === item.category);

            return (
              <article
                key={item.id}
                className={`rounded-3xl border p-5 sm:p-7 transition-all ${
                  isCompleted
                    ? "border-emerald-500/40 bg-emerald-500/[0.04]"
                    : "wasl-reading-surface border-[var(--wasl-border)]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[var(--wasl-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--wasl-primary)]">
                      {locale === "ar" ? catLabel?.nameAr : catLabel?.nameEn}
                    </span>
                    <span className="rounded-full border border-[var(--wasl-border)] px-3 py-1 text-xs font-medium text-[var(--wasl-text-muted)]">
                      {locale === "ar"
                        ? `التكرار: ${item.repeatCount}`
                        : `Repeat: ${item.repeatCount}×`}
                    </span>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(item)}
                      aria-label={locale === "ar" ? "نسخ الذكر" : "Copy dhikr"}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-3 py-1.5 text-xs font-medium text-[var(--wasl-text-muted)] hover:text-[var(--wasl-text)] transition"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-emerald-500">
                            {locale === "ar" ? "نُسخ" : "Copied"}
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">
                            {locale === "ar" ? "نسخ" : "Copy"}
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleBookmark({
                          id: bookmarkId,
                          type: "dhikr",
                          titleAr: catLabel?.nameAr ?? "ذكر مأثور",
                          titleEn: catLabel?.nameEn ?? "Supplication",
                          arabicText: item.arabicText,
                          englishText: item.englishTranslation,
                          referenceAr: item.referenceAr,
                          referenceEn: item.referenceEn,
                          url: `/adhkar?cat=${item.category}`,
                        })
                      }
                      aria-label={
                        locale === "ar" ? "حفظ في المفضلة" : "Toggle bookmark"
                      }
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                        saved
                          ? "border-[var(--wasl-accent)] bg-[var(--wasl-accent)]/15 text-[var(--wasl-accent-strong)]"
                          : "border-[var(--wasl-border)] bg-[var(--wasl-bg)] text-[var(--wasl-text-muted)] hover:text-[var(--wasl-text)]"
                      }`}
                    >
                      <Bookmark
                        className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`}
                      />
                      <span className="hidden sm:inline">
                        {locale === "ar" ? (saved ? "محفوظ" : "حفظ") : saved ? "Saved" : "Save"}
                      </span>
                    </button>

                    <WaslShare
                      variant="pill"
                      label={locale === "ar" ? "مشاركة" : "Share"}
                      payload={{
                        kind:
                          item.category === "quranic"
                            ? "dua"
                            : item.category === "morning" || item.category === "evening"
                              ? "adhkar"
                              : "dhikr",
                        titleAr: catLabel?.nameAr,
                        titleEn: catLabel?.nameEn,
                        arabicText: item.arabicText,
                        englishText: item.englishTranslation,
                        referenceAr: item.referenceAr,
                        referenceEn: item.referenceEn,
                        repeatCount: item.repeatCount,
                        shareUrl: `/adhkar?cat=${item.category}`,
                      }}
                    />
                  </div>
                </div>

                {/* Arabic Supplication */}
                <p
                  dir="rtl"
                  lang="ar"
                  className="font-arabic wasl-reading-body text-xl sm:text-2xl leading-[2.05]"
                >
                  {item.arabicText}
                </p>

                {/* English Translation */}
                <p
                  dir="ltr"
                  lang="en"
                  className={`mt-4 text-sm leading-relaxed text-[var(--wasl-text-muted)] ${
                    locale === "ar" ? "border-t border-[var(--wasl-border)]/70 pt-3" : ""
                  }`}
                >
                  {item.englishTranslation}
                </p>

                {/* Virtue / Note if present */}
                {(item.virtueAr || item.virtueEn) && (
                  <p className="mt-3 rounded-xl bg-[var(--wasl-bg)]/75 px-3.5 py-2.5 text-xs leading-relaxed text-[var(--wasl-text-muted)]">
                    {locale === "ar" ? item.virtueAr : item.virtueEn}
                  </p>
                )}

                {/* Bottom Footer: Reference + Interactive Repetition Counter */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--wasl-border)] pt-4">
                  <p className="text-xs font-medium text-[var(--wasl-primary)]">
                    {locale === "ar" ? item.referenceAr : item.referenceEn}
                  </p>

                  <div className="flex items-center gap-2">
                    {currentCount > 0 && (
                      <button
                        type="button"
                        onClick={() => handleResetItem(item.id)}
                        aria-label={locale === "ar" ? "إعادة العداد" : "Reset counter"}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] text-[var(--wasl-text-muted)] hover:text-[var(--wasl-text)] transition"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleIncrement(item)}
                      disabled={isCompleted}
                      className={`inline-flex min-w-[130px] items-center justify-center gap-2.5 rounded-2xl px-5 py-2.5 text-sm font-bold transition active:scale-[0.98] ${
                        isCompleted
                          ? "bg-emerald-600 text-white cursor-default"
                          : "bg-[var(--wasl-primary)] text-white hover:bg-[var(--wasl-primary-hover)] shadow-sm"
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>{locale === "ar" ? "اكتمل" : "Done"}</span>
                        </>
                      ) : (
                        <span>
                          {locale === "ar" ? "تسبيح" : "Count"}
                        </span>
                      )}
                      <span dir="ltr" className="font-mono text-xs opacity-90">
                        {currentCount}/{item.repeatCount}
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}

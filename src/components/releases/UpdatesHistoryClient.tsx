"use client";

import React, { useMemo, useState } from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  GitCommitHorizontal,
  History,
  Palette,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useWasl } from "@/components/providers/WaslProvider";
import { RELEASE_CATEGORY_META } from "@/lib/releases/schema";
import type { PlatformRelease, ReleaseCategoryId } from "@/types/islamic";

function getCategoryIcon(category: ReleaseCategoryId) {
  switch (category) {
    case "new_feature":
      return <Sparkles className="h-3.5 w-3.5" />;
    case "improvement":
      return <TrendingUp className="h-3.5 w-3.5" />;
    case "bug_fix":
      return <Wrench className="h-3.5 w-3.5" />;
    case "performance":
      return <Zap className="h-3.5 w-3.5" />;
    case "security":
      return <ShieldCheck className="h-3.5 w-3.5" />;
    case "ui_ux":
      return <Palette className="h-3.5 w-3.5" />;
    case "content":
      return <BookOpen className="h-3.5 w-3.5" />;
    default:
      return <Sparkles className="h-3.5 w-3.5" />;
  }
}

const FILTER_CATEGORIES: Array<ReleaseCategoryId | "all"> = [
  "all",
  "new_feature",
  "improvement",
  "bug_fix",
  "performance",
  "security",
];

export function UpdatesHistoryClient({
  initialReleases,
}: {
  initialReleases: PlatformRelease[];
}) {
  const { locale } = useWasl();
  const isEn = locale === "en";
  const [selectedCategory, setSelectedCategory] = useState<
    ReleaseCategoryId | "all"
  >("all");

  const filteredReleases = useMemo(() => {
    if (selectedCategory === "all") return initialReleases;
    return initialReleases.filter((rel) =>
      rel.categories.some((cat) => cat.category === selectedCategory)
    );
  }, [initialReleases, selectedCategory]);

  const formatReleaseDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(isEn ? "en-US" : "ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    } catch {
      return iso.slice(0, 10);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-10 space-y-7">
      <Breadcrumbs
        items={[
          {
            labelAr: "سجل التحديثات والإصدارات",
            labelEn: "Updates & Changelog",
          },
        ]}
      />

      {/* Header */}
      <header className="wasl-surface rounded-3xl border border-[var(--border-subtle)] p-6 sm:p-8 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-emerald-soft)] px-3.5 py-1 text-xs font-semibold text-[var(--brand-emerald)]">
          <History className="h-3.5 w-3.5" />
          <span>
            {isEn
              ? "Verified Production Release History"
              : "السجل الموثق لتحديثات الإنتاج"}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          {isEn
            ? "Platform Updates & Changelog"
            : "سجل التحديثات وإصدارات وصل الإسلامية"}
        </h1>

        <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          {isEn
            ? "Every verified improvement and new Islamic service published after confirmed production deployment."
            : "استعرض كافة الميزات الجديدة والتحسينات وإصلاحات الأداء المعلنة تلقائياً بعد تأكيد نجاح النشر الفعلي على بيئة الإنتاج."}
        </p>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          {FILTER_CATEGORIES.map((catId) => {
            const label =
              catId === "all"
                ? isEn
                  ? "All Updates"
                  : "جميع التحديثات"
                : isEn
                  ? RELEASE_CATEGORY_META[catId].labelEn
                  : RELEASE_CATEGORY_META[catId].labelAr;
            const active = selectedCategory === catId;
            return (
              <button
                key={catId}
                type="button"
                onClick={() => setSelectedCategory(catId)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald)] text-white"
                    : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--brand-emerald)]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Timeline List */}
      {filteredReleases.length === 0 ? (
        <div className="wasl-surface rounded-3xl border border-[var(--border-subtle)] p-10 text-center space-y-2">
          <Sparkles className="h-7 w-7 mx-auto text-[var(--brand-gold)]" />
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            {initialReleases.length === 0
              ? isEn
                ? "No published updates recorded yet"
                : "لا توجد تحديثات منشورة في السجل حتى الآن"
              : isEn
                ? "No updates match the selected category"
                : "لا توجد تحديثات مطابقة لهذا التصنيف"}
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {isEn
              ? "New announcements appear here automatically once a production release succeeds."
              : "ستظهر بيانات الإصدارات تلقائياً هنا عند نشر أي تحديث مؤكد على منصة الإنتاج."}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredReleases.map((release, index) => (
            <article
              key={release.id}
              className="wasl-surface rounded-3xl border border-[var(--border-subtle)] p-6 space-y-4 relative overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--brand-emerald)] px-3 py-1 text-xs font-bold font-mono text-white">
                    v{release.releaseVersion}
                  </span>
                  {index === 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-gold-soft)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--brand-gold)]">
                      <CheckCircle2 className="h-3 w-3" />
                      {isEn ? "Latest Release" : "أحدث إصدار"}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] px-2.5 py-0.5 text-[11px] font-mono text-[var(--text-muted)]">
                    <GitCommitHorizontal className="h-3 w-3" />
                    {release.commitSha.slice(0, 7)}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <Calendar className="h-3.5 w-3.5 text-[var(--brand-gold)]" />
                  <time dateTime={release.deployedAt}>
                    {formatReleaseDate(release.deployedAt)}
                  </time>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                  {release.titleAr}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {release.summaryAr}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {release.categories.map((cat) => {
                  const meta = RELEASE_CATEGORY_META[cat.category];
                  return (
                    <div
                      key={`${release.id}-${cat.category}`}
                      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/55 p-4 space-y-2"
                    >
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.badgeClass}`}
                      >
                        {getCategoryIcon(cat.category)}
                        {isEn ? cat.labelEn : cat.labelAr}
                      </span>

                      <ul className="space-y-1.5 text-xs sm:text-sm text-[var(--text-primary)] list-disc list-inside leading-relaxed">
                        {cat.items.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

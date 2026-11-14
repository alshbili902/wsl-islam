"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Clock,
  ExternalLink,
  PenLine,
  Quote,
  ShieldCheck,
} from "lucide-react";
import { useWasl } from "@/components/providers/WaslProvider";
import { WaslShare } from "@/components/share/WaslShare";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageShell } from "@/components/ui/MotionPrimitives";
import { GeometricLattice } from "@/components/brand/IslamicVisuals";
import { ARTICLE_CATEGORIES } from "@/data/articles";
import type { Article } from "@/types/islamic";

interface ArticleDetailClientProps {
  article: Article;
  relatedArticles: Article[];
}

export function ArticleDetailClient({
  article,
  relatedArticles,
}: ArticleDetailClientProps) {
  const { locale, isRtl, isBookmarked, toggleBookmark } = useWasl();
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const catMeta = ARTICLE_CATEGORIES.find((c) => c.id === article.category);
  const bookmarkId = `article:${article.slug}`;
  const saved = isBookmarked(bookmarkId);

  return (
    <PageShell className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          {
            labelAr: "المعرفة الإسلامية",
            labelEn: "Knowledge",
            href: "/knowledge",
          },
          {
            labelAr: article.titleAr,
            labelEn: article.titleEn,
          },
        ]}
      />

      {/* Article Header */}
      <header className="wasl-surface relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10 mb-8 shadow-sm">
        <GeometricLattice className="opacity-[0.04]" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-[var(--wasl-primary)]/10 px-3 py-1 font-bold text-[var(--wasl-primary)]">
                {locale === "ar" ? catMeta?.nameAr : catMeta?.nameEn}
              </span>
              <span className="inline-flex items-center gap-1 text-[var(--wasl-text-muted)]">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {article.readingMinutes}{" "}
                  {locale === "ar" ? "دقائق للقراءة" : "min read"}
                </span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <WaslShare
                variant="pill"
                label={locale === "ar" ? "مشاركة المقال" : "Share Article"}
                payload={{
                  kind:
                    article.category === "prophets"
                      ? "prophet_story"
                      : article.category === "education"
                        ? "lesson"
                        : "article",
                  titleAr: article.titleAr,
                  titleEn: article.titleEn,
                  arabicText: `${article.titleAr}\n\n${article.summaryAr}`,
                  englishText: `${article.titleEn}\n\n${article.summaryEn}`,
                  referenceAr:
                    article.sources[0]?.nameAr ?? "منصة وصل الإسلامية",
                  referenceEn:
                    article.sources[0]?.nameEn ?? "Wasl Islamic",
                  sourceAr: article.sources.map((s) => s.nameAr).join(" • "),
                  sourceEn: article.sources.map((s) => s.nameEn).join(" • "),
                  shareUrl: `/knowledge/${article.slug}`,
                }}
              />

              <button
                type="button"
                onClick={() =>
                  toggleBookmark({
                    id: bookmarkId,
                    type: "article",
                    titleAr: article.titleAr,
                    titleEn: article.titleEn,
                    arabicText: article.summaryAr,
                    englishText: article.summaryEn,
                    referenceAr:
                      article.sources[0]?.nameAr ?? "منصة وصل الإسلامية",
                    referenceEn:
                      article.sources[0]?.nameEn ?? "Wasl Islamic",
                    url: `/knowledge/${article.slug}`,
                  })
                }
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                  saved
                    ? "border-[var(--wasl-accent)] bg-[var(--wasl-accent)]/15 text-[var(--wasl-accent-strong)]"
                    : "border-[var(--wasl-border)] bg-[var(--wasl-bg)] text-[var(--wasl-text)] hover:border-[var(--wasl-primary)]"
                }`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />
                <span>
                  {locale === "ar" ? (saved ? "محفوظ" : "حفظ المقال") : saved ? "Saved" : "Bookmark"}
                </span>
              </button>
            </div>
          </div>

          <h1 className="text-2xl font-bold leading-snug text-[var(--wasl-text)] sm:text-3xl lg:text-4xl">
            {locale === "ar" ? article.titleAr : article.titleEn}
          </h1>

          <p className="text-sm sm:text-base leading-relaxed text-[var(--wasl-text-muted)]">
            {locale === "ar" ? article.summaryAr : article.summaryEn}
          </p>

          {/* Integrity Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[var(--wasl-border)] text-xs text-[var(--wasl-text-muted)]">
            <span className="inline-flex items-center gap-1.5 text-[var(--wasl-primary)] font-medium">
              <Quote className="h-3.5 w-3.5 text-[var(--wasl-accent)]" />
              <span>
                {locale === "ar"
                  ? "المربعات الذهبية: نصوص قرآنية ونبوية وأقوال موثقة بنصها"
                  : "Gold-bordered boxes: verbatim Quran, Hadith & scholarly citations"}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <PenLine className="h-3.5 w-3.5" />
              <span>
                {locale === "ar"
                  ? "الفقرات الاعتيادية: شرح تحريري ميسر"
                  : "Plain paragraphs: editorial explanation"}
              </span>
            </span>
          </div>
        </div>
      </header>

      {/* Structured Article Body */}
      <article className="wasl-reading-surface wasl-reading-container rounded-3xl border border-[var(--wasl-border)] p-5 sm:p-8 space-y-6 mb-10">
        {article.blocks.map((block, index) => {
          if (block.type === "quote") {
            const badgeLabel =
              block.quoteType === "quran"
                ? locale === "ar"
                  ? "نص قرآني موثق"
                  : "Verified Quranic Text"
                : block.quoteType === "hadith"
                  ? locale === "ar"
                    ? "حديث نبوي موثق"
                    : "Verified Prophetic Hadith"
                  : locale === "ar"
                    ? "قول علمي موثق"
                    : "Verified Scholarly Citation";

            return (
              <blockquote
                key={`quote-${index}`}
                className="rounded-3xl border border-[var(--wasl-accent)]/40 bg-[var(--wasl-primary)]/[0.045] p-6 sm:p-7 space-y-3"
              >
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--wasl-accent)]/15 px-3 py-1 text-[11px] font-bold text-[var(--wasl-accent-strong)]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{badgeLabel}</span>
                </div>

                <p
                  dir="rtl"
                  lang="ar"
                  className="font-arabic wasl-reading-body text-xl sm:text-2xl leading-[2.05]"
                >
                  {block.arabicText}
                </p>

                <p
                  dir="ltr"
                  lang="en"
                  className="text-sm leading-relaxed text-[var(--wasl-text-muted)]"
                >
                  {block.englishText}
                </p>

                <footer className="pt-2 border-t border-[var(--wasl-border)]/70 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[var(--wasl-primary)]">
                  <span>{locale === "ar" ? block.referenceAr : block.referenceEn}</span>
                  <WaslShare
                    variant="pill"
                    label={locale === "ar" ? "مشاركة" : "Share"}
                    payload={{
                      kind:
                        block.quoteType === "quran"
                          ? "verse"
                          : block.quoteType === "hadith"
                            ? "hadith"
                            : article.category === "prophets"
                              ? "prophet_story"
                              : article.category === "education"
                                ? "lesson"
                                : "article",
                      titleAr: article.titleAr,
                      titleEn: article.titleEn,
                      arabicText: block.arabicText,
                      englishText: block.englishText,
                      referenceAr: block.referenceAr,
                      referenceEn: block.referenceEn,
                      shareUrl: `/knowledge/${article.slug}`,
                    }}
                  />
                </footer>
              </blockquote>
            );
          }

          return (
            <section
              key={`editorial-${index}`}
              className="wasl-surface rounded-3xl p-6 sm:p-7 space-y-3"
            >
              {(block.headingAr || block.headingEn) && (
                <h2 className="text-xl font-bold text-[var(--wasl-text)]">
                  {locale === "ar" ? block.headingAr : block.headingEn}
                </h2>
              )}
              <p className="text-base leading-[1.9] text-[var(--wasl-text)]">
                {locale === "ar" ? block.textAr : block.textEn}
              </p>
            </section>
          );
        })}
      </article>

      {/* Sources & Attribution Card */}
      <section className="wasl-surface rounded-3xl p-6 sm:p-7 mb-8 space-y-4">
        <h2 className="text-base font-bold text-[var(--wasl-text)]">
          {locale === "ar" ? "المصادر والمراجع العلمية" : "Sources & References"}
        </h2>
        <ul className="space-y-2.5">
          {article.sources.map((src) => (
            <li
              key={src.nameEn}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)]/70 px-4 py-3 text-sm"
            >
              <span className="font-medium text-[var(--wasl-text)]">
                {locale === "ar" ? src.nameAr : src.nameEn}
              </span>
              {src.url && (
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--wasl-primary)] hover:underline"
                >
                  <span>{locale === "ar" ? "المصدر الرسمي" : "Official Source"}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Related & Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/knowledge"
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--wasl-border)] bg-[var(--wasl-surface)] px-5 py-3 text-sm font-semibold text-[var(--wasl-text)] hover:border-[var(--wasl-primary)] transition"
        >
          <BackIcon className="h-4 w-4" />
          <span>{locale === "ar" ? "العودة إلى مكتبة المعرفة" : "Back to Knowledge Library"}</span>
        </Link>

        {relatedArticles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {relatedArticles.map((rel) => (
              <Link
                key={rel.slug}
                href={`/knowledge/${rel.slug}`}
                className="rounded-2xl border border-[var(--wasl-border)] bg-[var(--wasl-surface)] px-4 py-2.5 text-xs font-semibold text-[var(--wasl-primary)] hover:border-[var(--wasl-primary)]"
              >
                {locale === "ar" ? rel.titleAr : rel.titleEn}
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

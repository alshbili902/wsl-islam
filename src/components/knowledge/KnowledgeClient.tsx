"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Clock,
  ExternalLink,
  Globe2,
  Library,
  Search,
  Sparkles,
} from "lucide-react";
import { useWasl } from "@/components/providers/WaslProvider";
import { WaslShare } from "@/components/share/WaslShare";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageShell, RevealSection } from "@/components/ui/MotionPrimitives";
import {
  GeometricLattice,
  OrnamentalDivider,
} from "@/components/brand/IslamicVisuals";
import { ARTICLE_CATEGORIES } from "@/data/articles";
import type {
  AllahName,
  Article,
  ArticleCategory,
  ScholarlyResource,
} from "@/types/islamic";

interface KnowledgeClientProps {
  articles: Article[];
  allahNames: AllahName[];
  multilingualResources: ScholarlyResource[];
}

export function KnowledgeClient({
  articles,
  allahNames,
  multilingualResources,
}: KnowledgeClientProps) {
  const { locale, isRtl } = useWasl();
  const searchParams = useSearchParams();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const paramCategory = searchParams.get("cat") as ArticleCategory | null;
  const [activeCat, setActiveCat] = useState<"all" | ArticleCategory>(
    paramCategory && ARTICLE_CATEGORIES.some((c) => c.id === paramCategory)
      ? paramCategory
      : "all"
  );
  const [articleQuery, setArticleQuery] = useState("");
  const [nameQuery, setNameQuery] = useState("");

  useEffect(() => {
    if (paramCategory && ARTICLE_CATEGORIES.some((c) => c.id === paramCategory)) {
      const id = window.setTimeout(() => setActiveCat(paramCategory), 0);
      return () => window.clearTimeout(id);
    }
  }, [paramCategory]);

  const filteredArticles = useMemo(() => {
    const q = articleQuery.trim().toLowerCase();
    return articles.filter((a) => {
      if (activeCat !== "all" && a.category !== activeCat) return false;
      if (!q) return true;
      return (
        a.titleAr.toLowerCase().includes(q) ||
        a.titleEn.toLowerCase().includes(q) ||
        a.summaryAr.toLowerCase().includes(q) ||
        a.summaryEn.toLowerCase().includes(q)
      );
    });
  }, [activeCat, articleQuery, articles]);

  const filteredNames = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    if (!q) return allahNames;
    return allahNames.filter(
      (n) =>
        n.arabic.includes(nameQuery.trim()) ||
        n.transliteration.toLowerCase().includes(q) ||
        n.meaningAr.toLowerCase().includes(q) ||
        n.meaningEn.toLowerCase().includes(q)
    );
  }, [allahNames, nameQuery]);

  const activeCategoryMeta = useMemo(
    () => ARTICLE_CATEGORIES.find((c) => c.id === activeCat),
    [activeCat]
  );

  return (
    <PageShell className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { labelAr: "المعرفة الإسلامية", labelEn: "Islamic Knowledge" },
        ]}
      />

      {/* Hero Section */}
      <section className="wasl-surface relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-6 shadow-sm">
        <GeometricLattice className="opacity-[0.04]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--wasl-border)] bg-[var(--wasl-bg)]/85 px-3.5 py-1 text-xs font-medium text-[var(--wasl-primary)]">
              <Library className="h-3.5 w-3.5 text-[var(--wasl-accent)]" />
              <span>
                {locale === "ar"
                  ? "محتوى علمي مؤصل مع تمييز النص الموثق عن الشرح التحريري"
                  : "Source-Attributed Articles & Verified Quotations"}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[var(--wasl-text)] sm:text-4xl">
              {locale === "ar"
                ? "المعرفة والعلوم الإسلامية"
                : "Islamic Knowledge & Educational Library"}
            </h1>
            <p className="text-sm leading-relaxed text-[var(--wasl-text-muted)]">
              {activeCategoryMeta
                ? locale === "ar"
                  ? activeCategoryMeta.descriptionAr
                  : activeCategoryMeta.descriptionEn
                : locale === "ar"
                  ? "مقالات ومقدمات منهجية في العقيدة، العبادات، السيرة النبوية، قصص الأنبياء، الأخلاق، ودليل المسلم الجديد، بالإضافة إلى أسماء الله الحسنى."
                  : "Structured guides on Aqeedah, Worship, Prophetic Seerah ﷺ, Stories of the Prophets, Islamic Manners, New Muslims Guide, and the Names of Allah."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:min-w-[300px]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-3.5 h-4 w-4 text-[var(--wasl-text-muted)]" />
              <input
                type="search"
                value={articleQuery}
                onChange={(e) => setArticleQuery(e.target.value)}
                placeholder={
                  locale === "ar" ? "ابحث في المقالات والأبواب..." : "Search articles..."
                }
                className="w-full rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] py-2.5 ps-10 pe-4 text-sm text-[var(--wasl-text)] placeholder:text-[var(--wasl-text-muted)] focus:border-[var(--wasl-primary)] focus:outline-none"
              />
            </div>

            <a
              href="#names-of-allah"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--wasl-accent)]/45 bg-[var(--wasl-accent)]/10 px-4 py-2 text-xs font-bold text-[var(--wasl-accent-strong)] hover:bg-[var(--wasl-accent)]/20 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {locale === "ar"
                  ? "الانتقال إلى أسماء الله الحسنى"
                  : "Jump to Beautiful Names of Allah"}
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Category Filter Pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCat("all")}
          className={`rounded-2xl border px-4 py-2 text-xs sm:text-sm font-semibold transition ${
            activeCat === "all"
              ? "border-[var(--wasl-primary)] bg-[var(--wasl-primary)] text-white"
              : "border-[var(--wasl-border)] bg-[var(--wasl-surface)] text-[var(--wasl-text)] hover:border-[var(--wasl-primary)]/50"
          }`}
        >
          {locale === "ar" ? "جميع الموضوعات" : "All Topics"}
        </button>
        {ARTICLE_CATEGORIES.map((cat) => {
          const active = activeCat === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCat(cat.id)}
              className={`rounded-2xl border px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                active
                  ? "border-[var(--wasl-primary)] bg-[var(--wasl-primary)] text-white"
                  : "border-[var(--wasl-border)] bg-[var(--wasl-surface)] text-[var(--wasl-text)] hover:border-[var(--wasl-primary)]/50"
              }`}
            >
              {locale === "ar" ? cat.nameAr : cat.nameEn}
            </button>
          );
        })}
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="wasl-surface rounded-3xl p-10 text-center mb-12">
          <p className="text-sm text-[var(--wasl-text-muted)]">
            {locale === "ar"
              ? "لم يتم العثور على مقالات مطابقة لبحثك."
              : "No matching articles found."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 mb-14">
          {filteredArticles.map((article) => {
            const catMeta = ARTICLE_CATEGORIES.find(
              (c) => c.id === article.category
            );
            const shareKind =
              article.category === "prophets"
                ? "prophet_story"
                : article.category === "education"
                  ? "lesson"
                  : "article";

            return (
              <div
                key={article.slug}
                className="group flex flex-col justify-between rounded-3xl border border-[var(--wasl-border)] bg-[var(--wasl-surface)] p-6 transition hover:-translate-y-0.5 hover:border-[var(--wasl-primary)]/50 hover:shadow-md"
              >
                <Link href={`/knowledge/${article.slug}`} className="space-y-3 block">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="rounded-full bg-[var(--wasl-primary)]/10 px-3 py-1 font-semibold text-[var(--wasl-primary)]">
                      {locale === "ar" ? catMeta?.nameAr : catMeta?.nameEn}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[var(--wasl-text-muted)]">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {article.readingMinutes}{" "}
                        {locale === "ar" ? "دقائق" : "min"}
                      </span>
                    </span>
                  </div>

                  <h2 className="text-lg font-bold leading-snug text-[var(--wasl-text)] group-hover:text-[var(--wasl-primary)] transition">
                    {locale === "ar" ? article.titleAr : article.titleEn}
                  </h2>

                  <p className="text-xs sm:text-sm leading-relaxed text-[var(--wasl-text-muted)] line-clamp-3">
                    {locale === "ar" ? article.summaryAr : article.summaryEn}
                  </p>
                </Link>

                <div className="mt-5 pt-4 border-t border-[var(--wasl-border)] flex items-center justify-between gap-2 text-xs font-semibold text-[var(--wasl-primary)]">
                  <span>
                    {locale === "ar"
                      ? `${article.sources.length} مصادر موثقة`
                      : `${article.sources.length} Verified Sources`}
                  </span>
                  <div className="flex items-center gap-2">
                    <WaslShare
                      variant="icon"
                      payload={{
                        kind: shareKind,
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
                    <Link
                      href={`/knowledge/${article.slug}`}
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      <span>{locale === "ar" ? "اقرأ المقال" : "Read Article"}</span>
                      <ArrowIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <OrnamentalDivider className="my-10" />

      {/* Beautiful Names of Allah Section */}
      <RevealSection id="names-of-allah" className="scroll-mt-24 space-y-6 mb-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[var(--wasl-primary)]">
              <Sparkles className="h-4 w-4 text-[var(--wasl-accent)]" />
              <span>{locale === "ar" ? "وللّه الأسماء الحسنى فادعوه بها" : "The Beautiful Names of Allah"}</span>
            </div>
            <h2 className="text-2xl font-bold text-[var(--wasl-text)] sm:text-3xl">
              {locale === "ar" ? "أسماء الله الحسنى" : "The 99 Beautiful Names of Allah"}
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-3.5 h-4 w-4 text-[var(--wasl-text-muted)]" />
            <input
              type="search"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              placeholder={
                locale === "ar"
                  ? "ابحث بالاسم أو المعنى..."
                  : "Search by name or meaning..."
              }
              className="w-full rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-surface)] py-2.5 ps-10 pe-4 text-sm text-[var(--wasl-text)] placeholder:text-[var(--wasl-text-muted)] focus:border-[var(--wasl-primary)] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredNames.map((n) => (
            <div
              key={n.number}
              className="wasl-surface flex flex-col justify-between rounded-2xl p-5 transition hover:border-[var(--wasl-accent)]/50"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--wasl-primary)]/10 font-mono text-xs font-bold text-[var(--wasl-primary)]">
                    {n.number}
                  </span>
                  <span className="text-[11px] font-medium text-[var(--wasl-text-muted)]">
                    {n.transliteration}
                  </span>
                </div>

                <h3
                  dir="rtl"
                  lang="ar"
                  className="font-arabic text-3xl font-bold text-[var(--wasl-primary)] my-2"
                >
                  {n.arabic}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-[var(--wasl-text)]">
                  {locale === "ar" ? n.meaningAr : n.meaningEn}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[var(--wasl-border)]/70 flex items-center justify-between gap-2">
                <p className="text-[11px] text-[var(--wasl-text-muted)]">
                  {n.referenceAr}
                </p>
                <WaslShare
                  variant="icon"
                  payload={{
                    kind: "allah_name",
                    titleAr: `${n.arabic} (${n.number})`,
                    titleEn: `${n.transliteration} — Allah's Name #${n.number}`,
                    arabicText: `${n.arabic}\n${n.meaningAr}`,
                    englishText: `${n.transliteration}: ${n.meaningEn}`,
                    referenceAr: n.referenceAr,
                    referenceEn: n.referenceAr,
                    shareUrl: "/knowledge#names-of-allah",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </RevealSection>

      {/* Multilingual Educational Resources */}
      <RevealSection className="wasl-surface rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Globe2 className="h-5 w-5 text-[var(--wasl-primary)]" />
            <div>
              <h2 className="text-xl font-bold text-[var(--wasl-text)]">
                {locale === "ar"
                  ? "مصادر التعليم الإسلامي بلغات متعددة"
                  : "Multilingual Islamic Educational Resources"}
              </h2>
              <p className="text-xs text-[var(--wasl-text-muted)]">
                {locale === "ar"
                  ? "روابط موثوقة لتعلم معاني القرآن والإسلام بأكثر من 70 لغة عالمية"
                  : "Trusted portals for vetted Quran translations and introductory books in 70+ languages"}
              </p>
            </div>
          </div>

          <Link
            href="/resources"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--wasl-primary)] hover:underline"
          >
            <BookOpenText className="h-4 w-4" />
            <span>
              {locale === "ar"
                ? "استعراض جميع المصادر العلمية"
                : "Browse All Scholarly Resources"}
            </span>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {multilingualResources.map((res) => (
            <a
              key={res.slug}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col justify-between rounded-2xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)]/70 p-4 transition hover:border-[var(--wasl-primary)]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-[var(--wasl-primary)]">
                    {locale === "ar" ? res.organizationAr : res.organizationEn}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-[var(--wasl-text-muted)] shrink-0" />
                </div>
                <h3 className="text-sm font-bold text-[var(--wasl-text)]">
                  {locale === "ar" ? res.titleAr : res.titleEn}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--wasl-text-muted)]">
                  {locale === "ar" ? res.descriptionAr : res.descriptionEn}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {res.languageTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-[var(--wasl-surface)] px-2 py-0.5 text-[10px] font-mono uppercase text-[var(--wasl-text-muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </RevealSection>
    </PageShell>
  );
}

"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookA,
  BookOpen,
  ExternalLink,
  GraduationCap,
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
import type { GlossaryTerm, ScholarlyResource } from "@/types/islamic";

interface DailyReminderItem {
  id: string;
  titleAr: string;
  titleEn: string;
  textAr: string;
  textEn: string;
  href: string;
}

interface ResourcesClientProps {
  resources: ScholarlyResource[];
  glossary: GlossaryTerm[];
  dailyReminders: DailyReminderItem[];
}

const RESOURCE_CATEGORIES: {
  id: "all" | ScholarlyResource["category"];
  ar: string;
  en: string;
}[] = [
  { id: "all", ar: "جميع المصادر", en: "All Sources" },
  { id: "scholarly", ar: "المواقع العلمية للعلماء", en: "Scholarly Websites" },
  { id: "fatwa", ar: "الإفتاء الرسمي", en: "Official Ifta" },
  { id: "quran_official", ar: "مصادر القرآن الرسمية", en: "Official Quran Authorities" },
  { id: "multilingual", ar: "مصادر متعددة اللغات", en: "Multilingual" },
  { id: "charity", ar: "المنصات الخيرية الرسمية", en: "Official Charities" },
];

export function ResourcesClient({
  resources,
  glossary,
  dailyReminders,
}: ResourcesClientProps) {
  const { locale } = useWasl();

  const [resourceCat, setResourceCat] = useState<
    "all" | ScholarlyResource["category"]
  >("all");
  const [glossaryQuery, setGlossaryQuery] = useState("");

  const filteredResources = useMemo(() => {
    if (resourceCat === "all") return resources;
    return resources.filter((r) => r.category === resourceCat);
  }, [resourceCat, resources]);

  const filteredGlossary = useMemo(() => {
    const q = glossaryQuery.trim().toLowerCase();
    if (!q) return glossary;
    return glossary.filter(
      (g) =>
        g.termAr.includes(glossaryQuery.trim()) ||
        g.termEn.toLowerCase().includes(q) ||
        g.transliteration.toLowerCase().includes(q) ||
        g.definitionAr.toLowerCase().includes(q) ||
        g.definitionEn.toLowerCase().includes(q)
    );
  }, [glossary, glossaryQuery]);

  return (
    <PageShell className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { labelAr: "المصادر والمعجم", labelEn: "Resources & Glossary" },
        ]}
      />

      {/* Hero Header */}
      <section className="wasl-surface relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
        <GeometricLattice className="opacity-[0.045]" />
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--wasl-border)] bg-[var(--wasl-bg)]/85 px-3.5 py-1 text-xs font-medium text-[var(--wasl-primary)]">
            <GraduationCap className="h-3.5 w-3.5 text-[var(--wasl-accent)]" />
            <span>
              {locale === "ar"
                ? "بوابة المراجع العلمية الموثوقة والمؤسسات السعودية الرسمية"
                : "Verified Scholarly Institutions & Islamic Terminology Glossary"}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--wasl-text)] sm:text-4xl">
            {locale === "ar"
              ? "المصادر العلمية والمعجم والتذكيرات"
              : "Scholarly Resources, Glossary & Daily Reminders"}
          </h1>
          <p className="text-sm leading-relaxed text-[var(--wasl-text-muted)]">
            {locale === "ar"
              ? "دليل منسق إلى المواقع العلمية الرسمية الموثوقة (وفي مقدمتها موقع سماحة الشيخ عبدالعزيز بن باز رحمه الله، واللجنة الدائمة للإفتاء، ومجمع الملك فهد)، مع معجم لأبرز المصطلحات الشرعية وتذكيرات يومية نافعة."
              : "Curated directory of official Saudi and scholarly Islamic portals — including binbaz.org.sa, alifta.gov.sa, and King Fahd Quran Complex — paired with an accessible glossary and daily spiritual reminders."}
          </p>
        </div>
      </section>

      {/* Trusted Scholarly & Official Portals */}
      <RevealSection className="space-y-5 mb-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-[var(--wasl-text)]">
            {locale === "ar"
              ? "المواقع العلمية والمؤسسات الموثوقة"
              : "Verified Scholarly & Official Portals"}
          </h2>

          <div className="flex flex-wrap gap-2">
            {RESOURCE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setResourceCat(cat.id)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  resourceCat === cat.id
                    ? "border-[var(--wasl-primary)] bg-[var(--wasl-primary)] text-white"
                    : "border-[var(--wasl-border)] bg-[var(--wasl-surface)] text-[var(--wasl-text)] hover:border-[var(--wasl-primary)]"
                }`}
              >
                {locale === "ar" ? cat.ar : cat.en}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((res) => (
            <a
              key={res.slug}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group wasl-surface flex flex-col justify-between rounded-3xl p-6 transition hover:-translate-y-0.5 hover:border-[var(--wasl-primary)]/50 hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-[var(--wasl-primary)]/10 px-3 py-1 text-[11px] font-bold text-[var(--wasl-primary)]">
                    {locale === "ar" ? res.organizationAr : res.organizationEn}
                  </span>
                  <ExternalLink className="h-4 w-4 text-[var(--wasl-text-muted)] group-hover:text-[var(--wasl-primary)] shrink-0" />
                </div>

                <h3 className="text-base font-bold text-[var(--wasl-text)] group-hover:text-[var(--wasl-primary)] transition">
                  {locale === "ar" ? res.titleAr : res.titleEn}
                </h3>

                <p className="text-xs leading-relaxed text-[var(--wasl-text-muted)]">
                  {locale === "ar" ? res.descriptionAr : res.descriptionEn}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--wasl-border)] flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {res.languageTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-[var(--wasl-bg)] px-2 py-0.5 text-[10px] font-mono uppercase text-[var(--wasl-text-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span dir="ltr" className="text-[11px] font-mono text-[var(--wasl-primary)] truncate">
                  {res.url.replace(/^https?:\/\/(www\.)?/, "")}
                </span>
              </div>
            </a>
          ))}
        </div>
      </RevealSection>

      <OrnamentalDivider className="my-10" />

      {/* Useful Daily Reminders */}
      <RevealSection className="space-y-5 mb-12">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--wasl-accent)]" />
          <h2 className="text-2xl font-bold text-[var(--wasl-text)]">
            {locale === "ar" ? "تذكيرات إيمانية يومية" : "Useful Daily Reminders"}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {dailyReminders.map((rem) => (
            <div
              key={rem.id}
              className="wasl-surface flex flex-col justify-between rounded-3xl p-5 sm:p-6 space-y-4"
            >
              <div className="space-y-2">
                <h3 className="text-base font-bold text-[var(--wasl-primary)]">
                  {locale === "ar" ? rem.titleAr : rem.titleEn}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--wasl-text)]">
                  {locale === "ar" ? rem.textAr : rem.textEn}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--wasl-border)]">
                <Link
                  href={rem.href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--wasl-primary)] hover:underline"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{locale === "ar" ? "الانتقال إلى القسم" : "Open Section"}</span>
                </Link>

                <WaslShare
                  variant="pill"
                  label={locale === "ar" ? "مشاركة" : "Share"}
                  payload={{
                    kind: "reminder",
                    titleAr: rem.titleAr,
                    titleEn: rem.titleEn,
                    arabicText: rem.textAr,
                    englishText: rem.textEn,
                    referenceAr: rem.titleAr,
                    referenceEn: rem.titleEn,
                    shareUrl: rem.href || "/resources",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </RevealSection>

      <OrnamentalDivider className="my-10" />

      {/* Searchable Islamic Glossary */}
      <RevealSection className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[var(--wasl-primary)]">
              <BookA className="h-4 w-4 text-[var(--wasl-accent)]" />
              <span>{locale === "ar" ? "تعريفات مبسطة وموثقة" : "Clear Concise Definitions"}</span>
            </div>
            <h2 className="text-2xl font-bold text-[var(--wasl-text)]">
              {locale === "ar" ? "المعجم الإسلامي للمصطلحات" : "Islamic Glossary"}
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-3.5 h-4 w-4 text-[var(--wasl-text-muted)]" />
            <input
              type="search"
              value={glossaryQuery}
              onChange={(e) => setGlossaryQuery(e.target.value)}
              placeholder={
                locale === "ar"
                  ? "ابحث في المصطلحات..."
                  : "Search glossary terms..."
              }
              className="w-full rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-surface)] py-2.5 ps-10 pe-4 text-sm text-[var(--wasl-text)] placeholder:text-[var(--wasl-text-muted)] focus:border-[var(--wasl-primary)] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredGlossary.map((term) => (
            <article
              key={term.slug}
              className="wasl-surface rounded-2xl p-5 space-y-2.5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-bold text-[var(--wasl-primary)]">
                  {locale === "ar" ? term.termAr : term.termEn}
                </h3>
                <span className="rounded-md bg-[var(--wasl-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--wasl-text-muted)]">
                  {term.transliteration}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-[var(--wasl-text)]">
                {locale === "ar" ? term.definitionAr : term.definitionEn}
              </p>

              {(term.referenceAr || term.referenceEn) && (
                <p className="text-xs font-medium text-[var(--wasl-text-muted)]">
                  {locale === "ar" ? term.referenceAr : term.referenceEn}
                </p>
              )}
            </article>
          ))}
        </div>
      </RevealSection>
    </PageShell>
  );
}

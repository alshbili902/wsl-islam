"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Bookmark,
  BookMarked,
  Check,
  Copy,
  RefreshCw,
  ScrollText,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useWasl } from "@/components/providers/WaslProvider";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageShell } from "@/components/ui/MotionPrimitives";
import { GeometricLattice } from "@/components/brand/IslamicVisuals";
import { WaslLogo } from "@/components/brand/WaslLogo";
import { WaslShare } from "@/components/share/WaslShare";
import type { HadithCollectionKey, HadithSectionMeta } from "@/lib/api/hadith";
import type { HadithItem } from "@/types/islamic";

interface HadithLibraryClientProps {
  initialCollection: HadithCollectionKey;
  initialSectionId: string;
  initialHadiths: HadithItem[];
  initialSectionTitleAr: string;
  initialSectionTitleEn: string;
  initialSections: HadithSectionMeta[];
}

const COLLECTIONS: {
  id: HadithCollectionKey;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
}[] = [
  {
    id: "nawawi",
    titleAr: "الأربعون النووية",
    titleEn: "Forty Hadith of an-Nawawi",
    subtitleAr: "٤٢ حديثاً جامعاً لأصول الدين",
    subtitleEn: "42 Foundational Hadiths",
  },
  {
    id: "bukhari",
    titleAr: "صحيح البخاري",
    titleEn: "Sahih al-Bukhari",
    subtitleAr: "٩٧ كتاباً بأسانيدها الصحيحة",
    subtitleEn: "97 Books — Highest Authenticity",
  },
  {
    id: "muslim",
    titleAr: "صحيح مسلم",
    titleEn: "Sahih Muslim",
    subtitleAr: "٥٦ كتاباً من أصح الكتب بعد كتاب الله",
    subtitleEn: "56 Books — Authenticated Narration",
  },
];

export function HadithLibraryClient({
  initialCollection,
  initialSectionId,
  initialHadiths,
  initialSectionTitleAr,
  initialSectionTitleEn,
  initialSections,
}: HadithLibraryClientProps) {
  const { locale, isBookmarked, toggleBookmark } = useWasl();
  const searchParams = useSearchParams();

  const paramCollection = searchParams.get("collection") as HadithCollectionKey | null;
  const paramSection = searchParams.get("section");

  const [collection, setCollection] = useState<HadithCollectionKey>(
    paramCollection && ["nawawi", "bukhari", "muslim"].includes(paramCollection)
      ? paramCollection
      : initialCollection
  );
  const [sectionId, setSectionId] = useState<string>(
    paramSection || initialSectionId
  );
  const [sections, setSections] = useState<HadithSectionMeta[]>(initialSections);
  const [hadiths, setHadiths] = useState<HadithItem[]>(initialHadiths);
  const [sectionTitleAr, setSectionTitleAr] = useState(initialSectionTitleAr);
  const [sectionTitleEn, setSectionTitleEn] = useState(initialSectionTitleEn);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadSection = useCallback(
    async (targetCol: HadithCollectionKey, targetSec: string) => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(
          `/api/hadith?collection=${encodeURIComponent(targetCol)}&section=${encodeURIComponent(
            targetSec
          )}`
        );
        const data = (await res.json()) as {
          hadiths?: HadithItem[];
          sections?: HadithSectionMeta[];
          sectionTitleAr?: string;
          sectionTitleEn?: string;
          error?: string;
        };

        if (!res.ok || !data.hadiths) {
          throw new Error(data.error || "Failed to fetch hadiths");
        }

        setHadiths(data.hadiths);
        if (data.sections) setSections(data.sections);
        setSectionTitleAr(data.sectionTitleAr ?? "");
        setSectionTitleEn(data.sectionTitleEn ?? "");
      } catch {
        setErrorMsg(
          locale === "ar"
            ? "تعذّر تحميل هذا الكتاب من مصدر الحديث الخارجي حاليًا. لم تُستبدل النصوص بمحتوى بديل حفظًا للأمانة العلمية."
            : "Unable to load this hadith book from the upstream source right now. No placeholder text has been substituted."
        );
      } finally {
        setLoading(false);
      }
    },
    [locale]
  );

  // Sync if URL query parameters specify bukhari/muslim directly
  useEffect(() => {
    if (
      paramCollection &&
      ["nawawi", "bukhari", "muslim"].includes(paramCollection) &&
      (paramCollection !== initialCollection || (paramSection && paramSection !== initialSectionId))
    ) {
      const targetSec = paramSection || "1";
      const id = window.setTimeout(() => {
        setCollection(paramCollection);
        setSectionId(targetSec);
        void loadSection(paramCollection, targetSec);
      }, 0);
      return () => window.clearTimeout(id);
    }
  }, [paramCollection, paramSection, initialCollection, initialSectionId, loadSection]);

  const handleSelectCollection = (nextCol: HadithCollectionKey) => {
    if (nextCol === collection && sectionId === "1" && hadiths.length > 0 && !errorMsg) {
      return;
    }
    setCollection(nextCol);
    setSectionId("1");
    setSearchQuery("");
    void loadSection(nextCol, "1");
  };

  const handleSelectSection = (nextSectionId: string) => {
    setSectionId(nextSectionId);
    setSearchQuery("");
    void loadSection(collection, nextSectionId);
  };

  const filteredHadiths = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return hadiths;
    return hadiths.filter(
      (h) =>
        h.arabicText.toLowerCase().includes(q) ||
        h.englishText.toLowerCase().includes(q) ||
        String(h.hadithNumber).includes(q)
    );
  }, [hadiths, searchQuery]);

  const activeCollectionMeta = useMemo(
    () => COLLECTIONS.find((c) => c.id === collection) ?? COLLECTIONS[0],
    [collection]
  );

  const handleCopy = async (item: HadithItem, key: string) => {
    const text =
      locale === "ar"
        ? `${item.arabicText}\n\n[${activeCollectionMeta.titleAr} — ${
            item.referenceBook ?? `حديث ${item.hadithNumber}`
          }]`
        : `${item.arabicText}\n\n${item.englishText}\n\n[${activeCollectionMeta.titleEn} — Hadith #${item.hadithNumber}]`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <PageShell className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { labelAr: "الحديث الشريف", labelEn: "Hadith Library" },
        ]}
      />

      {/* Header & Collection Switcher */}
      <section className="wasl-surface relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-6 shadow-sm">
        <GeometricLattice className="opacity-[0.04]" />
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--wasl-border)] bg-[var(--wasl-bg)]/85 px-3 py-1 text-xs font-medium text-[var(--wasl-primary)]">
                <ScrollText className="h-3.5 w-3.5 text-[var(--wasl-accent)]" />
                <span>
                  {locale === "ar"
                    ? "نصوص مسندة ومخرّجة من أمهات كتب السنة"
                    : "Verified Texts from Sahih al-Bukhari, Sahih Muslim & Nawawi"}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-[var(--wasl-text)] sm:text-4xl">
                {locale === "ar" ? "مكتبة الحديث الشريف" : "Authentic Hadith Library"}
              </h1>
            </div>

            <div className="relative w-full lg:w-80">
              <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-3.5 h-4 w-4 text-[var(--wasl-text-muted)]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  locale === "ar"
                    ? "ابحث في هذا الكتاب برقم الحديث أو النص..."
                    : "Search in current book by text or number..."
                }
                className="w-full rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] py-2.5 ps-10 pe-4 text-sm text-[var(--wasl-text)] placeholder:text-[var(--wasl-text-muted)] focus:border-[var(--wasl-primary)] focus:outline-none"
              />
            </div>
          </div>

          {/* 3 Collections Grid */}
          <div className="grid gap-3 sm:grid-cols-3">
            {COLLECTIONS.map((col) => {
              const active = col.id === collection;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => handleSelectCollection(col.id)}
                  className={`flex flex-col items-start rounded-2xl border p-4 text-start transition ${
                    active
                      ? "border-[var(--wasl-primary)] bg-[var(--wasl-primary)] text-white shadow-sm"
                      : "border-[var(--wasl-border)] bg-[var(--wasl-bg)]/80 text-[var(--wasl-text)] hover:border-[var(--wasl-primary)]/50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-base">
                    <BookMarked className="h-4 w-4 shrink-0" />
                    <span>{locale === "ar" ? col.titleAr : col.titleEn}</span>
                  </div>
                  <span
                    className={`mt-1 text-xs ${
                      active ? "text-white/80" : "text-[var(--wasl-text-muted)]"
                    }`}
                  >
                    {locale === "ar" ? col.subtitleAr : col.subtitleEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Book / Section Selector Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[var(--wasl-border)] pt-5">
            <div className="flex-1 max-w-xl">
              <label
                htmlFor="hadith-book-select"
                className="mb-1.5 block text-xs font-semibold text-[var(--wasl-text-muted)]"
              >
                {locale === "ar" ? "اختر الكتاب / الباب" : "Select Book / Chapter"}
              </label>
              <select
                id="hadith-book-select"
                value={sectionId}
                onChange={(e) => handleSelectSection(e.target.value)}
                disabled={sections.length <= 1}
                className="w-full rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-4 py-2.5 text-sm text-[var(--wasl-text)] focus:border-[var(--wasl-primary)] focus:outline-none disabled:opacity-75"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {locale === "ar" ? sec.titleAr : sec.titleEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 text-xs text-[var(--wasl-text-muted)]">
              <span className="rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-3.5 py-2 font-semibold text-[var(--wasl-text)]">
                {locale === "ar" ? sectionTitleAr : sectionTitleEn}
              </span>
              <span className="font-mono">
                {filteredHadiths.length}{" "}
                {locale === "ar" ? "حديثاً" : "hadiths"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Error State */}
      {errorMsg && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-amber-500/40 bg-amber-500/10 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
            <p className="text-sm text-[var(--wasl-text)]">{errorMsg}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadSection(collection, sectionId)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[var(--wasl-primary)] px-4 py-2.5 text-xs font-semibold text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{locale === "ar" ? "إعادة المحاولة" : "Retry"}</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-44 rounded-3xl border border-[var(--wasl-border)] bg-[var(--wasl-surface)] p-6 animate-pulse"
            />
          ))}
        </div>
      ) : filteredHadiths.length === 0 && !errorMsg ? (
        <div className="wasl-surface rounded-3xl p-10 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-emerald-soft)] border border-[var(--border-subtle)]">
            <WaslLogo variant="icon" className="h-9 w-9" />
          </div>
          <p className="text-sm text-[var(--wasl-text-muted)]">
            {locale === "ar"
              ? "لا توجد أحاديث مطابقة لبحثك في هذا الكتاب."
              : "No hadiths matched your search inside this book."}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredHadiths.map((h) => {
            const key = `${collection}:${h.hadithNumber}`;
            const bookmarkId = `hadith:${key}`;
            const saved = isBookmarked(bookmarkId);
            const refAr = `${activeCollectionMeta.titleAr} — ${
              h.referenceBook ?? `حديث رقم ${h.hadithNumber}`
            }`;
            const refEn = `${activeCollectionMeta.titleEn} — Hadith #${h.hadithNumber}`;

            return (
              <article
                key={key}
                className="wasl-surface wasl-reading-surface rounded-3xl p-5 sm:p-7 transition hover:border-[var(--wasl-primary)]/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[var(--wasl-primary)]/10 px-3 py-1 text-xs font-bold text-[var(--wasl-primary)]">
                      {locale === "ar"
                        ? `حديث رقم ${h.hadithNumber}`
                        : `Hadith #${h.hadithNumber}`}
                    </span>
                    {(h.gradeAr || h.gradeEn) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-emerald-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-emerald)]">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>{locale === "ar" ? h.gradeAr : h.gradeEn}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(h, key)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-3 py-1.5 text-xs font-medium text-[var(--wasl-text-muted)] hover:text-[var(--wasl-text)]"
                    >
                      {copiedKey === key ? (
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
                          type: "hadith",
                          titleAr: refAr,
                          titleEn: refEn,
                          arabicText: h.arabicText,
                          englishText: h.englishText,
                          referenceAr: refAr,
                          referenceEn: refEn,
                          url: `/hadith?collection=${collection}&section=${sectionId}`,
                        })
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
                        kind: "hadith",
                        arabicText: h.arabicText,
                        englishText: h.englishText,
                        referenceAr: refAr,
                        referenceEn: refEn,
                        sourceAr: activeCollectionMeta.titleAr,
                        sourceEn: activeCollectionMeta.titleEn,
                        hadithGradeAr: h.gradeAr,
                        hadithGradeEn: h.gradeEn,
                        shareUrl: `/hadith?collection=${collection}&section=${sectionId}`,
                      }}
                    />
                  </div>
                </div>

                {/* Arabic Hadith Text */}
                <p
                  dir="rtl"
                  lang="ar"
                  className="font-arabic wasl-reading-body text-lg sm:text-xl leading-[2.05]"
                >
                  {h.arabicText}
                </p>

                {/* English Translation */}
                {h.englishText && (
                  <p
                    dir="ltr"
                    lang="en"
                    className="mt-4 border-t border-[var(--wasl-border)]/70 pt-3.5 text-sm leading-relaxed text-[var(--wasl-text-muted)]"
                  >
                    {h.englishText}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--wasl-primary)] font-medium">
                  <span>{locale === "ar" ? refAr : refEn}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}

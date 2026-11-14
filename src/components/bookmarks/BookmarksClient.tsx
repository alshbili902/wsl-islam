"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Copy,
  Check,
  Search,
  Trash2,
} from "lucide-react";
import { useWasl } from "@/components/providers/WaslProvider";
import { WaslShare } from "@/components/share/WaslShare";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageShell } from "@/components/ui/MotionPrimitives";
import { GeometricLattice } from "@/components/brand/IslamicVisuals";
import { WaslLogo } from "@/components/brand/WaslLogo";
import type { BookmarkItem } from "@/types/islamic";

const TYPE_LABELS: Record<
  "all" | BookmarkItem["type"],
  { ar: string; en: string }
> = {
  all: { ar: "الكل", en: "All Saved" },
  verse: { ar: "الآيات", en: "Verses" },
  tafsir: { ar: "التفسير", en: "Tafsir" },
  mushaf: { ar: "المصحف", en: "Mushaf" },
  hadith: { ar: "الأحاديث", en: "Hadiths" },
  dhikr: { ar: "الأذكار والأدعية", en: "Adhkar & Duas" },
  article: { ar: "المقالات", en: "Articles" },
  lecture: { ar: "المحاضرات", en: "Lectures" },
};

export function BookmarksClient() {
  const { locale, bookmarks, removeBookmark } = useWasl();

  const [filterType, setFilterType] = useState<"all" | BookmarkItem["type"]>("all");
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredBookmarks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookmarks.filter((b) => {
      if (filterType !== "all" && b.type !== filterType) return false;
      if (!q) return true;
      return (
        b.arabicText.toLowerCase().includes(q) ||
        (b.englishText ?? "").toLowerCase().includes(q) ||
        b.titleAr.toLowerCase().includes(q) ||
        b.titleEn.toLowerCase().includes(q)
      );
    });
  }, [bookmarks, filterType, query]);

  const handleCopy = async (b: BookmarkItem) => {
    const text =
      locale === "ar"
        ? `${b.arabicText}\n\n[${b.referenceAr}]`
        : `${b.arabicText}\n\n${b.englishText ?? ""}\n\n[${b.referenceEn}]`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(b.id);
      window.setTimeout(() => {
        setCopiedId((c) => (c === b.id ? null : c));
      }, 2000);
    } catch {
      // Ignore
    }
  };

  return (
    <PageShell className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { labelAr: "المحفوظات", labelEn: "Saved Bookmarks" },
        ]}
      />

      <section className="wasl-surface relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-6 shadow-sm">
        <GeometricLattice className="opacity-[0.04]" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--wasl-border)] bg-[var(--wasl-bg)]/85 px-3.5 py-1 text-xs font-medium text-[var(--wasl-primary)]">
              <Bookmark className="h-3.5 w-3.5 text-[var(--wasl-accent)]" />
              <span>
                {locale === "ar"
                  ? "محفوظة محليًا على متصفحك دون تسجيل"
                  : "Stored Locally on Your Device"}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[var(--wasl-text)] sm:text-4xl">
              {locale === "ar" ? "المحفوظات والمفضلة" : "Saved Bookmarks"}
            </h1>
            <p className="text-sm text-[var(--wasl-text-muted)]">
              {locale === "ar"
                ? `لديك ${bookmarks.length} عنصراً محفوظاً للرجوع السريع والمشاركة.`
                : `You currently have ${bookmarks.length} saved item(s).`}
            </p>
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-3.5 h-4 w-4 text-[var(--wasl-text-muted)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={locale === "ar" ? "ابحث في محفوظاتك..." : "Search saved items..."}
              className="w-full rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] py-2.5 ps-10 pe-4 text-sm text-[var(--wasl-text)] focus:border-[var(--wasl-primary)] focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(Object.keys(TYPE_LABELS) as ("all" | BookmarkItem["type"])[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilterType(key)}
            className={`rounded-2xl border px-4 py-2 text-xs sm:text-sm font-semibold transition ${
              filterType === key
                ? "border-[var(--wasl-primary)] bg-[var(--wasl-primary)] text-white"
                : "border-[var(--wasl-border)] bg-[var(--wasl-surface)] text-[var(--wasl-text)] hover:border-[var(--wasl-primary)]/50"
            }`}
          >
            {locale === "ar" ? TYPE_LABELS[key].ar : TYPE_LABELS[key].en}
          </button>
        ))}
      </div>

      {filteredBookmarks.length === 0 ? (
        <div className="wasl-surface rounded-3xl p-10 text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-emerald-soft)] border border-[var(--border-subtle)]">
            <WaslLogo variant="icon" className="h-11 w-11" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-lg font-bold text-[var(--wasl-text)]">
              {bookmarks.length === 0
                ? locale === "ar"
                  ? "لا توجد محفوظات بعد"
                  : "No Bookmarks Yet"
                : locale === "ar"
                  ? "لا توجد نتائج مطابقة"
                  : "No Matching Bookmarks"}
            </h2>
            <p className="text-xs leading-relaxed text-[var(--wasl-text-muted)]">
              {locale === "ar"
                ? "اضغط على أيقونة الحفظ بجانب أي آية أو حديث أو ذكر أو مقال لتصل إليها سريعاً هنا."
                : "Click the bookmark button beside any Quranic verse, hadith, dhikr, or article to save it here."}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/quran"
              className="rounded-xl bg-[var(--wasl-primary)] px-4 py-2 text-xs font-bold text-white"
            >
              {locale === "ar" ? "تصفح القرآن الكريم" : "Browse Quran"}
            </Link>
            <Link
              href="/adhkar"
              className="rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-4 py-2 text-xs font-bold text-[var(--wasl-text)]"
            >
              {locale === "ar" ? "الأذكار والأدعية" : "Explore Adhkar"}
            </Link>
            <Link
              href="/hadith"
              className="rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-4 py-2 text-xs font-bold text-[var(--wasl-text)]"
            >
              {locale === "ar" ? "الحديث الشريف" : "Hadith Library"}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookmarks.map((b) => (
            <article key={b.id} className="wasl-surface rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[var(--wasl-primary)]/10 px-3 py-1 text-xs font-bold text-[var(--wasl-primary)]">
                    {locale === "ar" ? TYPE_LABELS[b.type].ar : TYPE_LABELS[b.type].en}
                  </span>
                  <Link
                    href={b.url}
                    className="text-xs font-semibold text-[var(--wasl-text)] hover:text-[var(--wasl-primary)] hover:underline"
                  >
                    {locale === "ar" ? b.titleAr : b.titleEn}
                  </Link>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopy(b)}
                    className="inline-flex items-center gap-1 rounded-xl border border-[var(--wasl-border)] px-3 py-1.5 text-xs text-[var(--wasl-text-muted)] hover:text-[var(--wasl-text)]"
                  >
                    {copiedId === b.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{locale === "ar" ? "نسخ" : "Copy"}</span>
                  </button>

                  <WaslShare
                    variant="pill"
                    label={locale === "ar" ? "مشاركة" : "Share"}
                    payload={{
                      kind:
                        b.type === "verse" || b.type === "mushaf"
                          ? "verse"
                          : b.type === "tafsir"
                            ? "tafsir"
                            : b.type === "hadith"
                              ? "hadith"
                              : b.type === "lecture"
                                ? "lecture"
                                : b.type === "article"
                                  ? "article"
                                  : "dhikr",
                      titleAr: b.titleAr,
                      titleEn: b.titleEn,
                      arabicText: b.arabicText,
                      englishText: b.englishText,
                      referenceAr: b.referenceAr,
                      referenceEn: b.referenceEn,
                      shareUrl: b.url,
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => removeBookmark(b.id)}
                    aria-label={locale === "ar" ? "حذف من المحفوظات" : "Remove bookmark"}
                    className="inline-flex items-center gap-1 rounded-xl border border-red-500/25 px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{locale === "ar" ? "حذف" : "Remove"}</span>
                  </button>
                </div>
              </div>

              <p dir="rtl" lang="ar" className="font-arabic text-lg sm:text-xl leading-loose text-[var(--wasl-text)]">
                {b.arabicText}
              </p>

              {b.englishText && (
                <p dir="ltr" lang="en" className="text-xs sm:text-sm leading-relaxed text-[var(--wasl-text-muted)]">
                  {b.englishText}
                </p>
              )}

              {b.note && (
                <p className="rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-3 py-2 text-xs text-[var(--wasl-text)]">
                  <span className="font-semibold text-[var(--wasl-primary)]">
                    {locale === "ar" ? "ملاحظة:" : "Note:"}
                  </span>{" "}
                  {b.note}
                </p>
              )}

              <p className="text-xs font-medium text-[var(--wasl-primary)]">
                {locale === "ar" ? b.referenceAr : b.referenceEn}
              </p>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}

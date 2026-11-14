"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Headphones,
  Pause,
  Play,
  Search,
} from "lucide-react";
import { useAudio } from "@/components/providers/AudioProvider";
import { useWasl } from "@/components/providers/WaslProvider";
import { WaslShare } from "@/components/share/WaslShare";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageShell } from "@/components/ui/MotionPrimitives";
import { VERIFIED_RECITERS } from "@/data/reciters";
import { SURAHS } from "@/data/surahs";

export function QuranDirectoryClient() {
  const { locale, t } = useWasl();
  const {
    track,
    status: audioStatus,
    playSurah,
    togglePlayPause,
    savedPosition,
  } = useAudio();

  const [search, setSearch] = useState("");
  const [revelationFilter, setRevelationFilter] = useState<
    "all" | "Meccan" | "Medinan"
  >("all");
  const [selectedReciterSlug, setSelectedReciterSlug] = useState(
    VERIFIED_RECITERS[0].slug
  );

  const activeReciter = useMemo(
    () =>
      VERIFIED_RECITERS.find((r) => r.slug === selectedReciterSlug) ??
      VERIFIED_RECITERS[0],
    [selectedReciterSlug]
  );

  const filteredSurahs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SURAHS.filter((s) => {
      if (revelationFilter !== "all" && s.revelationType !== revelationFilter) {
        return false;
      }
      if (!q) return true;
      return (
        s.nameAr.includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        String(s.number) === q
      );
    });
  }, [search, revelationFilter]);

  return (
    <PageShell className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs
        items={[{ labelAr: "القرآن الكريم", labelEn: "Holy Quran" }]}
      />

      {/* Header & Controls */}
      <div className="wasl-arch-card p-6 sm:p-8 mb-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-emerald-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-emerald)]">
              <BookOpen className="h-3.5 w-3.5" />
              <span>
                {locale === "ar"
                  ? "المصحف الشريف كاملاً — 114 سورة"
                  : "Complete Holy Quran — 114 Surahs"}
              </span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold">
              {locale === "ar"
                ? "القرآن الكريم: قراءة واستماع"
                : "The Noble Quran: Read & Listen"}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
              {locale === "ar"
                ? "نص عثماني موثق برواية حفص عن عاصم مع التفسير الميسر والترجمة الإنجليزية وتلاوات نخبة من كبار القراء."
                : "Authentic Uthmani script with Tafsir Al-Muyassar, Sahih International translation, and full-surah recitations from verified Qaris."}
            </p>
          </div>

          {savedPosition ? (
            <button
              type="button"
              onClick={() => {
                const rec =
                  VERIFIED_RECITERS.find(
                    (r) => r.slug === savedPosition.reciterSlug
                  ) ?? VERIFIED_RECITERS[0];
                playSurah(
                  savedPosition.surahNumber,
                  rec,
                  savedPosition.currentTime
                );
              }}
              className="inline-flex items-center gap-2.5 rounded-2xl bg-[var(--brand-emerald)] hover:bg-[var(--brand-emerald-strong)] text-white px-5 py-3 text-sm font-semibold shadow-sm transition-colors self-start"
            >
              <Headphones className="h-4 w-4" />
              <span>
                {locale === "ar"
                  ? `متابعة: ${SURAHS.find((s) => s.number === savedPosition.surahNumber)?.nameAr ?? ""}`
                  : `Resume: ${SURAHS.find((s) => s.number === savedPosition.surahNumber)?.englishName ?? ""}`}
              </span>
            </button>
          ) : null}
        </div>

        {/* Search, Filter & Reciter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-[var(--border-subtle)]">
          <div className="md:col-span-5 relative">
            <Search className="h-4 w-4 text-[var(--text-muted)] absolute top-1/2 -translate-y-1/2 start-3.5" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                locale === "ar"
                  ? "ابحث باسم السورة أو رقمها (مثال: الكهف، 18)..."
                  : "Search surah by name or number (e.g. Al-Kahf, 18)..."
              }
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/70 ps-10 pe-4 py-2.5 text-sm outline-none focus:border-[var(--brand-emerald)]"
            />
          </div>

          <div className="md:col-span-3 flex items-center gap-1.5">
            {(
              [
                ["all", locale === "ar" ? "الكل" : "All"],
                ["Meccan", t.common.meccan],
                ["Medinan", t.common.medinan],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setRevelationFilter(val)}
                className={`flex-1 rounded-xl border py-2.5 text-xs sm:text-sm font-medium transition-colors ${
                  revelationFilter === val
                    ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)] font-semibold"
                    : "border-[var(--border-subtle)] hover:bg-[var(--bg-surface-alt)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="md:col-span-4">
            <select
              aria-label={locale === "ar" ? "القارئ المختار" : "Select Reciter"}
              value={selectedReciterSlug}
              onChange={(e) => setSelectedReciterSlug(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/70 px-3.5 py-2.5 text-sm font-medium outline-none"
            >
              {VERIFIED_RECITERS.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {locale === "ar"
                    ? `القارئ: ${r.nameAr}`
                    : `Reciter: ${r.nameEn}`}
                </option>
              ))}
            </select>
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              <Link
                href="/listen/reciters"
                className="font-semibold text-[var(--brand-emerald)] hover:underline"
              >
                {locale === "ar"
                  ? "تصفح جميع القراء (244+ قارئاً) ←"
                  : "Browse All 244+ Reciters →"}
              </Link>
              <Link
                href="/listen"
                className="text-[var(--text-muted)] hover:text-[var(--brand-emerald)] hover:underline"
              >
                {locale === "ar" ? "مركز الاستماع" : "Listening Center"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 114 Surahs Grid */}
      {filteredSurahs.length === 0 ? (
        <div className="wasl-surface rounded-2xl p-12 text-center text-sm text-[var(--text-muted)]">
          {locale === "ar"
            ? "لم يتم العثور على سورة مطابقة لبحثك."
            : "No surahs matched your search."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurahs.map((surah) => {
            const isActive =
              track?.kind === "quran" &&
              track.surahNumber === surah.number &&
              track.reciter.slug === activeReciter.slug;
            const isPlaying = isActive && audioStatus === "playing";

            return (
              <div
                key={surah.number}
                className={`wasl-surface rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 ${
                  isActive
                    ? "border-[var(--brand-emerald)] ring-1 ring-[var(--brand-emerald)]/35"
                    : ""
                }`}
              >
                <Link
                  href={`/quran/${surah.number}`}
                  className="flex items-center gap-3.5 min-w-0 flex-1 group"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)] font-bold text-sm border border-[var(--border-subtle)] group-hover:border-[var(--brand-gold)] transition-colors">
                    {surah.number}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-base sm:text-lg truncate group-hover:text-[var(--brand-emerald)] transition-colors">
                        {locale === "ar" ? surah.nameAr : surah.englishName}
                      </h2>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {locale === "ar"
                        ? `${surah.revelationType === "Meccan" ? t.common.meccan : t.common.medinan} • ${surah.numberOfAyahs} ${t.common.verses}`
                        : `${surah.englishNameTranslation} • ${surah.revelationType === "Meccan" ? t.common.meccan : t.common.medinan} • ${surah.numberOfAyahs} ${t.common.verses}`}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-1.5 shrink-0">
                  <WaslShare
                    variant="icon"
                    stopPropagation
                    payload={{
                      kind: "surah",
                      titleAr: `سورة ${surah.nameAr}`,
                      titleEn: `Surah ${surah.englishName}`,
                      arabicText: `سورة ${surah.nameAr} — ${
                        surah.revelationType === "Meccan" ? "مكية" : "مدنية"
                      }، عدد آياتها ${surah.numberOfAyahs} آية.`,
                      englishText: `Surah ${surah.englishName} (${surah.englishNameTranslation}) — ${surah.revelationType}, ${surah.numberOfAyahs} verses.`,
                      referenceAr: `السورة رقم ${surah.number} في المصحف الشريف`,
                      referenceEn: `Surah #${surah.number} in the Noble Quran`,
                      sourceAr: "القرآن الكريم — مجمع الملك فهد لطباعة المصحف الشريف",
                      sourceEn: "The Noble Quran — King Fahd Complex",
                      surahNameAr: surah.nameAr,
                      surahNameEn: surah.englishName,
                      surahNumber: surah.number,
                      shareUrl: `/quran/${surah.number}`,
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      isActive
                        ? togglePlayPause()
                        : playSurah(surah.number, activeReciter)
                    }
                    aria-label={
                      isPlaying
                        ? locale === "ar"
                          ? "إيقاف"
                          : "Pause"
                        : locale === "ar"
                          ? `تشغيل ${surah.nameAr}`
                          : `Play ${surah.englishName}`
                    }
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isPlaying
                        ? "bg-[var(--brand-gold)] text-white"
                        : "bg-[var(--bg-surface-alt)] text-[var(--brand-emerald)] hover:bg-[var(--brand-emerald)] hover:text-white border border-[var(--border-subtle)]"
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 ms-0.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}

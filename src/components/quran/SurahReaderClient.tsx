"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  Copy,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { BismillahBanner } from "@/components/brand/IslamicVisuals";
import { useAudio } from "@/components/providers/AudioProvider";
import { useWasl } from "@/components/providers/WaslProvider";
import { WaslShare } from "@/components/share/WaslShare";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageShell } from "@/components/ui/MotionPrimitives";
import { VERIFIED_RECITERS } from "@/data/reciters";
import { SURAHS } from "@/data/surahs";
import type { SurahDetailPayload } from "@/lib/api/quran";

function formatDuration(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = Math.floor(sec % 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function SurahReaderClient({
  initialData,
}: {
  initialData: SurahDetailPayload;
}) {
  const { locale, isRtl, t, isBookmarked, toggleBookmark } =
    useWasl();
  const {
    track,
    status: audioStatus,
    currentTime,
    duration,
    volume,
    muted,
    playbackRate,
    savedPosition,
    playSurah,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    setPlaybackRate,
  } = useAudio();

  const { surah, ayahs, source } = initialData;

  const [selectedReciterSlug, setSelectedReciterSlug] = useState(
    VERIFIED_RECITERS[0].slug
  );
  const [fontSize, setFontSize] = useState<"md" | "lg" | "xl">("lg");
  const [viewMode, setViewMode] = useState<"verses" | "mushaf">("verses");
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTafsir, setShowTafsir] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const selectedReciter = useMemo(
    () =>
      VERIFIED_RECITERS.find((r) => r.slug === selectedReciterSlug) ??
      VERIFIED_RECITERS[0],
    [selectedReciterSlug]
  );

  const isThisSurahActive =
    track?.kind === "quran" && track.surahNumber === surah.number;
  const isThisSurahPlaying = isThisSurahActive && audioStatus === "playing";

  const prevSurahMeta = SURAHS.find((s) => s.number === surah.number - 1);
  const nextSurahMeta = SURAHS.find((s) => s.number === surah.number + 1);

  const fontSizeClass =
    fontSize === "xl"
      ? "text-3xl sm:text-4xl leading-[2.35]"
      : fontSize === "lg"
        ? "text-2xl sm:text-3xl leading-[2.25]"
        : "text-xl sm:text-2xl leading-[2.15]";

  const handleCopyAyah = async (ayahNumber: number, textAr: string) => {
    try {
      await navigator.clipboard.writeText(
        `﴿${textAr}﴾ [${surah.nameAr}: ${ayahNumber}]`
      );
      setCopiedId(ayahNumber);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Ignore
    }
  };

  return (
    <PageShell className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { labelAr: "القرآن الكريم", labelEn: "Holy Quran", href: "/quran" },
          {
            labelAr: surah.nameAr,
            labelEn: `Surah ${surah.englishName}`,
          },
        ]}
      />

      {/* Surah Header + Dedicated Audio Studio */}
      <section className="wasl-arch-card p-5 sm:p-8 mb-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--brand-gold)] font-semibold mb-1.5">
              <span>
                {locale === "ar"
                  ? `السورة رقم ${surah.number}`
                  : `Surah ${surah.number}`}
              </span>
              <span>•</span>
              <span>
                {surah.revelationType === "Meccan"
                  ? t.common.meccan
                  : t.common.medinan}
              </span>
              <span>•</span>
              <span>
                {surah.numberOfAyahs} {t.common.verses}
              </span>
            </div>
            <h1 className="font-arabic-display text-3xl sm:text-4xl font-bold">
              {locale === "ar"
                ? surah.nameAr
                : `${surah.englishName} — ${surah.englishNameTranslation}`}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <WaslShare
              variant="pill"
              label={locale === "ar" ? "مشاركة السورة" : "Share Surah"}
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
            {prevSurahMeta ? (
              <Link
                href={`/quran/${prevSurahMeta.number}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium hover:border-[var(--brand-emerald)] transition-colors"
              >
                {isRtl ? (
                  <ArrowRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowLeft className="h-3.5 w-3.5" />
                )}
                <span>
                  {locale === "ar"
                    ? prevSurahMeta.nameAr
                    : prevSurahMeta.englishName}
                </span>
              </Link>
            ) : null}
            {nextSurahMeta ? (
              <Link
                href={`/quran/${nextSurahMeta.number}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium hover:border-[var(--brand-emerald)] transition-colors"
              >
                <span>
                  {locale === "ar"
                    ? nextSurahMeta.nameAr
                    : nextSurahMeta.englishName}
                </span>
                {isRtl ? (
                  <ArrowLeft className="h-3.5 w-3.5" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5" />
                )}
              </Link>
            ) : null}
          </div>
        </div>

        {/* Dedicated Surah Audio Player */}
        <div className="rounded-2xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                type="button"
                onClick={() =>
                  isThisSurahActive
                    ? togglePlayPause()
                    : playSurah(
                        surah.number,
                        selectedReciter,
                        savedPosition?.surahNumber === surah.number
                          ? savedPosition.currentTime
                          : 0
                      )
                }
                aria-label={
                  isThisSurahPlaying
                    ? locale === "ar"
                      ? "إيقاف مؤقت"
                      : "Pause"
                    : locale === "ar"
                      ? "تشغيل السورة"
                      : "Play Surah"
                }
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand-emerald)] hover:bg-[var(--brand-emerald-strong)] text-white shadow-md transition-colors"
              >
                {isThisSurahPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ms-0.5" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <label
                  htmlFor="surah-reciter-select"
                  className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1"
                >
                  {locale === "ar"
                    ? "القارئ المعتمد (MP3Quran)"
                    : "Verified Reciter (MP3Quran)"}
                </label>
                <select
                  id="surah-reciter-select"
                  value={
                    isThisSurahActive
                      ? track.reciter.slug
                      : selectedReciterSlug
                  }
                  onChange={(e) => {
                    const slug = e.target.value;
                    setSelectedReciterSlug(slug);
                    const rec = VERIFIED_RECITERS.find((r) => r.slug === slug);
                    if (rec && isThisSurahActive) {
                      playSurah(surah.number, rec, 0);
                    }
                  }}
                  className="w-full sm:w-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm font-medium outline-none"
                >
                  {VERIFIED_RECITERS.map((r) => (
                    <option key={r.slug} value={r.slug}>
                      {locale === "ar" ? r.nameAr : r.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {prevSurahMeta ? (
                <Link
                  href={`/quran/${prevSurahMeta.number}`}
                  aria-label={locale === "ar" ? "السورة السابقة" : "Previous Surah"}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 hover:border-[var(--brand-gold)]"
                >
                  <SkipBack className="h-4 w-4" />
                </Link>
              ) : null}
              {nextSurahMeta ? (
                <Link
                  href={`/quran/${nextSurahMeta.number}`}
                  aria-label={locale === "ar" ? "السورة التالية" : "Next Surah"}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 hover:border-[var(--brand-gold)]"
                >
                  <SkipForward className="h-4 w-4" />
                </Link>
              ) : null}

              {/* Playback Rate */}
              <div className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-0.5">
                {[0.75, 1, 1.25].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setPlaybackRate(rate)}
                    className={`rounded-lg px-2 py-1 text-xs font-mono ${
                      playbackRate === rate
                        ? "bg-[var(--brand-emerald)] text-white font-semibold"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Seek & Volume Bar */}
          {isThisSurahActive ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
              <div className="flex flex-1 items-center gap-2.5 text-xs font-mono text-[var(--text-muted)]">
                <span className="w-11 text-center">
                  {formatDuration(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={Math.min(currentTime, duration || 100)}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  aria-label={locale === "ar" ? "شريط التقدم" : "Seek slider"}
                  className="flex-1 h-2 accent-[var(--brand-emerald)] cursor-pointer"
                />
                <span className="w-11 text-center">
                  {formatDuration(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="p-1.5 rounded-lg hover:bg-[var(--bg-surface)]"
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  aria-label={locale === "ar" ? "الصوت" : "Volume"}
                  className="w-24 h-1.5 accent-[var(--brand-gold)] cursor-pointer"
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Reading Preferences Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-[var(--border-subtle)] p-0.5 bg-[var(--bg-surface-alt)]/50">
              <button
                type="button"
                onClick={() => setViewMode("verses")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "verses"
                    ? "bg-[var(--bg-surface)] text-[var(--brand-emerald)] shadow-sm font-semibold"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {locale === "ar" ? "آية بآية" : "Verse-by-Verse"}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("mushaf")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "mushaf"
                    ? "bg-[var(--bg-surface)] text-[var(--brand-emerald)] shadow-sm font-semibold"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {locale === "ar" ? "وضع المصحف" : "Mushaf Flow"}
              </button>
            </div>

            {viewMode === "verses" ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowTranslation((p) => !p)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                    showTranslation
                      ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)]"
                      : "border-[var(--border-subtle)]"
                  }`}
                >
                  {locale === "ar" ? "الترجمة الإنجليزية" : "Translation"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTafsir((p) => !p)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                    showTafsir
                      ? "border-[var(--brand-gold)] bg-[var(--brand-gold-soft)] text-[var(--text-primary)]"
                      : "border-[var(--border-subtle)]"
                  }`}
                >
                  {locale === "ar" ? "التفسير الميسر" : "Tafsir Muyassar"}
                </button>
              </>
            ) : null}
          </div>

          {/* Font Size Controls */}
          <div className="inline-flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] p-0.5 bg-[var(--bg-surface-alt)]/50">
            {(
              [
                ["md", locale === "ar" ? "متوسط" : "A"],
                ["lg", locale === "ar" ? "كبير" : "A+"],
                ["xl", locale === "ar" ? "مريح جداً" : "A++"],
              ] as const
            ).map(([sz, label]) => (
              <button
                key={sz}
                type="button"
                onClick={() => setFontSize(sz)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  fontSize === sz
                    ? "bg-[var(--brand-emerald)] text-white"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Bismillah Header (except Surah 9 At-Tawbah and Surah 1 where Ayah 1 IS Bismillah) */}
      {surah.number !== 1 && surah.number !== 9 ? (
        <div className="mb-6 py-3">
          <BismillahBanner />
        </div>
      ) : null}

      {/* Quran Text Display */}
      {viewMode === "mushaf" ? (
        <article className="wasl-surface wasl-reading-surface wasl-reading-container rounded-3xl p-6 sm:p-10">
          <div dir="rtl" className={`font-quran font-quran-reading text-justify ${fontSizeClass}`}>
            {ayahs.map((ayah) => (
              <span key={ayah.number} className="inline">
                {ayah.textAr}{" "}
                <span className="inline-flex items-center justify-center mx-1 px-2 py-0.5 text-sm font-sans font-bold rounded-full border border-[var(--brand-gold)]/50 text-[var(--brand-gold)] align-middle">
                  ﴿{ayah.numberInSurah}﴾
                </span>{" "}
              </span>
            ))}
          </div>
        </article>
      ) : (
        <div className="space-y-4">
          {ayahs.map((ayah) => {
            const bmId = `verse-${surah.number}:${ayah.numberInSurah}`;
            const saved = isBookmarked(bmId);
            return (
              <article
                key={ayah.number}
                id={`ayah-${ayah.numberInSurah}`}
                className="wasl-surface wasl-reading-surface wasl-reading-container rounded-2xl p-5 sm:p-7 space-y-4"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--border-subtle)]/70">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-emerald-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-emerald)]">
                      {surah.number}:{ayah.numberInSurah}
                    </span>
                    <Link
                      href={`/tafsir/${surah.number}/${ayah.numberInSurah}`}
                      className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-semibold text-[var(--brand-emerald)] hover:bg-[var(--brand-emerald-soft)] transition-colors"
                    >
                      {locale === "ar" ? "تفسير الآية" : "Tafsir"}
                    </Link>
                    {ayah.page ? (
                      <Link
                        href={`/mushaf?page=${ayah.page}`}
                        className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)] hover:border-[var(--brand-emerald)] transition-colors"
                      >
                        {locale === "ar" ? `المصحف ص ${ayah.page}` : `Mushaf p.${ayah.page}`}
                      </Link>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyAyah(ayah.numberInSurah, ayah.textAr)
                      }
                      aria-label={t.common.copy}
                      className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)]"
                    >
                      {copiedId === ayah.numberInSurah ? (
                        <Check className="h-4 w-4 text-[var(--brand-emerald)]" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        toggleBookmark({
                          id: bmId,
                          type: "verse",
                          titleAr: `${surah.nameAr} — الآية ${ayah.numberInSurah}`,
                          titleEn: `${surah.englishName} (${surah.number}:${ayah.numberInSurah})`,
                          arabicText: ayah.textAr,
                          englishText: ayah.textEn,
                          referenceAr: `${surah.nameAr} — الآية ${ayah.numberInSurah}`,
                          referenceEn: `Surah ${surah.englishName} ${surah.number}:${ayah.numberInSurah}`,
                          url: `/quran/${surah.number}#ayah-${ayah.numberInSurah}`,
                        })
                      }
                      aria-label={t.common.bookmark}
                      className={`rounded-lg p-1.5 transition-colors ${
                        saved
                          ? "bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)]"
                          : "text-[var(--text-muted)] hover:bg-[var(--bg-surface-alt)]"
                      }`}
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>
                    <WaslShare
                      variant="icon"
                      payload={{
                        kind: "verse",
                        arabicText: `﴿${ayah.textAr}﴾`,
                        englishText: ayah.textEn,
                        referenceAr: `${surah.nameAr} — الآية ${ayah.numberInSurah}`,
                        referenceEn: `Surah ${surah.englishName} (${surah.number}:${ayah.numberInSurah})`,
                        sourceAr: "القرآن الكريم — مجمع الملك فهد لطباعة المصحف الشريف",
                        sourceEn: "The Noble Quran — King Fahd Complex",
                        surahNameAr: surah.nameAr,
                        surahNameEn: surah.englishName,
                        surahNumber: surah.number,
                        ayahNumber: ayah.numberInSurah,
                        shareUrl: `/quran/${surah.number}#ayah-${ayah.numberInSurah}`,
                      }}
                    />
                  </div>
                </div>

                <p dir="rtl" className={`font-quran ${fontSizeClass}`}>
                  {ayah.textAr}
                </p>

                {showTranslation && ayah.textEn ? (
                  <p
                    dir="ltr"
                    className="text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] border-s-2 border-[var(--brand-emerald)]/35 ps-3.5"
                  >
                    {ayah.textEn}
                  </p>
                ) : null}

                {showTafsir && ayah.tafsirAr ? (
                  <div
                    dir="rtl"
                    className="rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] p-4 text-sm leading-relaxed text-[var(--text-secondary)]"
                  >
                    <span className="font-bold text-[var(--brand-gold)] block mb-1">
                      التفسير الميسر:
                    </span>
                    {ayah.tafsirAr}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
        {t.common.source}: {source}
      </p>
    </PageShell>
  );
}

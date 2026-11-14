"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  CalendarDays,
  Compass,
  HandHeart,
  Headphones,
  HelpCircle,
  Library,
  MapPin,
  Pause,
  Play,
  Radio,
  Sparkles,
  SunMoon,
  Volume2,
} from "lucide-react";
import {
  BismillahBanner,
  GeometricLattice,
  OrnamentalDivider,
} from "@/components/brand/IslamicVisuals";
import { WaslLogo } from "@/components/brand/WaslLogo";
import { WaslShare } from "@/components/share/WaslShare";
import { useAudio } from "@/components/providers/AudioProvider";
import { useWasl } from "@/components/providers/WaslProvider";
import { RevealSection } from "@/components/ui/MotionPrimitives";
import { ADHKAR_CATEGORIES } from "@/data/adhkar";
import { CITIES } from "@/data/cities";
import type { DailyHadith } from "@/data/hadith-books";
import { VERIFIED_RECITERS } from "@/data/reciters";
import { SURAHS } from "@/data/surahs";
import {
  computePrayerDay,
  formatCountdown,
  getRamadanStatus,
} from "@/lib/prayer/calculator";
import type { Article, DailyVerse, RadioStation } from "@/types/islamic";

const FEATURED_SURAH_NUMBERS = [1, 18, 36, 55, 67, 112];
const STATIC_ANCHOR_DATE = new Date("2026-11-14T09:00:00Z");

export function HomeExperience({
  dailyVerse,
  dailyHadith,
  featuredRadios,
  featuredArticles,
}: {
  dailyVerse: DailyVerse;
  dailyHadith: DailyHadith;
  featuredRadios: RadioStation[];
  featuredArticles: Article[];
}) {
  const { locale, isRtl, t, isBookmarked, toggleBookmark } =
    useWasl();
  const {
    track,
    status: audioStatus,
    playSurah,
    playRadio,
    togglePlayPause,
    savedPosition,
  } = useAudio();

  const [selectedCityId, setSelectedCityId] = useState("makkah");
  const [selectedReciterSlug, setSelectedReciterSlug] = useState(
    VERIFIED_RECITERS[0].slug
  );
  const [liveNow, setLiveNow] = useState<Date | null>(null);
  const now = liveNow ?? STATIC_ANCHOR_DATE;

  // Tick every second for accurate live prayer countdown after hydration
  useEffect(() => {
    const startId = window.setTimeout(() => setLiveNow(new Date()), 0);
    const timer = window.setInterval(() => setLiveNow(new Date()), 1000);
    return () => {
      window.clearTimeout(startId);
      window.clearInterval(timer);
    };
  }, []);

  // Load persisted prayer city if visitor configured one on /prayer-times
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem("wasl_prayer_city_v1");
        if (saved && CITIES.some((c) => c.id === saved)) {
          setSelectedCityId(saved);
        }
      } catch {
        // Ignore
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const activeCity = useMemo(
    () => CITIES.find((c) => c.id === selectedCityId) ?? CITIES[0],
    [selectedCityId]
  );

  const prayerDay = useMemo(
    () =>
      computePrayerDay({
        latitude: activeCity.latitude,
        longitude: activeCity.longitude,
        timezone: activeCity.timezone,
        methodId: activeCity.defaultMethodId,
        now,
      }),
    [activeCity, now]
  );

  const ramadanStatus = useMemo(() => getRamadanStatus(now), [now]);

  const activeReciter = useMemo(
    () =>
      VERIFIED_RECITERS.find((r) => r.slug === selectedReciterSlug) ??
      VERIFIED_RECITERS[0],
    [selectedReciterSlug]
  );

  const featuredSurahs = useMemo(
    () =>
      FEATURED_SURAH_NUMBERS.map((n) => SURAHS.find((s) => s.number === n)!).filter(
        Boolean
      ),
    []
  );

  const DirectionalArrow = isRtl ? ArrowLeft : ArrowRight;

  const verseBookmarkId = `verse-${dailyVerse.ref}`;
  const hadithBookmarkId = `hadith-${dailyHadith.id}`;

  return (
    <div className="pb-10">
      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative overflow-hidden wasl-ambient-hero border-b border-[var(--border-subtle)]">
        <div className="pointer-events-none absolute inset-0 text-[var(--brand-emerald)]">
          <GeometricLattice opacity={0.04} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-14 sm:pt-16 sm:pb-20">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <div className="flex justify-center">
              <WaslLogo
                variant="full"
                className="h-11 sm:h-14"
                alt={t.brand.name}
                priority
              />
            </div>

            <BismillahBanner />

            {/* Date & Ramadan Pill */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)]/85 backdrop-blur-md px-4 py-1.5 text-xs sm:text-sm shadow-sm">
              <CalendarDays className="h-4 w-4 text-[var(--brand-gold)]" />
              <span className="font-semibold text-[var(--text-primary)]">
                {locale === "ar" ? prayerDay.hijriAr : prayerDay.hijriEn}
              </span>
              <span className="text-[var(--text-muted)]">•</span>
              <span className="text-[var(--text-secondary)]">
                {ramadanStatus.isRamadan
                  ? locale === "ar"
                    ? `رمضان اليوم ${ramadanStatus.currentRamadanDay}`
                    : `Ramadan Day ${ramadanStatus.currentRamadanDay}`
                  : locale === "ar"
                    ? `متبقي على رمضان ${ramadanStatus.daysUntilRamadan} يوماً`
                    : `${ramadanStatus.daysUntilRamadan} days to Ramadan`}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.22] text-[var(--text-primary)]">
              {locale === "ar" ? (
                <>
                  وصلٌ بالكتاب والسنة،{" "}
                  <span className="text-[var(--brand-emerald)]">
                    وسكينةٌ للقلب
                  </span>{" "}
                  في كل يوم
                </>
              ) : (
                <>
                  Connected to the{" "}
                  <span className="text-[var(--brand-emerald)]">
                    Quran & Sunnah
                  </span>
                  , Serenity for Every Day
                </>
              )}
            </h1>

            <p className="mx-auto max-w-2xl text-sm sm:text-lg leading-relaxed text-[var(--text-secondary)]">
              {locale === "ar"
                ? "منصة وصل الإسلامية تجمع القرآن الكريم تلاوةً وتفسيراً، ومواقيت الصلاة الدقيقة، والأذكار المأثورة، ومكتبة الحديث الشريف، والإذاعات الإسلامية الموثوقة في تجربة هادئة وموثقة المصادر."
                : "Wasl Islamic brings together the Noble Quran, accurate prayer times, authentic Adhkar, verified Hadith collections, and live Islamic radio in one serene, source-verified digital sanctuary."}
            </p>

            {/* Primary Service CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/quran"
                className="inline-flex items-center gap-2 rounded-2xl bg-[var(--brand-emerald)] hover:bg-[var(--brand-emerald-strong)] text-white px-6 py-3.5 text-sm sm:text-base font-semibold shadow-lg transition-all hover:-translate-y-0.5"
              >
                <BookOpen className="h-4 w-4" />
                <span>
                  {locale === "ar" ? "تصفح القرآن الكريم" : "Read Holy Quran"}
                </span>
              </Link>
              <Link
                href="/prayer-times"
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] hover:border-[var(--brand-gold)] px-5 py-3.5 text-sm sm:text-base font-semibold transition-all hover:-translate-y-0.5"
              >
                <Compass className="h-4 w-4 text-[var(--brand-gold)]" />
                <span>{t.nav.prayerTimes}</span>
              </Link>
              <Link
                href="/adhkar"
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] hover:border-[var(--brand-emerald)] px-5 py-3.5 text-sm sm:text-base font-semibold transition-all hover:-translate-y-0.5"
              >
                <SunMoon className="h-4 w-4 text-[var(--brand-emerald)]" />
                <span>{t.nav.adhkar}</span>
              </Link>
              <Link
                href="/radio"
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] hover:border-[var(--brand-gold)] px-5 py-3.5 text-sm sm:text-base font-semibold transition-all hover:-translate-y-0.5"
              >
                <Radio className="h-4 w-4 text-[var(--brand-gold)]" />
                <span>{t.nav.radio}</span>
              </Link>
            </div>

            {/* Resume Playback Pill if previously saved */}
            {savedPosition ? (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const reciter =
                      VERIFIED_RECITERS.find(
                        (r) => r.slug === savedPosition.reciterSlug
                      ) ?? VERIFIED_RECITERS[0];
                    playSurah(
                      savedPosition.surahNumber,
                      reciter,
                      savedPosition.currentTime
                    );
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-gold-soft)] border border-[var(--brand-gold)]/40 px-4 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--brand-gold)]/20 transition-colors"
                >
                  <Headphones className="h-3.5 w-3.5 text-[var(--brand-gold)]" />
                  <span>
                    {locale === "ar"
                      ? `متابعة الاستماع: ${SURAHS.find((s) => s.number === savedPosition.surahNumber)?.nameAr ?? ""}`
                      : `Resume listening: Surah ${SURAHS.find((s) => s.number === savedPosition.surahNumber)?.englishName ?? ""}`}
                  </span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20 mt-10">
        {/* ================= 2. PRAYER TIMES LIVE STRIP ================= */}
        <RevealSection>
          <section
            aria-labelledby="home-prayer-heading"
            className="wasl-arch-card p-5 sm:p-7 relative overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--brand-gold)]">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>
                    {locale === "ar"
                      ? `مواقيت الصلاة — ${activeCity.nameAr}`
                      : `Prayer Times — ${activeCity.nameEn}`}
                  </span>
                </div>
                <h2
                  id="home-prayer-heading"
                  className="text-xl sm:text-2xl font-bold"
                >
                  {locale === "ar"
                    ? `الصلاة القادمة: ${prayerDay.nextPrayer.nameAr}`
                    : `Next Prayer: ${prayerDay.nextPrayer.nameEn}`}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Live Countdown Badge */}
                <div className="rounded-2xl bg-[var(--brand-emerald)] text-white px-4 py-2.5 flex items-center gap-3 shadow-sm">
                  <span className="text-xs opacity-90">
                    {locale === "ar" ? "المتبقي" : "In"}
                  </span>
                  <span
                    dir="ltr"
                    className="font-mono text-lg sm:text-xl font-bold tracking-wider"
                  >
                    {formatCountdown(prayerDay.countdownMs)}
                  </span>
                </div>

                {/* Quick City Selector */}
                <select
                  aria-label={locale === "ar" ? "اختيار المدينة" : "Select city"}
                  value={selectedCityId}
                  onChange={(e) => {
                    setSelectedCityId(e.target.value);
                    try {
                      localStorage.setItem("wasl_prayer_city_v1", e.target.value);
                    } catch {
                      // Ignore
                    }
                  }}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] px-3 py-2.5 text-xs sm:text-sm font-medium outline-none"
                >
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {locale === "ar" ? c.nameAr : c.nameEn}
                    </option>
                  ))}
                </select>

                <Link
                  href="/prayer-times"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--brand-emerald)] hover:underline"
                >
                  <span>
                    {locale === "ar" ? "تفاصيل المواقيت" : "Full schedule"}
                  </span>
                  <DirectionalArrow className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5">
              {prayerDay.prayers.map((prayer) => {
                const isNext = prayer.key === prayerDay.nextPrayer.key;
                return (
                  <div
                    key={prayer.key}
                    className={`rounded-2xl border px-3.5 py-3.5 text-center transition-all ${
                      isNext
                        ? "border-[var(--brand-gold)] bg-[var(--brand-emerald-soft)] shadow-sm ring-1 ring-[var(--brand-gold)]/40"
                        : "border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/55"
                    }`}
                  >
                    <p
                      className={`text-xs font-semibold ${
                        isNext
                          ? "text-[var(--brand-emerald)]"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {locale === "ar" ? prayer.nameAr : prayer.nameEn}
                    </p>
                    <p
                      dir="ltr"
                      className="mt-1 text-base sm:text-lg font-bold text-[var(--text-primary)]"
                    >
                      {locale === "ar"
                        ? prayer.formatted12Ar
                        : prayer.formatted12En}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </RevealSection>

        {/* ================= 3 & 4. DAILY VERSE + DAILY HADITH ================= */}
        <RevealSection>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Verse */}
            <article className="wasl-surface rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-emerald-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-emerald)]">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{locale === "ar" ? "آية اليوم" : "Verse of the Day"}</span>
                  </span>
                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    {locale === "ar"
                      ? `${dailyVerse.surahNameAr} — الآية ${dailyVerse.ayahNumber}`
                      : `Surah ${dailyVerse.surahNameEn} (${dailyVerse.ref})`}
                  </span>
                </div>

                <blockquote
                  dir="rtl"
                  className="font-quran text-2xl sm:text-[1.7rem] leading-[2.15] text-[var(--text-primary)] pt-2"
                >
                  ﴿{dailyVerse.arabicText}﴾
                </blockquote>

                <p
                  dir="ltr"
                  className="text-sm leading-relaxed text-[var(--text-secondary)] border-s-2 border-[var(--brand-gold)]/50 ps-3"
                >
                  {dailyVerse.englishText}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[var(--text-muted)]">
                  {locale === "ar"
                    ? "المصدر: مصحف المدينة — Al-Quran Cloud"
                    : "Source: Al-Quran Cloud (Uthmani / Sahih Intl.)"}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      toggleBookmark({
                        id: verseBookmarkId,
                        type: "verse",
                        titleAr: `${dailyVerse.surahNameAr} (${dailyVerse.ayahNumber})`,
                        titleEn: `Surah ${dailyVerse.surahNameEn} (${dailyVerse.ref})`,
                        arabicText: dailyVerse.arabicText,
                        englishText: dailyVerse.englishText,
                        referenceAr: `${dailyVerse.surahNameAr} — الآية ${dailyVerse.ayahNumber}`,
                        referenceEn: `Surah ${dailyVerse.surahNameEn} ${dailyVerse.ref}`,
                        url: `/quran/${dailyVerse.surahNumber}`,
                      })
                    }
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                      isBookmarked(verseBookmarkId)
                        ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)]"
                        : "border-[var(--border-subtle)] hover:bg-[var(--bg-surface-alt)]"
                    }`}
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>
                      {isBookmarked(verseBookmarkId)
                        ? t.common.bookmarked
                        : t.common.bookmark}
                    </span>
                  </button>

                  <WaslShare
                    variant="button"
                    label={locale === "ar" ? "مشاركة" : "Share"}
                    payload={{
                      kind: "verse",
                      arabicText: `﴿${dailyVerse.arabicText}﴾`,
                      englishText: dailyVerse.englishText,
                      referenceAr: `${dailyVerse.surahNameAr} — الآية ${dailyVerse.ayahNumber}`,
                      referenceEn: `Surah ${dailyVerse.surahNameEn} (${dailyVerse.ref})`,
                      sourceAr: "القرآن الكريم — مجمع الملك فهد لطباعة المصحف الشريف",
                      sourceEn: "The Noble Quran — King Fahd Complex",
                      surahNameAr: dailyVerse.surahNameAr,
                      surahNameEn: dailyVerse.surahNameEn,
                      surahNumber: dailyVerse.surahNumber,
                      ayahNumber: dailyVerse.ayahNumber,
                      shareUrl: `/quran/${dailyVerse.surahNumber}`,
                    }}
                  />
                </div>
              </div>
            </article>

            {/* Daily Hadith */}
            <article className="wasl-surface rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-gold-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-gold)]">
                    <Library className="h-3.5 w-3.5" />
                    <span>
                      {locale === "ar" ? "حديث اليوم" : "Hadith of the Day"}
                    </span>
                  </span>
                  <span className="text-xs font-medium text-[var(--brand-emerald)]">
                    {locale === "ar"
                      ? dailyHadith.gradeAr
                      : dailyHadith.gradeEn}
                  </span>
                </div>

                <blockquote
                  dir="rtl"
                  className="font-arabic-display text-lg sm:text-xl leading-[2] text-[var(--text-primary)] pt-1"
                >
                  {dailyHadith.arabicText}
                </blockquote>

                <p
                  dir="ltr"
                  className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)] line-clamp-4 border-s-2 border-[var(--brand-emerald)]/40 ps-3"
                >
                  {dailyHadith.englishText}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[var(--text-muted)]">
                  {locale === "ar"
                    ? dailyHadith.referenceAr
                    : dailyHadith.referenceEn}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      toggleBookmark({
                        id: hadithBookmarkId,
                        type: "hadith",
                        titleAr: dailyHadith.collectionAr,
                        titleEn: dailyHadith.collectionEn,
                        arabicText: dailyHadith.arabicText,
                        englishText: dailyHadith.englishText,
                        referenceAr: dailyHadith.referenceAr,
                        referenceEn: dailyHadith.referenceEn,
                        url: "/hadith",
                      })
                    }
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                      isBookmarked(hadithBookmarkId)
                        ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)]"
                        : "border-[var(--border-subtle)] hover:bg-[var(--bg-surface-alt)]"
                    }`}
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>
                      {isBookmarked(hadithBookmarkId)
                        ? t.common.bookmarked
                        : t.common.bookmark}
                    </span>
                  </button>

                  <WaslShare
                    variant="button"
                    label={locale === "ar" ? "مشاركة" : "Share"}
                    payload={{
                      kind: "hadith",
                      arabicText: dailyHadith.arabicText,
                      englishText: dailyHadith.englishText,
                      referenceAr: dailyHadith.referenceAr,
                      referenceEn: dailyHadith.referenceEn,
                      sourceAr: dailyHadith.collectionAr,
                      sourceEn: dailyHadith.collectionEn,
                      hadithGradeAr: dailyHadith.gradeAr,
                      hadithGradeEn: dailyHadith.gradeEn,
                      shareUrl: "/hadith",
                    }}
                  />
                </div>
              </div>
            </article>
          </section>
        </RevealSection>

        {/* ================= 5. QURAN LISTENING SECTION ================= */}
        <RevealSection>
          <section aria-labelledby="home-quran-audio">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-semibold text-[var(--brand-gold)] mb-1">
                  {locale === "ar"
                    ? "تلاوات قرآنية خاشعة"
                    : "Verified Quran Recitations"}
                </p>
                <h2
                  id="home-quran-audio"
                  className="text-2xl sm:text-3xl font-bold"
                >
                  {locale === "ar"
                    ? "استمع إلى القرآن الكريم بأصوات كبار القراء"
                    : "Listen to the Noble Quran by Renowned Reciters"}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  aria-label={locale === "ar" ? "اختر القارئ" : "Select Reciter"}
                  value={selectedReciterSlug}
                  onChange={(e) => setSelectedReciterSlug(e.target.value)}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none"
                >
                  {VERIFIED_RECITERS.map((r) => (
                    <option key={r.slug} value={r.slug}>
                      {locale === "ar" ? r.nameAr : r.nameEn}
                    </option>
                  ))}
                </select>
                <Link
                  href="/quran"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand-emerald-soft)] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[var(--brand-emerald)] hover:bg-[var(--brand-emerald)] hover:text-white transition-colors"
                >
                  <span>
                    {locale === "ar" ? "المصحف كاملاً (114 سورة)" : "All 114 Surahs"}
                  </span>
                  <DirectionalArrow className="h-4 w-4" />
                </Link>
                <Link
                  href="/listen"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--brand-emerald)] transition-colors"
                >
                  <Headphones className="h-4 w-4 text-[var(--brand-emerald)]" />
                  <span>
                    {locale === "ar" ? "مركز الاستماع (244+ قارئاً)" : "Listening Center (244+ Qaris)"}
                  </span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredSurahs.map((surah) => {
                const isActive =
                  track?.kind === "quran" &&
                  track.surahNumber === surah.number &&
                  track.reciter.slug === activeReciter.slug;
                const isPlaying = isActive && audioStatus === "playing";

                return (
                  <div
                    key={surah.number}
                    className={`wasl-surface rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 ${
                      isActive ? "border-[var(--brand-emerald)] ring-1 ring-[var(--brand-emerald)]/30" : ""
                    }`}
                  >
                    <Link
                      href={`/quran/${surah.number}`}
                      className="flex items-center gap-3.5 min-w-0 flex-1 group"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] font-bold text-sm text-[var(--brand-emerald)] group-hover:border-[var(--brand-gold)] transition-colors">
                        {surah.number}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base truncate group-hover:text-[var(--brand-emerald)] transition-colors">
                          {locale === "ar" ? surah.nameAr : surah.englishName}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)]">
                          {locale === "ar"
                            ? `${surah.revelationType === "Meccan" ? "مكية" : "مدنية"} • ${surah.numberOfAyahs} آية`
                            : `${surah.englishNameTranslation} • ${surah.numberOfAyahs} verses`}
                        </p>
                      </div>
                    </Link>

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
                            ? "إيقاف التلاوة"
                            : "Pause recitation"
                          : locale === "ar"
                            ? `تشغيل ${surah.nameAr}`
                            : `Play ${surah.englishName}`
                      }
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                        isPlaying
                          ? "bg-[var(--brand-gold)] text-white"
                          : "bg-[var(--brand-emerald)] text-white hover:bg-[var(--brand-emerald-strong)]"
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4 ms-0.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </RevealSection>

        <OrnamentalDivider />

        {/* ================= 6. DAILY ADHKAR & SUPPLICATIONS ================= */}
        <RevealSection>
          <section aria-labelledby="home-adhkar-heading">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-semibold text-[var(--brand-gold)] mb-1">
                  {locale === "ar" ? "حصن المسلم اليومي" : "Daily Fortress of the Believer"}
                </p>
                <h2
                  id="home-adhkar-heading"
                  className="text-2xl sm:text-3xl font-bold"
                >
                  {locale === "ar"
                    ? "الأذكار والأدعية المأثورة"
                    : "Authentic Adhkar & Supplications"}
                </h2>
              </div>
              <Link
                href="/adhkar"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-emerald)] hover:underline"
              >
                <span>{t.common.browseAll}</span>
                <DirectionalArrow className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ADHKAR_CATEGORIES.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/adhkar?cat=${cat.id}`}
                  className="wasl-surface rounded-2xl p-5 hover:-translate-y-0.5 hover:border-[var(--brand-emerald)] group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-base group-hover:text-[var(--brand-emerald)] transition-colors">
                      {locale === "ar" ? cat.nameAr : cat.nameEn}
                    </h3>
                    <DirectionalArrow className="h-4 w-4 text-[var(--brand-gold)] opacity-70 group-hover:opacity-100" />
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {locale === "ar" ? cat.descriptionAr : cat.descriptionEn}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </RevealSection>

        {/* ================= 7. ISLAMIC RADIO STATIONS ================= */}
        <RevealSection>
          <section
            aria-labelledby="home-radio-heading"
            className="wasl-surface-alt rounded-3xl p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-semibold text-[var(--brand-gold)] mb-1">
                  {locale === "ar" ? "بث مباشر موثق" : "Verified Live Audio"}
                </p>
                <h2
                  id="home-radio-heading"
                  className="text-2xl sm:text-3xl font-bold"
                >
                  {locale === "ar"
                    ? "الإذاعات الإسلامية المباشرة"
                    : "Live Islamic Radio Stations"}
                </h2>
              </div>
              <Link
                href="/radio"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-emerald)] hover:underline"
              >
                <span>
                  {locale === "ar" ? "جميع الإذاعات (24 محطة)" : "All Radio Stations"}
                </span>
                <DirectionalArrow className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredRadios.slice(0, 6).map((station) => {
                const isActive =
                  track?.kind === "radio" &&
                  track.station.slug === station.slug;
                const isPlaying = isActive && audioStatus === "playing";

                return (
                  <div
                    key={station.slug}
                    className={`wasl-surface rounded-2xl p-4 flex items-center justify-between gap-3 ${
                      isActive ? "border-[var(--brand-emerald)] ring-1 ring-[var(--brand-emerald)]/35" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isPlaying
                              ? "bg-[var(--brand-emerald)] animate-pulse"
                              : "bg-[var(--brand-gold)]"
                          }`}
                        />
                        <span className="text-[11px] font-medium text-[var(--text-muted)] truncate">
                          {locale === "ar"
                            ? station.sourceOrgAr
                            : station.sourceOrgEn}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm sm:text-base truncate">
                        {locale === "ar" ? station.nameAr : station.nameEn}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        isActive ? togglePlayPause() : playRadio(station)
                      }
                      aria-label={
                        isPlaying
                          ? locale === "ar"
                            ? "إيقاف البث"
                            : "Pause broadcast"
                          : locale === "ar"
                            ? `تشغيل ${station.nameAr}`
                            : `Play ${station.nameEn}`
                      }
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        isPlaying
                          ? "bg-[var(--brand-gold)] text-white"
                          : "bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)] hover:bg-[var(--brand-emerald)] hover:text-white"
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </RevealSection>

        {/* ================= 8. FEATURED ISLAMIC ARTICLES ================= */}
        <RevealSection>
          <section aria-labelledby="home-articles-heading">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-semibold text-[var(--brand-gold)] mb-1">
                  {locale === "ar" ? "المعرفة الإسلامية المؤصلة" : "Source-Grounded Islamic Learning"}
                </p>
                <h2
                  id="home-articles-heading"
                  className="text-2xl sm:text-3xl font-bold"
                >
                  {locale === "ar"
                    ? "مقالات ودروس مختارة"
                    : "Featured Islamic Articles & Guides"}
                </h2>
              </div>
              <Link
                href="/knowledge"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-emerald)] hover:underline"
              >
                <span>{t.common.browseAll}</span>
                <DirectionalArrow className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredArticles.slice(0, 3).map((article) => (
                <Link
                  key={article.slug}
                  href={`/knowledge/${article.slug}`}
                  className="wasl-surface rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-0.5 hover:border-[var(--brand-gold)] group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <span className="rounded-full bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)] px-2.5 py-0.5 font-semibold">
                        {locale === "ar"
                          ? `${article.readingMinutes} دقائق قراءة`
                          : `${article.readingMinutes} min read`}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold leading-snug group-hover:text-[var(--brand-emerald)] transition-colors">
                      {locale === "ar" ? article.titleAr : article.titleEn}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                      {locale === "ar" ? article.summaryAr : article.summaryEn}
                    </p>
                  </div>
                  <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-emerald)]">
                    <span>{t.common.readMore}</span>
                    <DirectionalArrow className="h-3.5 w-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </RevealSection>

        {/* ================= 9. FREQUENTLY USED ISLAMIC SERVICES ================= */}
        <RevealSection>
          <section aria-labelledby="home-services-heading">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <p className="text-xs font-semibold text-[var(--brand-gold)] mb-1">
                {locale === "ar" ? "خدمات وأدوات نافعة" : "Essential Digital Tools"}
              </p>
              <h2
                id="home-services-heading"
                className="text-2xl sm:text-3xl font-bold"
              >
                {locale === "ar"
                  ? "الخدمات الإسلامية الأكثر استخداماً"
                  : "Frequently Used Islamic Services"}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ServiceTile
                href="/ramadan"
                icon={<SunMoon className="h-5 w-5" />}
                title={t.nav.ramadan}
                description={
                  locale === "ar"
                    ? "العد التنازلي لرمضان، متابعة الختمة الشخصية بالأجزاء، وأذكار الصيام والعيد."
                    : "Live Ramadan countdown, 30-Juz personal Khatmah tracker, and fasting supplications."
                }
              />
              <ServiceTile
                href="/zakat"
                icon={<HandHeart className="h-5 w-5" />}
                title={t.nav.zakat}
                description={
                  locale === "ar"
                    ? "حاسبة الزكاة وفق النصاب الشرعي مع روابط مباشرة لمنصة إحسان والجهات الرسمية."
                    : "Zakat calculator based on gold/silver Nisab with verified official Saudi charity links."
                }
              />
              <ServiceTile
                href="/quiz"
                icon={<HelpCircle className="h-5 w-5" />}
                title={t.nav.quiz}
                description={
                  locale === "ar"
                    ? "اختبارات معرفية بثلاثة مستويات مع تصحيح فوري وشرح موثق بالأدلة."
                    : "Three-tier interactive Islamic knowledge quizzes with verified references."
                }
              />
              <ServiceTile
                href="/calendar"
                icon={<CalendarDays className="h-5 w-5" />}
                title={t.nav.calendar}
                description={
                  locale === "ar"
                    ? "استعراض الشهور الهجرية بتقويم أم القرى وما يقابلها بالتاريخ الميلادي والأيام الفاضلة."
                    : "Monthly Umm al-Qura Hijri & Gregorian calendar highlighting key Islamic occasions."
                }
              />
              <ServiceTile
                href="/knowledge#names-of-allah"
                icon={<Sparkles className="h-5 w-5" />}
                title={t.nav.namesOfAllah}
                description={
                  locale === "ar"
                    ? "أسماء الله الحسنى مشروحة بإيجاز رصين مع دلالاتها القرآنية."
                    : "Explore the Beautiful Names of Allah with meanings and Quranic references."
                }
              />
              <ServiceTile
                href="/resources"
                icon={<Library className="h-5 w-5" />}
                title={t.nav.resources}
                description={
                  locale === "ar"
                    ? "معجم المصطلحات الإسلامية ودليل المواقع العلمية الرسمية كموقع الشيخ ابن باز ومجمع الملك فهد."
                    : "Islamic glossary and directory of official scholarly & multilingual portals."
                }
              />
            </div>
          </section>
        </RevealSection>
      </div>
    </div>
  );
}

function ServiceTile({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="wasl-surface rounded-2xl p-5 flex items-start gap-4 hover:-translate-y-0.5 hover:border-[var(--brand-emerald)] group"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)] group-hover:bg-[var(--brand-emerald)] group-hover:text-white transition-colors">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-base group-hover:text-[var(--brand-emerald)] transition-colors">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
}

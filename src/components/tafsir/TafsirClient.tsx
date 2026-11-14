"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Compass,
  ExternalLink,
  Languages,
  ScrollText,
  Settings2,
  ShieldCheck,
  Sparkles,
  Volume2,
} from "lucide-react";
import { GeometricLattice } from "@/components/brand/IslamicVisuals";
import { useReadingPreferences } from "@/components/providers/ReadingPreferencesProvider";
import { useWasl } from "@/components/providers/WaslProvider";
import { WaslShare } from "@/components/share/WaslShare";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageShell } from "@/components/ui/MotionPrimitives";
import { SURAHS } from "@/data/surahs";
import { VERIFIED_TAFSIR_SOURCES } from "@/data/tafsir-sources";
import { QURANIC_THEMES } from "@/data/tafsir-themes";
import type { TafsirVersePayload } from "@/lib/api/tafsir";

type TafsirTab = "tafsir" | "words" | "asbab" | "themes";

const TAFSIR_HISTORY_KEY = "wasl_tafsir_history_v1";

interface TafsirClientProps {
  initialData: TafsirVersePayload;
  initialTab?: TafsirTab;
}

export function TafsirClient({
  initialData,
  initialTab = "tafsir",
}: TafsirClientProps) {
  const router = useRouter();
  const { locale, isRtl, isBookmarked, toggleBookmark } = useWasl();
  const { prefs } = useReadingPreferences();

  const [data, setData] = useState<TafsirVersePayload>(initialData);
  const [selectedSource, setSelectedSource] = useState<string>(
    initialData.source.slug
  );
  const [activeTab, setActiveTab] = useState<TafsirTab>(initialTab);
  const [selectedThemeId, setSelectedThemeId] = useState<string>(
    QURANIC_THEMES[0].id
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [visitedKeys, setVisitedKeys] = useState<string[]>([]);
  const [playingWordPos, setPlayingWordPos] = useState<number | null>(null);

  const wordAudioRef = useRef<HTMLAudioElement | null>(null);
  const PrevIcon = isRtl ? ArrowRight : ArrowLeft;
  const NextIcon = isRtl ? ArrowLeft : ArrowRight;

  // Hydrate Tafsir reading history safely
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(TAFSIR_HISTORY_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setVisitedKeys(parsed.filter((x): x is string => typeof x === "string"));
          }
        }
      } catch {
        // Ignore storage error
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const recordHistory = useCallback((verseKey: string) => {
    setVisitedKeys((prev) => {
      const next = [verseKey, ...prev.filter((k) => k !== verseKey)].slice(0, 12);
      try {
        localStorage.setItem(TAFSIR_HISTORY_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage error
      }
      return next;
    });
  }, []);

  const loadVerseTafsir = useCallback(
    async (
      targetSurah: number,
      targetAyah: number,
      targetSource: string,
      syncUrl: boolean = true
    ) => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(
          `/api/tafsir/verse?surah=${targetSurah}&ayah=${targetAyah}&source=${encodeURIComponent(
            targetSource
          )}`
        );
        const json = (await res.json()) as TafsirVersePayload & { error?: string };
        if (!res.ok || !json.verseKey) {
          throw new Error(json.error || "Failed to load tafsir");
        }
        setData(json);
        setSelectedSource(json.source.slug);
        recordHistory(json.verseKey);
        if (syncUrl) {
          router.replace(
            `/tafsir?surah=${json.surahNumber}&ayah=${json.ayahNumber}&source=${encodeURIComponent(
              json.source.slug
            )}`,
            { scroll: false }
          );
        }
      } catch {
        setErrorMsg(
          locale === "ar"
            ? "تعذر الاتصال بمصدر التفسير المعتمد حالياً. لم يتم استبدال النص بأي محتوى غير موثق."
            : "Unable to reach the verified tafsir provider right now. No unverified text has been substituted."
        );
      } finally {
        setLoading(false);
      }
    },
    [locale, recordHistory, router]
  );

  const currentSurahMeta = useMemo(
    () => SURAHS.find((s) => s.number === data.surahNumber) ?? SURAHS[0],
    [data.surahNumber]
  );

  const handlePrevAyah = () => {
    if (data.ayahNumber > 1) {
      void loadVerseTafsir(data.surahNumber, data.ayahNumber - 1, selectedSource);
    } else if (data.surahNumber > 1) {
      const prevSurah = SURAHS.find((s) => s.number === data.surahNumber - 1);
      if (prevSurah) {
        void loadVerseTafsir(
          prevSurah.number,
          prevSurah.numberOfAyahs,
          selectedSource
        );
      }
    }
  };

  const handleNextAyah = () => {
    if (data.ayahNumber < data.totalAyahsInSurah) {
      void loadVerseTafsir(data.surahNumber, data.ayahNumber + 1, selectedSource);
    } else if (data.surahNumber < 114) {
      void loadVerseTafsir(data.surahNumber + 1, 1, selectedSource);
    }
  };

  const playWordPronunciation = (url: string | null, pos: number) => {
    if (!url) return;
    if (wordAudioRef.current) {
      wordAudioRef.current.pause();
    }
    const audio = new Audio(url);
    wordAudioRef.current = audio;
    setPlayingWordPos(pos);
    audio.onended = () => setPlayingWordPos(null);
    audio.onerror = () => setPlayingWordPos(null);
    audio.play().catch(() => setPlayingWordPos(null));
  };

  const bookmarkId = `tafsir:${data.verseKey}:${data.source.slug}`;
  const isSaved = isBookmarked(bookmarkId);
  const activeTheme =
    QURANIC_THEMES.find((th) => th.id === selectedThemeId) ?? QURANIC_THEMES[0];

  const tabs: { id: TafsirTab; labelAr: string; labelEn: string }[] = [
    { id: "tafsir", labelAr: "التفسير الموثق", labelEn: "Verified Tafsir" },
    { id: "words", labelAr: "الكلمات والغريب والإعراب", labelEn: "Word & Grammar Analysis" },
    { id: "asbab", labelAr: "أسباب النزول", labelEn: "Reasons for Revelation" },
    { id: "themes", labelAr: "الموضوعات والتدبر", labelEn: "Themes & Reflection" },
  ];

  return (
    <PageShell className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs
        items={[
          { labelAr: "القرآن الكريم", labelEn: "Holy Quran", href: "/quran" },
          {
            labelAr: "موسوعة التفسير والتدبر",
            labelEn: "Tafsir & Reflection Encyclopedia",
          },
        ]}
      />

      {/* Encyclopedia Hero + Verse Selector */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 mb-8 shadow-sm">
        <div className="pointer-events-none absolute inset-0 text-[var(--brand-emerald)]">
          <GeometricLattice opacity={0.03} />
        </div>

        <div className="relative space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-gold)]/40 bg-[var(--brand-gold-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-gold)]">
                <BookMarked className="h-3.5 w-3.5" />
                <span>
                  {locale === "ar"
                    ? "موسوعة التفسير والتدبر الموثقة"
                    : "Verified Quranic Tafsir & Reflection"}
                </span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                {locale === "ar"
                  ? "موسوعة التفسير والتدبر والبيان القرآني"
                  : "Islamic Tafsir & Reflection Encyclopedia"}
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">
                {locale === "ar"
                  ? "استعرض تفسير آيات القرآن الكريم من أمهات كتب التفسير المعتبرة (ابن كثير، السعدي، الطبري، القرطبي، البغوي، الميسر) مع غريب القرآن والإعراب وأسباب النزول الموثقة."
                  : "Explore authentic Quranic exegesis from Ibn Kathir, al-Sa'di, al-Tabari, al-Qurtubi, al-Baghawi, and Al-Muyassar alongside word analysis and verified Asbab al-Nuzul."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                href={`/mushaf?page=${data.pageNumber}`}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--brand-emerald)]/35 bg-[var(--brand-emerald-soft)] px-4 py-2.5 text-xs font-bold text-[var(--brand-emerald)] hover:bg-[var(--brand-emerald)] hover:text-white transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                <span>
                  {locale === "ar"
                    ? `عرض في المصحف (ص ${data.pageNumber})`
                    : `Open in Mushaf (P.${data.pageNumber})`}
                </span>
              </Link>
              <Link
                href="/reading-settings"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] px-3.5 py-2.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Settings2 className="h-4 w-4 text-[var(--brand-gold)]" />
                <span>{locale === "ar" ? "تخصيص القراءة" : "Reading Settings"}</span>
              </Link>
            </div>
          </div>

          {/* Verse Navigation Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <div className="md:col-span-5">
              <label
                htmlFor="tafsir-surah-select"
                className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5"
              >
                {locale === "ar" ? "السورة (١١٤ سورة)" : "Surah (114 Chapters)"}
              </label>
              <select
                id="tafsir-surah-select"
                value={data.surahNumber}
                onChange={(e) => {
                  const s = Number(e.target.value);
                  void loadVerseTafsir(s, 1, selectedSource);
                }}
                className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm font-medium text-[var(--text-primary)]"
              >
                {SURAHS.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.nameAr} ({s.englishName}) — {s.numberOfAyahs}{" "}
                    {locale === "ar" ? "آية" : "ayahs"}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label
                htmlFor="tafsir-ayah-select"
                className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5"
              >
                {locale === "ar"
                  ? `الآية (من ١ إلى ${currentSurahMeta.numberOfAyahs})`
                  : `Verse (1–${currentSurahMeta.numberOfAyahs})`}
              </label>
              <select
                id="tafsir-ayah-select"
                value={data.ayahNumber}
                onChange={(e) => {
                  void loadVerseTafsir(
                    data.surahNumber,
                    Number(e.target.value),
                    selectedSource
                  );
                }}
                className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm font-medium text-[var(--text-primary)]"
              >
                {Array.from(
                  { length: currentSurahMeta.numberOfAyahs },
                  (_, idx) => idx + 1
                ).map((num) => (
                  <option key={num} value={num}>
                    {locale === "ar" ? `الآية ${num}` : `Verse ${num}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4 flex items-end gap-2">
              <button
                type="button"
                onClick={handlePrevAyah}
                disabled={data.surahNumber === 1 && data.ayahNumber === 1}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2.5 text-xs font-semibold hover:bg-[var(--bg-surface-alt)] disabled:opacity-45"
              >
                <PrevIcon className="h-4 w-4" />
                <span>{locale === "ar" ? "الآية السابقة" : "Previous"}</span>
              </button>
              <button
                type="button"
                onClick={handleNextAyah}
                disabled={data.surahNumber === 114 && data.ayahNumber === 6}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--brand-emerald)] text-white px-3 py-2.5 text-xs font-semibold hover:bg-[var(--brand-emerald-strong)] disabled:opacity-45"
              >
                <span>{locale === "ar" ? "الآية التالية" : "Next"}</span>
                <NextIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {errorMsg ? (
        <div className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 flex items-center gap-3 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      ) : null}

      {/* Main Verse Display Card (Honors Reading Preferences) */}
      <div className="wasl-reading-container">
        <article className="wasl-reading-surface rounded-3xl border p-6 sm:p-9 mb-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--brand-emerald)] px-3.5 py-1 text-xs font-bold text-white">
                {locale === "ar"
                  ? `سورة ${data.surahNameAr} — الآية ${data.ayahNumber}`
                  : `Surah ${data.surahNameEn} (${data.verseKey})`}
              </span>
              <span className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                {locale === "ar"
                  ? `الجزء ${data.juzNumber} • الصفحة ${data.pageNumber}`
                  : `Juz ${data.juzNumber} • Page ${data.pageNumber}`}
              </span>
              {data.sajdahNumber ? (
                <span className="rounded-full bg-[var(--brand-gold-soft)] border border-[var(--brand-gold)]/40 px-3 py-1 text-xs font-bold text-[var(--brand-gold)]">
                  {locale === "ar" ? "موضع سجدة تلاوة" : "Sajdah Tilawah"}
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  toggleBookmark({
                    id: bookmarkId,
                    type: "tafsir",
                    titleAr: `تفسير ${data.surahNameAr} (${data.ayahNumber}) — ${data.source.nameAr}`,
                    titleEn: `Tafsir ${data.surahNameEn} (${data.verseKey}) — ${data.source.nameEn}`,
                    arabicText: `﴿${data.textUthmani}﴾\n\n${data.tafsirPlainText.slice(0, 600)}${
                      data.tafsirPlainText.length > 600 ? "..." : ""
                    }`,
                    englishText: data.translationEn,
                    referenceAr: `${data.source.nameAr} — سورة ${data.surahNameAr} الآية ${data.ayahNumber}`,
                    referenceEn: `${data.source.nameEn} — ${data.surahNameEn} ${data.verseKey}`,
                    url: `/tafsir/${data.surahNumber}/${data.ayahNumber}?source=${data.source.slug}`,
                  })
                }
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isSaved
                    ? "border-[var(--brand-gold)] bg-[var(--brand-gold-soft)] text-[var(--brand-gold)]"
                    : "border-[var(--border-subtle)] hover:border-[var(--brand-emerald)] text-[var(--text-secondary)]"
                }`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-current" : ""}`} />
                <span>
                  {isSaved
                    ? locale === "ar"
                      ? "تم الحفظ"
                      : "Saved"
                    : locale === "ar"
                      ? "حفظ التفسير"
                      : "Bookmark"}
                </span>
              </button>

              <WaslShare
                variant="pill"
                label={locale === "ar" ? "مشاركة" : "Share"}
                payload={{
                  kind: "tafsir",
                  titleAr: `تفسير ${data.surahNameAr} — الآية ${data.ayahNumber}`,
                  titleEn: `Tafsir ${data.surahNameEn} (${data.verseKey})`,
                  arabicText: `﴿${data.textUthmani}﴾\n\n${
                    data.tafsirPlainText
                      ? `من ${data.source.nameAr}:\n${data.tafsirPlainText}`
                      : ""
                  }`,
                  englishText: data.translationEn,
                  referenceAr: `سورة ${data.surahNameAr} — الآية ${data.ayahNumber}`,
                  referenceEn: `Surah ${data.surahNameEn} (${data.verseKey})`,
                  sourceAr: data.source.nameAr,
                  sourceEn: data.source.nameEn,
                  surahNameAr: data.surahNameAr,
                  surahNameEn: data.surahNameEn,
                  surahNumber: data.surahNumber,
                  ayahNumber: data.ayahNumber,
                  shareUrl: `/tafsir/${data.surahNumber}/${data.ayahNumber}?source=${data.source.slug}`,
                }}
              />

              <Link
                href={`/quran/${data.surahNumber}`}
                className="inline-flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-emerald)] transition-colors"
              >
                <span>{locale === "ar" ? "السورة كاملة" : "Full Surah"}</span>
                <NextIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Verbatim Uthmani Quranic Text */}
          <div className="space-y-3">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wide text-[var(--brand-emerald)]">
              {locale === "ar"
                ? "١. النص القرآني الكريم (بالرسم العثماني)"
                : "1. Verbatim Quranic Text (Uthmani Script)"}
            </span>
            <p
              dir="rtl"
              lang="ar"
              className={`font-quran-reading text-[var(--wasl-paper-text)] leading-[2.3] ${
                prefs.verseHighlight
                  ? "rounded-2xl bg-[var(--brand-emerald-soft)]/50 px-5 py-4 border border-[var(--brand-emerald)]/15"
                  : ""
              }`}
            >
              {data.textUthmani}{" "}
              <span className="inline-flex items-center justify-center rounded-full border border-[var(--brand-gold)]/50 px-2.5 py-0.5 text-base font-bold text-[var(--brand-gold)]">
                ﴿{data.ayahNumber}﴾
              </span>
            </p>
            {prefs.showTranslation && data.translationEn ? (
              <div dir="ltr" lang="en" className="pt-2 space-y-1">
                <p className="text-sm sm:text-base leading-relaxed text-[var(--wasl-paper-muted)]">
                  {data.translationEn}
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Translation Source: {data.translationSourceEn}
                </p>
              </div>
            ) : null}
          </div>
        </article>

        {/* Sub-Tabs Navigation */}
        <div
          role="tablist"
          aria-label={locale === "ar" ? "أقسام الموسوعة" : "Encyclopedia Sections"}
          className="flex flex-wrap gap-2 mb-6"
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                  active
                    ? "bg-[var(--brand-emerald)] text-white shadow-sm"
                    : "border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--brand-gold)]"
                }`}
              >
                {locale === "ar" ? tab.labelAr : tab.labelEn}
              </button>
            );
          })}
        </div>

        {/* TAB 1: Scholarly Tafsir */}
        {activeTab === "tafsir" ? (
          <section className="space-y-5">
            {/* Tafsir Source Switcher */}
            <div className="wasl-surface rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <ScrollText className="h-4 w-4 text-[var(--brand-gold)]" />
                  <span>
                    {locale === "ar"
                      ? "اختر كتاب التفسير المعتمد:"
                      : "Select Authentic Tafsir Source:"}
                  </span>
                </h2>
                <span className="text-xs text-[var(--text-muted)]">
                  {locale === "ar"
                    ? `${VERIFIED_TAFSIR_SOURCES.length} مصادر معتمدة`
                    : `${VERIFIED_TAFSIR_SOURCES.length} Verified Sources`}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {VERIFIED_TAFSIR_SOURCES.map((src) => {
                  const isActive = selectedSource === src.slug;
                  return (
                    <button
                      key={src.slug}
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        void loadVerseTafsir(
                          data.surahNumber,
                          data.ayahNumber,
                          src.slug
                        );
                      }}
                      className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all border ${
                        isActive
                          ? "border-[var(--brand-gold)] bg-[var(--brand-gold-soft)] text-[var(--text-primary)] shadow-xs"
                          : "border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-secondary)] hover:border-[var(--brand-emerald)]"
                      }`}
                    >
                      {locale === "ar" ? src.nameAr : src.nameEn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tafsir Content Card */}
            <div className="wasl-reading-surface rounded-3xl border p-6 sm:p-8 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--brand-gold)]">
                    <ShieldCheck className="h-4 w-4" />
                    <span>
                      {locale === "ar"
                        ? "٢. التفسير العلمي المأثور"
                        : "2. Authenticated Scholarly Tafsir"}
                    </span>
                  </span>
                  <h3 className="text-xl font-bold text-[var(--wasl-paper-text)]">
                    {locale === "ar" ? data.source.nameAr : data.source.nameEn}
                  </h3>
                  <p className="text-xs text-[var(--wasl-paper-muted)]">
                    {locale === "ar"
                      ? data.source.authorAr
                      : data.source.authorEn}
                  </p>
                </div>

                <a
                  href={data.source.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--brand-emerald)]"
                >
                  <span>{locale === "ar" ? "توثيق المصدر" : "Source Attribution"}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {loading ? (
                <div className="space-y-3 py-4">
                  <div className="wasl-skeleton h-5 w-3/4 rounded-lg" />
                  <div className="wasl-skeleton h-5 w-full rounded-lg" />
                  <div className="wasl-skeleton h-5 w-5/6 rounded-lg" />
                </div>
              ) : data.tafsirAvailable ? (
                <div
                  dir={data.source.language === "ar" ? "rtl" : "ltr"}
                  lang={data.source.language}
                  className="wasl-reading-body text-[var(--wasl-paper-text)] space-y-4 [&>p]:mb-4 [&>h2]:font-bold [&>h2]:text-lg [&>h3]:font-bold [&_.qpc-hafs]:font-quran"
                  dangerouslySetInnerHTML={{ __html: data.tafsirTextHtml }}
                />
              ) : (
                <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 p-5 text-sm text-[var(--text-secondary)]">
                  {locale === "ar"
                    ? "لم يتوفر نص هذا التفسير لهذه الآية تحديداً عبر المزود الرقمي حالياً، يمكنك التبديل إلى مصدر تفسير آخر أعلاه دون أي نص مُلفّق."
                    : "This edition does not have a separate entry for this specific verse right now. Please switch to another verified tafsir source above."}
                </div>
              )}

              <footer className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                <span>
                  {locale === "ar" ? "المرجع الببليوغرافي: " : "Bibliographic Reference: "}
                  {data.tafsirProviderNote}
                </span>
                <span>
                  {locale === "ar" ? "الآية: " : "Verse: "}
                  {data.surahNameAr} ({data.verseKey})
                </span>
              </footer>
            </div>
          </section>
        ) : null}

        {/* TAB 2: Word-by-Word, Morphology & I'rab */}
        {activeTab === "words" ? (
          <section className="space-y-6">
            {/* Word by Word Tokens */}
            <div className="wasl-surface rounded-3xl p-6 sm:p-7 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-[var(--brand-emerald)]">
                    {locale === "ar"
                      ? "٣. البيان اللفظي — كلمة بكلمة"
                      : "3. Word-by-Word Breakdown"}
                  </span>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    {locale === "ar"
                      ? "مفردات الآية والنطق الموثق"
                      : "Quranic Vocabulary & Pronunciation"}
                  </h2>
                </div>
                <span className="text-xs text-[var(--text-muted)]">
                  {locale === "ar"
                    ? "اضغط على أي كلمة للاستماع إلى نطقها (Quran.com v4)"
                    : "Click any word to hear pronunciation (Quran.com v4)"}
                </span>
              </div>

              {data.words.length > 0 ? (
                <div dir="rtl" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {data.words.map((w) => (
                    <button
                      key={`${data.verseKey}-w-${w.position}`}
                      type="button"
                      onClick={() => playWordPronunciation(w.audioUrl, w.position)}
                      className={`group rounded-2xl border p-3.5 text-center transition-all ${
                        playingWordPos === w.position
                          ? "border-[var(--brand-gold)] bg-[var(--brand-gold-soft)]"
                          : "border-[var(--border-subtle)] bg-[var(--bg-page)] hover:border-[var(--brand-emerald)]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mb-1">
                        <span className="font-mono">{w.position}</span>
                        {w.audioUrl ? (
                          <Volume2 className="h-3.5 w-3.5 text-[var(--brand-emerald)] opacity-75 group-hover:opacity-100" />
                        ) : null}
                      </div>
                      <p className="font-quran text-2xl font-bold text-[var(--text-primary)] mb-1.5">
                        {w.textUthmani}
                      </p>
                      {w.transliteration ? (
                        <p dir="ltr" className="text-[11px] font-mono text-[var(--brand-gold)] truncate">
                          {w.transliteration}
                        </p>
                      ) : null}
                      {w.translationEn ? (
                        <p dir="ltr" className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                          {w.translationEn}
                        </p>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">
                  {locale === "ar"
                    ? "بيانات تفصيل الكلمات غير متوفرة مؤقتاً لهذه الآية."
                    : "Word-by-word data is currently unavailable for this verse."}
                </p>
              )}
            </div>

            {/* Arabic Roots / Morphology + Gharib + I'rab */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="wasl-surface rounded-3xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--brand-emerald)]">
                  <Languages className="h-4 w-4" />
                  <span>
                    {locale === "ar"
                      ? "تحليل الكلمات والجذور اللغوية"
                      : "Arabic Roots & Word Morphology"}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  {locale === "ar"
                    ? "المصدر: تحليل كلمات القرآن الكريم (المادة والنوع والحالة الإعرابية)"
                    : "Source: Tahlil Kalimat al-Quran Digital Lexicon"}
                </p>
                {data.arabicMorphologyText ? (
                  <div
                    dir="rtl"
                    className="wasl-reading-body text-sm sm:text-base whitespace-pre-line text-[var(--text-primary)] bg-[var(--bg-page)] rounded-2xl p-4 border border-[var(--border-subtle)]"
                  >
                    {data.arabicMorphologyText}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)]">
                    {locale === "ar"
                      ? "لا تتوفر بيانات الجذر الصرفي لهذه الآية حالياً."
                      : "Morphological lexicon data not available for this verse."}
                  </p>
                )}
              </div>

              <div className="space-y-5">
                <div className="wasl-surface rounded-3xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--brand-gold)]">
                    <BookMarked className="h-4 w-4" />
                    <span>
                      {locale === "ar"
                        ? "الإعراب الميسر للآية الكريمة"
                        : "Arabic Grammatical Analysis (I'rab)"}
                    </span>
                  </div>
                  {data.arabicIrabText ? (
                    <div
                      dir="rtl"
                      className="wasl-reading-body text-sm sm:text-base whitespace-pre-line text-[var(--text-primary)] bg-[var(--bg-page)] rounded-2xl p-4 border border-[var(--border-subtle)]"
                    >
                      {data.arabicIrabText}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--text-muted)]">
                      {locale === "ar"
                        ? "لا يتوفر سجل الإعراب الميسر لهذه الآية عبر المزود."
                        : "Arabic grammatical entry unavailable for this verse."}
                    </p>
                  )}
                </div>

                {data.gharibText ? (
                  <div className="wasl-surface rounded-3xl p-6 space-y-3">
                    <h3 className="text-xs font-bold text-[var(--brand-emerald)]">
                      {locale === "ar"
                        ? "السراج في بيان غريب القرآن (الخضيري)"
                        : "Al-Siraj — Concise Quranic Vocabulary"}
                    </h3>
                    <div
                      dir="rtl"
                      className="text-sm leading-relaxed whitespace-pre-line text-[var(--text-secondary)] max-h-60 overflow-y-auto"
                    >
                      {data.gharibText}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {/* TAB 3: Asbab al-Nuzul */}
        {activeTab === "asbab" ? (
          <section className="wasl-surface rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="space-y-1.5 pb-4 border-b border-[var(--border-subtle)]">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-gold)]">
                <ShieldCheck className="h-4 w-4" />
                <span>
                  {locale === "ar"
                    ? "توثيق أسباب النزول وضبط الروايات"
                    : "Verified Reasons for Revelation (Asbab al-Nuzul)"}
                </span>
              </span>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {locale === "ar"
                  ? `أسباب النزول المتعلقة بالآية (${data.verseKey})`
                  : `Asbab al-Nuzul for ${data.surahNameEn} (${data.verseKey})`}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {locale === "ar"
                  ? "تنبيه علمي: ليس لكل آية في القرآن الكريم سبب نزول خاص؛ إذ نزل معظم القرآن ابتداءً للهداية والتشريع، ويُذكر هنا فقط ما ورد في المصادر المعتبرة مع بيان درجته."
                  : "Note: Most Quranic verses were revealed directly for guidance without a specific incident; only documented reports with explicit source attribution are shown."}
              </p>
            </div>

            {data.asbabEntries.length > 0 ? (
              <div className="space-y-4">
                {data.asbabEntries.map((entry, idx) => (
                  <div
                    key={`${entry.reference}-${idx}`}
                    className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-page)] p-5 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                          entry.status === "verified"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : entry.status === "disputed_noted"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                              : "bg-[var(--brand-gold-soft)] text-[var(--brand-gold)]"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>
                          {locale === "ar" ? entry.statusLabelAr : entry.statusLabelEn}
                        </span>
                      </span>
                      <span className="text-xs font-medium text-[var(--text-muted)]">
                        {entry.reference}
                      </span>
                    </div>

                    <p
                      dir={entry.language === "ar" ? "rtl" : "ltr"}
                      lang={entry.language}
                      className="wasl-reading-body text-sm sm:text-base text-[var(--text-primary)] leading-relaxed"
                    >
                      {entry.text}
                    </p>

                    <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                      <span>
                        {locale === "ar" ? entry.sourceNameAr : entry.sourceNameEn}
                      </span>
                      <a
                        href={entry.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--brand-emerald)] hover:underline"
                      >
                        <span>{locale === "ar" ? "رابط المصدر" : "Source"}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-page)] p-6 text-center space-y-2">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {locale === "ar"
                    ? "لم يُثبت في المصادر المتاحة سببُ نزولٍ خاص لهذه الآية الكريمة."
                    : "No specific documented Asbab al-Nuzul report exists for this verse in the verified collections."}
                </p>
                <p className="text-xs text-[var(--text-muted)] max-w-xl mx-auto">
                  {locale === "ar"
                    ? "نزلت هذه الآية في سياق الهداية العامة والبيان القرآني، ويمكنك مطالعة تفسير السلف لمعانيها في تبويب «التفسير الموثق»."
                    : "You can read the classical scholarly commentary on this verse in the Verified Tafsir tab."}
                </p>
              </div>
            )}
          </section>
        ) : null}

        {/* TAB 4: Quranic Themes & Reflection */}
        {activeTab === "themes" ? (
          <section className="space-y-6">
            {/* Theme Selector Pills */}
            <div className="flex flex-wrap gap-2">
              {QURANIC_THEMES.map((theme) => {
                const active = theme.id === activeTheme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedThemeId(theme.id)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition-all border ${
                      active
                        ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald)] text-white"
                        : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--brand-gold)]"
                    }`}
                  >
                    {locale === "ar" ? theme.titleAr : theme.titleEn}
                  </button>
                );
              })}
            </div>

            <div className="wasl-surface rounded-3xl p-6 sm:p-8 space-y-6">
              {/* Distinct Section 1: Educational Summary */}
              <div className="space-y-2 pb-4 border-b border-[var(--border-subtle)]">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-emerald)]">
                  <Compass className="h-4 w-4" />
                  <span>
                    {locale === "ar"
                      ? "٤. ملخص تعليمي للموضوع (غير منسوب كحديث أو تفسير أثر)"
                      : "4. Educational Topic Overview"}
                  </span>
                </span>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  {locale === "ar" ? activeTheme.titleAr : activeTheme.titleEn}
                </h2>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {locale === "ar" ? activeTheme.summaryAr : activeTheme.summaryEn}
                </p>
              </div>

              {/* Linked Verified Verses */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {locale === "ar"
                    ? "الآيات القرآنية المرتبطة بهذا الموضوع"
                    : "Related Quranic Verses"}
                </h3>
                <div className="space-y-3">
                  {activeTheme.verses.map((v) => (
                    <div
                      key={`${v.surahNumber}:${v.ayahNumber}`}
                      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-page)] p-5 space-y-3"
                    >
                      <p dir="rtl" lang="ar" className="font-quran text-2xl text-[var(--text-primary)] leading-loose">
                        ﴿{v.excerptAr}﴾
                      </p>
                      <p dir="ltr" lang="en" className="text-xs text-[var(--text-secondary)]">
                        {v.excerptEn}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)] text-xs">
                        <span className="font-semibold text-[var(--brand-gold)]">
                          {locale === "ar"
                            ? `سورة ${v.surahNameAr}: ${v.ayahNumber} — ${v.keyFocusAr}`
                            : `${v.surahNameEn} ${v.surahNumber}:${v.ayahNumber} — ${v.keyFocusEn}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("tafsir");
                            void loadVerseTafsir(
                              v.surahNumber,
                              v.ayahNumber,
                              selectedSource
                            );
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-[var(--brand-emerald-soft)] px-3 py-1 font-bold text-[var(--brand-emerald)] hover:bg-[var(--brand-emerald)] hover:text-white transition-colors"
                        >
                          <span>
                            {locale === "ar" ? "اقرأ تفسير الآية" : "Open Tafsir"}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Distinct Section 2: Personal Reflection Prompts */}
              <div className="rounded-2xl border border-[var(--brand-gold)]/35 bg-[var(--brand-gold-soft)]/50 p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--brand-gold)]">
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {locale === "ar"
                      ? "٥. وقفة تدبر وتطبيق شخصي (أسئلة تدبرية عامة وليست نصاً شرعياً)"
                      : "5. Personal Reflection Prompts (Non-Scriptural Questions)"}
                  </span>
                </div>
                <ul className="space-y-1.5 text-sm text-[var(--text-primary)] list-disc list-inside">
                  {(locale === "ar"
                    ? activeTheme.reflectionPromptsAr
                    : activeTheme.reflectionPromptsEn
                  ).map((prompt, idx) => (
                    <li key={idx}>{prompt}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}

        {/* Neighboring & Recently Read Verses Footer */}
        {visitedKeys.length > 0 ? (
          <section className="mt-8 wasl-surface rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-[var(--text-muted)]">
              {locale === "ar"
                ? "آيات طالعت تفسيرها مؤخراً:"
                : "Recently Explored Verses:"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {visitedKeys.map((key) => {
                const [sStr, aStr] = key.split(":");
                const sNum = Number(sStr);
                const aNum = Number(aStr);
                const meta = SURAHS.find((s) => s.number === sNum);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      void loadVerseTafsir(sNum, aNum, selectedSource);
                    }}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-1.5 text-xs font-semibold hover:border-[var(--brand-emerald)] transition-colors"
                  >
                    {locale === "ar"
                      ? `${meta?.nameAr ?? sNum} (${aNum})`
                      : `${meta?.englishName ?? sNum} (${key})`}
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </PageShell>
  );
}

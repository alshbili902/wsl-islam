"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BookMarked,
  BookOpen,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Compass,
  Headphones,
  ListTree,
  Pause,
  Play,
  Settings2,
  Sparkles,
} from "lucide-react";
import { BismillahBanner, GeometricLattice } from "@/components/brand/IslamicVisuals";
import { useAudio } from "@/components/providers/AudioProvider";
import { useReadingPreferences } from "@/components/providers/ReadingPreferencesProvider";
import { useWasl } from "@/components/providers/WaslProvider";
import { WaslShare } from "@/components/share/WaslShare";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageShell } from "@/components/ui/MotionPrimitives";
import { VERIFIED_RECITERS } from "@/data/reciters";
import { SURAHS } from "@/data/surahs";
import {
  MUSHAF_CHAPTERS,
  MUSHAF_JUZS,
  MUSHAF_PAGE_INDEX,
  MUSHAF_TIMESTAMP_RECITERS,
  MUSHAF_TOTAL_PAGES,
} from "@/lib/api/mushaf";
import type { MushafPagePayload, MushafPageVerse } from "@/types/islamic";

type MushafReadingMode = "mushaf" | "continuous" | "focused";

interface SavedMushafPosition {
  pageNumber: number;
  lastVerseKey: string;
  recentPages: number[];
  updatedAt: string;
}

interface AudioSegmentTimestamp {
  verseKey: string;
  fromSec: number;
  toSec: number;
}

const MUSHAF_POS_KEY = "wasl_mushaf_position_v1";

function toArabicDigits(n: number): string {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)] ?? d);
}

export function MushafClient({
  initialPageData,
  explicitPageRequested,
}: {
  initialPageData: MushafPagePayload;
  explicitPageRequested: boolean;
}) {
  const router = useRouter();
  const { locale, isRtl, bookmarks, toggleBookmark, isBookmarked } = useWasl();
  const { prefs, updatePrefs } = useReadingPreferences();
  const {
    track,
    status: audioStatus,
    currentTime,
    playSurah,
    togglePlayPause,
  } = useAudio();

  const [pageData, setPageData] = useState<MushafPagePayload>(initialPageData);
  const [mode, setMode] = useState<MushafReadingMode>("mushaf");
  const [selectedVerseKey, setSelectedVerseKey] = useState<string>(
    initialPageData.verses[0]?.verseKey ?? "1:1"
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<"index" | "prefs" | "note" | null>(
    null
  );
  const [savedPosition, setSavedPosition] = useState<SavedMushafPosition | null>(
    null
  );
  const [jumpSurah, setJumpSurah] = useState<number>(
    initialPageData.verses[0]?.surahNumber ?? 1
  );
  const [jumpAyah, setJumpAyah] = useState<number>(
    initialPageData.verses[0]?.ayahNumber ?? 1
  );
  const [bookmarkNote, setBookmarkNote] = useState("");
  const [activeReciterId, setActiveReciterId] = useState<number>(
    MUSHAF_TIMESTAMP_RECITERS[0].qdcId
  );
  const [timestamps, setTimestamps] = useState<AudioSegmentTimestamp[]>([]);
  const [timestampsSurah, setTimestampsSurah] = useState<number | null>(null);

  const PrevPageIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextPageIcon = isRtl ? ChevronLeft : ChevronRight;

  // Hydrate saved Mushaf reading position safely on mount
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(MUSHAF_POS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as SavedMushafPosition;
          if (parsed?.pageNumber >= 1 && parsed?.pageNumber <= MUSHAF_TOTAL_PAGES) {
            setSavedPosition(parsed);
          }
        }
      } catch {
        // Ignore storage error
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const persistPosition = useCallback(
    (nextPage: number, verseKey: string) => {
      setSavedPosition((prev) => {
        const recent = [
          nextPage,
          ...(prev?.recentPages || []).filter((p) => p !== nextPage),
        ].slice(0, 8);
        const next: SavedMushafPosition = {
          pageNumber: nextPage,
          lastVerseKey: verseKey,
          recentPages: recent,
          updatedAt: new Date().toISOString(),
        };
        try {
          localStorage.setItem(MUSHAF_POS_KEY, JSON.stringify(next));
        } catch {
          // Ignore storage errors
        }
        return next;
      });
    },
    []
  );

  const loadPage = useCallback(
    async (targetPage: number, targetVerseKey?: string) => {
      const clamped = Math.min(MUSHAF_TOTAL_PAGES, Math.max(1, Math.trunc(targetPage)));
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/mushaf/page/${clamped}`);
        const json = (await res.json()) as MushafPagePayload & { error?: string };
        if (!res.ok || !Array.isArray(json.verses)) {
          throw new Error(json.error || "Failed to load Mushaf page");
        }
        setPageData(json);
        const resolvedVerseKey =
          targetVerseKey && json.verses.some((v) => v.verseKey === targetVerseKey)
            ? targetVerseKey
            : json.verses[0]?.verseKey ?? "1:1";
        setSelectedVerseKey(resolvedVerseKey);
        if (json.verses[0]) {
          setJumpSurah(json.verses[0].surahNumber);
          setJumpAyah(json.verses[0].ayahNumber);
        }
        persistPosition(clamped, resolvedVerseKey);
        router.replace(`/mushaf?page=${clamped}`, { scroll: false });
      } catch {
        setErrorMsg(
          locale === "ar"
            ? "تعذر تحميل صفحة المصحف من المزود المعتمد حالياً. لم تُعرض أي نصوص بديلة."
            : "Unable to load this Mushaf page from the verified provider right now."
        );
      } finally {
        setLoading(false);
      }
    },
    [locale, persistPosition, router]
  );

  // Keyboard page navigation (RTL-aware)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "SELECT" ||
        target?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "ArrowLeft") {
        if (isRtl && pageData.pageNumber < MUSHAF_TOTAL_PAGES) {
          void loadPage(pageData.pageNumber + 1);
        } else if (!isRtl && pageData.pageNumber > 1) {
          void loadPage(pageData.pageNumber - 1);
        }
      } else if (e.key === "ArrowRight") {
        if (isRtl && pageData.pageNumber > 1) {
          void loadPage(pageData.pageNumber - 1);
        } else if (!isRtl && pageData.pageNumber < MUSHAF_TOTAL_PAGES) {
          void loadPage(pageData.pageNumber + 1);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isRtl, loadPage, pageData.pageNumber]);

  const selectedVerse: MushafPageVerse = useMemo(
    () =>
      pageData.verses.find((v) => v.verseKey === selectedVerseKey) ??
      pageData.verses[0],
    [pageData.verses, selectedVerseKey]
  );

  const selectedSurahMeta = useMemo(
    () =>
      SURAHS.find((s) => s.number === (selectedVerse?.surahNumber ?? 1)) ??
      SURAHS[0],
    [selectedVerse]
  );

  // Determine surahs shown on this page for header indicator
  const pageSurahs = useMemo(() => {
    const seen = new Set<number>();
    const list: (typeof SURAHS)[number][] = [];
    for (const v of pageData.verses) {
      if (!seen.has(v.surahNumber)) {
        seen.add(v.surahNumber);
        const s = SURAHS.find((x) => x.number === v.surahNumber);
        if (s) list.push(s);
      }
    }
    return list;
  }, [pageData.verses]);

  // Verified 15-line Madinah Mushaf layout grouping when word line_number data is present
  const hasLineLayout = useMemo(
    () => pageData.verses.some((v) => v.words.length > 0),
    [pageData.verses]
  );

  // Active audio verse tracking based strictly on verified timestamps
  const activeAudioVerseKey = useMemo(() => {
    if (
      track?.kind !== "quran" ||
      audioStatus !== "playing" ||
      timestampsSurah !== track.surahNumber ||
      timestamps.length === 0
    ) {
      return null;
    }
    const found = timestamps.find(
      (t) => currentTime >= t.fromSec && currentTime <= t.toSec
    );
    return found?.verseKey ?? null;
  }, [audioStatus, currentTime, timestamps, timestampsSurah, track]);

  const handlePlayFromVerse = async (verse: MushafPageVerse) => {
    const recMeta =
      MUSHAF_TIMESTAMP_RECITERS.find((r) => r.qdcId === activeReciterId) ??
      MUSHAF_TIMESTAMP_RECITERS[0];
    const waslReciter =
      VERIFIED_RECITERS.find((r) => r.slug === recMeta.slug) ??
      VERIFIED_RECITERS[0];

    try {
      const res = await fetch(
        `/api/mushaf/audio-segments?reciterId=${recMeta.qdcId}&surah=${verse.surahNumber}`
      );
      if (res.ok) {
        const json = (await res.json()) as {
          audioUrl?: string;
          timestamps?: AudioSegmentTimestamp[];
        };
        if (json.audioUrl && Array.isArray(json.timestamps)) {
          setTimestamps(json.timestamps);
          setTimestampsSurah(verse.surahNumber);
          const match = json.timestamps.find(
            (t) => t.verseKey === verse.verseKey
          );
          playSurah(
            verse.surahNumber,
            waslReciter,
            match ? match.fromSec : 0,
            json.audioUrl
          );
          return;
        }
      }
    } catch {
      // Fallback cleanly to standard surah audio without inventing timestamps
    }

    setTimestamps([]);
    setTimestampsSurah(null);
    playSurah(verse.surahNumber, waslReciter);
  };

  const handleJumpToSurahAyah = () => {
    // Search indexed pages for exact surah + ayah location
    const entries = Object.values(MUSHAF_PAGE_INDEX);
    const matchingPage = entries.find((p) => {
      const startsBeforeOrHere =
        p.startSurah < jumpSurah ||
        (p.startSurah === jumpSurah && p.startAyah <= jumpAyah);
      const endsAfterOrHere =
        p.endSurah > jumpSurah ||
        (p.endSurah === jumpSurah && p.endAyah >= jumpAyah);
      return startsBeforeOrHere && endsAfterOrHere;
    });
    const chapterMeta = MUSHAF_CHAPTERS.find((c) => c.number === jumpSurah);
    const targetPage = matchingPage?.page ?? chapterMeta?.startPage ?? 1;
    setDrawerOpen(null);
    void loadPage(targetPage, `${jumpSurah}:${jumpAyah}`);
  };

  const mushafBookmarks = useMemo(
    () => bookmarks.filter((b) => b.type === "mushaf"),
    [bookmarks]
  );

  const selectedBookmarkId = selectedVerse
    ? `mushaf:${selectedVerse.verseKey}`
    : "mushaf:1:1";
  const isVerseBookmarked = isBookmarked(selectedBookmarkId);

  const jumpSurahMeta = SURAHS.find((s) => s.number === jumpSurah) ?? SURAHS[0];

  // Build ordered page blocks per line (1..15) for faithful Mushaf Mode
  const lineBlocks = useMemo(() => {
    if (!hasLineLayout) return [];
    const linesMap = new Map<
      number,
      {
        surahHeader?: (typeof MUSHAF_CHAPTERS)[number];
        bismillah?: boolean;
        words: {
          verseKey: string;
          surahNumber: number;
          ayahNumber: number;
          textUthmani: string;
          isEnd: boolean;
          sajdahNumber: number | null;
        }[];
      }
    >();

    for (const verse of pageData.verses) {
      // If Ayah 1 begins on this page, render its surah header right before its first word's line
      const firstLine = verse.words[0]?.lineNumber ?? 1;
      if (verse.ayahNumber === 1) {
        const chapter = MUSHAF_CHAPTERS.find((c) => c.number === verse.surahNumber);
        const headerLine = firstLine;
        const slot = linesMap.get(headerLine) ?? { words: [] };
        if (chapter && !slot.surahHeader) {
          slot.surahHeader = chapter;
          slot.bismillah = chapter.bismillahPre;
        }
        linesMap.set(headerLine, slot);
      }

      for (const word of verse.words) {
        const ln = word.lineNumber || 1;
        const slot = linesMap.get(ln) ?? { words: [] };
        slot.words.push({
          verseKey: verse.verseKey,
          surahNumber: verse.surahNumber,
          ayahNumber: verse.ayahNumber,
          textUthmani: word.textUthmani,
          isEnd: word.charType === "end",
          sajdahNumber: verse.sajdahNumber,
        });
        linesMap.set(ln, slot);
      }
    }

    return Array.from(linesMap.entries()).sort((a, b) => a[0] - b[0]);
  }, [hasLineLayout, pageData.verses]);

  return (
    <PageShell className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <Breadcrumbs
        items={[
          { labelAr: "القرآن الكريم", labelEn: "Holy Quran", href: "/quran" },
          { labelAr: "المصحف الشريف", labelEn: "Digital Mushaf" },
        ]}
      />

      {/* Continue Reading Banner if saved position differs */}
      {!explicitPageRequested &&
      savedPosition &&
      savedPosition.pageNumber !== pageData.pageNumber ? (
        <div className="mb-5 rounded-2xl border border-[var(--brand-gold)]/40 bg-[var(--brand-gold-soft)]/55 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
            <BookOpen className="h-4 w-4 text-[var(--brand-gold)]" />
            <span>
              {locale === "ar"
                ? `توقفت سابقاً عند صفحة ${savedPosition.pageNumber} (${savedPosition.lastVerseKey})`
                : `Your last reading position was Page ${savedPosition.pageNumber} (${savedPosition.lastVerseKey})`}
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              void loadPage(savedPosition.pageNumber, savedPosition.lastVerseKey)
            }
            className="rounded-xl bg-[var(--brand-emerald)] px-4 py-1.5 text-xs font-bold text-white hover:bg-[var(--brand-emerald-strong)] transition-colors"
          >
            {locale === "ar" ? "استكمال القراءة" : "Continue Reading"}
          </button>
        </div>
      ) : null}

      {/* Top Mushaf Control Toolbar */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-6 mb-6 shadow-sm">
        <div className="pointer-events-none absolute inset-0 text-[var(--brand-emerald)]">
          <GeometricLattice opacity={0.025} />
        </div>

        <div className="relative flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                {locale === "ar"
                  ? "المصحف الشريف — وضع القراءة"
                  : "The Noble Mushaf — Reading Experience"}
              </h1>
              <p className="text-xs text-[var(--text-secondary)]">
                {locale === "ar"
                  ? `صفحة ${pageData.pageNumber} من ${MUSHAF_TOTAL_PAGES} • الجزء ${pageData.juzNumber} • الحزب ${pageData.hizbNumber}`
                  : `Page ${pageData.pageNumber} of ${MUSHAF_TOTAL_PAGES} • Juz ${pageData.juzNumber} • Hizb ${pageData.hizbNumber}`}
              </p>
            </div>

            {/* 3 Reading Modes */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-page)] p-1">
              {(
                [
                  { id: "mushaf", ar: "صفحة المصحف", en: "Mushaf Page" },
                  { id: "continuous", ar: "نص متصل", en: "Continuous" },
                  { id: "focused", ar: "الآيات مفصلة", en: "Surah Focus" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                    mode === m.id
                      ? "bg-[var(--brand-emerald)] text-white"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {locale === "ar" ? m.ar : m.en}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation + Quick Pickers */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void loadPage(pageData.pageNumber - 1)}
                disabled={loading || pageData.pageNumber <= 1}
                className="inline-flex items-center gap-1 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-xs font-semibold hover:bg-[var(--bg-surface-alt)] disabled:opacity-45"
              >
                <PrevPageIcon className="h-4 w-4" />
                <span>{locale === "ar" ? "السابقة" : "Prev"}</span>
              </button>

              {/* Direct Page Input Selector */}
              <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-page)] px-2.5 py-1.5 text-xs">
                <label htmlFor="mushaf-page-select" className="text-[var(--text-muted)]">
                  {locale === "ar" ? "ص" : "P."}
                </label>
                <select
                  id="mushaf-page-select"
                  value={pageData.pageNumber}
                  onChange={(e) => void loadPage(Number(e.target.value))}
                  className="bg-transparent font-mono font-bold text-[var(--text-primary)] focus:outline-none"
                >
                  {Array.from({ length: MUSHAF_TOTAL_PAGES }, (_, idx) => idx + 1).map(
                    (p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    )
                  )}
                </select>
              </div>

              <button
                type="button"
                onClick={() => void loadPage(pageData.pageNumber + 1)}
                disabled={loading || pageData.pageNumber >= MUSHAF_TOTAL_PAGES}
                className="inline-flex items-center gap-1 rounded-xl bg-[var(--brand-emerald)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--brand-emerald-strong)] disabled:opacity-45"
              >
                <span>{locale === "ar" ? "التالية" : "Next"}</span>
                <NextPageIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Utility Drawer Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setDrawerOpen((prev) => (prev === "index" ? null : "index"))
                }
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                  drawerOpen === "index"
                    ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-secondary)]"
                }`}
              >
                <ListTree className="h-3.5 w-3.5" />
                <span>{locale === "ar" ? "الفهرس والانتقال" : "Index & Jump"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setDrawerOpen((prev) => (prev === "note" ? null : "note"))
                }
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                  drawerOpen === "note"
                    ? "border-[var(--brand-gold)] bg-[var(--brand-gold-soft)] text-[var(--brand-gold)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-secondary)]"
                }`}
              >
                <Bookmark className="h-3.5 w-3.5" />
                <span>
                  {locale === "ar"
                    ? `علاماتي (${mushafBookmarks.length})`
                    : `Bookmarks (${mushafBookmarks.length})`}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setDrawerOpen((prev) => (prev === "prefs" ? null : "prefs"))
                }
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                  drawerOpen === "prefs"
                    ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-secondary)]"
                }`}
              >
                <Settings2 className="h-3.5 w-3.5" />
                <span>{locale === "ar" ? "الخط والعرض" : "Display"}</span>
              </button>

              <Link
                href={`/khatmah?startPage=${pageData.pageNumber}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--brand-gold)]/40 bg-[var(--brand-gold-soft)] px-3 py-2 text-xs font-bold text-[var(--brand-gold)] hover:opacity-90"
              >
                <Compass className="h-3.5 w-3.5" />
                <span>{locale === "ar" ? "ختمة من هنا" : "Start Khatmah"}</span>
              </Link>
            </div>
          </div>

          {/* Reciter Bar (Verified Timestamps Audio) */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-subtle)] px-3.5 py-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Headphones className="h-4 w-4 text-[var(--brand-emerald)]" />
              <label htmlFor="mushaf-reciter" className="font-semibold text-[var(--text-secondary)]">
                {locale === "ar" ? "القارئ:" : "Reciter:"}
              </label>
              <select
                id="mushaf-reciter"
                value={activeReciterId}
                onChange={(e) => setActiveReciterId(Number(e.target.value))}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--text-primary)]"
              >
                {MUSHAF_TIMESTAMP_RECITERS.map((r) => (
                  <option key={r.qdcId} value={r.qdcId}>
                    {locale === "ar" ? r.nameAr : r.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {selectedVerse ? (
              <button
                type="button"
                onClick={() => {
                  const isPlayingThis =
                    track?.kind === "quran" &&
                    track.surahNumber === selectedVerse.surahNumber &&
                    audioStatus === "playing";
                  if (isPlayingThis) {
                    togglePlayPause();
                  } else {
                    void handlePlayFromVerse(selectedVerse);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand-emerald)] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[var(--brand-emerald-strong)] transition-colors"
              >
                {track?.kind === "quran" &&
                track.surahNumber === selectedVerse.surahNumber &&
                audioStatus === "playing" ? (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    <span>{locale === "ar" ? "إيقاف التلاوة" : "Pause"}</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    <span>
                      {locale === "ar"
                        ? `تلاوة من الآية ${selectedVerse.ayahNumber}`
                        : `Play from ${selectedVerse.verseKey}`}
                    </span>
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {/* Expandable Utility Panels */}
      {drawerOpen === "index" ? (
        <section className="wasl-surface rounded-3xl p-5 sm:p-6 mb-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Jump by Surah & Ayah */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              {locale === "ar" ? "الانتقال إلى سورة وآية" : "Jump to Surah & Verse"}
            </h2>
            <div className="space-y-2">
              <select
                value={jumpSurah}
                onChange={(e) => {
                  setJumpSurah(Number(e.target.value));
                  setJumpAyah(1);
                }}
                aria-label="Select Surah"
                className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-xs font-semibold"
              >
                {SURAHS.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.nameAr} ({s.englishName})
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <select
                  value={jumpAyah}
                  onChange={(e) => setJumpAyah(Number(e.target.value))}
                  aria-label="Select Verse"
                  className="flex-1 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-xs font-semibold"
                >
                  {Array.from(
                    { length: jumpSurahMeta.numberOfAyahs },
                    (_, i) => i + 1
                  ).map((num) => (
                    <option key={num} value={num}>
                      {locale === "ar" ? `آية ${num}` : `Verse ${num}`}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleJumpToSurahAyah}
                  className="rounded-xl bg-[var(--brand-emerald)] px-4 py-2 text-xs font-bold text-white"
                >
                  {locale === "ar" ? "انتقال" : "Go"}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Juz Grid */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              {locale === "ar" ? "فهرس الأجزاء (٣٠ جزءاً)" : "Juz Index (1–30)"}
            </h2>
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-1.5">
              {MUSHAF_JUZS.map((j) => (
                <button
                  key={j.juzNumber}
                  type="button"
                  onClick={() => {
                    setDrawerOpen(null);
                    void loadPage(j.startPage);
                  }}
                  className={`rounded-xl border py-2 text-xs font-bold transition-colors ${
                    pageData.juzNumber === j.juzNumber
                      ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald)] text-white"
                      : "border-[var(--border-subtle)] bg-[var(--bg-page)] hover:border-[var(--brand-gold)]"
                  }`}
                >
                  {locale === "ar" ? `ج ${j.juzNumber}` : `J${j.juzNumber}`}
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {drawerOpen === "prefs" ? (
        <section className="wasl-surface rounded-3xl p-5 sm:p-6 mb-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              {locale === "ar" ? "إعدادات عرض المصحف السريعة" : "Quick Display Controls"}
            </h2>
            <Link
              href="/reading-settings"
              className="text-xs font-bold text-[var(--brand-emerald)] hover:underline"
            >
              {locale === "ar"
                ? "فتح صفحة الإعدادات الكاملة ←"
                : "Open Full Reading Preferences →"}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-[var(--text-secondary)] flex justify-between">
                <span>{locale === "ar" ? "حجم الخط القرآني" : "Quran Size"}</span>
                <span className="font-mono">{prefs.quranFontSizePx}px</span>
              </label>
              <input
                type="range"
                min={20}
                max={40}
                value={prefs.quranFontSizePx}
                onChange={(e) =>
                  updatePrefs({ quranFontSizePx: Number(e.target.value) })
                }
                className="w-full accent-[var(--brand-emerald)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[var(--text-secondary)] flex justify-between">
                <span>{locale === "ar" ? "تكبير الصفحة" : "Page Zoom"}</span>
                <span className="font-mono">{Math.round(prefs.mushafZoom * 100)}%</span>
              </label>
              <input
                type="range"
                min={0.85}
                max={1.3}
                step={0.05}
                value={prefs.mushafZoom}
                onChange={(e) =>
                  updatePrefs({ mushafZoom: Number(e.target.value) })
                }
                className="w-full accent-[var(--brand-emerald)]"
              />
            </div>

            <div className="flex items-center gap-2 pt-3">
              <input
                id="mushaf-trans-toggle"
                type="checkbox"
                checked={prefs.showTranslation}
                onChange={(e) =>
                  updatePrefs({ showTranslation: e.target.checked })
                }
                className="h-4 w-4 accent-[var(--brand-emerald)]"
              />
              <label htmlFor="mushaf-trans-toggle" className="font-semibold">
                {locale === "ar" ? "عرض الترجمة الإنجليزية" : "Show Translation"}
              </label>
            </div>

            <div className="flex items-center gap-2 pt-3">
              <input
                id="mushaf-highlight-toggle"
                type="checkbox"
                checked={prefs.verseHighlight}
                onChange={(e) =>
                  updatePrefs({ verseHighlight: e.target.checked })
                }
                className="h-4 w-4 accent-[var(--brand-emerald)]"
              />
              <label htmlFor="mushaf-highlight-toggle" className="font-semibold">
                {locale === "ar" ? "تمييز الآية النشطة" : "Highlight Active Verse"}
              </label>
            </div>
          </div>
        </section>
      ) : null}

      {drawerOpen === "note" ? (
        <section className="wasl-surface rounded-3xl p-5 sm:p-6 mb-6 space-y-4">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            {locale === "ar"
              ? "العلامات المرجعية وملاحظات القراءة"
              : "Mushaf Bookmarks & Reading Notes"}
          </h2>

          {selectedVerse ? (
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-page)] p-4 space-y-3">
              <p className="text-xs font-semibold text-[var(--brand-emerald)]">
                {locale === "ar"
                  ? `الآية المحددة: سورة ${selectedSurahMeta.nameAr} — الآية ${selectedVerse.ayahNumber} (صفحة ${pageData.pageNumber})`
                  : `Selected: Surah ${selectedSurahMeta.englishName} (${selectedVerse.verseKey}, Page ${pageData.pageNumber})`}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={bookmarkNote}
                  onChange={(e) => setBookmarkNote(e.target.value)}
                  placeholder={
                    locale === "ar"
                      ? "أضف ملاحظة أو فائدة تدبرية اختيارية..."
                      : "Add an optional reflection note..."
                  }
                  className="flex-1 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    toggleBookmark({
                      id: selectedBookmarkId,
                      type: "mushaf",
                      titleAr: `صفحة ${pageData.pageNumber} — ${selectedSurahMeta.nameAr} (${selectedVerse.ayahNumber})`,
                      titleEn: `Page ${pageData.pageNumber} — ${selectedSurahMeta.englishName} (${selectedVerse.verseKey})`,
                      arabicText: selectedVerse.textUthmani,
                      englishText: selectedVerse.translationEn,
                      referenceAr: `المصحف الشريف: ص ${pageData.pageNumber} — سورة ${selectedSurahMeta.nameAr} آية ${selectedVerse.ayahNumber}`,
                      referenceEn: `Mushaf Page ${pageData.pageNumber} — ${selectedVerse.verseKey}`,
                      note: bookmarkNote.trim() || undefined,
                      url: `/mushaf?page=${pageData.pageNumber}`,
                    });
                    setBookmarkNote("");
                  }}
                  className="rounded-xl bg-[var(--brand-gold)] px-4 py-2 text-xs font-bold text-white"
                >
                  {isVerseBookmarked
                    ? locale === "ar"
                      ? "إزالة العلامة"
                      : "Remove Bookmark"
                    : locale === "ar"
                      ? "حفظ العلامة المرجعية"
                      : "Save Bookmark"}
                </button>
              </div>
            </div>
          ) : null}

          {mushafBookmarks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mushafBookmarks.map((b) => {
                const pageMatch = b.url.match(/page=(\d+)/);
                const targetPage = pageMatch ? Number(pageMatch[1]) : 1;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setDrawerOpen(null);
                      void loadPage(targetPage);
                    }}
                    className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3.5 text-start hover:border-[var(--brand-emerald)] transition-colors space-y-1"
                  >
                    <p className="text-xs font-bold text-[var(--brand-emerald)]">
                      {locale === "ar" ? b.titleAr : b.titleEn}
                    </p>
                    {b.note ? (
                      <p className="text-xs text-[var(--text-secondary)] italic">
                        “{b.note}”
                      </p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)]">
              {locale === "ar"
                ? "لم تضف علامات مرجعية من المصحف بعد."
                : "No Mushaf bookmarks saved yet."}
            </p>
          )}
        </section>
      ) : null}

      {errorMsg ? (
        <div className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 flex items-center gap-3 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      ) : null}

      {/* Main Digital Mushaf Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <div className="wasl-reading-surface rounded-[2rem] border-2 border-[var(--brand-gold)]/35 p-4 sm:p-8 shadow-md relative overflow-hidden">
            {/* Ornamental Page Header Bar */}
            <div className="flex items-center justify-between text-xs font-bold text-[var(--brand-gold)] pb-3 mb-5 border-b border-[var(--brand-gold)]/25">
              <span>
                {pageSurahs.map((s) => `سورة ${s.nameAr}`).join(" • ")}
              </span>
              <span className="font-mono">
                {locale === "ar"
                  ? `الجزء ${toArabicDigits(pageData.juzNumber)} — صفحة ${toArabicDigits(
                      pageData.pageNumber
                    )}`
                  : `Juz ${pageData.juzNumber} — Page ${pageData.pageNumber}`}
              </span>
            </div>

            {loading ? (
              <div className="space-y-4 py-10">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="wasl-skeleton h-8 w-full rounded-xl" />
                ))}
              </div>
            ) : mode === "mushaf" && hasLineLayout ? (
              <div dir="rtl" lang="ar" className="space-y-2.5 text-center">
                {lineBlocks.map(([lineNo, block]) => (
                  <div key={lineNo} className="space-y-2">
                    {block.surahHeader ? (
                      <div className="my-4 space-y-2">
                        <div className="rounded-2xl border border-[var(--brand-gold)]/45 bg-[var(--brand-gold-soft)]/55 py-2.5 px-4 text-center">
                          <h2 className="font-arabic-display text-lg sm:text-xl font-bold text-[var(--wasl-paper-text)]">
                            سورة {block.surahHeader.nameAr}
                          </h2>
                        </div>
                        {block.bismillah ? <BismillahBanner /> : null}
                      </div>
                    ) : null}

                    <p className="font-quran-reading leading-[2.3] flex flex-wrap justify-center gap-x-1.5 text-[var(--wasl-paper-text)]">
                      {block.words.map((w, wIdx) => {
                        const isSelected = w.verseKey === selectedVerseKey;
                        const isPlaying = w.verseKey === activeAudioVerseKey;
                        return (
                          <span
                            key={`${w.verseKey}-${wIdx}`}
                            onClick={() => {
                              setSelectedVerseKey(w.verseKey);
                              persistPosition(pageData.pageNumber, w.verseKey);
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedVerseKey(w.verseKey);
                                persistPosition(pageData.pageNumber, w.verseKey);
                              }
                            }}
                            className={`cursor-pointer rounded-md px-0.5 transition-colors ${
                              isPlaying
                                ? "bg-[var(--brand-emerald)]/25 text-[var(--brand-emerald)]"
                                : isSelected && prefs.verseHighlight
                                  ? "bg-[var(--brand-gold-soft)]"
                                  : "hover:bg-[var(--brand-emerald-soft)]/50"
                            } ${w.isEnd ? "text-[var(--brand-gold)] font-bold mx-0.5" : ""}`}
                          >
                            {w.textUthmani}
                            {w.isEnd && w.sajdahNumber ? " ۩" : ""}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : mode === "focused" ? (
              <div className="space-y-5">
                {pageData.verses.map((v) => {
                  const sMeta = SURAHS.find((s) => s.number === v.surahNumber);
                  const isSelected = v.verseKey === selectedVerseKey;
                  const isPlaying = v.verseKey === activeAudioVerseKey;
                  return (
                    <div
                      key={v.verseKey}
                      onClick={() => {
                        setSelectedVerseKey(v.verseKey);
                        persistPosition(pageData.pageNumber, v.verseKey);
                      }}
                      className={`rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer space-y-3 ${
                        isPlaying
                          ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald-soft)]"
                          : isSelected && prefs.verseHighlight
                            ? "border-[var(--brand-gold)] bg-[var(--brand-gold-soft)]/40"
                            : "border-[var(--border-subtle)]"
                      }`}
                    >
                      {v.ayahNumber === 1 && sMeta ? (
                        <div className="text-center pb-2 border-b border-[var(--border-subtle)] space-y-2">
                          <h2 className="font-arabic-display text-lg font-bold text-[var(--brand-emerald)]">
                            سورة {sMeta.nameAr}
                          </h2>
                          {v.surahNumber !== 1 && v.surahNumber !== 9 ? (
                            <BismillahBanner />
                          ) : null}
                        </div>
                      ) : null}

                      <p
                        dir="rtl"
                        lang="ar"
                        className="font-quran-reading text-[var(--wasl-paper-text)] leading-[2.25]"
                      >
                        {v.textUthmani}{" "}
                        <span className="text-[var(--brand-gold)] font-bold">
                          ﴿{toArabicDigits(v.ayahNumber)}﴾
                          {v.sajdahNumber ? " ۩" : ""}
                        </span>
                      </p>

                      {prefs.showTranslation && v.translationEn ? (
                        <p dir="ltr" lang="en" className="text-xs sm:text-sm text-[var(--wasl-paper-muted)]">
                          {v.translationEn}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Continuous Quran Flow Mode */
              <div dir="rtl" lang="ar" className="font-quran-reading leading-[2.4] text-justify text-[var(--wasl-paper-text)]">
                {pageData.verses.map((v) => {
                  const sMeta = SURAHS.find((s) => s.number === v.surahNumber);
                  const isSelected = v.verseKey === selectedVerseKey;
                  const isPlaying = v.verseKey === activeAudioVerseKey;
                  return (
                    <React.Fragment key={v.verseKey}>
                      {v.ayahNumber === 1 && sMeta ? (
                        <span className="block my-5 text-center">
                          <span className="block rounded-2xl border border-[var(--brand-gold)]/45 bg-[var(--brand-gold-soft)]/50 py-2 font-bold text-lg">
                            سورة {sMeta.nameAr}
                          </span>
                          {v.surahNumber !== 1 && v.surahNumber !== 9 ? (
                            <BismillahBanner className="mt-2" />
                          ) : null}
                        </span>
                      ) : null}
                      <span
                        onClick={() => {
                          setSelectedVerseKey(v.verseKey);
                          persistPosition(pageData.pageNumber, v.verseKey);
                        }}
                        className={`cursor-pointer rounded px-1 transition-colors ${
                          isPlaying
                            ? "bg-[var(--brand-emerald)]/25"
                            : isSelected && prefs.verseHighlight
                              ? "bg-[var(--brand-gold-soft)]"
                              : "hover:bg-[var(--brand-emerald-soft)]/50"
                        }`}
                      >
                        {v.textUthmani}{" "}
                        <span className="text-[var(--brand-gold)] font-bold">
                          ﴿{toArabicDigits(v.ayahNumber)}﴾{v.sajdahNumber ? " ۩" : ""}{" "}
                        </span>
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* Page Footer Attribution + Prev/Next */}
            <div className="mt-8 pt-4 border-t border-[var(--brand-gold)]/25 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
              <span>{pageData.sourceName}</span>
              <span className="font-mono font-bold text-[var(--brand-gold)]">
                {pageData.pageNumber} / {MUSHAF_TOTAL_PAGES}
              </span>
            </div>
          </div>
        </div>

        {/* Sticky Contextual Companion Sidebar (Selected Verse Tools) */}
        <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
          {selectedVerse ? (
            <div className="wasl-surface rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
                <div>
                  <span className="text-[11px] font-bold text-[var(--brand-gold)]">
                    {locale === "ar" ? "الآية المختارة" : "Selected Verse"}
                  </span>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    {locale === "ar"
                      ? `سورة ${selectedSurahMeta.nameAr} — الآية ${selectedVerse.ayahNumber}`
                      : `Surah ${selectedSurahMeta.englishName} (${selectedVerse.verseKey})`}
                  </h2>
                </div>
                {selectedVerse.sajdahNumber ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-gold-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--brand-gold)]">
                    <Sparkles className="h-3 w-3" />
                    <span>{locale === "ar" ? "سجدة" : "Sajdah"}</span>
                  </span>
                ) : null}
              </div>

              <p dir="rtl" lang="ar" className="font-quran text-xl leading-loose text-[var(--text-primary)] bg-[var(--bg-page)] rounded-2xl p-4 border border-[var(--border-subtle)]">
                ﴿{selectedVerse.textUthmani}﴾
              </p>

              {selectedVerse.translationEn ? (
                <p dir="ltr" lang="en" className="text-xs leading-relaxed text-[var(--text-secondary)]">
                  {selectedVerse.translationEn}
                </p>
              ) : null}

              {/* Integrated Platform Actions */}
              <div className="grid grid-cols-1 gap-2.5 pt-2">
                <Link
                  href={`/tafsir/${selectedVerse.surahNumber}/${selectedVerse.ayahNumber}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-emerald)] px-4 py-2.5 text-xs font-bold text-white hover:bg-[var(--brand-emerald-strong)] transition-colors"
                >
                  <BookMarked className="h-4 w-4" />
                  <span>
                    {locale === "ar"
                      ? "اقرأ التفسير وأسباب النزول"
                      : "Open in Tafsir Encyclopedia"}
                  </span>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDrawerOpen("note")}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                      isVerseBookmarked
                        ? "border-[var(--brand-gold)] bg-[var(--brand-gold-soft)] text-[var(--brand-gold)]"
                        : "border-[var(--border-subtle)] hover:border-[var(--brand-emerald)]"
                    }`}
                  >
                    <Bookmark
                      className={`h-3.5 w-3.5 ${isVerseBookmarked ? "fill-current" : ""}`}
                    />
                    <span>
                      {isVerseBookmarked
                        ? locale === "ar"
                          ? "معلمة في مكتبتي"
                          : "Bookmarked"
                        : locale === "ar"
                          ? "علامة + ملاحظة"
                          : "Bookmark"}
                    </span>
                  </button>

                  <WaslShare
                    variant="pill"
                    label={locale === "ar" ? "مشاركة" : "Share"}
                    payload={{
                      kind: "verse",
                      arabicText: `﴿${selectedVerse.textUthmani}﴾`,
                      englishText: selectedVerse.translationEn,
                      referenceAr: `${selectedSurahMeta.nameAr} — الآية ${selectedVerse.ayahNumber}`,
                      referenceEn: `Surah ${selectedSurahMeta.englishName} (${selectedVerse.verseKey})`,
                      sourceAr: "القرآن الكريم — المصحف الشريف",
                      sourceEn: "The Noble Quran — Digital Mushaf",
                      surahNameAr: selectedSurahMeta.nameAr,
                      surahNameEn: selectedSurahMeta.englishName,
                      surahNumber: selectedVerse.surahNumber,
                      ayahNumber: selectedVerse.ayahNumber,
                      shareUrl: `/mushaf?page=${pageData.pageNumber}`,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {/* Recent Pages Quick Switcher */}
          {savedPosition && savedPosition.recentPages.length > 0 ? (
            <div className="wasl-surface rounded-3xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-[var(--text-muted)]">
                {locale === "ar" ? "صفحات فتحتها مؤخراً:" : "Recently Opened Pages:"}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {savedPosition.recentPages.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => void loadPage(p)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-mono font-bold transition-colors ${
                      p === pageData.pageNumber
                        ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald)] text-white"
                        : "border-[var(--border-subtle)] bg-[var(--bg-page)] hover:border-[var(--brand-gold)]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </PageShell>
  );
}

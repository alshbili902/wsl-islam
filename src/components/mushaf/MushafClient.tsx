"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  BookMarked,
  BookOpen,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Compass,
  FileText,
  Headphones,
  ListTree,
  Maximize2,
  Minimize2,
  Moon,
  Pause,
  Play,
  Settings2,
  Sparkles,
  Sun,
} from "lucide-react";
import { BismillahBanner, GeometricLattice } from "@/components/brand/IslamicVisuals";
import {
  MushafBookStage,
  type BookSpreadPreference,
} from "@/components/mushaf/MushafBookStage";
import { useAudio } from "@/components/providers/AudioProvider";
import { useReadingPreferences } from "@/components/providers/ReadingPreferencesProvider";
import { useWasl } from "@/components/providers/WaslProvider";
import { WaslShare } from "@/components/share/WaslShare";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageShell } from "@/components/ui/MotionPrimitives";
import { VERIFIED_RECITERS } from "@/data/reciters";
import { SURAHS } from "@/data/surahs";
import {
  getPageIndexInfo,
  MUSHAF_JUZS,
  MUSHAF_TIMESTAMP_RECITERS,
  MUSHAF_TOTAL_PAGES,
} from "@/lib/api/mushaf";
import {
  buildMushafLineBlocks,
  findPageForVerse,
  formatHizbRubInfo,
  toArabicDigits,
} from "@/lib/mushaf/helpers";
import type { MushafPagePayload, MushafPageVerse } from "@/types/islamic";

type MushafReadingMode = "book" | "continuous" | "focused";

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
const MAX_CACHED_PAGES = 48;

export function MushafClient({
  initialPageData,
  explicitPageRequested,
}: {
  initialPageData: MushafPagePayload;
  explicitPageRequested: boolean;
}) {
  const router = useRouter();
  const osReducedMotion = useReducedMotion();
  const { locale, isRtl, resolvedTheme, bookmarks, toggleBookmark, isBookmarked } =
    useWasl();
  const { prefs, updatePrefs } = useReadingPreferences();
  const {
    track,
    status: audioStatus,
    currentTime,
    playSurah,
    togglePlayPause,
  } = useAudio();

  const reducedMotion = Boolean(osReducedMotion || prefs.reducedMotion);

  const [pageData, setPageData] = useState<MushafPagePayload>(initialPageData);
  const [pageCache, setPageCache] = useState<Map<number, MushafPagePayload>>(() => {
    const map = new Map<number, MushafPagePayload>();
    map.set(initialPageData.pageNumber, initialPageData);
    return map;
  });
  const [loadingPages, setLoadingPages] = useState<Set<number>>(() => new Set());
  const [errorPages, setErrorPages] = useState<Set<number>>(() => new Set());

  const [mode, setMode] = useState<MushafReadingMode>("book");
  const [spreadPref, setSpreadPref] = useState<BookSpreadPreference>("auto");
  const [bookNightMode, setBookNightMode] = useState(
    () => resolvedTheme === "night" || resolvedTheme === "dark"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cssFullscreenFallback, setCssFullscreenFallback] = useState(false);

  const [selectedVerseKey, setSelectedVerseKey] = useState<string>(
    initialPageData.verses[0]?.verseKey ?? "1:1"
  );
  const [drawerOpen, setDrawerOpen] = useState<"index" | "prefs" | "note" | null>(
    null
  );
  const [savedPosition, setSavedPosition] = useState<SavedMushafPosition | null>(
    null
  );
  const [jumpPageInput, setJumpPageInput] = useState<string>(
    String(initialPageData.pageNumber)
  );
  const [jumpSurah, setJumpSurah] = useState<number>(
    initialPageData.verses[0]?.surahNumber ?? 1
  );
  const [jumpAyah, setJumpAyah] = useState<number>(
    initialPageData.verses[0]?.ayahNumber ?? 1
  );
  const [bookmarkNote, setBookmarkNote] = useState("");
  const [selectedReciterSlug, setSelectedReciterSlug] = useState<string>(
    MUSHAF_TIMESTAMP_RECITERS[0].slug
  );
  const [timestamps, setTimestamps] = useState<AudioSegmentTimestamp[]>([]);
  const [timestampsSurah, setTimestampsSurah] = useState<number | null>(null);
  const [detectedOrientation, setDetectedOrientation] = useState<
    "portrait" | "landscape"
  >("landscape");

  const bookWrapperRef = useRef<HTMLDivElement | null>(null);
  const bookControlsRef = useRef<{
    flipNextPage: () => void;
    flipPrevPage: () => void;
  } | null>(null);
  const pageCacheRef = useRef(pageCache);
  const inflightRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    pageCacheRef.current = pageCache;
  }, [pageCache]);

  const PrevPageIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextPageIcon = isRtl ? ChevronLeft : ChevronRight;

  // Sync night reading toggle cleanly if global theme is toggled
  useEffect(() => {
    const id = window.setTimeout(() => {
      setBookNightMode(resolvedTheme === "night" || resolvedTheme === "dark");
    }, 0);
    return () => window.clearTimeout(id);
  }, [resolvedTheme]);

  // Listen to native fullscreen changes
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        setCssFullscreenFallback(false);
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Escape exits fallback fullscreen cleanly
  useEffect(() => {
    if (!cssFullscreenFallback) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCssFullscreenFallback(false);
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cssFullscreenFallback]);

  // Hydrate saved Mushaf position safely on mount
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

  // Fetch and cache any Mushaf page cleanly without duplicate in-flight requests
  const fetchAndCachePage = useCallback(
    async (pageNum: number): Promise<MushafPagePayload | null> => {
      const clamped = Math.min(MUSHAF_TOTAL_PAGES, Math.max(1, Math.trunc(pageNum)));
      const existing = pageCacheRef.current.get(clamped);
      if (existing) return existing;
      if (inflightRef.current.has(clamped)) return null;

      inflightRef.current.add(clamped);
      setLoadingPages((prev) => {
        const next = new Set(prev);
        next.add(clamped);
        return next;
      });
      setErrorPages((prev) => {
        if (!prev.has(clamped)) return prev;
        const next = new Set(prev);
        next.delete(clamped);
        return next;
      });

      try {
        const res = await fetch(`/api/mushaf/page/${clamped}`);
        const json = (await res.json()) as MushafPagePayload & { error?: string };
        if (!res.ok || !Array.isArray(json.verses)) {
          throw new Error(json.error || "Failed to load page");
        }

        setPageCache((prev) => {
          const next = new Map(prev);
          next.set(clamped, json);
          // Bound memory usage cleanly while retaining nearby pages
          if (next.size > MAX_CACHED_PAGES) {
            const firstKey = next.keys().next().value;
            if (typeof firstKey === "number" && firstKey !== clamped) {
              next.delete(firstKey);
            }
          }
          return next;
        });

        return json;
      } catch {
        setErrorPages((prev) => {
          const next = new Set(prev);
          next.add(clamped);
          return next;
        });
        return null;
      } finally {
        inflightRef.current.delete(clamped);
        setLoadingPages((prev) => {
          if (!prev.has(clamped)) return prev;
          const next = new Set(prev);
          next.delete(clamped);
          return next;
        });
      }
    },
    []
  );

  // Prefetch facing page + neighbor spreads silently around current page
  useEffect(() => {
    const p = pageData.pageNumber;
    const neighbors = [p, p + 1, p + 2, p + 3, p - 1, p - 2].filter(
      (n) => n >= 1 && n <= MUSHAF_TOTAL_PAGES
    );
    for (const n of neighbors) {
      if (!pageCacheRef.current.has(n)) {
        void fetchAndCachePage(n);
      }
    }
  }, [pageData.pageNumber, fetchAndCachePage]);

  const loadPage = useCallback(
    async (targetPage: number, targetVerseKey?: string) => {
      const clamped = Math.min(
        MUSHAF_TOTAL_PAGES,
        Math.max(1, Math.trunc(targetPage))
      );

      setJumpPageInput(String(clamped));

      const cached = pageCacheRef.current.get(clamped);
      const data = cached ?? (await fetchAndCachePage(clamped));
      if (!data) return;

      setPageData(data);
      const resolvedVerseKey =
        targetVerseKey && data.verses.some((v) => v.verseKey === targetVerseKey)
          ? targetVerseKey
          : data.verses[0]?.verseKey ?? "1:1";
      setSelectedVerseKey(resolvedVerseKey);

      if (data.verses[0]) {
        setJumpSurah(data.verses[0].surahNumber);
        setJumpAyah(data.verses[0].ayahNumber);
      }
      persistPosition(clamped, resolvedVerseKey);
      router.replace(`/mushaf?page=${clamped}`, { scroll: false });
    },
    [fetchAndCachePage, persistPosition, router]
  );

  // Handle physical book page flips triggered via mouse corner drag or touch swipe
  const handleBookFlipped = useCallback(
    (newPage: number) => {
      void loadPage(newPage);
    },
    [loadPage]
  );

  const handleStepPage = useCallback(
    (delta: 1 | -1) => {
      if (mode === "book" && bookControlsRef.current) {
        if (delta > 0) {
          bookControlsRef.current.flipNextPage();
        } else {
          bookControlsRef.current.flipPrevPage();
        }
        return;
      }
      const next = pageData.pageNumber + delta;
      if (next >= 1 && next <= MUSHAF_TOTAL_PAGES) {
        void loadPage(next);
      }
    },
    [mode, pageData.pageNumber, loadPage]
  );

  // Keyboard navigation (RTL-aware)
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
        if (isRtl) handleStepPage(1);
        else handleStepPage(-1);
      } else if (e.key === "ArrowRight") {
        if (isRtl) handleStepPage(-1);
        else handleStepPage(1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isRtl, handleStepPage]);

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          // ignore
        }
      }
      setCssFullscreenFallback(false);
      setIsFullscreen(false);
      return;
    }

    const target = bookWrapperRef.current;
    if (target && typeof target.requestFullscreen === "function") {
      try {
        await target.requestFullscreen();
        setIsFullscreen(true);
        return;
      } catch {
        // Fallback smoothly on iOS/restricted WebViews
      }
    }
    setCssFullscreenFallback(true);
    setIsFullscreen(true);
  };

  // Selected verse might live on EITHER the right or left facing page of a 2-page spread!
  const facingPartnerPageNumber = useMemo(() => {
    if (mode !== "book" || detectedOrientation !== "landscape") return null;
    const p = pageData.pageNumber;
    return p % 2 === 1 ? (p < MUSHAF_TOTAL_PAGES ? p + 1 : null) : p > 1 ? p - 1 : null;
  }, [mode, detectedOrientation, pageData.pageNumber]);

  const visibleSpreadVerses = useMemo(() => {
    const partnerData = facingPartnerPageNumber
      ? pageCache.get(facingPartnerPageNumber)
      : null;
    return partnerData
      ? [...pageData.verses, ...partnerData.verses]
      : pageData.verses;
  }, [pageData.verses, pageCache, facingPartnerPageNumber]);

  const selectedVerse: MushafPageVerse = useMemo(
    () =>
      visibleSpreadVerses.find((v) => v.verseKey === selectedVerseKey) ??
      pageData.verses[0],
    [visibleSpreadVerses, pageData.verses, selectedVerseKey]
  );

  const selectedSurahMeta = useMemo(
    () =>
      SURAHS.find((s) => s.number === (selectedVerse?.surahNumber ?? 1)) ??
      SURAHS[0],
    [selectedVerse]
  );

  const handleSelectVerseInBook = useCallback(
    (versePage: number, verseKey: string) => {
      setSelectedVerseKey(verseKey);
      const dataForPage = pageCacheRef.current.get(versePage);
      if (dataForPage) {
        setPageData(dataForPage);
      }
      persistPosition(versePage, verseKey);
    },
    [persistPosition]
  );

  // Active audio verse tracking strictly from verified Quran.com timestamps
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

  // Automatically turn Mushaf page when recited verse progresses to a different page
  useEffect(() => {
    if (!activeAudioVerseKey) return;
    const [sStr, aStr] = activeAudioVerseKey.split(":");
    const sNum = Number(sStr);
    const aNum = Number(aStr);
    if (!Number.isInteger(sNum) || !Number.isInteger(aNum)) return;

    const targetPage = findPageForVerse(sNum, aNum);
    const alreadyVisible =
      targetPage === pageData.pageNumber ||
      (facingPartnerPageNumber !== null && targetPage === facingPartnerPageNumber);

    if (!alreadyVisible) {
      const id = window.setTimeout(() => {
        void loadPage(targetPage, activeAudioVerseKey);
      }, 0);
      return () => window.clearTimeout(id);
    }
  }, [
    activeAudioVerseKey,
    pageData.pageNumber,
    facingPartnerPageNumber,
    loadPage,
  ]);

  const allAvailableReciters = useMemo(() => {
    const tsSlugs = new Set(MUSHAF_TIMESTAMP_RECITERS.map((r) => r.slug));
    const extras = VERIFIED_RECITERS.filter((r) => !tsSlugs.has(r.slug)).map(
      (r) => ({
        slug: r.slug,
        nameAr: r.nameAr,
        nameEn: r.nameEn,
        qdcId: null as number | null,
        hasTimestamps: false,
      })
    );
    const withTs = MUSHAF_TIMESTAMP_RECITERS.map((r) => ({
      slug: r.slug,
      nameAr: r.nameAr,
      nameEn: r.nameEn,
      qdcId: r.qdcId as number | null,
      hasTimestamps: true,
    }));
    return [...withTs, ...extras];
  }, []);

  const selectedReciterMeta = useMemo(
    () =>
      allAvailableReciters.find((r) => r.slug === selectedReciterSlug) ??
      allAvailableReciters[0],
    [allAvailableReciters, selectedReciterSlug]
  );

  const handlePlayFromVerse = async (verse: MushafPageVerse) => {
    const waslReciter =
      VERIFIED_RECITERS.find((r) => r.slug === selectedReciterMeta.slug) ??
      VERIFIED_RECITERS[0];

    if (selectedReciterMeta.qdcId) {
      try {
        const res = await fetch(
          `/api/mushaf/audio-segments?reciterId=${selectedReciterMeta.qdcId}&surah=${verse.surahNumber}`
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
        // Fallback cleanly to standard full-surah playback without fake timestamps
      }
    }

    setTimestamps([]);
    setTimestampsSurah(null);
    playSurah(verse.surahNumber, waslReciter);
  };

  const handleJumpToSurahAyah = () => {
    const targetPage = findPageForVerse(jumpSurah, jumpAyah);
    setDrawerOpen(null);
    void loadPage(targetPage, `${jumpSurah}:${jumpAyah}`);
  };

  const handleJumpPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(jumpPageInput);
    if (!Number.isFinite(num) || num < 1 || num > MUSHAF_TOTAL_PAGES) return;
    void loadPage(Math.trunc(num));
  };

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

  const mushafBookmarks = useMemo(
    () => bookmarks.filter((b) => b.type === "mushaf"),
    [bookmarks]
  );

  const selectedBookmarkId = selectedVerse
    ? `mushaf:${selectedVerse.verseKey}`
    : "mushaf:1:1";
  const isVerseBookmarked = isBookmarked(selectedBookmarkId);
  const jumpSurahMeta = SURAHS.find((s) => s.number === jumpSurah) ?? SURAHS[0];

  const continuousLineBlocks = useMemo(
    () => (mode === "continuous" ? buildMushafLineBlocks(pageData) : []),
    [mode, pageData]
  );

  const progressPct = Math.round(
    (pageData.pageNumber / MUSHAF_TOTAL_PAGES) * 100
  );

  const isLoadingActive = loadingPages.has(pageData.pageNumber);
  const hasErrorActive = errorPages.has(pageData.pageNumber);
  const pageIndexMeta = getPageIndexInfo(pageData.pageNumber);

  return (
    <PageShell className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-5 sm:py-8 overflow-x-hidden">
      <Breadcrumbs
        items={[
          { labelAr: "القرآن الكريم", labelEn: "Holy Quran", href: "/quran" },
          { labelAr: "المصحف الشريف", labelEn: "Digital Mushaf" },
        ]}
      />

      {/* Continue Reading Banner */}
      {!explicitPageRequested &&
      savedPosition &&
      savedPosition.pageNumber !== pageData.pageNumber ? (
        <div className="mb-4 rounded-2xl border border-[var(--brand-gold)]/45 bg-[var(--brand-gold-soft)]/55 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
            <BookOpen className="h-4 w-4 text-[var(--brand-gold)] shrink-0" />
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
            className="rounded-xl bg-[var(--brand-emerald)] px-4 py-1.5 text-xs font-bold text-white hover:bg-[var(--brand-emerald-strong)] transition-colors cursor-pointer"
          >
            {locale === "ar" ? "متابعة القراءة" : "Continue Reading"}
          </button>
        </div>
      ) : null}

      {/* Compact Control & Navigation Toolbar */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5 mb-5 shadow-sm">
        <div className="pointer-events-none absolute inset-0 text-[var(--brand-emerald)]">
          <GeometricLattice opacity={0.02} />
        </div>

        <div className="relative flex flex-col gap-3.5">
          {/* Row 1: Title, Metadata Summary, Progress & View Modes */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h1 className="text-lg sm:text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>
                  {locale === "ar"
                    ? "المصحف الشريف الرقمي"
                    : "The Noble Digital Mushaf"}
                </span>
                <span className="rounded-full bg-[var(--brand-gold-soft)] px-2.5 py-0.5 text-[11px] font-mono font-bold text-[var(--brand-gold)]">
                  {progressPct}%
                </span>
              </h1>
              <p className="text-xs text-[var(--text-secondary)]">
                {locale === "ar"
                  ? `صفحة ${pageData.pageNumber} من ${MUSHAF_TOTAL_PAGES} • الجزء ${pageData.juzNumber} • ${formatHizbRubInfo(
                      pageData.hizbNumber,
                      pageData.rubElHizbNumber,
                      "ar"
                    )}${pageIndexMeta ? ` • ${pageSurahs.map((s) => `سورة ${s.nameAr}`).join(" - ")}` : ""}`
                  : `Page ${pageData.pageNumber} of ${MUSHAF_TOTAL_PAGES} • Juz ${pageData.juzNumber} • ${formatHizbRubInfo(
                      pageData.hizbNumber,
                      pageData.rubElHizbNumber,
                      "en"
                    )}`}
              </p>
            </div>

            {/* Mode Switcher: Realistic Book / Continuous / Verse Focus */}
            <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-page)] p-1">
              {(
                [
                  { id: "book", ar: "المصحف المفتوح", en: "Book Flip" },
                  { id: "continuous", ar: "صفحة متصلة", en: "Single Sheet" },
                  { id: "focused", ar: "الآيات مفصلة", en: "Verse Focus" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
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

          {/* Reading Progress Strip */}
          <div className="h-1.5 w-full rounded-full bg-[var(--bg-page)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[var(--brand-gold)] to-[var(--brand-emerald)] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Row 2: Page Turns, Direct Jump, Layout Toggle, Fullscreen, Night Mode & Drawers */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleStepPage(-1)}
                disabled={pageData.pageNumber <= 1}
                aria-label={locale === "ar" ? "الصفحة السابقة" : "Previous Page"}
                className="inline-flex items-center gap-1 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-xs font-semibold hover:bg-[var(--bg-surface-alt)] disabled:opacity-45 cursor-pointer"
              >
                <PrevPageIcon className="h-4 w-4" />
                <span>{locale === "ar" ? "السابقة" : "Prev"}</span>
              </button>

              {/* Direct Page Input */}
              <form
                onSubmit={handleJumpPageSubmit}
                className="flex items-center gap-1 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-page)] px-2 py-1 text-xs"
              >
                <label
                  htmlFor="mushaf-page-input"
                  className="text-[var(--text-muted)] px-1"
                >
                  {locale === "ar" ? "ص" : "P."}
                </label>
                <input
                  id="mushaf-page-input"
                  type="number"
                  min={1}
                  max={MUSHAF_TOTAL_PAGES}
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  className="w-12 bg-transparent text-center font-mono font-bold text-[var(--text-primary)] focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[var(--brand-emerald-soft)] px-2 py-1 text-[11px] font-bold text-[var(--brand-emerald)] hover:bg-[var(--brand-emerald)] hover:text-white transition-colors cursor-pointer"
                >
                  {locale === "ar" ? "اذهب" : "Go"}
                </button>
              </form>

              <button
                type="button"
                onClick={() => handleStepPage(1)}
                disabled={pageData.pageNumber >= MUSHAF_TOTAL_PAGES}
                aria-label={locale === "ar" ? "الصفحة التالية" : "Next Page"}
                className="inline-flex items-center gap-1 rounded-xl bg-[var(--brand-emerald)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--brand-emerald-strong)] disabled:opacity-45 cursor-pointer"
              >
                <span>{locale === "ar" ? "التالية" : "Next"}</span>
                <NextPageIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Compact Reading Controls */}
            <div className="flex flex-wrap items-center gap-1.5">
              {mode === "book" ? (
                <button
                  type="button"
                  onClick={() =>
                    setSpreadPref((prev) =>
                      prev === "single" ? "double" : "single"
                    )
                  }
                  title={
                    locale === "ar"
                      ? "التبديل بين صفحة واحدة وصفحتين"
                      : "Toggle Single / Double Page"
                  }
                  className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--brand-emerald)] cursor-pointer"
                >
                  {spreadPref === "single" ? (
                    <>
                      <Columns2 className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
                      <span>{locale === "ar" ? "صفحتان" : "Two Pages"}</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
                      <span>{locale === "ar" ? "صفحة واحدة" : "Single Page"}</span>
                    </>
                  )}
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setBookNightMode((v) => !v)}
                aria-pressed={bookNightMode}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold cursor-pointer transition-colors ${
                  bookNightMode
                    ? "border-[#dcb460]/50 bg-[#082c20] text-[#f3ecda]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-secondary)]"
                }`}
              >
                {bookNightMode ? (
                  <>
                    <Sun className="h-3.5 w-3.5 text-[#ecc977]" />
                    <span>{locale === "ar" ? "نهاري" : "Day"}</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
                    <span>{locale === "ar" ? "ليلي" : "Night"}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                aria-pressed={isFullscreen}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--brand-emerald)] cursor-pointer"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
                    <span className="hidden sm:inline">
                      {locale === "ar" ? "إنهاء ملء الشاشة" : "Exit"}
                    </span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
                    <span className="hidden sm:inline">
                      {locale === "ar" ? "ملء الشاشة" : "Fullscreen"}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  setDrawerOpen((prev) => (prev === "index" ? null : "index"))
                }
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold cursor-pointer ${
                  drawerOpen === "index"
                    ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-secondary)]"
                }`}
              >
                <ListTree className="h-3.5 w-3.5" />
                <span>{locale === "ar" ? "الفهرس" : "Index"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setDrawerOpen((prev) => (prev === "note" ? null : "note"))
                }
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold cursor-pointer ${
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
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold cursor-pointer ${
                  drawerOpen === "prefs"
                    ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-secondary)]"
                }`}
              >
                <Settings2 className="h-3.5 w-3.5" />
                <span>{locale === "ar" ? "العرض" : "Display"}</span>
              </button>
            </div>
          </div>

          {/* Row 3: Audio & Synchronized Playback Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-subtle)] px-3.5 py-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Headphones className="h-4 w-4 text-[var(--brand-emerald)] shrink-0" />
              <label
                htmlFor="mushaf-reciter"
                className="font-semibold text-[var(--text-secondary)]"
              >
                {locale === "ar" ? "القارئ:" : "Reciter:"}
              </label>
              <select
                id="mushaf-reciter"
                value={selectedReciterSlug}
                onChange={(e) => setSelectedReciterSlug(e.target.value)}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--text-primary)]"
              >
                {allAvailableReciters.map((r) => (
                  <option key={r.slug} value={r.slug}>
                    {locale === "ar"
                      ? `${r.nameAr}${r.hasTimestamps ? " ★ (تتبع الآيات)" : ""}`
                      : `${r.nameEn}${r.hasTimestamps ? " ★ (Verse Sync)" : ""}`}
                  </option>
                ))}
              </select>
              {!selectedReciterMeta.hasTimestamps ? (
                <span className="text-[11px] text-[var(--text-muted)]">
                  {locale === "ar"
                    ? "(بث السورة كاملة بدون تقسيم آيات من المصدر)"
                    : "(Full Surah audio without per-verse timestamps)"}
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedVerse ? (
                <button
                  type="button"
                  onClick={() => {
                    const isPlayingThis =
                      track?.kind === "quran" &&
                      track.surahNumber === selectedVerse.surahNumber &&
                      track.reciter.slug === selectedReciterMeta.slug &&
                      audioStatus === "playing";
                    if (isPlayingThis) {
                      togglePlayPause();
                    } else {
                      void handlePlayFromVerse(selectedVerse);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand-emerald)] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[var(--brand-emerald-strong)] transition-colors cursor-pointer"
                >
                  {track?.kind === "quran" &&
                  track.surahNumber === selectedVerse.surahNumber &&
                  track.reciter.slug === selectedReciterMeta.slug &&
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
                          ? selectedReciterMeta.hasTimestamps
                            ? `تلاوة من الآية ${selectedVerse.ayahNumber}`
                            : `استماع سورة ${selectedSurahMeta.nameAr}`
                          : `Play from ${selectedVerse.verseKey}`}
                      </span>
                    </>
                  )}
                </button>
              ) : null}

              <Link
                href={`/khatmah?startPage=${pageData.pageNumber}`}
                className="inline-flex items-center gap-1 rounded-xl border border-[var(--brand-gold)]/40 bg-[var(--brand-gold-soft)] px-3 py-1.5 text-xs font-bold text-[var(--brand-gold)] hover:opacity-90"
              >
                <Compass className="h-3.5 w-3.5" />
                <span>{locale === "ar" ? "ختمة من هنا" : "Khatmah"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Expandable Index Drawer */}
      {drawerOpen === "index" ? (
        <section className="wasl-surface rounded-3xl p-5 sm:p-6 mb-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
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
                  className="rounded-xl bg-[var(--brand-emerald)] px-4 py-2 text-xs font-bold text-white cursor-pointer"
                >
                  {locale === "ar" ? "انتقال" : "Go"}
                </button>
              </div>
            </div>
          </div>

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
                  className={`rounded-xl border py-2 text-xs font-bold transition-colors cursor-pointer ${
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

      {/* Expandable Display Prefs Drawer */}
      {drawerOpen === "prefs" ? (
        <section className="wasl-surface rounded-3xl p-5 sm:p-6 mb-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              {locale === "ar" ? "تخصيص القراءة (دون تغيير ترتيب الصفحات)" : "Reading Controls"}
            </h2>
            <Link
              href="/reading-settings"
              className="text-xs font-bold text-[var(--brand-emerald)] hover:underline"
            >
              {locale === "ar" ? "الإعدادات الكاملة ←" : "Full Settings →"}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-[var(--text-secondary)] flex justify-between">
                <span>{locale === "ar" ? "حجم الخط داخل الصفحة" : "Page Font Zoom"}</span>
                <span className="font-mono">{Math.round(prefs.mushafZoom * 100)}%</span>
              </label>
              <input
                type="range"
                min={0.85}
                max={1.2}
                step={0.05}
                value={Math.min(1.2, prefs.mushafZoom)}
                onChange={(e) =>
                  updatePrefs({ mushafZoom: Number(e.target.value) })
                }
                className="w-full accent-[var(--brand-emerald)]"
              />
            </div>

            <label className="flex items-center gap-2 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.showTranslation}
                onChange={(e) =>
                  updatePrefs({ showTranslation: e.target.checked })
                }
                className="h-4 w-4 accent-[var(--brand-emerald)]"
              />
              <span className="font-semibold">
                {locale === "ar" ? "عرض الترجمة الإنجليزية" : "Show Translation"}
              </span>
            </label>

            <label className="flex items-center gap-2 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.verseHighlight}
                onChange={(e) =>
                  updatePrefs({ verseHighlight: e.target.checked })
                }
                className="h-4 w-4 accent-[var(--brand-emerald)]"
              />
              <span className="font-semibold">
                {locale === "ar" ? "تمييز الآية المختارة" : "Highlight Selected Verse"}
              </span>
            </label>
          </div>
        </section>
      ) : null}

      {/* Expandable Bookmarks Drawer */}
      {drawerOpen === "note" ? (
        <section className="wasl-surface rounded-3xl p-5 sm:p-6 mb-5 space-y-4">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            {locale === "ar" ? "العلامات المرجعية وملاحظات التدبر" : "Mushaf Bookmarks"}
          </h2>

          {selectedVerse ? (
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-page)] p-4 space-y-3">
              <p className="text-xs font-semibold text-[var(--brand-emerald)]">
                {locale === "ar"
                  ? `الآية المحددة: سورة ${selectedSurahMeta.nameAr} — الآية ${selectedVerse.ayahNumber} (صفحة ${selectedVerse.pageNumber})`
                  : `Selected: Surah ${selectedSurahMeta.englishName} (${selectedVerse.verseKey}, Page ${selectedVerse.pageNumber})`}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={bookmarkNote}
                  onChange={(e) => setBookmarkNote(e.target.value)}
                  placeholder={
                    locale === "ar"
                      ? "أضف ملاحظة اختيارية..."
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
                      titleAr: `صفحة ${selectedVerse.pageNumber} — ${selectedSurahMeta.nameAr} (${selectedVerse.ayahNumber})`,
                      titleEn: `Page ${selectedVerse.pageNumber} — ${selectedSurahMeta.englishName} (${selectedVerse.verseKey})`,
                      arabicText: selectedVerse.textUthmani,
                      englishText: selectedVerse.translationEn,
                      referenceAr: `المصحف الشريف: ص ${selectedVerse.pageNumber} — سورة ${selectedSurahMeta.nameAr} آية ${selectedVerse.ayahNumber}`,
                      referenceEn: `Mushaf Page ${selectedVerse.pageNumber} — ${selectedVerse.verseKey}`,
                      note: bookmarkNote.trim() || undefined,
                      url: `/mushaf?page=${selectedVerse.pageNumber}`,
                    });
                    setBookmarkNote("");
                  }}
                  className="rounded-xl bg-[var(--brand-gold)] px-4 py-2 text-xs font-bold text-white cursor-pointer"
                >
                  {isVerseBookmarked
                    ? locale === "ar"
                      ? "إزالة العلامة"
                      : "Remove Bookmark"
                    : locale === "ar"
                      ? "حفظ العلامة"
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
                    className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3.5 text-start hover:border-[var(--brand-emerald)] transition-colors space-y-1 cursor-pointer"
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

      {/* Primary Interactive Realistic Mushaf Book Section */}
      <div
        ref={bookWrapperRef}
        className={
          cssFullscreenFallback
            ? "fixed inset-0 z-50 bg-[var(--bg-page)] overflow-y-auto p-4 sm:p-6"
            : isFullscreen
              ? "bg-[var(--bg-page)] overflow-y-auto p-4 sm:p-8 flex flex-col justify-center"
              : ""
        }
      >
        {isFullscreen ? (
          <div className="mx-auto max-w-6xl w-full flex flex-wrap items-center justify-between gap-2 pb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStepPage(-1)}
                disabled={pageData.pageNumber <= 1}
                className="inline-flex items-center gap-1 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-bold cursor-pointer disabled:opacity-45"
              >
                <PrevPageIcon className="h-4 w-4" />
                <span>{locale === "ar" ? "السابقة" : "Prev"}</span>
              </button>
              <span className="text-xs font-mono font-bold px-2">
                {pageData.pageNumber} / {MUSHAF_TOTAL_PAGES}
              </span>
              <button
                type="button"
                onClick={() => handleStepPage(1)}
                disabled={pageData.pageNumber >= MUSHAF_TOTAL_PAGES}
                className="inline-flex items-center gap-1 rounded-xl bg-[var(--brand-emerald)] px-3 py-1.5 text-xs font-bold text-white cursor-pointer disabled:opacity-45"
              >
                <span>{locale === "ar" ? "التالية" : "Next"}</span>
                <NextPageIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBookNightMode((v) => !v)}
                className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold cursor-pointer"
              >
                {bookNightMode ? "☀️" : "🌙"}
              </button>
              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white cursor-pointer"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                <span>{locale === "ar" ? "خروج" : "Exit Fullscreen"}</span>
              </button>
            </div>
          </div>
        ) : null}

        {mode === "book" ? (
          <div className="space-y-3">
            <MushafBookStage
              currentPage={pageData.pageNumber}
              pageCache={pageCache}
              loadingPages={loadingPages}
              errorPages={errorPages}
              onPageChanged={handleBookFlipped}
              onRetryPage={(p) => void fetchAndCachePage(p)}
              onOrientationDetected={setDetectedOrientation}
              spreadPreference={spreadPref}
              nightMode={bookNightMode}
              fontZoom={prefs.mushafZoom}
              highlightEnabled={prefs.verseHighlight}
              showTranslationInline={prefs.showTranslation}
              selectedVerseKey={selectedVerseKey}
              activeAudioVerseKey={activeAudioVerseKey}
              onSelectVerse={handleSelectVerseInBook}
              reducedMotion={reducedMotion}
              locale={locale}
              bookControlsRef={bookControlsRef}
            />
            <p className="text-center text-[11px] text-[var(--text-muted)]">
              {locale === "ar"
                ? "اسحب طرف الصفحة أو مرّر بإصبعك لتقليب صفحات المصحف — واضغط على أي آية للتحديد والتلاوة والتفسير."
                : "Drag any page corner or swipe horizontally to turn pages — click any verse for audio & Tafsir."}
            </p>
          </div>
        ) : (
          /* Single Sheet Continuous OR Focused Verse Mode */
          <div className="mx-auto max-w-4xl">
            <div
              className={`rounded-[2rem] border-2 border-[#b6872c]/45 p-5 sm:p-8 shadow-lg ${
                bookNightMode ? "mushaf-paper-night" : "mushaf-paper-day"
              }`}
            >
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

              {isLoadingActive ? (
                <div className="space-y-4 py-10">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="wasl-skeleton h-8 w-full rounded-xl" />
                  ))}
                </div>
              ) : hasErrorActive ? (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 flex items-center gap-3 text-sm text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <span>
                    {locale === "ar"
                      ? "تعذر تحميل صفحة المصحف من المزود المعتمد حالياً."
                      : "Unable to load this Mushaf page right now."}
                  </span>
                </div>
              ) : mode === "focused" ? (
                <div className="space-y-4">
                  {pageData.verses.map((v) => {
                    const sMeta = SURAHS.find((s) => s.number === v.surahNumber);
                    const isSelected = v.verseKey === selectedVerseKey;
                    const isPlaying = v.verseKey === activeAudioVerseKey;
                    return (
                      <div
                        key={v.verseKey}
                        onClick={() =>
                          handleSelectVerseInBook(pageData.pageNumber, v.verseKey)
                        }
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

                        <p dir="rtl" lang="ar" className="font-quran-reading leading-[2.25]">
                          {v.textUthmani}{" "}
                          <span className="text-[var(--brand-gold)] font-bold">
                            ﴿{toArabicDigits(v.ayahNumber)}﴾
                            {v.sajdahNumber ? " ۩" : ""}
                          </span>
                        </p>

                        {prefs.showTranslation && v.translationEn ? (
                          <p dir="ltr" lang="en" className="text-xs sm:text-sm opacity-80">
                            {v.translationEn}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div dir="rtl" lang="ar" className="space-y-2.5 text-center">
                  {continuousLineBlocks.map(([lineNo, block]) => (
                    <div key={lineNo} className="space-y-2">
                      {block.surahHeader ? (
                        <div className="my-4 space-y-2">
                          <div className="rounded-2xl border border-[var(--brand-gold)]/45 bg-[var(--brand-gold-soft)]/55 py-2.5 px-4 text-center">
                            <h2 className="font-arabic-display text-lg sm:text-xl font-bold">
                              سورة {block.surahHeader.nameAr}
                            </h2>
                          </div>
                          {block.bismillah ? <BismillahBanner /> : null}
                        </div>
                      ) : null}
                      <p className="font-quran-reading leading-[2.3] flex flex-wrap justify-center gap-x-1.5">
                        {block.words.map((w, wIdx) => {
                          const isSelected = w.verseKey === selectedVerseKey;
                          const isPlaying = w.verseKey === activeAudioVerseKey;
                          return (
                            <button
                              key={`${w.verseKey}-${wIdx}`}
                              type="button"
                              onClick={() =>
                                handleSelectVerseInBook(pageData.pageNumber, w.verseKey)
                              }
                              className={`inline cursor-pointer rounded-md px-0.5 transition-colors ${
                                isPlaying
                                  ? "bg-[var(--brand-emerald)]/25"
                                  : isSelected && prefs.verseHighlight
                                    ? "bg-[var(--brand-gold-soft)]"
                                    : "hover:bg-[var(--brand-emerald-soft)]/50"
                              } ${w.isEnd ? "text-[var(--brand-gold)] font-bold mx-0.5" : ""}`}
                            >
                              {w.textUthmani}
                              {w.isEnd && w.sajdahNumber ? " ۩" : ""}
                            </button>
                          );
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-[var(--brand-gold)]/25 flex flex-wrap items-center justify-between gap-3 text-xs opacity-80">
                <span>{pageData.sourceName}</span>
                <span className="font-mono font-bold text-[var(--brand-gold)]">
                  {pageData.pageNumber} / {MUSHAF_TOTAL_PAGES}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Verse Tools & Recent History Strip Below the Open Mushaf */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {selectedVerse ? (
          <div className="lg:col-span-8 wasl-surface rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <span className="text-[11px] font-bold text-[var(--brand-gold)]">
                  {locale === "ar" ? "الآية المختارة من الصفحة" : "Selected Verse"}
                </span>
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  {locale === "ar"
                    ? `سورة ${selectedSurahMeta.nameAr} — الآية ${selectedVerse.ayahNumber}`
                    : `Surah ${selectedSurahMeta.englishName} (${selectedVerse.verseKey})`}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedVerse.sajdahNumber ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-gold-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--brand-gold)]">
                    <Sparkles className="h-3 w-3" />
                    <span>{locale === "ar" ? "سجدة" : "Sajdah"}</span>
                  </span>
                ) : null}

                <Link
                  href={`/tafsir/${selectedVerse.surahNumber}/${selectedVerse.ayahNumber}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand-emerald)] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[var(--brand-emerald-strong)] transition-colors"
                >
                  <BookMarked className="h-3.5 w-3.5" />
                  <span>{locale === "ar" ? "التفسير والتدبر" : "Open Tafsir"}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setDrawerOpen("note")}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
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
                        ? "معلمة"
                        : "Saved"
                      : locale === "ar"
                        ? "علامة"
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
                    shareUrl: `/mushaf?page=${selectedVerse.pageNumber}`,
                  }}
                />
              </div>
            </div>

            <p
              dir="rtl"
              lang="ar"
              className="font-quran text-xl leading-loose text-[var(--text-primary)] bg-[var(--bg-page)] rounded-2xl p-4 border border-[var(--border-subtle)]"
            >
              ﴿{selectedVerse.textUthmani}﴾
            </p>

            {selectedVerse.translationEn ? (
              <p dir="ltr" lang="en" className="text-xs leading-relaxed text-[var(--text-secondary)]">
                {selectedVerse.translationEn}
              </p>
            ) : null}
          </div>
        ) : null}

        {savedPosition && savedPosition.recentPages.length > 0 ? (
          <div className="lg:col-span-4 wasl-surface rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-[var(--text-muted)]">
              {locale === "ar" ? "صفحات فتحتها مؤخراً:" : "Recently Opened Pages:"}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {savedPosition.recentPages.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => void loadPage(p)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-mono font-bold transition-colors cursor-pointer ${
                    p === pageData.pageNumber
                      ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald)] text-white"
                      : "border-[var(--border-subtle)] bg-[var(--bg-page)] hover:border-[var(--brand-gold)]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              {pageData.sourceName}
            </p>
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}

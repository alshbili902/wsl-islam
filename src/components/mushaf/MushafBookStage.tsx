"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Orientation, PageFlip } from "page-flip";
import { MushafPrintedPage } from "@/components/mushaf/MushafPrintedPage";
import { MUSHAF_TOTAL_PAGES } from "@/lib/api/mushaf";
import type { Locale, MushafPagePayload } from "@/types/islamic";

export type BookSpreadPreference = "auto" | "double" | "single";

interface MushafBookStageProps {
  currentPage: number;
  pageCache: Map<number, MushafPagePayload>;
  loadingPages: Set<number>;
  errorPages: Set<number>;
  onPageChanged: (newPage: number) => void;
  onRetryPage: (page: number) => void;
  onOrientationDetected?: (orientation: Orientation) => void;
  spreadPreference: BookSpreadPreference;
  nightMode: boolean;
  fontZoom: number;
  highlightEnabled: boolean;
  showTranslationInline: boolean;
  selectedVerseKey: string;
  activeAudioVerseKey: string | null;
  onSelectVerse: (page: number, verseKey: string) => void;
  reducedMotion: boolean;
  locale: Locale;
  bookControlsRef?: React.MutableRefObject<{
    flipNextPage: () => void;
    flipPrevPage: () => void;
  } | null>;
}

/**
 * Physical RTL 604-page StPageFlip Quran Book renderer.
 * Slot ordering: index `i` (0..603) holds Mushaf Page `P = 604 - i`.
 * Index 603 (right page) = Al-Fatiha (Page 1); Index 602 (left page) = Page 2.
 * Dragging/swiping left-to-right advances Page 1 -> 2 -> 3 ... naturally like a printed Arabic Mushaf.
 */
export function MushafBookStage({
  currentPage,
  pageCache,
  loadingPages,
  errorPages,
  onPageChanged,
  onRetryPage,
  onOrientationDetected,
  spreadPreference,
  nightMode,
  fontZoom,
  highlightEnabled,
  showTranslationInline,
  selectedVerseKey,
  activeAudioVerseKey,
  onSelectVerse,
  reducedMotion,
  locale,
  bookControlsRef,
}: MushafBookStageProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);
  const currentPageRef = useRef(currentPage);
  const onPageChangedRef = useRef(onPageChanged);
  const onOrientationRef = useRef(onOrientationDetected);
  const isFlippingSyncRef = useRef(false);

  const [slotElements, setSlotElements] = useState<HTMLElement[]>([]);
  const [orientation, setOrientation] = useState<Orientation>("landscape");

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    onPageChangedRef.current = onPageChanged;
  }, [onPageChanged]);

  useEffect(() => {
    onOrientationRef.current = onOrientationDetected;
  }, [onOrientationDetected]);

  // Mount / re-mount PageFlip safely inside a detached imperative DOM container
  useEffect(() => {
    const container = hostRef.current;
    if (!container) return;

    let cancelled = false;
    let instance: PageFlip | null = null;
    const bookRoot = document.createElement("div");
    bookRoot.className = "mx-auto w-full";
    container.innerHTML = "";
    container.appendChild(bookRoot);

    const createdSlots: HTMLElement[] = [];
    for (let idx = 0; idx < MUSHAF_TOTAL_PAGES; idx++) {
      const pageNum = MUSHAF_TOTAL_PAGES - idx;
      const el = document.createElement("div");
      el.className = "stf__item overflow-hidden";
      el.setAttribute("data-mushaf-page", String(pageNum));
      createdSlots.push(el);
    }

    async function initBook() {
      const { PageFlip: PageFlipCtor } = await import("page-flip");
      if (cancelled) return;

      const forceSingle = spreadPreference === "single";
      const startIndex = Math.min(
        MUSHAF_TOTAL_PAGES - 1,
        Math.max(0, MUSHAF_TOTAL_PAGES - currentPageRef.current)
      );

      instance = new PageFlipCtor(bookRoot, {
        width: forceSingle ? 520 : 520,
        height: forceSingle ? 780 : 770,
        size: "stretch",
        minWidth: forceSingle ? 460 : 310,
        maxWidth: forceSingle ? 560 : 620,
        minHeight: 460,
        maxHeight: 920,
        startPage: startIndex,
        drawShadow: !reducedMotion,
        maxShadowOpacity: 0.42,
        flippingTime: reducedMotion ? 0 : 640,
        usePortrait: true,
        autoSize: true,
        showCover: false,
        mobileScrollSupport: true,
        swipeDistance: 28,
        clickEventForward: true,
        useMouseEvents: true,
        showPageCorners: !reducedMotion,
        disableFlipByClick: true,
      });

      instance.loadFromHTML(createdSlots);
      pageFlipRef.current = instance;
      setSlotElements(createdSlots);

      instance.on("init", (e) => {
        if (cancelled) return;
        const mode = e.data.mode;
        setOrientation(mode);
        onOrientationRef.current?.(mode);
      });

      instance.on("changeOrientation", (e) => {
        if (cancelled) return;
        const mode = e.data;
        setOrientation(mode);
        onOrientationRef.current?.(mode);
      });

      instance.on("flip", (e) => {
        if (cancelled || !instance) return;
        const newIndex = e.data;
        const rawPage = MUSHAF_TOTAL_PAGES - newIndex;
        const mode = instance.getOrientation();

        // In 2-page RTL spread, PageFlip reports left-hand index (even Mushaf page 2, 4, ...).
        // The spread covers [right = rawPage - 1, left = rawPage]; pick odd right-hand page unless user stayed in spread.
        const reportedPage =
          mode === "landscape" && rawPage > 1 && rawPage % 2 === 0
            ? rawPage - 1
            : rawPage;

        if (reportedPage !== currentPageRef.current) {
          isFlippingSyncRef.current = true;
          onPageChangedRef.current(reportedPage);
          window.setTimeout(() => {
            isFlippingSyncRef.current = false;
          }, 80);
        }
      });

      if (bookControlsRef) {
        bookControlsRef.current = {
          flipNextPage: () => {
            if (!instance) return;
            const cur = instance.getCurrentPageIndex();
            if (cur <= 0) return;
            if (reducedMotion) {
              instance.turnToPrevPage();
            } else {
              instance.flipPrev("bottom");
            }
          },
          flipPrevPage: () => {
            if (!instance) return;
            const cur = instance.getCurrentPageIndex();
            if (cur >= MUSHAF_TOTAL_PAGES - 1) return;
            if (reducedMotion) {
              instance.turnToNextPage();
            } else {
              instance.flipNext("bottom");
            }
          },
        };
      }
    }

    void initBook();

    return () => {
      cancelled = true;
      if (bookControlsRef) {
        bookControlsRef.current = null;
      }
      if (instance) {
        try {
          instance.destroy();
        } catch {
          // Ignore teardown errors
        }
      }
      pageFlipRef.current = null;
      setSlotElements([]);
      if (bookRoot.parentNode) {
        bookRoot.remove();
      }
    };
  }, [spreadPreference, reducedMotion, bookControlsRef]);

  // Synchronize external page changes (Surah/Ayah jump, Continue Reading, Audio auto-page) to PageFlip
  useEffect(() => {
    const instance = pageFlipRef.current;
    if (!instance || slotElements.length === 0 || isFlippingSyncRef.current) return;

    const targetIndex = MUSHAF_TOTAL_PAGES - currentPage;
    const currentIndex = instance.getCurrentPageIndex();
    const mode = instance.getOrientation();

    if (mode === "landscape") {
      if (Math.floor(targetIndex / 2) === Math.floor(currentIndex / 2)) {
        return; // Already visible in the facing 2-page spread!
      }
    } else if (targetIndex === currentIndex) {
      return;
    }

    const stepDiff = Math.abs(targetIndex - currentIndex);
    if (stepDiff <= 2 && !reducedMotion) {
      if (targetIndex < currentIndex) {
        instance.flipPrev("bottom");
      } else {
        instance.flipNext("bottom");
      }
    } else {
      instance.turnToPage(targetIndex);
    }
  }, [currentPage, slotElements.length, reducedMotion]);

  // Render full JSX ONLY for the current spread ± 4 buffered neighbor pages!
  const bufferedPageNumbers = useMemo(() => {
    const start = Math.max(1, currentPage - 4);
    const end = Math.min(MUSHAF_TOTAL_PAGES, currentPage + 5);
    const list: number[] = [];
    for (let p = start; p <= end; p++) {
      list.push(p);
    }
    return list;
  }, [currentPage]);

  const isDoubleSpread = orientation === "landscape";

  return (
    <div
      className={`relative mx-auto w-full rounded-[1.75rem] p-2 sm:p-3.5 mushaf-book-leather transition-all ${
        spreadPreference === "single" ? "max-w-[540px]" : "max-w-[1160px]"
      }`}
    >
      {/* Physical Page Flip Container (unmanaged by React children) */}
      <div className="relative rounded-2xl overflow-hidden shadow-inner">
        <div ref={hostRef} className="w-full min-h-[480px]" />

        {/* Central Book Spine Fold Shadow on Double Spread */}
        {isDoubleSpread && slotElements.length > 0 ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-5 z-20"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(25,18,8,0.28) 48%, rgba(25,18,8,0.42) 50%, rgba(25,18,8,0.28) 52%, transparent 100%)",
            }}
          />
        ) : null}
      </div>

      {/* Portals mounting active + neighbor Mushaf pages cleanly into StPageFlip slots */}
      {slotElements.length === MUSHAF_TOTAL_PAGES &&
        bufferedPageNumbers.map((pageNum) => {
          const slotIndex = MUSHAF_TOTAL_PAGES - pageNum;
          const slotEl = slotElements[slotIndex];
          if (!slotEl) return null;

          return createPortal(
            <MushafPrintedPage
              key={pageNum}
              pageNumber={pageNum}
              pageData={pageCache.get(pageNum)}
              loading={loadingPages.has(pageNum)}
              hasError={errorPages.has(pageNum)}
              onRetry={onRetryPage}
              nightMode={nightMode}
              isDoubleSpread={isDoubleSpread}
              fontZoom={fontZoom}
              highlightEnabled={highlightEnabled}
              showTranslationInline={showTranslationInline}
              selectedVerseKey={selectedVerseKey}
              activeAudioVerseKey={activeAudioVerseKey}
              onSelectVerse={onSelectVerse}
              onEdgeFlipPrev={() => bookControlsRef?.current?.flipPrevPage()}
              onEdgeFlipNext={() => bookControlsRef?.current?.flipNextPage()}
              locale={locale}
            />,
            slotEl,
            `mushaf-portal-${pageNum}`
          );
        })}
    </div>
  );
}

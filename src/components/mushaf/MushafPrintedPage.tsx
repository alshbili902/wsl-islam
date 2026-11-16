"use client";

import React, { useMemo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { BismillahBanner } from "@/components/brand/IslamicVisuals";
import { SURAHS } from "@/data/surahs";
import { getPageIndexInfo, MUSHAF_TOTAL_PAGES } from "@/lib/api/mushaf";
import {
  buildMushafLineBlocks,
  formatHizbRubInfo,
  toArabicDigits,
} from "@/lib/mushaf/helpers";
import type { Locale, MushafPagePayload } from "@/types/islamic";

interface MushafPrintedPageProps {
  pageNumber: number;
  pageData?: MushafPagePayload;
  loading?: boolean;
  hasError?: boolean;
  onRetry?: (page: number) => void;
  nightMode: boolean;
  isDoubleSpread: boolean;
  fontZoom: number;
  highlightEnabled: boolean;
  showTranslationInline: boolean;
  selectedVerseKey: string;
  activeAudioVerseKey: string | null;
  onSelectVerse: (page: number, verseKey: string) => void;
  onEdgeFlipPrev?: () => void;
  onEdgeFlipNext?: () => void;
  locale: Locale;
}

export const MushafPrintedPage = React.memo(function MushafPrintedPage({
  pageNumber,
  pageData,
  loading = false,
  hasError = false,
  onRetry,
  nightMode,
  isDoubleSpread,
  fontZoom,
  highlightEnabled,
  showTranslationInline,
  selectedVerseKey,
  activeAudioVerseKey,
  onSelectVerse,
  onEdgeFlipPrev,
  onEdgeFlipNext,
  locale,
}: MushafPrintedPageProps) {
  const indexMeta = useMemo(() => getPageIndexInfo(pageNumber), [pageNumber]);
  const isOddPage = pageNumber % 2 === 1;
  const isIlluminatedOpening = pageNumber === 1 || pageNumber === 2;

  const lineBlocks = useMemo(
    () => (pageData ? buildMushafLineBlocks(pageData) : []),
    [pageData]
  );

  const pageSurahs = useMemo(() => {
    if (!pageData) return [];
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
  }, [pageData]);

  const juzNum = pageData?.juzNumber ?? indexMeta?.juz ?? 1;
  const hizbLabel = pageData
    ? formatHizbRubInfo(pageData.hizbNumber, pageData.rubElHizbNumber, locale)
    : indexMeta
      ? formatHizbRubInfo(
          Math.ceil(indexMeta.hizbQuarter / 4),
          indexMeta.hizbQuarter,
          locale
        )
      : "";

  const headerSurahText =
    pageSurahs.length > 0
      ? pageSurahs.map((s) => `سورة ${s.nameAr}`).join(" • ")
      : indexMeta?.startSurahAr
        ? `سورة ${indexMeta.startSurahAr}`
        : "";

  // Spine gutter styling: in RTL book, odd pages sit on RIGHT (gutter on LEFT edge),
  // even pages sit on LEFT (gutter on RIGHT edge)
  const gutterClass = isDoubleSpread
    ? isOddPage
      ? nightMode
        ? "mushaf-night-gutter-right"
        : "mushaf-gutter-right"
      : nightMode
        ? "mushaf-night-gutter-left"
        : "mushaf-gutter-left"
    : "";

  const textSizePx = Math.round(18 * Math.min(1.2, Math.max(0.85, fontZoom)));

  return (
    <div
      dir="rtl"
      lang="ar"
      className={`relative h-full w-full select-none overflow-hidden flex flex-col justify-between p-3 sm:p-5 ${
        nightMode ? "mushaf-paper-night" : "mushaf-paper-day"
      } ${gutterClass}`}
    >
      {/* Subtle Outer Page Edge Flip Click Target */}
      {isDoubleSpread && (isOddPage ? onEdgeFlipPrev : onEdgeFlipNext) ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isOddPage) onEdgeFlipPrev?.();
            else onEdgeFlipNext?.();
          }}
          aria-label={
            isOddPage
              ? locale === "ar"
                ? "العودة للصفحة السابقة"
                : "Previous Page"
              : locale === "ar"
                ? "تقليب إلى الصفحة التالية"
                : "Next Page"
          }
          title={
            isOddPage
              ? locale === "ar"
                ? "الصفحة السابقة"
                : "Previous"
              : locale === "ar"
                ? "الصفحة التالية"
                : "Next"
          }
          className={`hidden sm:block absolute top-14 bottom-14 w-5 z-20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer ${
            isOddPage
              ? "right-0 bg-gradient-to-l from-[#b6872c]/20 to-transparent"
              : "left-0 bg-gradient-to-r from-[#b6872c]/20 to-transparent"
          }`}
        />
      ) : null}

      {/* Authentic Double Islamic Border Frame */}
      <div
        className={`relative flex-1 flex flex-col justify-between rounded-xl border p-2.5 sm:p-4 overflow-hidden ${
          isIlluminatedOpening
            ? "border-2 border-[#b6872c]/70 ring-2 ring-[#b6872c]/20"
            : nightMode
              ? "border-[#dcb460]/35"
              : "border-[#b6872c]/45"
        }`}
      >
        {/* Top Ornamental Header (Juz & Surah) */}
        <header
          className={`flex items-center justify-between gap-2 pb-1.5 mb-2 border-b text-[11px] font-bold shrink-0 ${
            nightMode
              ? "border-[#dcb460]/25 text-[#e5c16c]"
              : "border-[#b6872c]/25 text-[#0d5c43]"
          }`}
        >
          <span className="truncate">{headerSurahText}</span>
          <span className="shrink-0 font-medium opacity-90">
            الجزء {toArabicDigits(juzNum)}
          </span>
        </header>

        {/* Inner Authentic Mushaf Script Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-1 flex flex-col justify-center">
          {loading && !pageData ? (
            <div className="space-y-3 py-6">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-4 rounded-full animate-pulse ${
                    nightMode ? "bg-white/10" : "bg-[#b6872c]/15"
                  }`}
                />
              ))}
            </div>
          ) : hasError && !pageData ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <p className="text-xs leading-relaxed max-w-xs opacity-85">
                {locale === "ar"
                  ? "تعذر تحميل بيانات هذه الصفحة من المزود المعتمد."
                  : "Unable to load this Mushaf page from verified provider."}
              </p>
              {onRetry ? (
                <button
                  type="button"
                  onClick={() => onRetry(pageNumber)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0d5c43] px-3.5 py-1.5 text-xs font-semibold text-white cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>{locale === "ar" ? "إعادة المحاولة" : "Retry"}</span>
                </button>
              ) : null}
            </div>
          ) : pageData && lineBlocks.length > 0 ? (
            <div
              className={`space-y-1 text-center ${
                isIlluminatedOpening ? "py-3 px-2 rounded-xl bg-[#b6872c]/[0.04]" : ""
              }`}
            >
              {lineBlocks.map(([lineNo, block]) => (
                <div key={lineNo} className="space-y-1.5">
                  {block.surahHeader ? (
                    <div className="my-1.5 space-y-1">
                      <div
                        className={`rounded-xl border py-1 px-3 text-center ${
                          nightMode
                            ? "border-[#dcb460]/45 bg-[#dcb460]/10 text-[#f3ecda]"
                            : "border-[#b6872c]/45 bg-[#b6872c]/10 text-[#0d5c43]"
                        }`}
                      >
                        <h2 className="font-arabic-display text-sm sm:text-base font-bold">
                          سورة {block.surahHeader.nameAr}
                        </h2>
                      </div>
                      {block.bismillah ? <BismillahBanner /> : null}
                    </div>
                  ) : null}

                  <p
                    style={{ fontSize: `${textSizePx}px`, lineHeight: 2.05 }}
                    className="font-quran flex flex-wrap justify-center gap-x-1"
                  >
                    {block.words.map((w, wIdx) => {
                      const isSelected = w.verseKey === selectedVerseKey;
                      const isPlaying = w.verseKey === activeAudioVerseKey;
                      return (
                        <button
                          key={`${w.verseKey}-${wIdx}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectVerse(pageNumber, w.verseKey);
                          }}
                          className={`inline p-0 m-0 border-0 bg-transparent font-inherit cursor-pointer rounded px-0.5 transition-colors ${
                            isPlaying
                              ? nightMode
                                ? "bg-emerald-500/35 text-emerald-200"
                                : "bg-[#0d5c43]/20 text-[#08412f]"
                              : isSelected && highlightEnabled
                                ? nightMode
                                  ? "bg-[#dcb460]/25"
                                  : "bg-[#b6872c]/22"
                                : "hover:bg-[#b6872c]/10"
                          } ${
                            w.isEnd
                              ? nightMode
                                ? "text-[#ecc977] font-bold"
                                : "text-[#9c6f16] font-bold"
                              : ""
                          }`}
                        >
                          {w.textUthmani}
                          {w.isEnd && w.sajdahNumber ? " ۩" : ""}
                        </button>
                      );
                    })}
                  </p>
                </div>
              ))}

              {showTranslationInline ? (
                <div className="mt-3 pt-2 border-t border-current/10 space-y-1 text-start">
                  {pageData.verses
                    .filter((v) => Boolean(v.translationEn))
                    .map((v) => (
                      <p
                        key={`tr-${v.verseKey}`}
                        dir="ltr"
                        lang="en"
                        className="text-[11px] leading-snug opacity-80"
                      >
                        <strong className="font-mono">{v.verseKey}:</strong>{" "}
                        {v.translationEn}
                      </p>
                    ))}
                </div>
              ) : null}
            </div>
          ) : pageData ? (
            /* Verified Fallback Uthmani Continuous Text */
            <div
              style={{ fontSize: `${textSizePx}px`, lineHeight: 2.1 }}
              className="font-quran text-justify space-y-2"
            >
              {pageData.verses.map((v) => {
                const sMeta = SURAHS.find((s) => s.number === v.surahNumber);
                const isSelected = v.verseKey === selectedVerseKey;
                const isPlaying = v.verseKey === activeAudioVerseKey;
                return (
                  <React.Fragment key={v.verseKey}>
                    {v.ayahNumber === 1 && sMeta ? (
                      <div className="my-2 text-center space-y-1">
                        <div className="rounded-xl border border-[#b6872c]/45 bg-[#b6872c]/10 py-1 font-bold text-sm">
                          سورة {sMeta.nameAr}
                        </div>
                        {v.surahNumber !== 1 && v.surahNumber !== 9 ? (
                          <BismillahBanner />
                        ) : null}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVerse(pageNumber, v.verseKey);
                      }}
                      className={`inline p-0 m-0 border-0 bg-transparent text-inherit font-inherit cursor-pointer rounded px-0.5 ${
                        isPlaying
                          ? "bg-emerald-500/25"
                          : isSelected && highlightEnabled
                            ? "bg-[#b6872c]/20"
                            : ""
                      }`}
                    >
                      {v.textUthmani}{" "}
                      <span
                        className={`pointer-events-none ${
                          nightMode ? "text-[#ecc977] font-bold" : "text-[#9c6f16] font-bold"
                        }`}
                      >
                        ﴿{toArabicDigits(v.ayahNumber)}﴾{v.sajdahNumber ? " ۩" : ""}{" "}
                      </span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Bottom Ornamental Page Footer (Hizb & Authentic Page Medallion) */}
        <footer
          className={`pt-1.5 mt-2 border-t flex items-center justify-between gap-2 text-[10px] shrink-0 ${
            nightMode
              ? "border-[#dcb460]/25 text-[#d7cfb8]"
              : "border-[#b6872c]/25 text-[#5c5138]"
          }`}
        >
          <span className="truncate">{hizbLabel}</span>
          <span
            className={`inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 font-bold tabular-nums ${
              nightMode
                ? "border-[#dcb460]/45 bg-[#dcb460]/12 text-[#f3ecda]"
                : "border-[#b6872c]/45 bg-[#b6872c]/10 text-[#0d5c43]"
            }`}
          >
            {toArabicDigits(pageNumber)} / {toArabicDigits(MUSHAF_TOTAL_PAGES)}
          </span>
        </footer>
      </div>
    </div>
  );
});

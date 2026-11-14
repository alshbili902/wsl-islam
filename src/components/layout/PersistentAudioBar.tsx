"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  ChevronUp,
  ExternalLink,
  Heart,
  ListMusic,
  Loader2,
  Moon,
  Pause,
  Play,
  Radio,
  Repeat,
  Repeat1,
  Save,
  Shuffle,
  SkipBack,
  SkipForward,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useAudio } from "@/components/providers/AudioProvider";
import { useWasl } from "@/components/providers/WaslProvider";
import { WaslShare } from "@/components/share/WaslShare";

function formatClock(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = Math.floor(sec % 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function PersistentAudioBar() {
  const { locale, isRtl } = useWasl();
  const {
    track,
    status,
    errorMessage,
    currentTime,
    duration,
    volume,
    muted,
    playbackRate,
    repeatMode,
    shuffle,
    sleepTimerRemainingSec,
    playerExpanded,
    setPlayerExpanded,
    queue,
    queueIndex,
    listeningPrefs,
    togglePlayPause,
    stop,
    seekTo,
    setVolume,
    toggleMute,
    setPlaybackRate,
    nextSurah,
    prevSurah,
    cycleRepeatMode,
    toggleShuffle,
    setSleepTimer,
    playQueueItem,
    removeFromQueue,
    reorderQueue,
    clearQueue,
    saveQueueAsPlaylist,
    toggleFavoriteReciter,
    toggleFavoriteSurah,
    toggleFavoriteLecture,
  } = useAudio();

  const [playlistTitleInput, setPlaylistTitleInput] = useState("");
  const [savedToast, setSavedToast] = useState(false);

  if (!track) return null;

  const isEn = locale === "en";
  const isQuran = track.kind === "quran";
  const isLecture = track.kind === "lecture";
  const isSeekable = isQuran || isLecture;
  const isPlaying = status === "playing";

  const mainTitle = isQuran
    ? isEn
      ? `Surah ${track.surahNameEn}`
      : `سورة ${track.surahNameAr}`
    : isLecture
      ? isEn
        ? track.lecture.titleEn
        : track.lecture.titleAr
      : isEn
        ? track.station.nameEn
        : track.station.nameAr;

  const subtitle = isQuran
    ? `${isEn ? track.reciter.nameEn : track.reciter.nameAr} • ${
        isEn ? track.reciter.rewayahEn : track.reciter.rewayahAr
      }`
    : isLecture
      ? `${isEn ? track.lecture.speakerEn : track.lecture.speakerAr}${
          track.attachmentTitle ? ` — ${track.attachmentTitle}` : ""
        }`
      : isEn
        ? `Live — ${track.station.sourceOrgEn}`
        : `بث مباشر — ${track.station.sourceOrgAr}`;

  const categoryBadge = isQuran
    ? isEn
      ? "Holy Quran"
      : "القرآن الكريم"
    : isLecture
      ? isEn
        ? "Lecture"
        : "محاضرة / درس"
      : isEn
        ? "Live Radio"
        : "إذاعة مباشرة";

  const isCurrentFavorite = isQuran
    ? listeningPrefs.favoriteSurahs.some(
        (f) =>
          f.surahNumber === track.surahNumber &&
          f.reciterSlug === track.reciter.slug
      )
    : isLecture
      ? listeningPrefs.favoriteLectureIds.includes(track.lecture.id)
      : false;

  const handleFavoriteClick = () => {
    if (isQuran) {
      toggleFavoriteSurah(
        track.surahNumber,
        track.reciter.slug,
        track.reciter.moshafId
      );
    } else if (isLecture) {
      toggleFavoriteLecture(track.lecture.id);
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.aside
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.22 }}
          aria-label={isEn ? "Persistent Audio Player" : "مشغل الصوت المستمر"}
          className="fixed bottom-2 sm:bottom-3 inset-x-2 sm:inset-x-6 z-40 mx-auto max-w-5xl rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elevated)]/95 backdrop-blur-xl shadow-2xl px-3.5 py-2.5 sm:px-5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]"
        >
          {errorMessage ? (
            <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-red-500/10 border border-red-500/25 px-3 py-1.5 text-xs text-red-500">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={togglePlayPause}
                className="underline font-semibold shrink-0 cursor-pointer"
              >
                {isEn ? "Retry" : "إعادة المحاولة"}
              </button>
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Track Info & Visual Equalizer Indicator */}
            <div className="flex items-center justify-between sm:justify-start gap-3 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setPlayerExpanded(true)}
                  aria-label={isEn ? "Expand player" : "توسيع المشغل"}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-emerald)] text-white relative overflow-hidden cursor-pointer"
                >
                  {status === "loading" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isPlaying ? (
                    <span className="flex items-end gap-0.5 h-4" aria-hidden="true">
                      <span className="w-1 bg-white rounded-full animate-pulse h-3" />
                      <span className="w-1 bg-[#F4DDA0] rounded-full animate-pulse h-4" />
                      <span className="w-1 bg-white rounded-full animate-pulse h-2.5" />
                    </span>
                  ) : isQuran ? (
                    <span className="font-arabic-display text-sm font-bold">
                      {track.surahNumber}
                    </span>
                  ) : (
                    <Radio className="h-5 w-5" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="hidden md:inline-block rounded-md bg-[var(--brand-emerald-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--brand-emerald)] shrink-0">
                      {categoryBadge}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPlayerExpanded(true)}
                      className="block truncate text-sm font-bold hover:text-[var(--brand-emerald)] transition-colors text-start cursor-pointer"
                    >
                      {mainTitle}
                    </button>
                  </div>
                  <p className="truncate text-xs text-[var(--text-muted)]">
                    {subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:hidden">
                <button
                  type="button"
                  onClick={() => setPlayerExpanded(true)}
                  aria-label={isEn ? "Expand player" : "توسيع المشغل"}
                  className="rounded-lg p-1.5 hover:bg-[var(--bg-surface-alt)] text-[var(--text-secondary)]"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={stop}
                  aria-label={isEn ? "Close player" : "إغلاق المشغل"}
                  className="rounded-lg p-1.5 hover:bg-[var(--bg-surface-alt)] text-[var(--text-muted)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Playback & Progress Controls */}
            <div className="flex flex-1 items-center gap-2 sm:gap-3 max-w-xl">
              {isQuran || queue.length > 0 ? (
                <button
                  type="button"
                  onClick={isRtl ? nextSurah : prevSurah}
                  aria-label={isEn ? "Previous" : "السابق"}
                  className="rounded-lg p-1.5 hover:bg-[var(--bg-surface-alt)] text-[var(--text-secondary)] cursor-pointer"
                >
                  <SkipBack className="h-4 w-4" />
                </button>
              ) : null}

              <button
                type="button"
                onClick={togglePlayPause}
                aria-label={
                  isPlaying
                    ? isEn
                      ? "Pause"
                      : "إيقاف مؤقت"
                    : isEn
                      ? "Play"
                      : "تشغيل"
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-emerald)] text-white hover:bg-[var(--brand-emerald-strong)] transition-colors cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 ms-0.5" />
                )}
              </button>

              {isQuran || queue.length > 0 ? (
                <button
                  type="button"
                  onClick={isRtl ? prevSurah : nextSurah}
                  aria-label={isEn ? "Next" : "التالي"}
                  className="rounded-lg p-1.5 hover:bg-[var(--bg-surface-alt)] text-[var(--text-secondary)] cursor-pointer"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              ) : null}

              {isSeekable ? (
                <div className="flex flex-1 items-center gap-2 text-[11px] font-mono text-[var(--text-muted)]">
                  <span className="w-10 text-center">{formatClock(currentTime)}</span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={Math.min(currentTime, duration || 100)}
                    onChange={(e) => seekTo(Number(e.target.value))}
                    aria-label={isEn ? "Seek" : "شريط التقدم"}
                    className="flex-1 h-1.5 accent-[var(--brand-emerald)] cursor-pointer"
                  />
                  <span className="w-10 text-center">{formatClock(duration)}</span>
                </div>
              ) : (
                <div className="flex flex-1 items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-emerald-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--brand-emerald)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--brand-emerald)] animate-pulse" />
                    {status === "loading"
                      ? isEn
                        ? "Connecting..."
                        : "جاري الاتصال بالبث..."
                      : isEn
                        ? "LIVE"
                        : "بث مباشر"}
                  </span>
                </div>
              )}
            </div>

            {/* Right Utility Controls */}
            <div className="hidden sm:flex items-center gap-1.5">
              {sleepTimerRemainingSec !== null && (
                <span className="rounded-lg bg-amber-500/15 px-2 py-1 text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-300">
                  {formatClock(sleepTimerRemainingSec)}
                </span>
              )}

              {isQuran && (
                <Link
                  href={`/quran/${track.surahNumber}`}
                  title={isEn ? "Open Surah Text" : "فتح السورة للقراءة"}
                  className="rounded-lg p-1.5 hover:bg-[var(--bg-surface-alt)] text-[var(--text-secondary)]"
                >
                  <BookOpen className="h-4 w-4" />
                </Link>
              )}

              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Unmute" : "Mute"}
                className="rounded-lg p-1.5 hover:bg-[var(--bg-surface-alt)] text-[var(--text-secondary)] cursor-pointer"
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
                aria-label={isEn ? "Volume" : "مستوى الصوت"}
                className="w-16 h-1.5 accent-[var(--brand-gold)] cursor-pointer"
              />

              <button
                type="button"
                onClick={() => setPlayerExpanded(true)}
                aria-label={isEn ? "Expand audio player" : "فتح المشغل الموسع"}
                className="inline-flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-semibold hover:border-[var(--brand-emerald)] cursor-pointer"
              >
                <ListMusic className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
                {queue.length > 0 && (
                  <span className="font-mono text-[10px]">{queue.length}</span>
                )}
              </button>

              <button
                type="button"
                onClick={stop}
                aria-label={isEn ? "Close player" : "إغلاق المشغل"}
                className="rounded-lg p-1.5 hover:bg-[var(--bg-surface-alt)] text-[var(--text-muted)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Expanded Full Player Modal */}
      <AnimatePresence>
        {playerExpanded ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm p-0 sm:p-4"
            onClick={() => setPlayerExpanded(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="wasl-surface w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-[var(--border-strong)] p-5 sm:p-7 space-y-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="inline-block rounded-full bg-[var(--brand-emerald-soft)] px-3 py-0.5 text-xs font-semibold text-[var(--brand-emerald)]">
                    {categoryBadge}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                    {mainTitle}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPlayerExpanded(false)}
                  aria-label={isEn ? "Collapse" : "تصغير"}
                  className="rounded-xl border border-[var(--border-subtle)] p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Waveform / Progress */}
              {isSeekable && (
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/50 p-4 space-y-3">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={Math.min(currentTime, duration || 100)}
                    onChange={(e) => seekTo(Number(e.target.value))}
                    className="w-full h-2 accent-[var(--brand-emerald)] cursor-pointer"
                  />
                  <div className="flex items-center justify-between font-mono text-xs text-[var(--text-muted)]">
                    <span>{formatClock(currentTime)}</span>
                    <span>{formatClock(duration)}</span>
                  </div>
                </div>
              )}

              {/* Primary Transport Controls */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
                {isSeekable && (
                  <button
                    type="button"
                    onClick={toggleShuffle}
                    title={isEn ? "Shuffle" : "ترتيب عشوائي"}
                    className={`rounded-xl p-2.5 border cursor-pointer ${
                      shuffle
                        ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)]"
                        : "border-[var(--border-subtle)] text-[var(--text-muted)]"
                    }`}
                  >
                    <Shuffle className="h-4 w-4" />
                  </button>
                )}

                {isQuran || queue.length > 0 ? (
                  <button
                    type="button"
                    onClick={isRtl ? nextSurah : prevSurah}
                    className="rounded-xl border border-[var(--border-subtle)] p-3 hover:border-[var(--brand-emerald)] cursor-pointer"
                  >
                    <SkipBack className="h-5 w-5" />
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-emerald)] text-white shadow-lg hover:bg-[var(--brand-emerald-strong)] cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ms-0.5" />
                  )}
                </button>

                {isQuran || queue.length > 0 ? (
                  <button
                    type="button"
                    onClick={isRtl ? prevSurah : nextSurah}
                    className="rounded-xl border border-[var(--border-subtle)] p-3 hover:border-[var(--brand-emerald)] cursor-pointer"
                  >
                    <SkipForward className="h-5 w-5" />
                  </button>
                ) : null}

                {isSeekable && (
                  <button
                    type="button"
                    onClick={cycleRepeatMode}
                    title={isEn ? "Repeat Mode" : "وضع التكرار"}
                    className={`rounded-xl p-2.5 border cursor-pointer ${
                      repeatMode !== "off"
                        ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)]"
                        : "border-[var(--border-subtle)] text-[var(--text-muted)]"
                    }`}
                  >
                    {repeatMode === "one" ? (
                      <Repeat1 className="h-4 w-4" />
                    ) : (
                      <Repeat className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Speed, Sleep Timer, Actions */}
              <div className="grid gap-3 sm:grid-cols-2">
                {isSeekable && (
                  <div className="rounded-2xl border border-[var(--border-subtle)] p-3.5 space-y-2">
                    <span className="text-xs font-semibold text-[var(--text-muted)] block">
                      {isEn ? "Playback Speed" : "سرعة التشغيل"}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => setPlaybackRate(spd)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-mono border cursor-pointer ${
                            playbackRate === spd
                              ? "bg-[var(--brand-emerald)] text-white border-[var(--brand-emerald)]"
                              : "border-[var(--border-subtle)]"
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-[var(--border-subtle)] p-3.5 space-y-2">
                  <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                    <Moon className="h-3.5 w-3.5 text-[var(--brand-gold)]" />
                    {isEn ? "Sleep Timer" : "مؤقت النوم التلقائي"}
                    {sleepTimerRemainingSec !== null && (
                      <span className="font-mono text-[var(--brand-emerald)]">
                        ({formatClock(sleepTimerRemainingSec)})
                      </span>
                    )}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { mins: null, label: isEn ? "Off" : "إيقاف" },
                      { mins: 15, label: "15م" },
                      { mins: 30, label: "30م" },
                      { mins: 45, label: "45م" },
                      { mins: 60, label: "60م" },
                    ].map((opt) => (
                      <button
                        key={String(opt.mins)}
                        type="button"
                        onClick={() => setSleepTimer(opt.mins)}
                        className="rounded-lg border border-[var(--border-subtle)] px-2.5 py-1 text-xs hover:border-[var(--brand-emerald)] cursor-pointer"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cross Links & Source Attribution */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[var(--border-subtle)] p-3.5 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {isSeekable && (
                    <button
                      type="button"
                      onClick={handleFavoriteClick}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-semibold cursor-pointer ${
                        isCurrentFavorite
                          ? "border-rose-500/40 bg-rose-500/10 text-rose-500"
                          : "border-[var(--border-subtle)]"
                      }`}
                    >
                      <Heart
                        className="h-3.5 w-3.5"
                        fill={isCurrentFavorite ? "currentColor" : "none"}
                      />
                      {isCurrentFavorite
                        ? isEn
                          ? "Favorited"
                          : "في المفضلة"
                        : isEn
                          ? "Favorite"
                          : "تفضيل"}
                    </button>
                  )}

                  {isQuran && (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleFavoriteReciter(track.reciter.slug)}
                        className="rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 font-semibold hover:border-[var(--brand-emerald)] cursor-pointer"
                      >
                        {listeningPrefs.favoriteReciterSlugs.includes(track.reciter.slug)
                          ? isEn
                            ? "Reciter Saved"
                            : "القارئ محفوظ"
                          : isEn
                            ? "Save Reciter"
                            : "حفظ القارئ"}
                      </button>
                      <Link
                        href={`/mushaf`}
                        onClick={() => setPlayerExpanded(false)}
                        className="inline-flex items-center gap-1 rounded-xl bg-[var(--brand-emerald-soft)] px-3 py-1.5 font-semibold text-[var(--brand-emerald)]"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        {isEn ? "Open in Mushaf" : "فتح في المصحف"}
                      </Link>
                      <Link
                        href={`/tafsir/${track.surahNumber}/1`}
                        onClick={() => setPlayerExpanded(false)}
                        className="rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 font-semibold hover:border-[var(--brand-emerald)]"
                      >
                        {isEn ? "Tafsir" : "التفسير"}
                      </Link>
                    </>
                  )}

                  {isLecture && (
                    <a
                      href={track.lecture.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 font-semibold text-[var(--brand-emerald)]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {track.lecture.sourceNameAr}
                    </a>
                  )}
                </div>

                {isQuran ? (
                  <WaslShare
                    variant="pill"
                    label={isEn ? "Share" : "مشاركة"}
                    payload={{
                      kind: "surah",
                      titleAr: mainTitle,
                      titleEn: mainTitle,
                      arabicText: `${mainTitle} — ${track.reciter.nameAr}`,
                      englishText: `${mainTitle} recited by ${track.reciter.nameEn}`,
                      referenceAr: `${track.reciter.nameAr} (${track.reciter.rewayahAr})`,
                      referenceEn: `${track.reciter.nameEn} (${track.reciter.rewayahEn})`,
                      shareUrl: `/listen/reciters/${track.reciter.slug}`,
                    }}
                  />
                ) : isLecture ? (
                  <WaslShare
                    variant="pill"
                    label={isEn ? "Share" : "مشاركة"}
                    payload={{
                      kind: "lecture",
                      titleAr: track.lecture.titleAr,
                      titleEn: track.lecture.titleEn,
                      arabicText: track.lecture.titleAr,
                      englishText: track.lecture.descriptionEn,
                      referenceAr: `${track.lecture.sourceNameAr} — ${track.lecture.speakerAr}`,
                      referenceEn: `${track.lecture.sourceNameEn} — ${track.lecture.speakerEn}`,
                      shareUrl: `/lectures/${track.lecture.slug}`,
                    }}
                  />
                ) : null}
              </div>

              {/* Queue Management */}
              <div className="space-y-3 border-t border-[var(--border-subtle)] pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <ListMusic className="h-4 w-4 text-[var(--brand-emerald)]" />
                    <span>
                      {isEn ? `Queue (${queue.length})` : `قائمة الانتظار (${queue.length})`}
                    </span>
                  </h3>
                  {queue.length > 0 && (
                    <button
                      type="button"
                      onClick={clearQueue}
                      className="inline-flex items-center gap-1 text-xs text-red-500 hover:underline cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {isEn ? "Clear Queue" : "إفراغ القائمة"}
                    </button>
                  )}
                </div>

                {queue.length > 0 && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={playlistTitleInput}
                      onChange={(e) => setPlaylistTitleInput(e.target.value)}
                      placeholder={
                        isEn
                          ? "Save queue as playlist name..."
                          : "احفظ القائمة باسم مخصص..."
                      }
                      className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!playlistTitleInput.trim()) return;
                        saveQueueAsPlaylist(playlistTitleInput);
                        setPlaylistTitleInput("");
                        setSavedToast(true);
                        window.setTimeout(() => setSavedToast(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 rounded-xl bg-[var(--brand-emerald)] px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {savedToast
                        ? isEn
                          ? "Saved!"
                          : "تم الحفظ!"
                        : isEn
                          ? "Save Playlist"
                          : "حفظ القائمة"}
                    </button>
                  </div>
                )}

                {queue.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">
                    {isEn
                      ? "Your playback queue is empty. Add any surah or lecture from the Listening Center."
                      : "قائمة الانتظار فارغة حالياً؛ يمكنك إضافة سور أو محاضرات من مركز الاستماع."}
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5">
                    {queue.map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs ${
                          idx === queueIndex
                            ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald-soft)]"
                            : "border-[var(--border-subtle)]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => playQueueItem(idx)}
                          className="min-w-0 flex-1 text-start cursor-pointer"
                        >
                          <p className="font-bold truncate">
                            {idx + 1}. {isEn ? item.titleEn : item.titleAr}
                          </p>
                          <p className="text-[11px] text-[var(--text-muted)] truncate">
                            {isEn ? item.subtitleEn : item.subtitleAr}
                          </p>
                        </button>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => reorderQueue(idx, idx - 1)}
                            disabled={idx === 0}
                            className="p-1 text-[var(--text-muted)] disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => reorderQueue(idx, idx + 1)}
                            disabled={idx === queue.length - 1}
                            className="p-1 text-[var(--text-muted)] disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromQueue(idx)}
                            className="p-1 text-red-500 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

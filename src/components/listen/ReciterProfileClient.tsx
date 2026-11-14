"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Heart,
  ListPlus,
  Play,
  Search,
  Star,
  Volume2,
} from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { WaslShare } from "@/components/share/WaslShare";
import { useAudio } from "@/components/providers/AudioProvider";
import { useWasl } from "@/components/providers/WaslProvider";
import { SURAHS } from "@/data/surahs";
import {
  buildDirectMp3UrlFromVariant,
  buildPlayerReciter,
} from "@/lib/audio/clientCatalog";
import { matchesNormalizedQuery } from "@/lib/audio/normalize";
import type { CatalogReciter, SurahMeta } from "@/types/islamic";

export function ReciterProfileClient({
  reciter,
}: {
  reciter: CatalogReciter;
}) {
  const { locale } = useWasl();
  const isEn = locale === "en";

  const {
    playSurah,
    addToQueue,
    listeningPrefs,
    toggleFavoriteReciter,
    toggleFavoriteSurah,
    setPreferredReciter,
    track,
    status,
  } = useAudio();

  const [selectedMoshafId, setSelectedMoshafId] = useState<string>(
    reciter.moshafs[0]?.moshafId || ""
  );
  const [surahQuery, setSurahQuery] = useState("");
  const [revelationFilter, setRevelationFilter] = useState<
    "all" | "makki" | "madani"
  >("all");
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [queuedFeedback, setQueuedFeedback] = useState<string | null>(null);

  const activeVariant = useMemo(() => {
    return (
      reciter.moshafs.find((m) => m.moshafId === selectedMoshafId) ||
      reciter.moshafs[0]
    );
  }, [reciter.moshafs, selectedMoshafId]);

  const availableSet = useMemo(() => {
    return new Set(activeVariant?.availableSurahs || []);
  }, [activeVariant]);

  const filteredSurahs = useMemo(() => {
    const q = surahQuery.trim();
    return SURAHS.filter((s) => {
      if (onlyAvailable && !availableSet.has(s.number)) return false;
      if (revelationFilter === "makki" && s.revelationType !== "Meccan")
        return false;
      if (revelationFilter === "madani" && s.revelationType !== "Medinan")
        return false;
      if (q) {
        return matchesNormalizedQuery(
          `${s.nameAr} ${s.englishName} ${s.englishNameTranslation} ${s.number}`,
          q
        );
      }
      return true;
    });
  }, [onlyAvailable, availableSet, revelationFilter, surahQuery]);

  const isFavReciter = listeningPrefs.favoriteReciterSlugs.includes(reciter.slug);
  const isPreferredReciter = listeningPrefs.preferredReciterSlug === reciter.slug;

  const handlePlaySurah = (surah: SurahMeta) => {
    if (!activeVariant || !availableSet.has(surah.number)) return;
    playSurah(surah.number, buildPlayerReciter(reciter, activeVariant));
  };

  const handleQueueSurah = (surah: SurahMeta) => {
    if (!activeVariant || !availableSet.has(surah.number)) return;
    const directUrl = buildDirectMp3UrlFromVariant(activeVariant, surah.number);
    addToQueue({
      id: `quran:${reciter.slug}:${activeVariant.moshafId}:${surah.number}`,
      kind: "quran",
      titleAr: `سورة ${surah.nameAr}`,
      titleEn: `Surah ${surah.englishName}`,
      subtitleAr: `${reciter.nameAr} — ${activeVariant.rewayahAr}`,
      subtitleEn: `${reciter.nameEn} — ${activeVariant.rewayahEn}`,
      audioUrl: directUrl || "",
      surahNumber: surah.number,
      reciter: buildPlayerReciter(reciter, activeVariant),
    });
    setQueuedFeedback(
      isEn
        ? `Added Surah ${surah.englishName} to queue`
        : `تمت إضافة سورة ${surah.nameAr} إلى قائمة التشغيل`
    );
    window.setTimeout(() => setQueuedFeedback(null), 2600);
  };

  const handleQueueAllFiltered = () => {
    if (!activeVariant) return;
    const playable = filteredSurahs.filter((s) => availableSet.has(s.number));
    if (playable.length === 0) return;

    const builtReciter = buildPlayerReciter(reciter, activeVariant);
    playSurah(playable[0].number, builtReciter);
    for (const s of playable.slice(1, 20)) {
      const directUrl = buildDirectMp3UrlFromVariant(activeVariant, s.number);
      addToQueue({
        id: `quran:${reciter.slug}:${activeVariant.moshafId}:${s.number}`,
        kind: "quran",
        titleAr: `سورة ${s.nameAr}`,
        titleEn: `Surah ${s.englishName}`,
        subtitleAr: `${reciter.nameAr} — ${activeVariant.rewayahAr}`,
        subtitleEn: `${reciter.nameEn} — ${activeVariant.rewayahEn}`,
        audioUrl: directUrl || "",
        surahNumber: s.number,
        reciter: builtReciter,
      });
    }
    setQueuedFeedback(
      isEn
        ? `Playing ${playable[0].englishName} + queued ${Math.min(playable.length - 1, 19)} Surahs`
        : `بدأ تشغيل ${playable[0].nameAr} مع إضافة ${Math.min(playable.length - 1, 19)} سورة للطابور`
    );
    window.setTimeout(() => setQueuedFeedback(null), 3200);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <Breadcrumbs
        items={[
          { labelAr: "مركز الاستماع", labelEn: "Listening Center", href: "/listen" },
          { labelAr: "جميع القراء", labelEn: "All Reciters", href: "/listen/reciters" },
          { labelAr: reciter.nameAr, labelEn: reciter.nameEn },
        ]}
      />

      {/* Reciter Profile Header */}
      <header className="wasl-surface rounded-3xl border border-[var(--border)] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 font-semibold text-[var(--primary)]">
                {activeVariant?.provider === "quran_com_v4"
                  ? "Quran.com Audio API"
                  : "MP3Quran API v3"}
              </span>
              <span className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-[var(--muted)]">
                {reciter.moshafs.length}{" "}
                {isEn ? "Mushaf Edition(s)" : "مصحف / رواية متاحة"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-[var(--foreground)]">
              {isEn ? reciter.nameEn : reciter.nameAr}
            </h1>
            {!isEn && reciter.nameEn !== reciter.nameAr && (
              <p className="text-sm text-[var(--muted)]">{reciter.nameEn}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setPreferredReciter(reciter.slug, activeVariant?.moshafId)
              }
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold cursor-pointer ${
                isPreferredReciter
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
              }`}
            >
              <Star
                className="h-3.5 w-3.5"
                fill={isPreferredReciter ? "currentColor" : "none"}
              />
              {isPreferredReciter
                ? isEn
                  ? "Preferred Reciter"
                  : "قارئك المفضل"
                : isEn
                  ? "Set as Preferred"
                  : "تعيين كمفضل"}
            </button>

            <button
              type="button"
              onClick={() => toggleFavoriteReciter(reciter.slug)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold cursor-pointer ${
                isFavReciter
                  ? "border-rose-500/40 bg-rose-500/10 text-rose-500"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
              }`}
            >
              <Heart
                className="h-3.5 w-3.5"
                fill={isFavReciter ? "currentColor" : "none"}
              />
              {isEn ? "Favorite" : "المفضلة"}
            </button>

            <WaslShare
              variant="pill"
              label={isEn ? "Share" : "مشاركة"}
              payload={{
                kind: "surah",
                titleAr: `تلاوات القارئ ${reciter.nameAr}`,
                titleEn: `Quran Recitations — ${reciter.nameEn}`,
                arabicText: `استمع إلى القرآن الكريم بصوت القارئ ${reciter.nameAr} (${activeVariant?.rewayahAr || "حفص عن عاصم"}) عبر مركز الاستماع في منصة وصل الإسلامية.`,
                englishText: `Listen to the Holy Quran recited by ${reciter.nameEn} (${activeVariant?.rewayahEn || "Hafs 'an 'Asim"}) on Wasl Islamic.`,
                referenceAr: `${activeVariant?.rewayahAr || ""} • ${activeVariant?.surahTotal || 114} سورة`,
                referenceEn: `${activeVariant?.rewayahEn || ""} • ${activeVariant?.surahTotal || 114} Surahs`,
                shareUrl: `/listen/reciters/${reciter.slug}`,
              }}
            />
          </div>
        </div>

        {/* Mushaf / Riwayah Variant Switcher */}
        <div className="space-y-2.5 pt-2 border-t border-[var(--border)]">
          <div className="text-xs font-bold text-[var(--muted)]">
            {isEn
              ? "Select Mushaf / Riwayah Edition:"
              : "اختر المصحف / الرواية المتاحة لهذا القارئ:"}
          </div>
          <div className="flex flex-wrap gap-2">
            {reciter.moshafs.map((variant) => {
              const selected = variant.moshafId === activeVariant?.moshafId;
              return (
                <button
                  key={variant.moshafId}
                  type="button"
                  onClick={() => setSelectedMoshafId(variant.moshafId)}
                  className={`rounded-2xl border px-3.5 py-2 text-start text-xs transition-colors cursor-pointer ${
                    selected
                      ? "border-[var(--primary)] bg-[var(--accent-soft)] text-[var(--primary)] font-bold"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--primary)]/50"
                  }`}
                >
                  <div>{isEn ? variant.nameEn : variant.nameAr}</div>
                  <div className="text-[10px] opacity-80 font-normal mt-0.5">
                    {isEn ? variant.styleEn : variant.styleAr} •{" "}
                    {variant.surahTotal}/114 {isEn ? "Surahs" : "سورة"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Surah Filter Controls + Play All */}
      <section className="wasl-surface rounded-3xl border border-[var(--border)] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
            <input
              type="search"
              value={surahQuery}
              onChange={(e) => setSurahQuery(e.target.value)}
              placeholder={
                isEn ? "Search Surah name or number..." : "ابحث عن سورة بالاسم أو الرقم..."
              }
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-2 ps-9 pe-3 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div className="flex items-center gap-1">
            {(
              [
                { id: "all", ar: "الكل", en: "All" },
                { id: "makki", ar: "مكية", en: "Meccan" },
                { id: "madani", ar: "مدنية", en: "Medinan" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRevelationFilter(opt.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold border cursor-pointer ${
                  revelationFilter === opt.id
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                    : "bg-[var(--card)] border-[var(--border)] text-[var(--foreground)]"
                }`}
              >
                {isEn ? opt.en : opt.ar}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOnlyAvailable((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
              onlyAvailable
                ? "border-[var(--primary)] bg-[var(--accent-soft)] text-[var(--primary)]"
                : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {isEn
              ? `Available (${availableSet.size})`
              : `المتوفرة فقط (${availableSet.size})`}
          </button>
        </div>

        <button
          type="button"
          onClick={handleQueueAllFiltered}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--primary-foreground)] hover:opacity-95 cursor-pointer shrink-0"
        >
          <Play className="h-3.5 w-3.5" />
          {isEn ? "Play & Queue Surahs" : "تشغيل وإضافة لقائمة التشغيل"}
        </button>
      </section>

      {queuedFeedback && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          {queuedFeedback}
        </div>
      )}

      {/* Surahs Grid */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSurahs.map((surah) => {
          const available = availableSet.has(surah.number);
          const isCurrentlyPlaying =
            track?.kind === "quran" &&
            track.surahNumber === surah.number &&
            track.reciter.slug === reciter.slug &&
            track.reciter.moshafId === activeVariant?.moshafId &&
            (status === "playing" || status === "loading");
          const isFavSurah = listeningPrefs.favoriteSurahs.some(
            (item) =>
              item.surahNumber === surah.number && item.reciterSlug === reciter.slug
          );

          return (
            <div
              key={surah.number}
              className={`wasl-surface rounded-2xl border p-4 flex flex-col justify-between gap-3 transition-colors ${
                isCurrentlyPlaying
                  ? "border-[var(--primary)] bg-[var(--accent-soft)]/50"
                  : "border-[var(--border)]"
              } ${!available ? "opacity-65" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-xs font-bold text-[var(--primary)] tabular-nums">
                    {surah.number}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-[var(--foreground)] truncate">
                      {isEn ? surah.englishName : `سورة ${surah.nameAr}`}
                    </h2>
                    <p className="text-[11px] text-[var(--muted)]">
                      {surah.revelationType === "Meccan"
                        ? isEn
                          ? "Meccan"
                          : "مكية"
                        : isEn
                          ? "Medinan"
                          : "مدنية"}{" "}
                      • {surah.numberOfAyahs} {isEn ? "verses" : "آية"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {available && (
                    <button
                      type="button"
                      onClick={() =>
                        toggleFavoriteSurah(
                          surah.number,
                          reciter.slug,
                          activeVariant?.moshafId
                        )
                      }
                      aria-label={isEn ? "Favorite Surah Recitation" : "تفضيل تلاوة السورة"}
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        isFavSurah
                          ? "text-rose-500"
                          : "text-[var(--muted)] hover:text-rose-500"
                      }`}
                    >
                      <Heart
                        className="h-3.5 w-3.5"
                        fill={isFavSurah ? "currentColor" : "none"}
                      />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
                {available ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePlaySurah(surah)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-foreground)] hover:opacity-95 cursor-pointer"
                    >
                      {isCurrentlyPlaying ? (
                        <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                      {isCurrentlyPlaying
                        ? isEn
                          ? "Playing"
                          : "يعمل الآن"
                        : isEn
                          ? "Play"
                          : "استماع"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQueueSurah(surah)}
                      title={isEn ? "Add to Queue" : "إضافة لطابور التشغيل"}
                      className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-1.5 text-[var(--foreground)] hover:border-[var(--primary)] cursor-pointer"
                    >
                      <ListPlus className="h-3.5 w-3.5 text-[var(--primary)]" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] font-medium text-[var(--muted)]">
                    {isEn
                      ? "Not recorded in this Mushaf"
                      : "غير متوفرة في هذا المصحف"}
                  </span>
                )}

                <div className="flex items-center gap-1.5 text-[11px]">
                  <Link
                    href={`/quran/${surah.number}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[var(--foreground)] hover:border-[var(--primary)]"
                  >
                    <BookOpen className="h-3 w-3 text-[var(--primary)]" />
                    {isEn ? "Read" : "قراءة"}
                  </Link>
                  <Link
                    href={`/tafsir/${surah.number}/1`}
                    className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[var(--muted)] hover:text-[var(--primary)]"
                  >
                    {isEn ? "Tafsir" : "التفسير"}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

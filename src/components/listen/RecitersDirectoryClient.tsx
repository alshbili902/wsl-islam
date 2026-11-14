"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Filter,
  Heart,
  Play,
  RefreshCw,
  Search,
  Star,
  Users,
} from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useAudio } from "@/components/providers/AudioProvider";
import { useWasl } from "@/components/providers/WaslProvider";
import { SURAHS } from "@/data/surahs";
import {
  ARABIC_ALPHABET_LETTERS,
  RECITATION_STYLE_OPTIONS,
  buildPlayerReciter,
  filterReciterCatalog,
} from "@/lib/audio/clientCatalog";
import type {
  CatalogReciter,
  RecitationStyleId,
  ReciterCatalogSnapshot,
  ReciterProviderId,
} from "@/types/islamic";

const PAGE_SIZE = 36;

export function RecitersDirectoryClient({
  initialSnapshot,
  initialQuery = "",
  initialStyle = "all",
  initialFullOnly = false,
  initialRiwayahId = null,
  initialLetter = "all",
}: {
  initialSnapshot: ReciterCatalogSnapshot;
  initialQuery?: string;
  initialStyle?: RecitationStyleId | "all";
  initialFullOnly?: boolean;
  initialRiwayahId?: number | null;
  initialLetter?: string;
}) {
  const { locale } = useWasl();
  const isEn = locale === "en";

  const {
    playSurah,
    listeningPrefs,
    toggleFavoriteReciter,
    setPreferredReciter,
    addRecentSearch,
  } = useAudio();

  const [snapshot, setSnapshot] = useState<ReciterCatalogSnapshot>(initialSnapshot);
  const [query, setQuery] = useState(initialQuery);
  const [letter, setLetter] = useState(initialLetter || "all");
  const [riwayahId, setRiwayahId] = useState<number | null>(initialRiwayahId);
  const [styleId, setStyleId] = useState<RecitationStyleId | "all">(initialStyle);
  const [surahFilter, setSurahFilter] = useState<number | null>(null);
  const [provider, setProvider] = useState<ReciterProviderId | "all">("all");
  const [fullOnly, setFullOnly] = useState(initialFullOnly);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [syncing, setSyncing] = useState(false);

  const filteredReciters = useMemo(() => {
    const base = filterReciterCatalog(snapshot.reciters, {
      query,
      letter,
      riwayahId,
      styleId,
      surahNumber: surahFilter,
      provider,
      fullOnly,
    });
    if (favoritesOnly) {
      const favs = new Set(listeningPrefs.favoriteReciterSlugs);
      return base.filter((r) => favs.has(r.slug));
    }
    return base;
  }, [
    snapshot.reciters,
    query,
    letter,
    riwayahId,
    styleId,
    surahFilter,
    provider,
    fullOnly,
    favoritesOnly,
    listeningPrefs.favoriteReciterSlugs,
  ]);

  const visibleReciters = useMemo(() => {
    return filteredReciters.slice(0, visibleCount);
  }, [filteredReciters, visibleCount]);

  const resetFilters = () => {
    setQuery("");
    setLetter("all");
    setRiwayahId(null);
    setStyleId("all");
    setSurahFilter(null);
    setProvider("all");
    setFullOnly(false);
    setFavoritesOnly(false);
    setVisibleCount(PAGE_SIZE);
  };

  const handleRefreshCatalog = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/listen/sync", { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as { snapshot?: ReciterCatalogSnapshot };
        if (data.snapshot) setSnapshot(data.snapshot);
      }
    } finally {
      setSyncing(false);
    }
  };

  const pickMatchingVariant = (reciter: CatalogReciter) => {
    return (
      reciter.moshafs.find((m) => {
        if (riwayahId && m.rewayahId !== riwayahId) return false;
        if (styleId !== "all" && m.styleId !== styleId) return false;
        if (provider !== "all" && m.provider !== provider) return false;
        if (surahFilter && !m.availableSurahs.includes(surahFilter)) return false;
        if (fullOnly && m.surahTotal < 114) return false;
        return true;
      }) || reciter.moshafs[0]
    );
  };

  const handlePlayReciter = (reciter: CatalogReciter) => {
    const variant = pickMatchingVariant(reciter);
    const surahToPlay =
      surahFilter && variant.availableSurahs.includes(surahFilter)
        ? surahFilter
        : variant.availableSurahs[0] || 1;
    playSurah(surahToPlay, buildPlayerReciter(reciter, variant));
  };

  const hasActiveFilters =
    Boolean(query.trim()) ||
    letter !== "all" ||
    riwayahId !== null ||
    styleId !== "all" ||
    surahFilter !== null ||
    provider !== "all" ||
    fullOnly ||
    favoritesOnly;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <Breadcrumbs
        items={[
          { labelAr: "مركز الاستماع", labelEn: "Listening Center", href: "/listen" },
          { labelAr: "جميع القراء", labelEn: "All Reciters" },
        ]}
      />

      {/* Directory Header */}
      <header className="wasl-surface rounded-3xl border border-[var(--border)] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
            <Users className="h-3.5 w-3.5" />
            {isEn
              ? `Dynamic Complete Catalog (${snapshot.reciters.length} Reciters)`
              : `الدليل الشامل المحدث ديناميكياً (${snapshot.reciters.length} قارئاً)`}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
            {isEn ? "All Quran Reciters & Riwayat" : "جميع قراء القرآن الكريم والروايات"}
          </h1>
          <p className="text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
            {isEn
              ? `Browse all ${snapshot.reciters.length} reciters and ${snapshot.stats.totalMoshafVariants} authentic Mushaf editions across MP3Quran v3 and Quran.com v4.`
              : `استعرض جميع القراء المتاحين (${snapshot.reciters.length} قارئاً و${snapshot.stats.totalMoshafVariants} مصحفاً)، مع التصفية بالرواية وأسلوب التلاوة والحروف والسور المتاحة.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRefreshCatalog}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--primary)] cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? (isEn ? "Syncing..." : "جاري التحديث...") : isEn ? "Refresh" : "تحديث الفهرس"}
          </button>
          <Link
            href="/listen/library"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--primary-foreground)] hover:opacity-95"
          >
            <Heart className="h-3.5 w-3.5" />
            {isEn ? "My Library" : "مكتبتي الصوتية"}
          </Link>
        </div>
      </header>

      {/* Filter Bar */}
      <section className="wasl-surface rounded-3xl border border-[var(--border)] p-4 sm:p-5 space-y-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          {/* Normalized Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) addRecentSearch(query.trim());
            }}
            className="relative lg:col-span-2"
          >
            <Search className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder={
                isEn
                  ? "Search by reciter name, Riwayah (Warsh, Qalun)..."
                  : "ابحث باسم القارئ أو الرواية (حفص، ورش، قالون)..."
              }
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-2.5 ps-10 pe-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
            />
          </form>

          {/* Riwayah Select */}
          <select
            aria-label={isEn ? "Filter by Riwayah" : "تصفية حسب الرواية"}
            value={riwayahId ?? ""}
            onChange={(e) => {
              setRiwayahId(e.target.value ? Number(e.target.value) : null);
              setVisibleCount(PAGE_SIZE);
            }}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-xs font-semibold text-[var(--foreground)]"
          >
            <option value="">
              {isEn ? "All Riwayat (Qira'at)" : "جميع الروايات والقراءات"}
            </option>
            {snapshot.riwayat.map((rw) => (
              <option key={rw.id} value={rw.id}>
                {isEn ? rw.nameEn : rw.nameAr}
              </option>
            ))}
          </select>

          {/* Surah Availability Select */}
          <select
            aria-label={isEn ? "Filter by Available Surah" : "تصفية حسب السورة المتوفرة"}
            value={surahFilter ?? ""}
            onChange={(e) => {
              setSurahFilter(e.target.value ? Number(e.target.value) : null);
              setVisibleCount(PAGE_SIZE);
            }}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-xs font-semibold text-[var(--foreground)]"
          >
            <option value="">
              {isEn ? "Any Available Surah" : "أي سورة متوفرة"}
            </option>
            {SURAHS.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {isEn ? s.englishName : s.nameAr}
              </option>
            ))}
          </select>

          {/* Provider Select */}
          <select
            aria-label={isEn ? "Filter by Audio Source" : "تصفية حسب المصدر الصوتي"}
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value as ReciterProviderId | "all");
              setVisibleCount(PAGE_SIZE);
            }}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-xs font-semibold text-[var(--foreground)]"
          >
            <option value="all">{isEn ? "All Audio Sources" : "جميع المصادر الموثقة"}</option>
            <option value="mp3quran_v3">MP3Quran API v3</option>
            <option value="quran_com_v4">Quran.com Audio API</option>
          </select>
        </div>

        {/* Style Tabs + Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {RECITATION_STYLE_OPTIONS.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setStyleId(st.id);
                  setVisibleCount(PAGE_SIZE);
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold border cursor-pointer transition-colors ${
                  styleId === st.id
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                    : "bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {isEn ? st.labelEn : st.labelAr}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setFullOnly((v) => !v);
                setVisibleCount(PAGE_SIZE);
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                fullOnly
                  ? "border-[var(--primary)] bg-[var(--accent-soft)] text-[var(--primary)]"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {isEn ? "Complete 114 Surahs" : "المصحف الكامل (114)"}
            </button>

            <button
              type="button"
              onClick={() => {
                setFavoritesOnly((v) => !v);
                setVisibleCount(PAGE_SIZE);
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                favoritesOnly
                  ? "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
              }`}
            >
              <Heart className="h-3.5 w-3.5" />
              {isEn
                ? `Favorites (${listeningPrefs.favoriteReciterSlugs.length})`
                : `المفضلة (${listeningPrefs.favoriteReciterSlugs.length})`}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                <Filter className="h-3 w-3" />
                {isEn ? "Reset" : "إعادة تعيين"}
              </button>
            )}
          </div>
        </div>

        {/* Arabic Alphabet Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-1">
          <button
            type="button"
            onClick={() => {
              setLetter("all");
              setVisibleCount(PAGE_SIZE);
            }}
            className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer ${
              letter === "all"
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)]"
            }`}
          >
            {isEn ? "All" : "الكل"}
          </button>
          {ARABIC_ALPHABET_LETTERS.map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => {
                setLetter(ch);
                setVisibleCount(PAGE_SIZE);
              }}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer ${
                letter === ch
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]"
              }`}
            >
              {ch}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--muted)]">
          <span>
            {isEn
              ? `Showing ${visibleReciters.length} of ${filteredReciters.length} matching reciters`
              : `يعرض ${visibleReciters.length} من أصل ${filteredReciters.length} قارئ مطابق`}
          </span>
          {surahFilter && (
            <span className="font-semibold text-[var(--primary)]">
              {isEn ? "Playback Surah:" : "سورة التشغيل:"}{" "}
              {SURAHS.find((s) => s.number === surahFilter)?.nameAr}
            </span>
          )}
        </div>
      </section>

      {/* Reciters Grid */}
      {filteredReciters.length === 0 ? (
        <div className="wasl-surface rounded-3xl border border-[var(--border)] p-10 text-center space-y-3">
          <p className="text-base font-bold text-[var(--foreground)]">
            {isEn ? "No matching reciters found" : "لا يوجد قراء مطابقون لخيارات التصفية الحالية"}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--primary-foreground)] cursor-pointer"
          >
            {isEn ? "Show All Reciters" : "عرض جميع القراء"}
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleReciters.map((reciter) => {
              const variant = pickMatchingVariant(reciter);
              const liked = listeningPrefs.favoriteReciterSlugs.includes(reciter.slug);
              const isPreferred = listeningPrefs.preferredReciterSlug === reciter.slug;

              return (
                <article
                  key={reciter.slug}
                  className="wasl-surface rounded-3xl border border-[var(--border)] p-5 flex flex-col justify-between gap-4 hover:border-[var(--primary)]/50 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-1">
                        <Link href={`/listen/reciters/${reciter.slug}`}>
                          <h2 className="text-base font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors line-clamp-1">
                            {isEn ? reciter.nameEn : reciter.nameAr}
                          </h2>
                        </Link>
                        {!isEn && reciter.nameEn !== reciter.nameAr && (
                          <p className="text-[11px] text-[var(--muted)] truncate">
                            {reciter.nameEn}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setPreferredReciter(reciter.slug, variant.moshafId)
                          }
                          title={isEn ? "Set Default Reciter" : "تعيين كقارئ مفضل افتراضي"}
                          className={`p-1.5 rounded-xl border cursor-pointer ${
                            isPreferred
                              ? "border-amber-500/50 bg-amber-500/10 text-amber-500"
                              : "border-[var(--border)] text-[var(--muted)] hover:text-amber-500"
                          }`}
                        >
                          <Star
                            className="h-3.5 w-3.5"
                            fill={isPreferred ? "currentColor" : "none"}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFavoriteReciter(reciter.slug)}
                          title={isEn ? "Favorite Reciter" : "إضافة للمفضلة"}
                          className={`p-1.5 rounded-xl border cursor-pointer ${
                            liked
                              ? "border-rose-500/40 bg-rose-500/10 text-rose-500"
                              : "border-[var(--border)] text-[var(--muted)] hover:text-rose-500"
                          }`}
                        >
                          <Heart
                            className="h-3.5 w-3.5"
                            fill={liked ? "currentColor" : "none"}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 font-semibold text-[var(--primary)]">
                        {isEn ? variant.rewayahEn : variant.rewayahAr}
                      </span>
                      <span className="rounded-full border border-[var(--border)] bg-[var(--card)] px-2.5 py-0.5 text-[var(--foreground)]">
                        {isEn ? variant.styleEn : variant.styleAr}
                      </span>
                      <span className="rounded-full border border-[var(--border)] bg-[var(--card)] px-2.5 py-0.5 text-[var(--muted)] tabular-nums">
                        {variant.surahTotal}/114 {isEn ? "Surahs" : "سورة"}
                      </span>
                    </div>

                    {reciter.moshafs.length > 1 && (
                      <p className="text-[11px] text-[var(--muted)] line-clamp-1">
                        {isEn
                          ? `+${reciter.moshafs.length - 1} more Mushaf edition(s) available`
                          : `يتوفر ${reciter.moshafs.length} مصاحف/روايات لهذا القارئ`}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                    <button
                      type="button"
                      onClick={() => handlePlayReciter(reciter)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-[var(--primary-foreground)] hover:opacity-95 cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5" />
                      {surahFilter
                        ? isEn
                          ? `Play Surah ${surahFilter}`
                          : `تشغيل ${SURAHS.find((s) => s.number === surahFilter)?.nameAr}`
                        : isEn
                          ? "Play Recitation"
                          : "تشغيل التلاوة"}
                    </button>
                    <Link
                      href={`/listen/reciters/${reciter.slug}`}
                      className="inline-flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--primary)]"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-[var(--primary)]" />
                      {isEn ? "Mushafs" : "التفاصيل"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Progressive Pagination Controls */}
          {visibleCount < filteredReciters.length && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="rounded-2xl bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-95 cursor-pointer"
              >
                {isEn
                  ? `Load More (${filteredReciters.length - visibleCount} remaining)`
                  : `عرض المزيد (${filteredReciters.length - visibleCount} متبقٍ)`}
              </button>
              <button
                type="button"
                onClick={() => setVisibleCount(filteredReciters.length)}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--primary)] cursor-pointer"
              >
                {isEn
                  ? `Show All ${filteredReciters.length}`
                  : `عرض الكل (${filteredReciters.length})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  Headphones,
  Heart,
  History,
  Library,
  ListMusic,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  Volume2,
} from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useAudio } from "@/components/providers/AudioProvider";
import { useWasl } from "@/components/providers/WaslProvider";
import { SURAHS } from "@/data/surahs";
import { LECTURE_CATEGORIES } from "@/data/lectures";
import { buildPlayerReciter, filterReciterCatalog } from "@/lib/audio/clientCatalog";
import { matchesNormalizedQuery } from "@/lib/audio/normalize";
import type {
  CatalogReciter,
  LectureItem,
  RecitationStyleId,
  ReciterCatalogSnapshot,
} from "@/types/islamic";

const CURATED_COLLECTIONS: Array<{
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  href: string;
  badgeAr: string;
  badgeEn: string;
}> = [
  {
    id: "murattal",
    titleAr: "المصاحف المرتلة الكاملة",
    titleEn: "Complete Murattal Recitations",
    descAr: "ختمات كاملة 114 سورة بأسلوب الترتيل الخاشع المتقن.",
    descEn: "Full 114-surah recitations in calm Murattal style.",
    href: "/listen/reciters?style=murattal&fullOnly=1",
    badgeAr: "مرتل • 114 سورة",
    badgeEn: "Murattal • 114 Surahs",
  },
  {
    id: "mujawwad",
    titleAr: "المصاحف المجودة",
    titleEn: "Mujawwad Masters",
    descAr: "تلاوات مجودة متقنة الأداء والمقامات من كبار القراء.",
    descEn: "Classical slow-cadence Mujawwad recitations.",
    href: "/listen/reciters?style=mujawwad",
    badgeAr: "مجود",
    badgeEn: "Mujawwad",
  },
  {
    id: "muallim",
    titleAr: "المصحف المعلم وتكرار الحفظ",
    titleEn: "Teaching (Mu'allim) Recitations",
    descAr: "مناسبة للحفظ وتثبيت القراءة السليمة مع القراء المعلمين.",
    descEn: "Designed for memorization and Tajweed precision.",
    href: "/listen/reciters?style=muallim",
    badgeAr: "المعلم",
    badgeEn: "Mu'allim",
  },
  {
    id: "warsh",
    titleAr: "قراءات برواية ورش عن نافع",
    titleEn: "Warsh 'an Nafi' Recitations",
    descAr: "تلاوات موثقة برواية ورش عن نافع من طرق متعددة.",
    descEn: "Verified Warsh 'an Nafi' Mushaf recordings.",
    href: "/listen/reciters?q=ورش",
    badgeAr: "ورش عن نافع",
    badgeEn: "Warsh",
  },
  {
    id: "qalun",
    titleAr: "قراءات برواية قالون عن نافع",
    titleEn: "Qalun 'an Nafi' Recitations",
    descAr: "مصاحف كاملة ومختارة برواية قالون عن نافع.",
    descEn: "Verified Qalun 'an Nafi' Mushaf recordings.",
    href: "/listen/reciters?q=قالون",
    badgeAr: "قالون عن نافع",
    badgeEn: "Qalun",
  },
];

export function ListeningCenterClient({
  initialSnapshot,
  initialLectures,
}: {
  initialSnapshot: ReciterCatalogSnapshot;
  initialLectures: LectureItem[];
}) {
  const { locale, isRtl } = useWasl();
  const isEn = locale === "en";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const {
    playSurah,
    playLecture,
    savedPosition,
    history,
    listeningPrefs,
    playlists,
    playPlaylist,
    addRecentSearch,
    clearRecentSearches,
    toggleFavoriteReciter,
  } = useAudio();

  const [snapshot, setSnapshot] = useState<ReciterCatalogSnapshot>(initialSnapshot);
  const [searchQuery, setSearchQuery] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [quickSurah, setQuickSurah] = useState(1);

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/listen/sync", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      const data = (await res.json()) as { snapshot?: ReciterCatalogSnapshot };
      if (data.snapshot) {
        setSnapshot(data.snapshot);
        setSyncMessage(
          isEn
            ? `Synced ${data.snapshot.reciters.length} reciters and ${data.snapshot.stats.totalMoshafVariants} Mushafs.`
            : `تم تحديث الفهرس بنجاح: ${data.snapshot.reciters.length} قارئاً و${data.snapshot.stats.totalMoshafVariants} مصحفاً.`
        );
      }
    } catch {
      setSyncMessage(
        isEn
          ? "Could not refresh upstream right now. Showing verified local/cached catalog."
          : "تعذر التحديث المباشر حالياً — يتم عرض الفهرس الموثق المحفوظ."
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim());
    }
  };

  const searchResults = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return null;

    const matchedReciters = filterReciterCatalog(snapshot.reciters, { query: q }).slice(0, 8);
    const matchedSurahs = SURAHS.filter((s) =>
      matchesNormalizedQuery(`${s.nameAr} ${s.englishName} ${s.englishNameTranslation} ${s.number}`, q)
    ).slice(0, 6);
    const matchedLectures = initialLectures
      .filter((l) =>
        matchesNormalizedQuery(
          `${l.titleAr} ${l.titleEn} ${l.speakerAr} ${l.speakerEn} ${l.descriptionAr}`,
          q
        )
      )
      .slice(0, 6);

    return {
      reciters: matchedReciters,
      surahs: matchedSurahs,
      lectures: matchedLectures,
    };
  }, [searchQuery, snapshot.reciters, initialLectures]);

  const favoriteReciters = useMemo(() => {
    const set = new Set(listeningPrefs.favoriteReciterSlugs);
    return snapshot.reciters.filter((r) => set.has(r.slug));
  }, [snapshot.reciters, listeningPrefs.favoriteReciterSlugs]);

  const favoriteLectures = useMemo(() => {
    const set = new Set(listeningPrefs.favoriteLectureIds);
    return initialLectures.filter((l) => set.has(l.id));
  }, [initialLectures, listeningPrefs.favoriteLectureIds]);

  const featuredReciters = useMemo(() => {
    return snapshot.reciters
      .filter((r) => r.moshafs.some((m) => m.surahTotal === 114))
      .slice(0, 8);
  }, [snapshot.reciters]);

  const audioLectures = useMemo(() => {
    return initialLectures.filter((l) => l.mediaType === "audio").slice(0, 6);
  }, [initialLectures]);

  const styleStats = useMemo(() => {
    const counts: Record<RecitationStyleId, number> = {
      murattal: 0,
      mujawwad: 0,
      muallim: 0,
      historic: 0,
      other: 0,
    };
    for (const r of snapshot.reciters) {
      for (const m of r.moshafs) {
        counts[m.styleId] = (counts[m.styleId] || 0) + 1;
      }
    }
    return counts;
  }, [snapshot.reciters]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, (typeof LECTURE_CATEGORIES)[number]>();
    for (const c of LECTURE_CATEGORIES) map.set(c.id, c);
    return map;
  }, []);

  const handlePlayCatalogReciter = (reciter: CatalogReciter, surahNum = quickSurah) => {
    const matchingVariant =
      reciter.moshafs.find((m) => m.availableSurahs.includes(surahNum)) ||
      reciter.moshafs[0];
    const targetSurah = matchingVariant.availableSurahs.includes(surahNum)
      ? surahNum
      : matchingVariant.availableSurahs[0] || 1;
    playSurah(targetSurah, buildPlayerReciter(reciter, matchingVariant));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 space-y-10">
      <Breadcrumbs
        items={[
          {
            labelAr: "مركز الاستماع",
            labelEn: "Listening Center",
          },
        ]}
      />

      {/* Premium Islamic Listening Hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-gradient-to-br from-[var(--brand-emerald)] via-[#0c563f] to-[#083929] text-white p-6 sm:p-10 shadow-xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #d4af37 0%, transparent 45%), radial-gradient(circle at 85% 75%, #27a770 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 grid gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/15 px-3.5 py-1 text-xs font-semibold text-[#f7df8f]">
              <Sparkles className="h-3.5 w-3.5" />
              {isEn
                ? "Unified Quran & Verified Islamic Audio Center"
                : "مكتبة الصوتيات القرآنية والعلمية الموثقة"}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              {isEn ? "Wasl Listening Center" : "مركز الاستماع"}
            </h1>
            <p className="text-sm sm:text-base text-white/85 max-w-2xl leading-relaxed">
              {isEn
                ? `Explore ${snapshot.reciters.length}+ dynamically synced Quran reciters across ${snapshot.riwayat.length} authentic Riwayat alongside verified Islamic lectures and book commentaries.`
                : `تصفح واستمع إلى أكثر من ${snapshot.reciters.length} قارئاً للقرآن الكريم عبر ${snapshot.riwayat.length} رواية وقراءة موثقة، مع مكتبة المحاضرات والدروس العلمية الموثقة في مشغّل صوتي واحد مستمر.`}
            </p>

            {/* Quick Unified Search */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl pt-2">
              <Search className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-950/60" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isEn
                    ? "Search reciters, Surahs, Riwayat, or scholars..."
                    : "ابحث عن قارئ، سورة، رواية (ورش، قالون)، أو محاضرة..."
                }
                className="w-full rounded-2xl border border-white/20 bg-white/95 py-3.5 ps-11 pe-28 text-sm text-emerald-950 placeholder:text-emerald-900/55 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              />
              <Link
                href={
                  searchQuery.trim()
                    ? `/listen/reciters?q=${encodeURIComponent(searchQuery.trim())}`
                    : "/listen/reciters"
                }
                className="absolute end-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-[var(--brand-emerald)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0d6247]"
              >
                {isEn ? "All Reciters" : "تصفح الكل"}
              </Link>
            </form>

            {listeningPrefs.recentSearches.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-white/75">
                  {isEn ? "Recent:" : "بحثت مؤخراً:"}
                </span>
                {listeningPrefs.recentSearches.slice(0, 5).map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setSearchQuery(term)}
                    className="rounded-full bg-white/15 px-2.5 py-1 text-white hover:bg-white/25 cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-[11px] text-white/60 hover:text-white underline cursor-pointer"
                >
                  {isEn ? "Clear" : "مسح"}
                </button>
              </div>
            )}
          </div>

          {/* Stats & Two Quick Actions */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm p-4 space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-[#f7df8f] tabular-nums">
                {snapshot.reciters.length}
              </div>
              <div className="text-xs text-white/85">
                {isEn ? "Synced Reciters" : "قارئاً متاحاً للاستماع"}
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm p-4 space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-[#f7df8f] tabular-nums">
                {snapshot.stats.totalMoshafVariants}
              </div>
              <div className="text-xs text-white/85">
                {isEn ? "Mushaf Recordings" : "مصحفاً وتلاوةً مسجلة"}
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm p-4 space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-[#f7df8f] tabular-nums">
                {snapshot.riwayat.length}
              </div>
              <div className="text-xs text-white/85">
                {isEn ? "Authentic Riwayat" : "رواية وقراءة موثقة"}
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm p-4 flex flex-col justify-between">
              <div className="text-[11px] text-white/80">
                {isEn ? "Source Sync" : "حالة المزامنة"}
              </div>
              <button
                type="button"
                onClick={handleManualSync}
                disabled={syncing}
                className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 px-2.5 py-1.5 text-xs font-semibold text-white cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                {syncing
                  ? isEn
                    ? "Syncing..."
                    : "جاري التحديث..."
                  : isEn
                    ? "Refresh Catalog"
                    : "تحديث الفهرس"}
              </button>
            </div>
          </div>
        </div>
        {syncMessage && (
          <p className="relative z-10 mt-4 text-xs text-[#f7df8f] bg-black/20 rounded-xl px-3 py-2 inline-block">
            {syncMessage}
          </p>
        )}
      </section>

      {/* Instant Live Search Results Drawer */}
      {searchResults && (
        <section className="wasl-surface rounded-3xl border border-[var(--primary)]/40 p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[var(--foreground)]">
              {isEn ? `Instant results for "${searchQuery}"` : `نتائج البحث الفورية عن "${searchQuery}"`}
            </h2>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs text-[var(--primary)] hover:underline cursor-pointer"
            >
              {isEn ? "Close results" : "إغلاق النتائج"}
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Reciters Matches */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  {isEn ? "Reciters" : "القراء"} ({searchResults.reciters.length})
                </h3>
                <Link
                  href={`/listen/reciters?q=${encodeURIComponent(searchQuery)}`}
                  className="text-[11px] font-semibold text-[var(--primary)] hover:underline"
                >
                  {isEn ? "View all" : "عرض الكل"}
                </Link>
              </div>
              {searchResults.reciters.length === 0 ? (
                <p className="text-xs text-[var(--muted)]">
                  {isEn ? "No reciters match." : "لا يوجد قراء مطابقون."}
                </p>
              ) : (
                <div className="space-y-2">
                  {searchResults.reciters.map((r) => (
                    <div
                      key={r.slug}
                      className="flex items-center justify-between gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5"
                    >
                      <Link href={`/listen/reciters/${r.slug}`} className="min-w-0 flex-1">
                        <div className="truncate text-xs font-bold text-[var(--foreground)] hover:text-[var(--primary)]">
                          {isEn ? r.nameEn : r.nameAr}
                        </div>
                        <div className="truncate text-[11px] text-[var(--muted)]">
                          {r.moshafs[0]?.rewayahAr} • {r.moshafs.length}{" "}
                          {isEn ? "Mushaf(s)" : "مصحف"}
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handlePlayCatalogReciter(r)}
                        aria-label={isEn ? "Play recitation" : "تشغيل التلاوة"}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Surahs Matches */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                {isEn ? "Surahs" : "السور"} ({searchResults.surahs.length})
              </h3>
              {searchResults.surahs.length === 0 ? (
                <p className="text-xs text-[var(--muted)]">
                  {isEn ? "No surahs match." : "لا توجد سور مطابقة."}
                </p>
              ) : (
                <div className="space-y-2">
                  {searchResults.surahs.map((s) => (
                    <div
                      key={s.number}
                      className="flex items-center justify-between gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5"
                    >
                      <Link href={`/quran/${s.number}`} className="min-w-0 flex-1">
                        <div className="truncate text-xs font-bold text-[var(--foreground)] hover:text-[var(--primary)]">
                          {s.number}. {isEn ? s.englishName : `سورة ${s.nameAr}`}
                        </div>
                        <div className="text-[11px] text-[var(--muted)]">
                          {s.numberOfAyahs} {isEn ? "verses" : "آية"}
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={() => playSurah(s.number)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white cursor-pointer transition-colors"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lectures Matches */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  {isEn ? "Lectures & Lessons" : "المحاضرات والدروس"} ({searchResults.lectures.length})
                </h3>
                <Link href="/lectures" className="text-[11px] font-semibold text-[var(--primary)] hover:underline">
                  {isEn ? "Library" : "المكتبة"}
                </Link>
              </div>
              {searchResults.lectures.length === 0 ? (
                <p className="text-xs text-[var(--muted)]">
                  {isEn ? "No lectures match." : "لا توجد محاضرات مطابقة."}
                </p>
              ) : (
                <div className="space-y-2">
                  {searchResults.lectures.map((l) => (
                    <Link
                      key={l.id}
                      href={`/lectures/${l.slug}`}
                      className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 hover:border-[var(--primary)]/50"
                    >
                      <div className="truncate text-xs font-bold text-[var(--foreground)]">
                        {isEn ? l.titleEn : l.titleAr}
                      </div>
                      <div className="truncate text-[11px] text-[var(--muted)]">
                        {isEn ? l.speakerEn : l.speakerAr}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Two Main Pillars: Holy Quran & Islamic Lectures */}
      <section className="grid gap-5 md:grid-cols-2">
        <div className="wasl-surface rounded-3xl border border-[var(--border)] p-6 sm:p-7 flex flex-col justify-between gap-5 relative overflow-hidden">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)]">
              <Headphones className="h-4 w-4" />
              {isEn ? "Section 01" : "القسم الأول"}
            </div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              {isEn ? "The Holy Quran" : "القرآن الكريم"}
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {isEn
                ? `Complete dynamic directory of ${snapshot.reciters.length} reciters across MP3Quran & Quran.com, filterable by Riwayah, recitation style (Murattal, Mujawwad, Mu'allim), Arabic alphabet, and available Surahs.`
                : `دليل شامل ومحدّث ديناميكياً لـ ${snapshot.reciters.length} قارئاً من المصادر الموثوقة، مع التصفية حسب الرواية وأسلوب التلاوة والحروف الهجائية وتوافر السور لكل مصحف.`}
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-[var(--muted)]">
              <span className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-1">
                {isEn ? "Murattal:" : "مرتل:"} {styleStats.murattal}
              </span>
              <span className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-1">
                {isEn ? "Mujawwad:" : "مجود:"} {styleStats.mujawwad}
              </span>
              <span className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-1">
                {isEn ? "Teaching:" : "المعلم:"} {styleStats.muallim}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/listen/reciters"
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-95"
            >
              <Users className="h-4 w-4" />
              {isEn ? "Browse All Reciters" : "تصفح جميع القراء"}
              <ArrowIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/quran"
              className="inline-flex items-center gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--primary)]"
            >
              <BookOpen className="h-3.5 w-3.5 text-[var(--primary)]" />
              {isEn ? "Surah Index" : "فهرس السور"}
            </Link>
          </div>
        </div>

        <div className="wasl-surface rounded-3xl border border-[var(--border)] p-6 sm:p-7 flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)]">
              <Library className="h-4 w-4" />
              {isEn ? "Section 02" : "القسم الثاني"}
            </div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              {isEn ? "Islamic Lectures & Lessons" : "المحاضرات والدروس"}
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {isEn
                ? "Verified lectures, book explanations, Tafsir circles, Prophetic Seerah, Aqeedah, Fiqh, and Prophets' stories from IslamHouse and official scholarly archives."
                : "مكتبة علمية موثقة تضم دروس التفسير، العقيدة، السيرة النبوية، قصص الأنبياء، شروح الكتب والمتون، والدروس المنهجية من مصادرها الرسمية."}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {LECTURE_CATEGORIES.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/lectures`}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)] hover:border-[var(--primary)]"
                >
                  {isEn ? cat.nameEn : cat.nameAr}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/lectures"
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-95"
            >
              <Library className="h-4 w-4" />
              {isEn ? "Explore Lectures & Lessons" : "استكشاف المحاضرات والدروس"}
              <ArrowIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/listen/library"
              className="inline-flex items-center gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--primary)]"
            >
              <ListMusic className="h-3.5 w-3.5 text-[var(--primary)]" />
              {isEn ? "My Listening Library" : "مكتبتي الصوتية"}
            </Link>
          </div>
        </div>
      </section>

      {/* Continue Listening & Recently Played & Personal Library Summary */}
      {(savedPosition || history.length > 0 || favoriteReciters.length > 0 || playlists.length > 0) && (
        <section className="grid gap-5 lg:grid-cols-3">
          {/* Continue Listening + Recently Played */}
          <div className="lg:col-span-2 wasl-surface rounded-3xl border border-[var(--border)] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-base font-bold text-[var(--foreground)]">
                  {isEn ? "Continue & Recently Played" : "مواصلة الاستماع وآخر ما استُمع إليه"}
                </h2>
              </div>
              <Link
                href="/listen/library"
                className="text-xs font-semibold text-[var(--primary)] hover:underline"
              >
                {isEn ? "Open Library" : "المكتبة الشخصية"}
              </Link>
            </div>

            {savedPosition && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--primary)]/30 bg-[var(--accent-soft)] p-4">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-semibold text-[var(--primary)]">
                    {isEn ? "Saved Quran Position" : "آخر موضع تلاوة محفوظ"}
                  </div>
                  <div className="text-sm font-bold text-[var(--foreground)]">
                    {(SURAHS.find((s) => s.number === savedPosition.surahNumber)?.nameAr ||
                      `سورة #${savedPosition.surahNumber}`)}{" "}
                    —{" "}
                    {snapshot.reciters.find(
                      (r) => r.slug === savedPosition.reciterSlug
                    )?.[isEn ? "nameEn" : "nameAr"] || savedPosition.reciterSlug}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const matched = snapshot.reciters.find(
                      (r) => r.slug === savedPosition.reciterSlug
                    );
                    const playerReciter = matched
                      ? buildPlayerReciter(
                          matched,
                          matched.moshafs.find(
                            (m) => m.moshafId === savedPosition.moshafId
                          ) || matched.moshafs[0]
                        )
                      : undefined;
                    playSurah(
                      savedPosition.surahNumber,
                      playerReciter,
                      savedPosition.currentTime
                    );
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--primary-foreground)] cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" />
                  {isEn ? "Resume" : "استئناف التلاوة"}
                </button>
              </div>
            )}

            {history.length > 0 && (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {history.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.kind === "quran" && item.surahNumber) {
                        const matched = snapshot.reciters.find(
                          (r) => r.slug === item.reciterSlug
                        );
                        playSurah(
                          item.surahNumber,
                          matched
                            ? buildPlayerReciter(
                                matched,
                                matched.moshafs.find((m) => m.moshafId === item.moshafId) ||
                                  matched.moshafs[0]
                              )
                            : undefined,
                          item.positionSeconds || 0
                        );
                      } else if (item.kind === "lecture" && item.lectureSlug) {
                        const lec = initialLectures.find(
                          (l) => l.slug === item.lectureSlug
                        );
                        const firstAudio =
                          lec?.attachments.find((a) => a.extensionType === "MP3") ||
                          lec?.attachments[0];
                        const url = firstAudio?.url || lec?.mediaUrl;
                        if (lec && url) {
                          playLecture(
                            lec,
                            url,
                            0,
                            firstAudio?.title || item.titleAr,
                            item.positionSeconds || 0
                          );
                        }
                      }
                    }}
                    className="flex items-center justify-between gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3.5 py-2.5 text-start hover:border-[var(--primary)]/50 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-[var(--foreground)]">
                        {isEn ? item.titleEn : item.titleAr}
                      </div>
                      <div className="truncate text-[11px] text-[var(--muted)]">
                        {isEn ? item.subtitleEn : item.subtitleAr}
                      </div>
                    </div>
                    <Play className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Favorites & Playlists Card */}
          <div className="wasl-surface rounded-3xl border border-[var(--border)] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                {isEn ? "Your Favorites" : "مفضلتك وقوائمك"}
              </h2>
              <Link
                href="/listen/library"
                className="text-xs font-semibold text-[var(--primary)] hover:underline"
              >
                {isEn ? "Manage" : "إدارة"}
              </Link>
            </div>

            {favoriteReciters.length === 0 &&
            favoriteLectures.length === 0 &&
            playlists.length === 0 ? (
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {isEn
                  ? "Mark reciters or lectures as favorites and save playlists — no login required."
                  : "أضف القراء أو المحاضرات للمفضلة أو احفظ قوائم تشغيل خاصة بك مباشرة دون حاجة لتسجيل الدخول."}
              </p>
            ) : (
              <div className="space-y-3">
                {favoriteReciters.slice(0, 3).map((r) => (
                  <Link
                    key={r.slug}
                    href={`/listen/reciters/${r.slug}`}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 hover:border-[var(--primary)]/50"
                  >
                    <span className="truncate text-xs font-semibold text-[var(--foreground)]">
                      {isEn ? r.nameEn : r.nameAr}
                    </span>
                    <span className="text-[10px] text-[var(--muted)] shrink-0">
                      {r.moshafs.length} {isEn ? "Mushafs" : "مصحف"}
                    </span>
                  </Link>
                ))}
                {playlists.slice(0, 2).map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => playPlaylist(pl)}
                    className="w-full flex items-center justify-between gap-2 rounded-xl border border-[var(--primary)]/30 bg-[var(--accent-soft)] px-3 py-2 text-start cursor-pointer"
                  >
                    <span className="truncate text-xs font-bold text-[var(--primary)]">
                      {pl.name} ({pl.items.length})
                    </span>
                    <Play className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Curated Listening Collections */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              {isEn ? "Curated Quranic Collections" : "مجموعات قرآنية مختارة"}
            </h2>
            <p className="text-xs text-[var(--muted)]">
              {isEn
                ? "Direct pathways to complete Mushafs, Riwayat, and recitation styles."
                : "مسارات مباشرة للمصاحف الكاملة والروايات المتواترة وأساليب التلاوة."}
            </p>
          </div>
          <Link
            href="/listen/reciters"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline"
          >
            {isEn ? "Explore Full Directory" : "استعراض الدليل الكامل"}
            <ArrowIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CURATED_COLLECTIONS.map((col) => (
            <Link
              key={col.id}
              href={col.href}
              className="group wasl-surface rounded-2xl border border-[var(--border)] p-4 flex flex-col justify-between gap-3 hover:border-[var(--primary)] transition-colors"
            >
              <div className="space-y-2">
                <span className="inline-block rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--primary)]">
                  {isEn ? col.badgeEn : col.badgeAr}
                </span>
                <h3 className="text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                  {isEn ? col.titleEn : col.titleAr}
                </h3>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  {isEn ? col.descEn : col.descAr}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--primary)]">
                {isEn ? "Open collection" : "تصفح المجموعة"}
                <ArrowIcon className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Surah Explorer + Complete Reciters Preview */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              {isEn ? "Complete Quran Reciters Preview" : "نماذج من قراء المصحف الكامل"}
            </h2>
            <p className="text-xs text-[var(--muted)]">
              {isEn
                ? "Select any Surah below and press play on a reciter, or open their full Mushaf profile."
                : "اختر أي سورة للتشغيل المباشر أو ادخل إلى صفحة القارئ لتصفح مصاحفه الـ 114."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="quick-surah-select" className="text-xs font-semibold text-[var(--muted)]">
              {isEn ? "Quick Surah:" : "سورة سريعة:"}
            </label>
            <select
              id="quick-surah-select"
              value={quickSurah}
              onChange={(e) => setQuickSurah(Number(e.target.value))}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]"
            >
              {SURAHS.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {isEn ? s.englishName : s.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredReciters.map((r) => {
            const liked = listeningPrefs.favoriteReciterSlugs.includes(r.slug);
            const firstVariant = r.moshafs[0];
            return (
              <div
                key={r.slug}
                className="wasl-surface rounded-2xl border border-[var(--border)] p-4 flex flex-col justify-between gap-3 hover:border-[var(--primary)]/50 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/listen/reciters/${r.slug}`} className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-[var(--foreground)] hover:text-[var(--primary)] line-clamp-1">
                        {isEn ? r.nameEn : r.nameAr}
                      </h3>
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleFavoriteReciter(r.slug)}
                      aria-label={isEn ? "Favorite Reciter" : "تفضيل القارئ"}
                      className={`p-1 rounded-lg cursor-pointer ${
                        liked ? "text-rose-500" : "text-[var(--muted)] hover:text-rose-500"
                      }`}
                    >
                      <Heart className="h-3.5 w-3.5" fill={liked ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <p className="text-[11px] text-[var(--primary)] font-medium line-clamp-1">
                    {isEn ? firstVariant?.rewayahEn : firstVariant?.rewayahAr}
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">
                    {r.moshafs.length} {isEn ? "Mushaf variant(s)" : "مصحفاً متاحاً"} •{" "}
                    {firstVariant?.surahTotal} {isEn ? "surahs" : "سورة"}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handlePlayCatalogReciter(r, quickSurah)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-[var(--primary-foreground)] hover:opacity-95 cursor-pointer"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    {isEn ? "Listen" : "استماع"}
                  </button>
                  <Link
                    href={`/listen/reciters/${r.slug}`}
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--primary)]"
                  >
                    {isEn ? "Profile" : "المصاحف"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-2">
          <Link
            href="/listen/reciters"
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--primary)] bg-[var(--accent-soft)] px-6 py-3 text-sm font-bold text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors"
          >
            <Users className="h-4 w-4" />
            {isEn
              ? `View All ${snapshot.reciters.length} Dynamic Reciters`
              : `عرض جميع القراء (${snapshot.reciters.length} قارئاً)`}
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Verified Audio Lectures Showcase */}
      {audioLectures.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                {isEn ? "Recently Added Verified Lectures" : "مختارات من المحاضرات الصوتية الموثقة"}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                {isEn
                  ? "Direct audio streams from verified Islamic scholarly libraries."
                  : "دروس وسلاسل صوتية مباشرة من مصادرها العلمية الموثقة."}
              </p>
            </div>
            <Link
              href="/lectures"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              {isEn ? "All Lectures" : "مكتبة المحاضرات الكاملة"}
              <ArrowIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {audioLectures.map((lecture) => {
              const cat = categoryMap.get(lecture.categoryId);
              const firstAudio =
                lecture.attachments.find((a) => a.extensionType === "MP3") ||
                lecture.attachments[0];
              const audioUrl = firstAudio?.url || lecture.mediaUrl;
              return (
                <article
                  key={lecture.id}
                  className="wasl-surface rounded-2xl border border-[var(--border)] p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-[10px]">
                      <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 font-semibold text-[var(--primary)]">
                        {cat ? (isEn ? cat.nameEn : cat.nameAr) : lecture.categoryId}
                      </span>
                      <span className="text-[var(--muted)] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lecture.attachments.length} {isEn ? "part(s)" : "مقطع"}
                      </span>
                    </div>
                    <Link href={`/lectures/${lecture.slug}`}>
                      <h3 className="text-sm font-bold text-[var(--foreground)] hover:text-[var(--primary)] line-clamp-2">
                        {isEn ? lecture.titleEn : lecture.titleAr}
                      </h3>
                    </Link>
                    <p className="text-xs font-medium text-[var(--primary)]">
                      {isEn ? lecture.speakerEn : lecture.speakerAr}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {audioUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          playLecture(lecture, audioUrl, 0, firstAudio?.title)
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-foreground)] cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5" />
                        {isEn ? "Listen" : "استماع"}
                      </button>
                    )}
                    <Link
                      href={`/lectures/${lecture.slug}`}
                      className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--primary)]"
                    >
                      {isEn ? "Details" : "التفاصيل"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

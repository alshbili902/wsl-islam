"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Headphones,
  Heart,
  History,
  ListMusic,
  Play,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useAudio } from "@/components/providers/AudioProvider";
import { useWasl } from "@/components/providers/WaslProvider";
import { SURAHS } from "@/data/surahs";
import {
  RECITATION_STYLE_OPTIONS,
  buildPlayerReciter,
} from "@/lib/audio/clientCatalog";
import type {
  LectureItem,
  RecitationStyleId,
  ReciterCatalogSnapshot,
} from "@/types/islamic";

function formatDurationSeconds(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function ListeningLibraryClient({
  snapshot,
  lectures,
}: {
  snapshot: ReciterCatalogSnapshot;
  lectures: LectureItem[];
}) {
  const { locale } = useWasl();
  const isEn = locale === "en";

  const {
    playSurah,
    playLecture,
    savedPosition,
    history,
    removeHistoryEntry,
    clearHistory,
    listeningPrefs,
    toggleFavoriteReciter,
    toggleFavoriteSurah,
    toggleFavoriteLecture,
    setPreferredRiwayah,
    setPreferredStyle,
    playlists,
    createPlaylist,
    deletePlaylist,
    removePlaylistItem,
    playPlaylist,
  } = useAudio();

  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(null);

  const reciterMap = useMemo(() => {
    const map = new Map(snapshot.reciters.map((r) => [r.slug, r]));
    return map;
  }, [snapshot.reciters]);

  const favoriteReciters = useMemo(() => {
    return listeningPrefs.favoriteReciterSlugs
      .map((slug) => reciterMap.get(slug))
      .filter((r): r is NonNullable<typeof r> => Boolean(r));
  }, [listeningPrefs.favoriteReciterSlugs, reciterMap]);

  const favoriteLectures = useMemo(() => {
    const map = new Map(lectures.map((l) => [l.id, l]));
    return listeningPrefs.favoriteLectureIds
      .map((id) => map.get(id))
      .filter((l): l is NonNullable<typeof l> => Boolean(l));
  }, [lectures, listeningPrefs.favoriteLectureIds]);

  const handleCreateEmptyPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName.trim(), []);
    setNewPlaylistName("");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      <Breadcrumbs
        items={[
          { labelAr: "مركز الاستماع", labelEn: "Listening Center", href: "/listen" },
          { labelAr: "مكتبة الاستماع الشخصية", labelEn: "Listening Library" },
        ]}
      />

      {/* Header */}
      <header className="wasl-surface rounded-3xl border border-[var(--border)] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
            <Bookmark className="h-3.5 w-3.5" />
            {isEn ? "Saved Automatically on Your Device" : "محفوظة تلقائياً على جهازك دون تسجيل"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
            {isEn ? "Personal Listening Library" : "مكتبة الاستماع الشخصية"}
          </h1>
          <p className="text-sm text-[var(--muted)] max-w-2xl">
            {isEn
              ? "Manage favorite reciters, favorite Surahs, saved lectures, custom audio playlists, and resume listening history."
              : "إدارة القراء المفضلين، السور والمحاضرات المحفوظة، قوائم التشغيل المخصصة، وسجل الاستماع واستئناف التلاوة."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/listen/reciters"
            className="rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--primary-foreground)] hover:opacity-95"
          >
            {isEn ? "Browse Reciters" : "استعراض القراء"}
          </Link>
          <Link
            href="/lectures"
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--primary)]"
          >
            {isEn ? "Lectures Library" : "مكتبة المحاضرات"}
          </Link>
        </div>
      </header>

      {/* Listening Preferences Bar */}
      <section className="wasl-surface rounded-3xl border border-[var(--border)] p-5 grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="pref-riwayah"
            className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5"
          >
            <Star className="h-3.5 w-3.5 text-amber-500" />
            {isEn ? "Preferred Quranic Riwayah:" : "الرواية القرآنية المفضلة:"}
          </label>
          <select
            id="pref-riwayah"
            value={listeningPrefs.preferredRiwayahId ?? ""}
            onChange={(e) =>
              setPreferredRiwayah(e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--foreground)]"
          >
            <option value="">{isEn ? "No preference" : "بدون تفضيل محدد"}</option>
            {snapshot.riwayat.map((rw) => (
              <option key={rw.id} value={rw.id}>
                {isEn ? rw.nameEn : rw.nameAr}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="pref-style"
            className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5"
          >
            <Headphones className="h-3.5 w-3.5 text-[var(--primary)]" />
            {isEn ? "Preferred Recitation Style:" : "أسلوب التلاوة المفضل:"}
          </label>
          <select
            id="pref-style"
            value={listeningPrefs.preferredStyleId ?? "all"}
            onChange={(e) =>
              setPreferredStyle(
                e.target.value === "all"
                  ? undefined
                  : (e.target.value as RecitationStyleId)
              )
            }
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--foreground)]"
          >
            {RECITATION_STYLE_OPTIONS.map((st) => (
              <option key={st.id} value={st.id}>
                {isEn ? st.labelEn : st.labelAr}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Favorite Reciters */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
          <Heart className="h-4 w-4 text-rose-500" />
          {isEn
            ? `Favorite Reciters (${favoriteReciters.length})`
            : `القراء المفضلون (${favoriteReciters.length})`}
        </h2>

        {favoriteReciters.length === 0 ? (
          <div className="wasl-surface rounded-2xl border border-[var(--border)] p-6 text-xs text-[var(--muted)]">
            {isEn
              ? "No favorite reciters yet. Tap the heart icon on any reciter card to save them here."
              : "لا يوجد قراء في المفضلة بعد. اضغط على أيقونة القلب بجانب أي قارئ لحفظه هنا."}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteReciters.map((r) => (
              <div
                key={r.slug}
                className="wasl-surface rounded-2xl border border-[var(--border)] p-4 flex items-center justify-between gap-3"
              >
                <Link href={`/listen/reciters/${r.slug}`} className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-[var(--foreground)] hover:text-[var(--primary)]">
                    {isEn ? r.nameEn : r.nameAr}
                  </div>
                  <div className="truncate text-[11px] text-[var(--muted)]">
                    {r.moshafs[0]?.rewayahAr} • {r.moshafs.length}{" "}
                    {isEn ? "Mushafs" : "مصحف"}
                  </div>
                </Link>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      playSurah(
                        r.moshafs[0]?.availableSurahs[0] || 1,
                        buildPlayerReciter(r, r.moshafs[0])
                      )
                    }
                    className="rounded-xl bg-[var(--primary)] p-2 text-[var(--primary-foreground)] cursor-pointer"
                    aria-label={isEn ? "Play" : "تشغيل"}
                  >
                    <Play className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFavoriteReciter(r.slug)}
                    className="rounded-xl border border-[var(--border)] p-2 text-rose-500 cursor-pointer"
                    aria-label={isEn ? "Remove favorite" : "إزالة من المفضلة"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Favorite Surahs & Favorite Lectures */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            {isEn
              ? `Favorite Surahs (${listeningPrefs.favoriteSurahs.length})`
              : `تلاوات السور المفضلة (${listeningPrefs.favoriteSurahs.length})`}
          </h2>
          {listeningPrefs.favoriteSurahs.length === 0 ? (
            <div className="wasl-surface rounded-2xl border border-[var(--border)] p-5 text-xs text-[var(--muted)]">
              {isEn
                ? "Save your favorite Surah recitations from any reciter page."
                : "احفظ تلاوات السور المفضلة لديك من صفحة أي قارئ لتصل إليها فوراً."}
            </div>
          ) : (
            <div className="space-y-2">
              {listeningPrefs.favoriteSurahs.map((fav) => {
                const surah = SURAHS.find((s) => s.number === fav.surahNumber);
                const rec = reciterMap.get(fav.reciterSlug);
                return (
                  <div
                    key={`${fav.reciterSlug}:${fav.surahNumber}`}
                    className="wasl-surface rounded-2xl border border-[var(--border)] px-4 py-3 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[var(--foreground)] truncate">
                        {surah
                          ? isEn
                            ? `Surah ${surah.englishName}`
                            : `سورة ${surah.nameAr}`
                          : `#${fav.surahNumber}`}
                      </div>
                      <div className="text-[11px] text-[var(--muted)] truncate">
                        {rec ? (isEn ? rec.nameEn : rec.nameAr) : fav.reciterSlug}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          playSurah(
                            fav.surahNumber,
                            rec
                              ? buildPlayerReciter(
                                  rec,
                                  rec.moshafs.find((m) => m.moshafId === fav.moshafId) ||
                                    rec.moshafs[0]
                                )
                              : undefined
                          )
                        }
                        className="rounded-xl bg-[var(--primary)] p-2 text-[var(--primary-foreground)] cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toggleFavoriteSurah(
                            fav.surahNumber,
                            fav.reciterSlug,
                            fav.moshafId
                          )
                        }
                        className="rounded-xl border border-[var(--border)] p-2 text-[var(--muted)] hover:text-rose-500 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            {isEn
              ? `Favorite Lectures (${favoriteLectures.length})`
              : `المحاضرات المفضلة (${favoriteLectures.length})`}
          </h2>
          {favoriteLectures.length === 0 ? (
            <div className="wasl-surface rounded-2xl border border-[var(--border)] p-5 text-xs text-[var(--muted)]">
              {isEn
                ? "Mark verified lectures as favorites inside the Lectures Library."
                : "أضف المحاضرات والدروس التي تود الرجوع إليها من مكتبة المحاضرات."}
            </div>
          ) : (
            <div className="space-y-2">
              {favoriteLectures.map((lec) => {
                const firstAudio =
                  lec.attachments.find((a) => a.extensionType === "MP3") ||
                  lec.attachments[0];
                const audioUrl = firstAudio?.url || lec.mediaUrl;
                return (
                  <div
                    key={lec.id}
                    className="wasl-surface rounded-2xl border border-[var(--border)] px-4 py-3 flex items-center justify-between gap-2"
                  >
                    <Link href={`/lectures/${lec.slug}`} className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[var(--foreground)] hover:text-[var(--primary)] truncate">
                        {isEn ? lec.titleEn : lec.titleAr}
                      </div>
                      <div className="text-[11px] text-[var(--muted)] truncate">
                        {isEn ? lec.speakerEn : lec.speakerAr}
                      </div>
                    </Link>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {lec.mediaType === "audio" && audioUrl && (
                        <button
                          type="button"
                          onClick={() => playLecture(lec, audioUrl, 0, firstAudio?.title)}
                          className="rounded-xl bg-[var(--primary)] p-2 text-[var(--primary-foreground)] cursor-pointer"
                        >
                          <Play className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleFavoriteLecture(lec.id)}
                        className="rounded-xl border border-[var(--border)] p-2 text-[var(--muted)] hover:text-rose-500 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Custom Saved Playlists */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <ListMusic className="h-4 w-4 text-[var(--primary)]" />
            {isEn
              ? `Saved Playlists (${playlists.length})`
              : `قوائم التشغيل المحفوظة (${playlists.length})`}
          </h2>
          <form onSubmit={handleCreateEmptyPlaylist} className="flex items-center gap-2">
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder={
                isEn ? "New playlist name..." : "اسم قائمة تشغيل جديدة..."
              }
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-foreground)] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              {isEn ? "Create" : "إنشاء"}
            </button>
          </form>
        </div>

        {playlists.length === 0 ? (
          <div className="wasl-surface rounded-2xl border border-[var(--border)] p-6 text-xs text-[var(--muted)]">
            {isEn
              ? "Queue tracks in the audio player and save them as a playlist, or create one above."
              : "أضف مقاطع إلى طابور التشغيل في المشغّل المستمر واحفظها كقائمة، أو أنشئ قائمة جديدة أعلاه."}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {playlists.map((pl) => {
              const expanded = expandedPlaylistId === pl.id;
              return (
                <div
                  key={pl.id}
                  className="wasl-surface rounded-2xl border border-[var(--border)] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--foreground)]">
                        {pl.name}
                      </h3>
                      <p className="text-[11px] text-[var(--muted)]">
                        {pl.items.length} {isEn ? "tracks" : "مقطعاً"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {pl.items.length > 0 && (
                        <button
                          type="button"
                          onClick={() => playPlaylist(pl)}
                          className="inline-flex items-center gap-1 rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-foreground)] cursor-pointer"
                        >
                          <Play className="h-3.5 w-3.5" />
                          {isEn ? "Play" : "تشغيل"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPlaylistId(expanded ? null : pl.id)
                        }
                        className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] cursor-pointer"
                      >
                        {expanded
                          ? isEn
                            ? "Hide"
                            : "إخفاء"
                          : isEn
                            ? "Tracks"
                            : "المقاطع"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePlaylist(pl.id)}
                        className="rounded-xl border border-[var(--border)] p-1.5 text-rose-500 cursor-pointer"
                        aria-label={isEn ? "Delete playlist" : "حذف القائمة"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
                      {pl.items.length === 0 ? (
                        <p className="text-[11px] text-[var(--muted)]">
                          {isEn ? "Empty playlist." : "القائمة فارغة حالياً."}
                        </p>
                      ) : (
                        pl.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-2 rounded-xl bg-[var(--card)] px-3 py-1.5 text-xs"
                          >
                            <span className="truncate">
                              {isEn ? item.titleEn : item.titleAr}
                            </span>
                            <button
                              type="button"
                              onClick={() => removePlaylistItem(pl.id, item.id)}
                              className="text-[var(--muted)] hover:text-rose-500 cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Listening History & Continue Listening */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <History className="h-4 w-4 text-[var(--primary)]" />
            {isEn
              ? `Listening History (${history.length})`
              : `سجل الاستماع (${history.length})`}
          </h2>
          {history.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              {isEn ? "Clear History" : "مسح السجل بالكامل"}
            </button>
          )}
        </div>

        {savedPosition && (
          <div className="rounded-2xl border border-[var(--primary)]/30 bg-[var(--accent-soft)] p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold text-[var(--primary)]">
                {isEn ? "Last Saved Quran Position" : "آخر موضع تلاوة متوقف عنده"}
              </div>
              <div className="text-sm font-bold text-[var(--foreground)]">
                {(SURAHS.find((s) => s.number === savedPosition.surahNumber)?.nameAr ||
                  `سورة #${savedPosition.surahNumber}`)}{" "}
                —{" "}
                {reciterMap.get(savedPosition.reciterSlug)?.[
                  isEn ? "nameEn" : "nameAr"
                ] || savedPosition.reciterSlug}{" "}
                ({formatDurationSeconds(savedPosition.currentTime)})
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const rec = savedPosition.reciterSlug
                  ? reciterMap.get(savedPosition.reciterSlug)
                  : undefined;
                playSurah(
                  savedPosition.surahNumber,
                  rec
                    ? buildPlayerReciter(
                        rec,
                        rec.moshafs.find((m) => m.moshafId === savedPosition.moshafId) ||
                          rec.moshafs[0]
                      )
                    : undefined,
                  savedPosition.currentTime
                );
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--primary-foreground)] cursor-pointer"
            >
              <Play className="h-3.5 w-3.5" />
              {isEn ? "Resume Listening" : "متابعة الاستماع"}
            </button>
          </div>
        )}

        {history.length === 0 ? (
          <div className="wasl-surface rounded-2xl border border-[var(--border)] p-6 text-xs text-[var(--muted)]">
            {isEn
              ? "Your recent Surahs and lectures will appear here automatically."
              : "سيظهر سجل السور والمحاضرات التي تستمع إليها هنا تلقائياً لسهولة المتابعة."}
          </div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="wasl-surface rounded-2xl border border-[var(--border)] p-3.5 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold text-[var(--foreground)]">
                    {isEn ? item.titleEn : item.titleAr}
                  </div>
                  <div className="truncate text-[11px] text-[var(--muted)]">
                    {isEn ? item.subtitleEn : item.subtitleAr}
                    {typeof item.positionSeconds === "number"
                      ? ` • ${formatDurationSeconds(item.positionSeconds)}`
                      : ""}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (item.kind === "quran" && item.surahNumber) {
                        const rec = item.reciterSlug
                          ? reciterMap.get(item.reciterSlug)
                          : undefined;
                        playSurah(
                          item.surahNumber,
                          rec
                            ? buildPlayerReciter(
                                rec,
                                rec.moshafs.find((m) => m.moshafId === item.moshafId) ||
                                  rec.moshafs[0]
                              )
                            : undefined,
                          item.positionSeconds || 0
                        );
                      } else if (item.kind === "lecture" && item.lectureSlug) {
                        const lec = lectures.find(
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
                    className="rounded-xl bg-[var(--primary)] p-2 text-[var(--primary-foreground)] cursor-pointer"
                    aria-label={isEn ? "Resume" : "استئناف"}
                  >
                    <Play className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeHistoryEntry(item.id)}
                    className="rounded-xl border border-[var(--border)] p-2 text-[var(--muted)] hover:text-rose-500 cursor-pointer"
                    aria-label={isEn ? "Remove entry" : "حذف"}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

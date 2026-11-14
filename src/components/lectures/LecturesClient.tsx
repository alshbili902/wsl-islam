"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  ExternalLink,
  Headphones,
  Heart,
  Library,
  ListPlus,
  Play,
  Search,
  Sparkles,
  UserCheck,
  Video,
} from "lucide-react";
import { CURATED_SCHOLARLY_PLATFORMS, LECTURE_CATEGORIES } from "@/data/lectures";
import { useAudio } from "@/components/providers/AudioProvider";
import { useWasl } from "@/components/providers/WaslProvider";
import { WaslShare } from "@/components/share/WaslShare";
import { matchesNormalizedQuery } from "@/lib/audio/normalize";
import type { LectureCategoryId, LectureItem } from "@/types/islamic";

const LECTURE_QUEUE_KEY = "wasl_lecture_queue_v1";
const FAVORITE_SPEAKERS_KEY = "wasl_favorite_speakers_v1";
const LAST_LECTURE_KEY = "wasl_last_lecture_v1";

interface LastLectureRecord {
  id: string;
  slug: string;
  titleAr: string;
  speakerAr: string;
  partIndex: number;
  mediaType: "audio" | "video" | "external";
}

export function LecturesClient({
  initialLectures,
}: {
  initialLectures: LectureItem[];
}) {
  const { locale, isBookmarked, toggleBookmark } = useWasl();
  const {
    playLecture,
    addToQueue,
    toggleFavoriteLecture,
    listeningPrefs,
  } = useAudio();
  const isEn = locale === "en";

  const [lectures] = useState<LectureItem[]>(initialLectures);
  const [selectedCategory, setSelectedCategory] = useState<LectureCategoryId | "all">("all");
  const [mediaFilter, setMediaFilter] = useState<"all" | "audio" | "video" | "external">("all");
  const [langFilter, setLangFilter] = useState<"all" | "ar" | "en">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [queueIds, setQueueIds] = useState<string[]>([]);
  const [favoriteSpeakers, setFavoriteSpeakers] = useState<string[]>([]);
  const [onlyQueue, setOnlyQueue] = useState(false);
  const [lastLecture, setLastLecture] = useState<LastLectureRecord | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const rawQueue = window.localStorage.getItem(LECTURE_QUEUE_KEY);
        if (rawQueue) setQueueIds(JSON.parse(rawQueue));
        const rawSpeakers = window.localStorage.getItem(FAVORITE_SPEAKERS_KEY);
        if (rawSpeakers) setFavoriteSpeakers(JSON.parse(rawSpeakers));
        const rawLast = window.localStorage.getItem(LAST_LECTURE_KEY);
        if (rawLast) setLastLecture(JSON.parse(rawLast));
      } catch {
        // ignore storage parse error
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const toggleQueue = (lecture: LectureItem) => {
    const id = lecture.id;
    const isAdding = !queueIds.includes(id);
    const next = isAdding
      ? [id, ...queueIds]
      : queueIds.filter((item) => item !== id);
    setQueueIds(next);
    try {
      window.localStorage.setItem(LECTURE_QUEUE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    if (isAdding && lecture.mediaType === "audio") {
      const audioAttachment =
        lecture.attachments.find((a) => a.extensionType === "MP3") ||
        lecture.attachments[0];
      const url = audioAttachment?.url || lecture.mediaUrl;
      if (url) {
        addToQueue({
          id: `lecture:${lecture.id}:0`,
          kind: "lecture",
          titleAr: audioAttachment?.title || lecture.titleAr,
          titleEn: audioAttachment?.title || lecture.titleEn,
          subtitleAr: lecture.speakerAr,
          subtitleEn: lecture.speakerEn,
          audioUrl: url,
          lecture,
          attachmentIndex: 0,
          attachmentTitle: audioAttachment?.title,
        });
      }
    }
  };

  const toggleFavoriteSpeaker = (speaker: string) => {
    const next = favoriteSpeakers.includes(speaker)
      ? favoriteSpeakers.filter((s) => s !== speaker)
      : [speaker, ...favoriteSpeakers];
    setFavoriteSpeakers(next);
    try {
      window.localStorage.setItem(FAVORITE_SPEAKERS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const filteredLectures = useMemo(() => {
    const q = searchQuery.trim();
    return lectures.filter((item) => {
      if (selectedCategory !== "all" && item.categoryId !== selectedCategory) return false;
      if (mediaFilter !== "all" && item.mediaType !== mediaFilter) return false;
      if (langFilter !== "all" && item.language !== langFilter) return false;
      if (onlyQueue && !queueIds.includes(item.id)) return false;
      if (q) {
        const hay = `${item.titleAr} ${item.titleEn} ${item.speakerAr} ${item.speakerEn} ${item.descriptionAr} ${item.descriptionEn} ${item.sourceNameAr}`;
        if (!matchesNormalizedQuery(hay, q)) return false;
      }
      return true;
    });
  }, [lectures, selectedCategory, mediaFilter, langFilter, onlyQueue, queueIds, searchQuery]);

  const handlePlayAudio = (lecture: LectureItem) => {
    const audioAttachment =
      lecture.attachments.find((a) => a.extensionType === "MP3") ||
      lecture.attachments[0];
    const url = audioAttachment?.url || lecture.mediaUrl;
    if (!url || lecture.mediaType !== "audio") return;

    playLecture(lecture, url, 0, audioAttachment?.title);
    const record: LastLectureRecord = {
      id: lecture.id,
      slug: lecture.slug,
      titleAr: lecture.titleAr,
      speakerAr: lecture.speakerAr,
      partIndex: 0,
      mediaType: lecture.mediaType,
    };
    setLastLecture(record);
    try {
      window.localStorage.setItem(LAST_LECTURE_KEY, JSON.stringify(record));
    } catch {
      // ignore
    }
  };

  const categoryMap = useMemo(() => {
    const map = new Map<string, (typeof LECTURE_CATEGORIES)[number]>();
    for (const c of LECTURE_CATEGORIES) map.set(c.id, c);
    return map;
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header */}
      <section className="wasl-surface rounded-3xl p-6 sm:p-8 border border-[var(--border)] space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
              <Library className="h-3.5 w-3.5" />
              {isEn
                ? "Verified Islamic Lectures & Lessons"
                : "مكتبة المحاضرات والدروس العلمية الموثقة"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              {isEn
                ? "Authentic Islamic Lectures & Educational Library"
                : "مكتبة المحاضرات والدروس الإسلامية"}
            </h1>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {isEn
                ? "Curated real audio and video lessons sourced directly from IslamHouse and official scholarly archives, with verified speaker attribution and zero fabricated metadata."
                : "محاضرات صوتية ومرئية ودروس علمية حقيقية من مكتبة إسلام هاوس والمنصات الشرعية الرسمية الموثوقة، مع حفظ التوثيق الكامل واسم الشيخ والمصدر."}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link
                href="/listen"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3.5 py-1.5 text-xs font-semibold text-[var(--primary-foreground)] hover:opacity-95"
              >
                <Headphones className="h-3.5 w-3.5" />
                {isEn ? "Listening Center" : "مركز الاستماع"}
              </Link>
              <Link
                href="/listen/library"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3.5 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--primary)]"
              >
                {isEn ? "My Audio Library" : "مكتبة الاستماع الشخصية"}
              </Link>
            </div>
          </div>

          {lastLecture && (
            <Link
              href={`/lectures/${lastLecture.slug}`}
              className="rounded-2xl border border-[var(--primary)]/30 bg-[var(--accent-soft)] p-3.5 max-w-xs space-y-1 hover:opacity-95"
            >
              <span className="text-[11px] font-semibold text-[var(--primary)] block">
                {isEn ? "Continue Last Lesson" : "متابعة آخر درس"}
              </span>
              <p className="text-xs font-bold text-[var(--foreground)] line-clamp-1">
                {lastLecture.titleAr}
              </p>
              <p className="text-[11px] text-[var(--muted)] line-clamp-1">
                {lastLecture.speakerAr}
              </p>
            </Link>
          )}
        </div>

        {/* Search & Filters */}
        <div className="grid gap-3 md:grid-cols-12">
          <div className="md:col-span-5 relative">
            <Search className="h-4 w-4 text-[var(--muted)] absolute top-1/2 -translate-y-1/2 start-3.5" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isEn
                  ? "Search by lecture title, topic, or scholar..."
                  : "ابحث بعنوان الدرس أو اسم الشيخ أو الموضوع..."
              }
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] py-2.5 ps-10 pe-4 text-sm text-[var(--foreground)]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={mediaFilter}
              onChange={(e) =>
                setMediaFilter(e.target.value as "all" | "audio" | "video" | "external")
              }
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--foreground)]"
            >
              <option value="all">{isEn ? "All Formats" : "جميع الصيغ"}</option>
              <option value="audio">{isEn ? "Audio MP3" : "دروس صوتية (MP3)"}</option>
              <option value="video">{isEn ? "Video MP4" : "مرئيات (MP4)"}</option>
              <option value="external">
                {isEn ? "Official External Archives" : "روابط أرشيفات رسمية"}
              </option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value as "all" | "ar" | "en")}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--foreground)]"
            >
              <option value="all">{isEn ? "All Languages" : "كل اللغات"}</option>
              <option value="ar">{isEn ? "Arabic" : "العربية"}</option>
              <option value="en">{isEn ? "English" : "الإنجليزية"}</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => setOnlyQueue((v) => !v)}
              className={`w-full rounded-2xl border px-3 py-2.5 text-xs font-semibold cursor-pointer transition-colors ${
                onlyQueue
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                  : "bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]"
              }`}
            >
              {isEn
                ? `Listen Later (${queueIds.length})`
                : `قائمتي (${queueIds.length})`}
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
              selectedCategory === "all"
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]"
            }`}
          >
            {isEn ? "All Categories" : "جميع الأقسام"}
          </button>
          {LECTURE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                selectedCategory === cat.id
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]"
              }`}
            >
              {isEn ? cat.nameEn : cat.nameAr}
            </button>
          ))}
        </div>

        {favoriteSpeakers.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-[var(--muted)] flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5 text-[var(--primary)]" />
              {isEn ? "Favorite Scholars:" : "الشيوخ المفضلون:"}
            </span>
            {favoriteSpeakers.map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => setSearchQuery(sp)}
                className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--primary)] cursor-pointer hover:opacity-85"
              >
                {sp}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Lecture Cards Grid */}
      {filteredLectures.length === 0 ? (
        <div className="wasl-surface rounded-3xl p-10 text-center border border-[var(--border)] space-y-2">
          <p className="font-bold text-[var(--foreground)]">
            {isEn ? "No matching lectures found" : "لا توجد محاضرات مطابقة لبحثك حالياً"}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {isEn
              ? "Try clearing category or format filters."
              : "جرّب إزالة بعض الفلاتر أو البحث باسم عام آخر."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredLectures.map((lecture) => {
            const cat = categoryMap.get(lecture.categoryId);
            const speaker = isEn ? lecture.speakerEn : lecture.speakerAr;
            const title = isEn ? lecture.titleEn : lecture.titleAr;
            const bookmarked = isBookmarked(`lecture-${lecture.id}`);
            const inQueue = queueIds.includes(lecture.id);
            const speakerLiked = favoriteSpeakers.includes(speaker);

            return (
              <article
                key={lecture.id}
                className="wasl-surface rounded-3xl border border-[var(--border)] p-5 flex flex-col justify-between gap-4 hover:border-[var(--primary)]/50 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 font-semibold text-[var(--primary)]">
                      {cat ? (isEn ? cat.nameEn : cat.nameAr) : lecture.categoryId}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--card)] px-2.5 py-0.5 font-medium text-[var(--muted)]">
                      {lecture.mediaType === "audio" ? (
                        <Headphones className="h-3 w-3 text-[var(--primary)]" />
                      ) : lecture.mediaType === "video" ? (
                        <Video className="h-3 w-3 text-[var(--primary)]" />
                      ) : (
                        <ExternalLink className="h-3 w-3 text-[var(--primary)]" />
                      )}
                      {lecture.mediaType === "audio"
                        ? isEn
                          ? "Audio"
                          : "صوتي"
                        : lecture.mediaType === "video"
                          ? isEn
                            ? "Video"
                            : "مرئي"
                          : isEn
                            ? "Archive"
                            : "أرشيف رسمي"}
                    </span>
                  </div>

                  <Link href={`/lectures/${lecture.slug}`} className="block group">
                    <h2 className="text-base font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors line-clamp-2 leading-snug">
                      {title}
                    </h2>
                  </Link>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--primary)] line-clamp-1">
                      {speaker}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleFavoriteSpeaker(speaker)}
                      title={isEn ? "Favorite Scholar" : "تفضيل المحاضر"}
                      className={`p-1 rounded-lg cursor-pointer ${
                        speakerLiked
                          ? "text-rose-500"
                          : "text-[var(--muted)] hover:text-rose-500"
                      }`}
                    >
                      <Heart
                        className="h-3.5 w-3.5"
                        fill={speakerLiked ? "currentColor" : "none"}
                      />
                    </button>
                  </div>

                  <p className="text-xs text-[var(--muted)] line-clamp-3 leading-relaxed">
                    {isEn ? lecture.descriptionEn : lecture.descriptionAr}
                  </p>

                  {lecture.attachments.length > 1 && (
                    <p className="text-[11px] font-medium text-[var(--foreground)]/80">
                      {isEn
                        ? `${lecture.attachments.length} verified parts/files`
                        : `${lecture.attachments.length} مقاطع / مرفقات موثقة`}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {lecture.mediaType === "audio" ? (
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(lecture)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-foreground)] hover:opacity-95 cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5" />
                        {isEn ? "Listen" : "استماع"}
                      </button>
                    ) : (
                      <Link
                        href={`/lectures/${lecture.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-foreground)] hover:opacity-95"
                      >
                        <Play className="h-3.5 w-3.5" />
                        {lecture.mediaType === "video"
                          ? isEn
                            ? "Watch"
                            : "مشاهدة"
                          : isEn
                            ? "Open Lesson"
                            : "فتح الدرس"}
                      </Link>
                    )}

                    <Link
                      href={`/lectures/${lecture.slug}`}
                      className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--primary)]"
                    >
                      {isEn ? "Details" : "التفاصيل"}
                    </Link>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleQueue(lecture)}
                      title={isEn ? "Add to Listening Queue" : "إضافة لقائمة الاستماع"}
                      className={`p-1.5 rounded-xl border cursor-pointer ${
                        inQueue
                          ? "border-[var(--primary)] bg-[var(--accent-soft)] text-[var(--primary)]"
                          : "border-[var(--border)] text-[var(--muted)]"
                      }`}
                    >
                      <ListPlus className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleFavoriteLecture(lecture.id)}
                      title={isEn ? "Favorite Lesson" : "تفضيل الدرس في مركز الاستماع"}
                      className={`p-1.5 rounded-xl border cursor-pointer ${
                        listeningPrefs.favoriteLectureIds.includes(lecture.id)
                          ? "border-rose-500/40 bg-rose-500/10 text-rose-500"
                          : "border-[var(--border)] text-[var(--muted)] hover:text-rose-500"
                      }`}
                    >
                      <Heart
                        className="h-3.5 w-3.5"
                        fill={
                          listeningPrefs.favoriteLectureIds.includes(lecture.id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleBookmark({
                          id: `lecture-${lecture.id}`,
                          type: "lecture",
                          titleAr: lecture.titleAr,
                          titleEn: lecture.titleEn,
                          arabicText: lecture.descriptionAr,
                          englishText: lecture.descriptionEn,
                          referenceAr: `${lecture.sourceNameAr} — ${lecture.speakerAr}`,
                          referenceEn: `${lecture.sourceNameEn} — ${lecture.speakerEn}`,
                          url: `/lectures/${lecture.slug}`,
                        })
                      }
                      title={isEn ? "Bookmark Lecture" : "حفظ المحاضرة"}
                      className={`p-1.5 rounded-xl border cursor-pointer ${
                        bookmarked
                          ? "border-[var(--primary)] bg-[var(--accent-soft)] text-[var(--primary)]"
                          : "border-[var(--border)] text-[var(--muted)]"
                      }`}
                    >
                      <Bookmark
                        className="h-3.5 w-3.5"
                        fill={bookmarked ? "currentColor" : "none"}
                      />
                    </button>

                    <WaslShare
                      variant="icon"
                      payload={{
                        kind: "lecture",
                        titleAr: lecture.titleAr,
                        titleEn: lecture.titleEn,
                        arabicText: lecture.titleAr,
                        englishText: lecture.descriptionEn,
                        referenceAr: `${lecture.sourceNameAr} — ${lecture.speakerAr}`,
                        referenceEn: `${lecture.sourceNameEn} — ${lecture.speakerEn}`,
                        sourceAr: lecture.sourceNameAr,
                        sourceEn: lecture.sourceNameEn,
                        shareUrl: `/lectures/${lecture.slug}`,
                      }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Curated Official Platforms Strip */}
      <section className="wasl-surface rounded-3xl p-6 border border-[var(--border)] space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--gold)]" />
          <h2 className="text-base font-bold text-[var(--foreground)]">
            {isEn
              ? "Official Scholarly Archives & Trusted Institutions"
              : "المنصات والمؤسسات العلمية الموثوقة"}
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CURATED_SCHOLARLY_PLATFORMS.map((platform) => (
            <a
              key={platform.id}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 p-4 space-y-1.5 hover:border-[var(--primary)] transition-colors block"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[var(--foreground)]">
                  {isEn ? platform.nameEn : platform.nameAr}
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" />
              </div>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                {isEn ? platform.descriptionEn : platform.descriptionAr}
              </p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

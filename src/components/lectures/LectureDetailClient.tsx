"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  ExternalLink,
  FileText,
  Headphones,
  Heart,
  ListPlus,
  Play,
  ShieldCheck,
  Video,
} from "lucide-react";
import { LECTURE_CATEGORIES } from "@/data/lectures";
import { useAudio } from "@/components/providers/AudioProvider";
import { useWasl } from "@/components/providers/WaslProvider";
import { WaslShare } from "@/components/share/WaslShare";
import type { LectureItem } from "@/types/islamic";

const VIDEO_RESUME_PREFIX = "wasl_lecture_video_pos_";

export function LectureDetailClient({
  lecture,
  related,
}: {
  lecture: LectureItem;
  related: LectureItem[];
}) {
  const { locale, isBookmarked, toggleBookmark } = useWasl();
  const {
    playLecture,
    addToQueue,
    toggleFavoriteLecture,
    listeningPrefs,
  } = useAudio();
  const isEn = locale === "en";
  const isFavLecture = listeningPrefs.favoriteLectureIds.includes(lecture.id);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [selectedPart, setSelectedPart] = useState(0);
  const [videoSpeed, setVideoSpeed] = useState(1);

  const playableParts = lecture.attachments.filter((a) =>
    ["MP3", "MP4", "M4A", "WEBM"].includes(a.extensionType.toUpperCase())
  );
  const docParts = lecture.attachments.filter(
    (a) => !["MP3", "MP4", "M4A", "WEBM"].includes(a.extensionType.toUpperCase())
  );

  const activeAttachment = playableParts[selectedPart] || lecture.attachments[0];
  const activeUrl = activeAttachment?.url || lecture.mediaUrl;
  const activeIsVideo =
    activeAttachment?.extensionType?.toUpperCase() === "MP4" ||
    activeAttachment?.extensionType?.toUpperCase() === "WEBM" ||
    lecture.mediaType === "video";

  const cat = LECTURE_CATEGORIES.find((c) => c.id === lecture.categoryId);
  const title = isEn ? lecture.titleEn : lecture.titleAr;
  const speaker = isEn ? lecture.speakerEn : lecture.speakerAr;
  const bookmarked = isBookmarked(`lecture-${lecture.id}`);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = videoSpeed;
  }, [videoSpeed]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    try {
      const saved = window.localStorage.getItem(
        `${VIDEO_RESUME_PREFIX}${lecture.id}_${selectedPart}`
      );
      if (saved) {
        const seconds = Number(saved);
        if (Number.isFinite(seconds) && seconds > 5) {
          vid.currentTime = seconds;
        }
      }
    } catch {
      // ignore
    }
  }, [lecture.id, selectedPart]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      <div>
        <Link
          href="/lectures"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
        >
          {isEn ? (
            <ArrowLeft className="h-3.5 w-3.5" />
          ) : (
            <ArrowRight className="h-3.5 w-3.5" />
          )}
          {isEn ? "Back to Lectures Library" : "العودة إلى مكتبة المحاضرات"}
        </Link>
      </div>

      {/* Main Card */}
      <section className="wasl-surface wasl-reading-surface rounded-3xl border border-[var(--border)] p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
            {cat ? (isEn ? cat.nameEn : cat.nameAr) : lecture.categoryId}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => toggleFavoriteLecture(lecture.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                isFavLecture
                  ? "border-rose-500/40 bg-rose-500/10 text-rose-500"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
              }`}
            >
              <Heart
                className="h-3.5 w-3.5"
                fill={isFavLecture ? "currentColor" : "none"}
              />
              {isEn ? "Favorite" : "المفضلة"}
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
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                bookmarked
                  ? "border-[var(--primary)] bg-[var(--accent-soft)] text-[var(--primary)]"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
              }`}
            >
              <Bookmark
                className="h-3.5 w-3.5"
                fill={bookmarked ? "currentColor" : "none"}
              />
              {bookmarked
                ? isEn
                  ? "Saved"
                  : "محفوظ"
                : isEn
                  ? "Save"
                  : "حفظ"}
            </button>

            <WaslShare
              variant="pill"
              label={isEn ? "Share" : "مشاركة"}
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

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] leading-snug">
            {title}
          </h1>
          <p className="text-sm font-semibold text-[var(--primary)]">{speaker}</p>
        </div>

        <p className="wasl-reading-body text-sm sm:text-base text-[var(--foreground)]/90 leading-relaxed">
          {isEn ? lecture.descriptionEn : lecture.descriptionAr}
        </p>

        {/* Playback Section */}
        {lecture.mediaType === "external" ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {isEn
                ? "This verified scholarly series is hosted on its official institutional platform. Open it directly below:"
                : "هذه السلسلة العلمية متاحة على المنصة الرسمية للجهة الموثقة حفاظاً على حقوق البث والتوثيق:"}
            </p>
            <a
              href={lecture.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-xs font-semibold text-[var(--primary-foreground)] hover:opacity-95"
            >
              <ExternalLink className="h-4 w-4" />
              {isEn ? "Open Official Archive" : "الانتقال إلى المصدر الرسمي"}
            </a>
          </div>
        ) : activeIsVideo ? (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-black">
              <video
                ref={videoRef}
                key={activeUrl}
                controls
                playsInline
                preload="metadata"
                className="w-full max-h-[480px]"
                onTimeUpdate={(e) => {
                  const sec = Math.floor(e.currentTarget.currentTime);
                  if (sec % 5 === 0) {
                    try {
                      window.localStorage.setItem(
                        `${VIDEO_RESUME_PREFIX}${lecture.id}_${selectedPart}`,
                        String(sec)
                      );
                    } catch {
                      // ignore
                    }
                  }
                }}
              >
                <source src={activeUrl} type="video/mp4" />
              </video>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 text-[var(--muted)]">
                <Video className="h-3.5 w-3.5 text-[var(--primary)]" />
                {activeAttachment?.title || title}
                {activeAttachment?.sizeLabel ? ` (${activeAttachment.sizeLabel})` : ""}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[var(--muted)] me-1">
                  {isEn ? "Speed:" : "السرعة:"}
                </span>
                {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setVideoSpeed(spd)}
                    className={`rounded-lg px-2 py-1 text-[11px] font-mono border cursor-pointer ${
                      videoSpeed === spd
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                        : "bg-[var(--card)] border-[var(--border)]"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)]">
                <Headphones className="h-4 w-4" />
                {isEn ? "Streaming Verified Audio (MP3)" : "بث صوتي مباشر من المصدر الموثق"}
              </span>
              <p className="text-sm font-bold text-[var(--foreground)]">
                {activeAttachment?.title || title}
              </p>
              {activeAttachment?.sizeLabel && (
                <p className="text-xs text-[var(--muted)]">
                  {isEn ? "File size:" : "حجم الملف:"} {activeAttachment.sizeLabel}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  playLecture(lecture, activeUrl, selectedPart, activeAttachment?.title)
                }
                className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-95 cursor-pointer"
              >
                <Play className="h-4 w-4" />
                {isEn ? "Play in Persistent Player" : "تشغيل في المشغّل المستمر"}
              </button>
              {activeUrl && (
                <button
                  type="button"
                  onClick={() =>
                    addToQueue({
                      id: `lecture:${lecture.id}:${selectedPart}`,
                      kind: "lecture",
                      titleAr: activeAttachment?.title || lecture.titleAr,
                      titleEn: activeAttachment?.title || lecture.titleEn,
                      subtitleAr: lecture.speakerAr,
                      subtitleEn: lecture.speakerEn,
                      audioUrl: activeUrl,
                      lecture,
                      attachmentIndex: selectedPart,
                      attachmentTitle: activeAttachment?.title,
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--primary)] cursor-pointer"
                >
                  <ListPlus className="h-4 w-4 text-[var(--primary)]" />
                  {isEn ? "Add to Queue" : "إضافة للطابور"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Multi-Part Playlist */}
        {playableParts.length > 1 && (
          <div className="space-y-2.5 pt-2">
            <h2 className="text-sm font-bold text-[var(--foreground)]">
              {isEn ? "Lesson Parts & Episodes" : "أجزاء ومقاطع السلسلة"}
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {playableParts.map((part, idx) => (
                <button
                  key={`${part.url}-${idx}`}
                  type="button"
                  onClick={() => {
                    setSelectedPart(idx);
                    if (part.extensionType.toUpperCase() === "MP3") {
                      playLecture(lecture, part.url, idx, part.title);
                    }
                  }}
                  className={`flex items-center justify-between gap-2 rounded-2xl border px-3.5 py-2.5 text-start text-xs cursor-pointer transition-colors ${
                    selectedPart === idx
                      ? "border-[var(--primary)] bg-[var(--accent-soft)] text-[var(--primary)] font-bold"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--primary)]/50"
                  }`}
                >
                  <span className="truncate">
                    {idx + 1}. {part.title}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] opacity-80">
                    {part.sizeLabel || part.extensionType}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Accompanying Verified PDFs / Docs */}
        {docParts.length > 0 && (
          <div className="space-y-2 pt-2">
            <h2 className="text-sm font-bold text-[var(--foreground)]">
              {isEn ? "Accompanying Verified Text / PDF" : "الكتاب أو المرفق النصي المعتمد"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {docParts.map((doc, i) => (
                <a
                  key={`${doc.url}-${i}`}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-semibold hover:border-[var(--primary)]"
                >
                  <FileText className="h-3.5 w-3.5 text-[var(--primary)]" />
                  <span>{doc.title}</span>
                  {doc.sizeLabel && (
                    <span className="text-[10px] text-[var(--muted)]">({doc.sizeLabel})</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Verification & Source Attribution */}
        <div className="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
            <span>
              {isEn ? lecture.referenceEn || lecture.sourceNameEn : lecture.referenceAr || lecture.sourceNameAr}
            </span>
          </div>
          <a
            href={lecture.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[var(--primary)] hover:underline"
          >
            <span>{isEn ? "Verify Original Source" : "التحقق من المصدر الأصلي"}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>

      {/* Related Lectures */}
      {related.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            {isEn ? "Related Verified Lessons" : "دروس ذات صلة"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/lectures/${item.slug}`}
                className="wasl-surface rounded-2xl border border-[var(--border)] p-4 space-y-1.5 hover:border-[var(--primary)]"
              >
                <p className="text-sm font-bold text-[var(--foreground)] line-clamp-2">
                  {isEn ? item.titleEn : item.titleAr}
                </p>
                <p className="text-xs text-[var(--primary)] line-clamp-1">
                  {isEn ? item.speakerEn : item.speakerAr}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

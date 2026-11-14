"use client";

import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  Pause,
  Play,
  Radio,
  Square,
  Volume2,
} from "lucide-react";
import { useWasl } from "@/components/providers/WaslProvider";
import { useAudio } from "@/components/providers/AudioProvider";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageShell } from "@/components/ui/MotionPrimitives";
import { GeometricLattice } from "@/components/brand/IslamicVisuals";
import type { RadioCategory, RadioStation } from "@/types/islamic";

const CATEGORIES: {
  id: "all" | RadioCategory;
  nameAr: string;
  nameEn: string;
}[] = [
  { id: "all", nameAr: "جميع المحطات", nameEn: "All Stations" },
  { id: "official", nameAr: "الإذاعات الرسمية", nameEn: "Official Broadcasts" },
  { id: "quran", nameAr: "القرآن الكريم", nameEn: "Holy Quran" },
  { id: "sunnah", nameAr: "السنة النبوية", nameEn: "Prophetic Sunnah" },
  { id: "tafsir", nameAr: "التفسير", nameEn: "Tafsir" },
  { id: "reciters", nameAr: "محطات القراء", nameEn: "Reciters" },
  { id: "knowledge", nameAr: "الدعوة والمعرفة", nameEn: "Islamic Channels" },
];

export function RadioDirectoryClient({ stations }: { stations: RadioStation[] }) {
  const { locale } = useWasl();
  const {
    track,
    status,
    errorMessage,
    playRadio,
    togglePlayPause,
    stop,
  } = useAudio();

  const [selectedCategory, setSelectedCategory] = useState<"all" | RadioCategory>("all");

  const filteredStations = useMemo(() => {
    if (selectedCategory === "all") return stations;
    return stations.filter((s) => s.category === selectedCategory);
  }, [selectedCategory, stations]);

  const activeRadioStation =
    track?.kind === "radio" ? track.station : null;

  const handleToggleStation = (station: RadioStation) => {
    if (activeRadioStation?.slug === station.slug) {
      if (status === "error") {
        playRadio(station);
      } else {
        togglePlayPause();
      }
      return;
    }
    playRadio(station);
  };

  return (
    <PageShell className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { labelAr: "الإذاعات الإسلامية", labelEn: "Islamic Radio" },
        ]}
      />

      {/* Clean Architectural Radio Header */}
      <section className="wasl-surface relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-6 shadow-sm">
        <GeometricLattice className="opacity-[0.04]" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--wasl-border)] bg-[var(--wasl-bg)]/85 px-3.5 py-1 text-xs font-medium text-[var(--wasl-primary)]">
              <Radio className="h-3.5 w-3.5 text-[var(--wasl-accent)]" />
              <span>
                {locale === "ar"
                  ? "بث صوتي مباشر وموثوق — يعمل في الخلفية أثناء التصفح"
                  : "Verified Live Audio Streams — Persistent Playback Across Pages"}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[var(--wasl-text)] sm:text-4xl">
              {locale === "ar" ? "الإذاعات الإسلامية المباشرة" : "Live Islamic Radio"}
            </h1>
            <p className="text-sm leading-relaxed text-[var(--wasl-text-muted)] max-w-2xl">
              {locale === "ar"
                ? "استمع مباشرة إلى إذاعة القرآن الكريم من المملكة العربية السعودية، وإذاعة السنة النبوية، وبث الحرم المكي، وقنوات الرسالة واقرأ، وتلاوات خاشعة على مدار الساعة."
                : "Listen live to Saudi Quran Radio, Al-Sunnah Al-Nabawiyyah, Makkah Live, Al-Resalah, Iqraa, and continuous Quran recitation broadcasts."}
            </p>
          </div>

          {/* Dedicated Live Stream Deck Status Box */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)]/90 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--wasl-text-muted)]">
                  {locale === "ar" ? "حالة المشغّل الإذاعي" : "Radio Deck Status"}
                </span>
                {activeRadioStation && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      status === "playing"
                        ? "bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)]"
                        : status === "loading"
                          ? "bg-amber-500/15 text-[var(--wasl-accent-strong)]"
                          : status === "error"
                            ? "bg-red-500/15 text-red-500"
                            : "bg-[var(--wasl-surface)] text-[var(--wasl-text-muted)]"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        status === "playing"
                          ? "bg-emerald-500 animate-pulse"
                          : status === "loading"
                            ? "bg-amber-500 animate-ping"
                            : status === "error"
                              ? "bg-red-500"
                              : "bg-[var(--wasl-text-muted)]"
                      }`}
                    />
                    <span>
                      {status === "playing"
                        ? locale === "ar"
                          ? "بث مباشر متصل"
                          : "Live On Air"
                        : status === "loading"
                          ? locale === "ar"
                            ? "جارٍ الاتصال..."
                            : "Connecting..."
                          : status === "error"
                            ? locale === "ar"
                              ? "تعذّر البث"
                              : "Unavailable"
                            : locale === "ar"
                              ? "متوقف مؤقتًا"
                              : "Paused"}
                    </span>
                  </span>
                )}
              </div>

              {activeRadioStation ? (
                <div className="space-y-3">
                  <div>
                    <h2 className="text-base font-bold text-[var(--wasl-text)]">
                      {locale === "ar"
                        ? activeRadioStation.nameAr
                        : activeRadioStation.nameEn}
                    </h2>
                    <p className="text-xs text-[var(--wasl-text-muted)]">
                      {locale === "ar"
                        ? activeRadioStation.sourceOrgAr
                        : activeRadioStation.sourceOrgEn}
                    </p>
                  </div>

                  {status === "error" && errorMessage && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-500">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStation(activeRadioStation)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--wasl-primary)] px-4 py-2.5 text-xs font-bold text-white hover:bg-[var(--wasl-primary-hover)] transition"
                    >
                      {status === "loading" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : status === "playing" ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      <span>
                        {status === "playing"
                          ? locale === "ar"
                            ? "إيقاف مؤقت"
                            : "Pause Stream"
                          : status === "error"
                            ? locale === "ar"
                              ? "إعادة المحاولة"
                              : "Retry Stream"
                            : locale === "ar"
                              ? "استئناف البث"
                              : "Resume Stream"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={stop}
                      aria-label={locale === "ar" ? "إيقاف البث" : "Stop stream"}
                      className="inline-flex items-center justify-center rounded-xl border border-[var(--wasl-border)] px-3.5 py-2.5 text-xs font-semibold text-[var(--wasl-text-muted)] hover:text-[var(--wasl-text)]"
                    >
                      <Square className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 py-2 text-xs text-[var(--wasl-text-muted)]">
                  <Volume2 className="h-5 w-5 text-[var(--wasl-primary)] shrink-0" />
                  <p>
                    {locale === "ar"
                      ? "اختر أي محطة من القائمة أدناه لبدء الاستماع الفوري؛ يستمر الصوت أثناء تنقلك في جميع صفحات المنصة."
                      : "Select any station below to begin listening; playback stays active across every page."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-2xl border px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                active
                  ? "border-[var(--wasl-primary)] bg-[var(--wasl-primary)] text-white"
                  : "border-[var(--wasl-border)] bg-[var(--wasl-surface)] text-[var(--wasl-text)] hover:border-[var(--wasl-primary)]/50"
              }`}
            >
              {locale === "ar" ? cat.nameAr : cat.nameEn}
            </button>
          );
        })}
      </div>

      {/* Stations Grid — Clean Architectural Cards Without Cluttered Thumbnails */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStations.map((station) => {
          const isCurrent = activeRadioStation?.slug === station.slug;
          const isPlaying = isCurrent && status === "playing";
          const isLoading = isCurrent && status === "loading";
          const isError = isCurrent && status === "error";

          return (
            <article
              key={station.slug}
              className={`flex flex-col justify-between rounded-3xl border p-5 sm:p-6 transition ${
                isCurrent
                  ? "border-[var(--wasl-accent)] bg-[var(--wasl-primary)]/[0.06] ring-1 ring-[var(--wasl-accent)]/30 shadow-sm"
                  : "border-[var(--wasl-border)] bg-[var(--wasl-surface)] hover:border-[var(--wasl-primary)]/45"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-[var(--wasl-primary)]/10 px-2.5 py-1 text-[11px] font-bold text-[var(--wasl-primary)]">
                      {station.streamType.toUpperCase()}
                    </span>
                    {station.isFeatured && (
                      <span className="rounded-full bg-[var(--wasl-accent)]/15 px-2.5 py-1 text-[11px] font-semibold text-[var(--wasl-accent-strong)]">
                        {locale === "ar" ? "رسمية" : "Featured"}
                      </span>
                    )}
                  </div>

                  {/* Minimal live indicator bar animation */}
                  {isPlaying && (
                    <div
                      aria-hidden="true"
                      className="flex items-end gap-0.5 h-4 text-[var(--wasl-primary)]"
                    >
                      <span className="w-1 bg-current rounded-full animate-pulse h-2.5" />
                      <span className="w-1 bg-current rounded-full animate-pulse h-4" />
                      <span className="w-1 bg-current rounded-full animate-pulse h-3" />
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[var(--wasl-text)]">
                    {locale === "ar" ? station.nameAr : station.nameEn}
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--wasl-text-muted)]">
                    {locale === "ar" ? station.descriptionAr : station.descriptionEn}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[var(--wasl-border)] flex items-center justify-between gap-3">
                <span className="text-[11px] font-medium text-[var(--wasl-text-muted)] truncate">
                  {locale === "ar" ? station.sourceOrgAr : station.sourceOrgEn}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleStation(station)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                    isPlaying
                      ? "bg-[var(--wasl-accent)] text-[#161914]"
                      : isError
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-[var(--wasl-primary)] text-white hover:bg-[var(--wasl-primary-hover)]"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {isLoading
                      ? locale === "ar"
                        ? "يتصل"
                        : "Connecting"
                      : isPlaying
                        ? locale === "ar"
                          ? "إيقاف"
                          : "Pause"
                        : isError
                          ? locale === "ar"
                            ? "أعد المحاولة"
                            : "Retry"
                          : locale === "ar"
                            ? "تشغيل"
                            : "Listen"}
                  </span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}

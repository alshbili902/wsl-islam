"use client";

import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sparkles,
} from "lucide-react";
import { useWasl } from "@/components/providers/WaslProvider";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageShell, RevealSection } from "@/components/ui/MotionPrimitives";
import { GeometricLattice } from "@/components/brand/IslamicVisuals";
import {
  formatGregorianDate,
  formatHijriDate,
  getHijriParts,
} from "@/lib/prayer/calculator";

const HIJRI_MONTHS = [
  { num: 1, ar: "محرم", en: "Muharram", noteAr: "من الأشهر الحرم — صيام عاشوراء (10 محرم)", noteEn: "Sacred Month — Day of Ashura (10th)" },
  { num: 2, ar: "صفر", en: "Safar", noteAr: "", noteEn: "" },
  { num: 3, ar: "ربيع الأول", en: "Rabi' al-Awwal", noteAr: "", noteEn: "" },
  { num: 4, ar: "ربيع الآخر", en: "Rabi' al-Thani", noteAr: "", noteEn: "" },
  { num: 5, ar: "جمادى الأولى", en: "Jumada al-Ula", noteAr: "", noteEn: "" },
  { num: 6, ar: "جمادى الآخرة", en: "Jumada al-Akhirah", noteAr: "", noteEn: "" },
  { num: 7, ar: "رجب", en: "Rajab", noteAr: "من الأشهر الحرم", noteEn: "Sacred Month" },
  { num: 8, ar: "شعبان", en: "Sha'ban", noteAr: "يُستحب الإكثار من الصيام فيه اتباعاً للسنة", noteEn: "Prophetic Sunnah of frequent voluntary fasting" },
  { num: 9, ar: "رمضان", en: "Ramadan", noteAr: "شهر الصيام والقرآن وليلة القدر", noteEn: "Month of Fasting, Quran & Laylat al-Qadr" },
  { num: 10, ar: "شوال", en: "Shawwal", noteAr: "عيد الفطر (1 شوال) وصيام ست من شوال", noteEn: "Eid al-Fitr (1st) & Six Days of Fasting" },
  { num: 11, ar: "ذو القعدة", en: "Dhu al-Qi'dah", noteAr: "من الأشهر الحرم", noteEn: "Sacred Month" },
  { num: 12, ar: "ذو الحجة", en: "Dhu al-Hijjah", noteAr: "عشر ذي الحجة، يوم عرفة (9) وعيد الأضحى (10)", noteEn: "First 10 Days, Day of Arafah (9th) & Eid al-Adha (10th)" },
];

interface CalendarDayCell {
  isoKey: string;
  gregorianDate: Date;
  hijriDay: number;
  hijriMonth: number;
  hijriYear: number;
  isToday: boolean;
  isFriday: boolean;
  isWhiteDay: boolean;
  gregorianLabel: string;
}

const STATIC_ANCHOR_DATE = new Date("2026-11-14T09:00:00Z");

export function CalendarClient() {
  const { locale, isRtl } = useWasl();
  const [monthOffset, setMonthOffset] = useState(0);
  const [liveNow, setLiveNow] = useState<Date | null>(null);

  React.useEffect(() => {
    const startId = window.setTimeout(() => setLiveNow(new Date()), 0);
    return () => window.clearTimeout(startId);
  }, []);

  const today = useMemo(() => liveNow ?? STATIC_ANCHOR_DATE, [liveNow]);
  const todayHijri = useMemo(() => getHijriParts(today, "Asia/Riyadh"), [today]);

  // Build days for target Hijri month relative to current Hijri month
  const monthView = useMemo(() => {
    const anchorDate = new Date(today.getTime() + monthOffset * 29.53 * 86_400_000);
    const targetParts = getHijriParts(anchorDate, "Asia/Riyadh");

    // Walk backward/forward +-32 days from anchorDate to gather every Gregorian day in targetParts month/year
    const days: CalendarDayCell[] = [];
    const seen = new Set<number>();

    for (let delta = -32; delta <= 32; delta++) {
      const candidate = new Date(anchorDate.getTime() + delta * 86_400_000);
      const hp = getHijriParts(candidate, "Asia/Riyadh");
      if (hp.year === targetParts.year && hp.month === targetParts.month) {
        if (seen.has(hp.day)) continue;
        seen.add(hp.day);

        const isToday =
          hp.year === todayHijri.year &&
          hp.month === todayHijri.month &&
          hp.day === todayHijri.day;

        const gLabel = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
          timeZone: "Asia/Riyadh",
          day: "numeric",
          month: "short",
        }).format(candidate);

        const weekday = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Riyadh",
          weekday: "short",
        }).format(candidate);

        days.push({
          isoKey: candidate.toISOString().slice(0, 10),
          gregorianDate: candidate,
          hijriDay: hp.day,
          hijriMonth: hp.month,
          hijriYear: hp.year,
          isToday,
          isFriday: weekday === "Fri",
          isWhiteDay: hp.day >= 13 && hp.day <= 15,
          gregorianLabel: gLabel,
        });
      }
    }

    days.sort((a, b) => a.hijriDay - b.hijriDay);
    const monthMeta =
      HIJRI_MONTHS.find((m) => m.num === targetParts.month) ?? HIJRI_MONTHS[0];

    return {
      monthMeta,
      hijriYear: targetParts.year,
      days,
    };
  }, [locale, monthOffset, today, todayHijri.day, todayHijri.month, todayHijri.year]);

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <PageShell className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { labelAr: "التقويم الهجري", labelEn: "Islamic Calendar" },
        ]}
      />

      {/* Today Banner */}
      <section className="wasl-surface relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
        <GeometricLattice className="opacity-[0.04]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--wasl-border)] bg-[var(--wasl-bg)]/85 px-3.5 py-1 text-xs font-medium text-[var(--wasl-primary)]">
              <CalendarDays className="h-3.5 w-3.5 text-[var(--wasl-accent)]" />
              <span>
                {locale === "ar"
                  ? "تقويم أم القرى المعتمد"
                  : "Official Umm al-Qura Islamic Calendar"}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-[var(--wasl-text)] sm:text-4xl">
              {locale === "ar" ? "التقويم الهجري والميلادي" : "Hijri & Gregorian Calendar"}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--wasl-text-muted)]">
              <span suppressHydrationWarning className="font-semibold text-[var(--wasl-primary)]">
                {formatHijriDate(today, "Asia/Riyadh", locale)}
              </span>
              <span aria-hidden="true">•</span>
              <span suppressHydrationWarning>
                {formatGregorianDate(today, "Asia/Riyadh", locale)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMonthOffset((m) => m - 1)}
              aria-label={locale === "ar" ? "الشهر السابق" : "Previous Month"}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] hover:border-[var(--wasl-primary)]"
            >
              <PrevIcon className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setMonthOffset(0)}
              className="rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-4 py-2 text-xs font-bold text-[var(--wasl-text)] hover:border-[var(--wasl-primary)]"
            >
              {locale === "ar" ? "الشهر الحالي" : "Current Month"}
            </button>

            <button
              type="button"
              onClick={() => setMonthOffset((m) => m + 1)}
              aria-label={locale === "ar" ? "الشهر التالي" : "Next Month"}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] hover:border-[var(--wasl-primary)]"
            >
              <NextIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Active Hijri Month Grid */}
      <RevealSection className="wasl-surface rounded-3xl p-6 sm:p-8 mb-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--wasl-border)] pb-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--wasl-text)]">
              {locale === "ar"
                ? `${monthView.monthMeta.ar} ${monthView.hijriYear} هـ`
                : `${monthView.monthMeta.en} ${monthView.hijriYear} AH`}
            </h2>
            {(monthView.monthMeta.noteAr || monthView.monthMeta.noteEn) && (
              <p className="mt-1 text-xs font-medium text-[var(--wasl-primary)]">
                {locale === "ar"
                  ? monthView.monthMeta.noteAr
                  : monthView.monthMeta.noteEn}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-[var(--wasl-text-muted)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--wasl-primary)]" />
              <span>{locale === "ar" ? "اليوم" : "Today"}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[var(--wasl-text-muted)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--wasl-accent)]" />
              <span>{locale === "ar" ? "الأيام البيض (13-15)" : "White Days (13–15)"}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
          {monthView.days.map((day) => (
            <div
              key={day.isoKey}
              className={`rounded-2xl border p-3.5 transition ${
                day.isToday
                  ? "border-[var(--wasl-primary)] bg-[var(--wasl-primary)] text-white shadow-sm"
                  : day.isWhiteDay
                    ? "border-[var(--wasl-accent)]/50 bg-[var(--wasl-accent)]/10 text-[var(--wasl-text)]"
                    : "border-[var(--wasl-border)] bg-[var(--wasl-bg)]/60 text-[var(--wasl-text)]"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-xl font-bold">{day.hijriDay}</span>
                {day.isWhiteDay && (
                  <Moon
                    className={`h-3.5 w-3.5 ${
                      day.isToday ? "text-[#F4DDA0]" : "text-[var(--wasl-accent)]"
                    }`}
                  />
                )}
              </div>
              <p
                className={`mt-2 text-[11px] ${
                  day.isToday ? "text-white/85" : "text-[var(--wasl-text-muted)]"
                }`}
              >
                {day.gregorianLabel}
              </p>
              {day.isFriday && (
                <span
                  className={`mt-1 inline-block text-[10px] font-bold ${
                    day.isToday ? "text-[#F4DDA0]" : "text-[var(--wasl-primary)]"
                  }`}
                >
                  {locale === "ar" ? "الجمعة" : "Friday"}
                </span>
              )}
            </div>
          ))}
        </div>
      </RevealSection>

      {/* 12 Hijri Months Reference */}
      <RevealSection className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--wasl-accent)]" />
          <h2 className="text-xl font-bold text-[var(--wasl-text)]">
            {locale === "ar" ? "أشهر السنة الهجرية الاثنا عشر" : "The Twelve Hijri Months"}
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HIJRI_MONTHS.map((m) => (
            <div
              key={m.num}
              className="wasl-surface rounded-2xl p-4 flex items-start gap-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--wasl-primary)]/10 font-mono text-xs font-bold text-[var(--wasl-primary)]">
                {m.num}
              </span>
              <div>
                <h3 className="text-sm font-bold text-[var(--wasl-text)]">
                  {locale === "ar" ? m.ar : m.en}
                </h3>
                {(m.noteAr || m.noteEn) && (
                  <p className="mt-1 text-xs leading-relaxed text-[var(--wasl-text-muted)]">
                    {locale === "ar" ? m.noteAr : m.noteEn}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </RevealSection>
    </PageShell>
  );
}

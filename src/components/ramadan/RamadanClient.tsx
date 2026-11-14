"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarHeart,
  Check,
  CheckCircle2,
  MoonStar,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useWasl } from "@/components/providers/WaslProvider";
import { WaslShare } from "@/components/share/WaslShare";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageShell, RevealSection } from "@/components/ui/MotionPrimitives";
import {
  GeometricLattice,
  OrnamentalDivider,
} from "@/components/brand/IslamicVisuals";
import { JUZ_LIST, SURAHS } from "@/data/surahs";
import { EID_SUNNAHS, RAMADAN_ADHKAR } from "@/data/ramadan";
import { getRamadanStatus } from "@/lib/prayer/calculator";

const KHATMAH_STORAGE_KEY = "wasl-khatmah-juz-v1";
const PACE_STORAGE_KEY = "wasl-khatmah-pace-v1";
const STATIC_ANCHOR_DATE = new Date("2026-11-14T09:00:00Z");

export function RamadanClient() {
  const { locale } = useWasl();

  const [liveNow, setLiveNow] = useState<Date | null>(null);
  const now = liveNow ?? STATIC_ANCHOR_DATE;
  const [completedJuz, setCompletedJuz] = useState<number[]>([]);
  const [dailyPace, setDailyPace] = useState<1 | 2 | 0.5>(1);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(KHATMAH_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as unknown;
          if (Array.isArray(parsed)) {
            setCompletedJuz(
              parsed.filter((n): n is number => typeof n === "number" && n >= 1 && n <= 30)
            );
          }
        }
        const paceRaw = localStorage.getItem(PACE_STORAGE_KEY);
        if (paceRaw === "2") setDailyPace(2);
        else if (paceRaw === "0.5") setDailyPace(0.5);
      } catch {
        // Ignore invalid JSON
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const startId = window.setTimeout(() => setLiveNow(new Date()), 0);
    const interval = window.setInterval(() => setLiveNow(new Date()), 1000);
    return () => {
      window.clearTimeout(startId);
      window.clearInterval(interval);
    };
  }, []);

  const ramadanStatus = useMemo(() => getRamadanStatus(now, "Asia/Riyadh"), [now]);

  const toggleJuz = (juzNum: number) => {
    setCompletedJuz((prev) => {
      const next = prev.includes(juzNum)
        ? prev.filter((j) => j !== juzNum)
        : [...prev, juzNum].sort((a, b) => a - b);
      try {
        localStorage.setItem(KHATMAH_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const handleMarkNext = () => {
    const nextUnfinished = JUZ_LIST.find((j) => !completedJuz.includes(j.juz));
    if (nextUnfinished) {
      toggleJuz(nextUnfinished.juz);
    }
  };

  const handleResetKhatmah = () => {
    setCompletedJuz([]);
    try {
      localStorage.removeItem(KHATMAH_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const handlePaceChange = (pace: 1 | 2 | 0.5) => {
    setDailyPace(pace);
    try {
      localStorage.setItem(PACE_STORAGE_KEY, String(pace));
    } catch {
      // Ignore
    }
  };

  const completedSet = useMemo(() => new Set(completedJuz), [completedJuz]);
  const pct = Math.round((completedJuz.length / 30) * 100);
  const remainingJuz = Math.max(0, 30 - completedJuz.length);
  const estimatedDaysRemaining = Math.ceil(remainingJuz / dailyPace);

  const surahMap = useMemo(() => {
    const map = new Map<number, { nameAr: string; englishName: string }>();
    for (const s of SURAHS) {
      map.set(s.number, { nameAr: s.nameAr, englishName: s.englishName });
    }
    return map;
  }, []);

  return (
    <PageShell className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { labelAr: "رمضان والختمة", labelEn: "Ramadan & Khatmah" },
        ]}
      />

      {/* Live Countdown Hero */}
      <section className="wasl-surface relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10 mb-8 shadow-sm">
        <GeometricLattice className="opacity-[0.045]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--wasl-border)] bg-[var(--wasl-bg)]/85 px-3.5 py-1.5 text-xs font-medium text-[var(--wasl-primary)]">
              <MoonStar className="h-3.5 w-3.5 text-[var(--wasl-accent)]" />
              <span>
                {locale === "ar"
                  ? "تقويم أم القرى الرسمي — حفظ التقدم محليًا دون تسجيل"
                  : "Official Umm al-Qura Calendar — Local Progress (No Account Needed)"}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-[var(--wasl-text)] sm:text-4xl">
              {ramadanStatus.isRamadan
                ? locale === "ar"
                  ? `رمضان مبارك — اليوم ${ramadanStatus.currentRamadanDay} من رمضان ${ramadanStatus.currentHijriYear} هـ`
                  : `Ramadan Mubarak — Day ${ramadanStatus.currentRamadanDay} of ${ramadanStatus.currentHijriYear} AH`
                : locale === "ar"
                  ? `رمضان والختمة الشخصية (${ramadanStatus.targetHijriYear} هـ)`
                  : `Ramadan & Personal Khatmah (${ramadanStatus.targetHijriYear} AH)`}
            </h1>

            <p className="text-sm leading-relaxed text-[var(--wasl-text-muted)] max-w-2xl">
              {locale === "ar"
                ? "استعد للشهر المبارك بورد قرآني منظم عبر الأجزاء الثلاثين، مع أذكار رمضان الصحيحة وسنن العيد، ويُحفظ تقدمك تلقائيًا على جهازك."
                : "Organize your daily Quran reading across all 30 Juz, reflect on authentic Ramadan & Eid supplications, and save your Khatmah locally on your device."}
            </p>
            <div className="pt-1 flex flex-wrap gap-2">
              <Link
                href="/khatmah"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--wasl-primary)] px-4 py-2 text-xs font-bold text-white hover:opacity-95"
              >
                {locale === "ar"
                  ? "افتح مخطط ختمة القرآن المتكامل (604 صفحات)"
                  : "Open Full 604-Page Khatmah Planner"}
              </Link>
              <Link
                href="/mushaf"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-4 py-2 text-xs font-semibold text-[var(--wasl-text)] hover:border-[var(--wasl-primary)]"
              >
                {locale === "ar" ? "تصفح المصحف الشريف" : "Open Digital Mushaf"}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-[var(--wasl-accent)]/35 bg-gradient-to-br from-[var(--wasl-primary)] to-[var(--wasl-primary-hover)] p-6 text-white shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#F4DDA0] mb-4">
                {ramadanStatus.isRamadan
                  ? locale === "ar"
                    ? "المتبقي على عيد الفطر (تقريبًا)"
                    : "Estimated Countdown to Eid al-Fitr"
                  : locale === "ar"
                    ? `العد التنازلي لغرة رمضان ${ramadanStatus.targetHijriYear} هـ`
                    : `Countdown to 1 Ramadan ${ramadanStatus.targetHijriYear} AH`}
              </p>

              <div dir="ltr" suppressHydrationWarning className="grid grid-cols-4 gap-2.5 text-center">
                {[
                  {
                    value: ramadanStatus.daysUntilRamadan,
                    labelAr: "يوم",
                    labelEn: "Days",
                  },
                  {
                    value: ramadanStatus.hoursUntilRamadan,
                    labelAr: "ساعة",
                    labelEn: "Hours",
                  },
                  {
                    value: ramadanStatus.minutesUntilRamadan,
                    labelAr: "دقيقة",
                    labelEn: "Mins",
                  },
                  {
                    value: ramadanStatus.secondsUntilRamadan,
                    labelAr: "ثانية",
                    labelEn: "Secs",
                  },
                ].map((box) => (
                  <div
                    key={box.labelEn}
                    className="rounded-2xl bg-white/10 px-2 py-3 backdrop-blur-sm"
                  >
                    <p className="font-mono text-2xl sm:text-3xl font-bold text-[#F4DDA0]">
                      {String(box.value).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-[11px] text-white/80">
                      {locale === "ar" ? box.labelAr : box.labelEn}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-[11px] text-white/75 text-center">
                {locale === "ar"
                  ? "ملاحظة: يعتمد دخول الشهر الشرعي على رؤية الهلال المعتمدة."
                  : "Note: Exact Islamic month start is confirmed by official moon sighting."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Personal 30-Juz Khatmah Tracker */}
      <RevealSection className="wasl-surface rounded-3xl p-6 sm:p-8 mb-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-[var(--wasl-border)] pb-6 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-5 w-5 text-[var(--wasl-primary)]" />
              <h2 className="text-2xl font-bold text-[var(--wasl-text)]">
                {locale === "ar" ? "متابعة الختمة الشخصية (30 جزءاً)" : "Personal Khatmah Tracker (30 Juz)"}
              </h2>
            </div>
            <p className="text-sm text-[var(--wasl-text-muted)]">
              {locale === "ar"
                ? `أنجزت ${completedJuz.length} من أصل 30 جزءاً (${pct}%). عند الخطة المختارة يتبقى لك ${estimatedDaysRemaining} يوماً.`
                : `Completed ${completedJuz.length} of 30 Juz (${pct}%). At your chosen pace, ~${estimatedDaysRemaining} day(s) remain.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] p-1 text-xs">
              {[
                { pace: 2 as const, ar: "ختمة ١٥ يوماً", en: "15-day (2 Juz/d)" },
                { pace: 1 as const, ar: "ختمة ٣٠ يوماً", en: "30-day (1 Juz/d)" },
                { pace: 0.5 as const, ar: "ختمة ٦٠ يوماً", en: "60-day (½ Juz/d)" },
              ].map((opt) => (
                <button
                  key={opt.pace}
                  type="button"
                  onClick={() => handlePaceChange(opt.pace)}
                  className={`rounded-lg px-3 py-1.5 font-medium transition ${
                    dailyPace === opt.pace
                      ? "bg-[var(--wasl-primary)] text-white"
                      : "text-[var(--wasl-text-muted)] hover:text-[var(--wasl-text)]"
                  }`}
                >
                  {locale === "ar" ? opt.ar : opt.en}
                </button>
              ))}
            </div>

            {completedJuz.length < 30 && (
              <button
                type="button"
                onClick={handleMarkNext}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--wasl-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--wasl-primary-hover)] transition"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {locale === "ar" ? "إتمام الجزء التالي" : "Complete Next Juz"}
                </span>
              </button>
            )}

            {completedJuz.length > 0 && (
              <button
                type="button"
                onClick={handleResetKhatmah}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-3 py-2 text-xs font-medium text-[var(--wasl-text-muted)] hover:text-[var(--wasl-text)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{locale === "ar" ? "تصفير" : "Reset"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--wasl-border)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--wasl-primary)] to-[var(--wasl-accent)] transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* 30 Juz Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {JUZ_LIST.map((j) => {
            const done = completedSet.has(j.juz);
            const startS = surahMap.get(j.startSurah);
            const endS = surahMap.get(j.endSurah);

            return (
              <div
                key={j.juz}
                className={`flex flex-col justify-between rounded-2xl border p-4 transition ${
                  done
                    ? "border-emerald-500/45 bg-emerald-500/[0.06]"
                    : "border-[var(--wasl-border)] bg-[var(--wasl-bg)]/60 hover:border-[var(--wasl-primary)]/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-[var(--wasl-primary)]">
                      {locale === "ar" ? `الجزء ${j.juz}` : `Juz ${j.juz}`}
                    </span>
                    <h3 className="text-sm font-bold text-[var(--wasl-text)] mt-0.5">
                      {locale === "ar" ? j.titleAr : j.titleEn}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--wasl-text-muted)]">
                      {locale === "ar"
                        ? `من ${startS?.nameAr ?? j.startSurah} (${j.startAyah}) إلى ${endS?.nameAr ?? j.endSurah} (${j.endAyah})`
                        : `From ${startS?.englishName ?? j.startSurah} ${j.startAyah} to ${endS?.englishName ?? j.endSurah} ${j.endAyah}`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleJuz(j.juz)}
                    aria-label={
                      locale === "ar"
                        ? `تحديد الجزء ${j.juz} كمقروء`
                        : `Toggle Juz ${j.juz} complete`
                    }
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
                      done
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-[var(--wasl-border)] bg-[var(--wasl-surface)] text-[var(--wasl-text-muted)] hover:border-[var(--wasl-primary)]"
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-[var(--wasl-border)]/70 flex items-center justify-between text-xs">
                  <Link
                    href={`/quran/${j.startSurah}`}
                    className="font-semibold text-[var(--wasl-primary)] hover:underline"
                  >
                    {locale === "ar" ? "اقرأ بداية الجزء ←" : "Open Starting Surah →"}
                  </Link>
                  <span className="text-[var(--wasl-text-muted)]">
                    {done
                      ? locale === "ar"
                        ? "مكتمل"
                        : "Completed"
                      : locale === "ar"
                        ? "قيد القراءة"
                        : "Pending"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </RevealSection>

      <OrnamentalDivider className="my-8" />

      {/* Ramadan Supplications & Eid Sunnahs */}
      <RevealSection className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-[var(--wasl-accent)]" />
            <h2 className="text-xl font-bold text-[var(--wasl-text)]">
              {locale === "ar" ? "أذكار وأدعية رمضان المأثورة" : "Authentic Ramadan Supplications"}
            </h2>
          </div>

          <div className="space-y-4">
            {RAMADAN_ADHKAR.map((dua) => (
              <div key={dua.id} className="wasl-surface rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-[var(--wasl-primary)]">
                    {locale === "ar" ? dua.titleAr : dua.titleEn}
                  </h3>
                  <WaslShare
                    variant="pill"
                    label={locale === "ar" ? "مشاركة" : "Share"}
                    payload={{
                      kind: "dua",
                      titleAr: locale === "ar" ? "أدعية رمضانية ومأثورة" : undefined,
                      titleEn: "Ramadan Supplication",
                      arabicText: dua.arabicText,
                      englishText: dua.englishTranslation,
                      referenceAr: dua.referenceAr,
                      referenceEn: dua.referenceEn,
                      shareUrl: "/ramadan",
                    }}
                  />
                </div>

                <p dir="rtl" lang="ar" className="font-arabic text-lg leading-loose text-[var(--wasl-text)]">
                  {dua.arabicText}
                </p>
                <p dir="ltr" lang="en" className="text-xs leading-relaxed text-[var(--wasl-text-muted)]">
                  {dua.englishTranslation}
                </p>
                <p className="text-[11px] font-medium text-[var(--wasl-primary)]">
                  {locale === "ar" ? dua.referenceAr : dua.referenceEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <CalendarHeart className="h-5 w-5 text-[var(--wasl-primary)]" />
            <h2 className="text-xl font-bold text-[var(--wasl-text)]">
              {locale === "ar" ? "من سنن وآداب العيد" : "Prophetic Sunnahs of Eid"}
            </h2>
          </div>

          <div className="wasl-surface rounded-3xl p-6 space-y-4">
            {EID_SUNNAHS.map((sunnah, idx) => (
              <div
                key={sunnah.titleEn}
                className={`${
                  idx > 0 ? "border-t border-[var(--wasl-border)] pt-4" : ""
                } space-y-1.5`}
              >
                <h3 className="text-sm font-bold text-[var(--wasl-text)]">
                  {locale === "ar" ? sunnah.titleAr : sunnah.titleEn}
                </h3>
                <p className="text-xs leading-relaxed text-[var(--wasl-text-muted)]">
                  {locale === "ar" ? sunnah.descAr : sunnah.descEn}
                </p>
                <p className="text-[11px] font-semibold text-[var(--wasl-primary)]">
                  {locale === "ar" ? sunnah.refAr : sunnah.refEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>
    </PageShell>
  );
}

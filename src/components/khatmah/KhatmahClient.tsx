"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Compass,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { GeometricLattice } from "@/components/brand/IslamicVisuals";
import { useWasl } from "@/components/providers/WaslProvider";
import { WaslShare } from "@/components/share/WaslShare";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageShell } from "@/components/ui/MotionPrimitives";
import { MUSHAF_TOTAL_PAGES } from "@/lib/api/mushaf";
import {
  computeKhatmahStats,
  createKhatmahPlan,
  describePageSpan,
  getPresetTargetDays,
  getTodayIso,
  recalculateRemainingPlan,
} from "@/lib/khatmah/calculator";
import type { KhatmahPlan, KhatmahPresetId } from "@/types/islamic";

const PLANS_STORAGE_KEY = "wasl_khatmah_plans_v1";

const WEEKDAY_LABELS = [
  { id: 0, ar: "الأحد", en: "Sun" },
  { id: 1, ar: "الاثنين", en: "Mon" },
  { id: 2, ar: "الثلاثاء", en: "Tue" },
  { id: 3, ar: "الأربعاء", en: "Wed" },
  { id: 4, ar: "الخميس", en: "Thu" },
  { id: 5, ar: "الجمعة", en: "Fri" },
  { id: 6, ar: "السبت", en: "Sat" },
];

export function KhatmahClient({ initialStartPage }: { initialStartPage: number }) {
  const { locale } = useWasl();

  const [plans, setPlans] = useState<KhatmahPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Builder form state
  const [showBuilder, setShowBuilder] = useState(initialStartPage > 1);
  const [planName, setPlanName] = useState("");
  const [preset, setPreset] = useState<KhatmahPresetId>("30d");
  const [customDays, setCustomDays] = useState(30);
  const [startDate, setStartDate] = useState<string>(getTodayIso);
  const [sessionsPerDay, setSessionsPerDay] = useState<1 | 2 | 5>(1);
  const [preferredTime, setPreferredTime] = useState("05:30");
  const [activeWeekdays, setActiveWeekdays] = useState<number[]>([
    0, 1, 2, 3, 4, 5, 6,
  ]);
  const [startPage, setStartPage] = useState<number>(initialStartPage);
  const [adjustDaysInput, setAdjustDaysInput] = useState<number>(30);
  const [confirmRestartId, setConfirmRestartId] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(PLANS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as KhatmahPlan[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPlans(parsed);
            setActivePlanId(parsed[0].id);
            setHydrated(true);
            return;
          }
        }
      } catch {
        // Ignore storage error
      }
      setShowBuilder(true);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const persistPlans = (next: KhatmahPlan[], nextActiveId?: string | null) => {
    setPlans(next);
    if (nextActiveId !== undefined) {
      setActivePlanId(nextActiveId);
    }
    try {
      localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage error
    }
  };

  const activePlan = useMemo(
    () => plans.find((p) => p.id === activePlanId) ?? plans[0] ?? null,
    [activePlanId, plans]
  );

  const stats = useMemo(
    () => (activePlan ? computeKhatmahStats(activePlan) : null),
    [activePlan]
  );

  const effectiveTargetDays =
    preset === "custom" ? Math.max(1, Math.min(604, customDays)) : getPresetTargetDays(preset);
  const previewPagesPerDay = Math.max(
    1,
    Math.ceil((MUSHAF_TOTAL_PAGES - startPage + 1) / effectiveTargetDays)
  );

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const defaultTitle =
      locale === "ar"
        ? `ختمة ${effectiveTargetDays} يوماً`
        : `${effectiveTargetDays}-Day Khatmah`;
    const newPlan = createKhatmahPlan({
      name: planName.trim() || defaultTitle,
      preset,
      startDate,
      targetDays: effectiveTargetDays,
      sessionsPerDay,
      preferredTime,
      activeWeekdays,
      startPage,
    });
    const next = [newPlan, ...plans];
    persistPlans(next, newPlan.id);
    setPlanName("");
    setShowBuilder(false);
    setAdjustDaysInput(newPlan.targetDays);
  };

  const toggleAssignmentCompleted = (
    planId: string,
    dayIndex: number,
    sessionIndex: number
  ) => {
    const next = plans.map((plan) => {
      if (plan.id !== planId) return plan;
      const assignments = plan.assignments.map((a) =>
        a.dayIndex === dayIndex && a.sessionIndex === sessionIndex
          ? {
              ...a,
              completed: !a.completed,
              completedAt: !a.completed ? new Date().toISOString() : undefined,
            }
          : a
      );
      const updated = {
        ...plan,
        assignments,
        updatedAt: new Date().toISOString(),
      };
      const nextStats = computeKhatmahStats(updated);
      return {
        ...updated,
        currentPage: nextStats.currentPage,
        status:
          nextStats.remainingPages === 0
            ? ("completed" as const)
            : plan.status === "paused"
              ? ("paused" as const)
              : ("active" as const),
      };
    });
    persistPlans(next);
  };

  const togglePausePlan = (planId: string) => {
    const next = plans.map((p) => {
      if (p.id !== planId || p.status === "completed") return p;
      return {
        ...p,
        status: p.status === "paused" ? ("active" as const) : ("paused" as const),
        updatedAt: new Date().toISOString(),
      };
    });
    persistPlans(next);
  };

  const handleRecalculateRemaining = (planId: string) => {
    const next = plans.map((p) =>
      p.id === planId
        ? recalculateRemainingPlan(p, {
            newTargetDaysForRemaining: Math.max(1, adjustDaysInput),
          })
        : p
    );
    persistPlans(next);
  };

  const handleRestartConfirmed = (planId: string) => {
    const next = plans.map((p) => {
      if (p.id !== planId) return p;
      return createKhatmahPlan({
        id: p.id,
        name: p.name,
        preset: p.preset,
        startDate: getTodayIso(),
        targetDays: p.targetDays,
        sessionsPerDay: p.sessionsPerDay,
        preferredTime: p.preferredTime,
        activeWeekdays: p.activeWeekdays,
        startPage: 1,
      });
    });
    persistPlans(next);
    setConfirmRestartId(null);
  };

  const handleDeletePlan = (planId: string) => {
    const next = plans.filter((p) => p.id !== planId);
    persistPlans(next, next[0]?.id ?? null);
    if (next.length === 0) setShowBuilder(true);
  };

  const todayIso = getTodayIso();

  return (
    <PageShell className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs
        items={[
          { labelAr: "القرآن الكريم", labelEn: "Holy Quran", href: "/quran" },
          { labelAr: "مخطط ختمة القرآن", labelEn: "Quran Khatmah Planner" },
        ]}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 mb-8 shadow-sm">
        <div className="pointer-events-none absolute inset-0 text-[var(--brand-emerald)]">
          <GeometricLattice opacity={0.03} />
        </div>

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-gold)]/40 bg-[var(--brand-gold-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-gold)]">
              <Compass className="h-3.5 w-3.5" />
              <span>
                {locale === "ar"
                  ? "مبني على صفحات المصحف الـ ٦٠٤"
                  : "Based on the 604-Page Madinah Mushaf"}
              </span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              {locale === "ar"
                ? "مخطط ختمة القرآن الكريم الشخصي"
                : "Personal Quran Khatmah Planner"}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {locale === "ar"
                ? "نظّم وردك اليومي بمرونة وطمأنينة دون أي تعقيد؛ قليلٌ دائمٌ خيرٌ من كثيرٍ منقطع، وكل خطوة تقربك من كتاب الله تُحسب لك."
                : "Organize your Quran reading gently and consistently based on exact 604-page assignments linked straight into the Digital Mushaf."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowBuilder((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-emerald)] px-4 py-2.5 text-xs font-bold text-white hover:bg-[var(--brand-emerald-strong)] transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>
                {locale === "ar" ? "إنشاء خطة ختمة جديدة" : "New Khatmah Plan"}
              </span>
            </button>

            <Link
              href="/notifications"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3.5 py-2.5 text-xs font-semibold hover:border-[var(--brand-gold)] transition-colors"
            >
              <Bell className="h-4 w-4 text-[var(--brand-gold)]" />
              <span>
                {locale === "ar" ? "تنبيهات الورد اليومي" : "Reading Reminders"}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Plan Creator Form */}
      {showBuilder ? (
        <form
          onSubmit={handleCreatePlan}
          className="wasl-surface rounded-3xl p-6 sm:p-8 mb-8 space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--border-subtle)]">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              {locale === "ar" ? "إعداد خطة ختمة مخصصة" : "Configure Your Khatmah Plan"}
            </h2>
            <span className="text-xs font-semibold text-[var(--brand-emerald)]">
              {locale === "ar"
                ? `المعدل اليومي المحسوب: ~${previewPagesPerDay} صفحة/يوم (من ص ${startPage} إلى ٦٠٤)`
                : `Calculated Target: ~${previewPagesPerDay} pages/day (Pages ${startPage}–604)`}
            </span>
          </div>

          {/* Preset Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--text-secondary)]">
              {locale === "ar" ? "اختر مدة الختمة:" : "Select Preset Duration:"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {(
                [
                  { id: "7d", ar: "٧ أيام", subAr: "٨٧ صفحة/يوم", en: "7 Days", subEn: "~87 pp/day" },
                  { id: "15d", ar: "١٥ يوماً", subAr: "٤١ صفحة/يوم", en: "15 Days", subEn: "~41 pp/day" },
                  { id: "30d", ar: "٣٠ يوماً", subAr: "٢٠ صفحة/يوم", en: "30 Days", subEn: "~20 pp/day" },
                  { id: "60d", ar: "٦٠ يوماً", subAr: "١٠ صفحات/يوم", en: "60 Days", subEn: "~10 pp/day" },
                  { id: "custom", ar: "خطة مخصصة", subAr: "حدد الأيام", en: "Custom", subEn: "Set your pace" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setPreset(opt.id);
                    if (opt.id !== "custom") {
                      setCustomDays(getPresetTargetDays(opt.id));
                    }
                  }}
                  className={`rounded-2xl border p-3 text-start transition-all ${
                    preset === opt.id
                      ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald-soft)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-page)] hover:border-[var(--brand-gold)]"
                  }`}
                >
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {locale === "ar" ? opt.ar : opt.en}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {locale === "ar" ? opt.subAr : opt.subEn}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                {locale === "ar" ? "اسم الخطة (اختياري)" : "Plan Name"}
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder={
                  locale === "ar" ? "مثلاً: ختمة الفجر المباركة" : "e.g. Morning Recitation"
                }
                className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                {locale === "ar" ? "تاريخ البدء" : "Start Date"}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-sm"
              />
            </div>

            {preset === "custom" ? (
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  {locale === "ar" ? "عدد أيام القراءة" : "Target Reading Days"}
                </label>
                <input
                  type="number"
                  min={1}
                  max={604}
                  value={customDays}
                  onChange={(e) => setCustomDays(Number(e.target.value) || 30)}
                  className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-sm"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  {locale === "ar" ? "وقت القراءة المفضل" : "Preferred Time"}
                </label>
                <input
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                {locale === "ar" ? "البداية من صفحة المصحف" : "Starting Mushaf Page"}
              </label>
              <input
                type="number"
                min={1}
                max={604}
                value={startPage}
                onChange={(e) =>
                  setStartPage(
                    Math.max(1, Math.min(604, Number(e.target.value) || 1))
                  )
                }
                className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Sessions & Weekly Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-[var(--text-muted)]">
                {locale === "ar" ? "توزيع الورد اليومي:" : "Daily Reading Sessions:"}
              </span>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { val: 1, ar: "جلسة واحدة يومياً", en: "1 Session / day" },
                    { val: 2, ar: "جلستان (صباحاً ومساءً)", en: "2 Sessions (AM/PM)" },
                    { val: 5, ar: "٥ جلسات (بعد كل صلاة)", en: "5 Sessions (After Prayers)" },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.val}
                    type="button"
                    onClick={() => setSessionsPerDay(s.val)}
                    className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors ${
                      sessionsPerDay === s.val
                        ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald)] text-white"
                        : "border-[var(--border-subtle)] bg-[var(--bg-page)]"
                    }`}
                  >
                    {locale === "ar" ? s.ar : s.en}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-semibold text-[var(--text-muted)]">
                {locale === "ar" ? "أيام القراءة الأسبوعية:" : "Weekly Reading Days:"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAY_LABELS.map((d) => {
                  const selected = activeWeekdays.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() =>
                        setActiveWeekdays((prev) =>
                          prev.includes(d.id)
                            ? prev.length > 1
                              ? prev.filter((x) => x !== d.id)
                              : prev
                            : [...prev, d.id]
                        )
                      }
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        selected
                          ? "border-[var(--brand-gold)] bg-[var(--brand-gold-soft)] text-[var(--text-primary)]"
                          : "border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-muted)]"
                      }`}
                    >
                      {locale === "ar" ? d.ar : d.en}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
            {plans.length > 0 ? (
              <button
                type="button"
                onClick={() => setShowBuilder(false)}
                className="rounded-xl border border-[var(--border-strong)] px-4 py-2 text-xs font-semibold"
              >
                {locale === "ar" ? "إلغاء" : "Cancel"}
              </button>
            ) : null}
            <button
              type="submit"
              className="rounded-xl bg-[var(--brand-emerald)] px-5 py-2.5 text-xs font-bold text-white hover:bg-[var(--brand-emerald-strong)] transition-colors"
            >
              {locale === "ar" ? "اعتماد خطة الختمة" : "Start Khatmah Plan"}
            </button>
          </div>
        </form>
      ) : null}

      {/* Saved Multiple Plans Tabs */}
      {hydrated && plans.length > 0 && activePlan && stats ? (
        <div className="space-y-6">
          {plans.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {plans.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setActivePlanId(p.id);
                    setAdjustDaysInput(p.targetDays);
                  }}
                  className={`rounded-2xl border px-4 py-2 text-xs font-bold transition-colors ${
                    p.id === activePlan.id
                      ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald)] text-white"
                      : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)]"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          ) : null}

          {/* Progress Overview Card */}
          <section className="wasl-surface rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    {activePlan.name}
                  </h2>
                  <span
                    className={`rounded-full px-3 py-0.5 text-[11px] font-bold ${
                      activePlan.status === "completed"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : activePlan.status === "paused"
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-300"
                          : "bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)]"
                    }`}
                  >
                    {activePlan.status === "completed"
                      ? locale === "ar"
                        ? "مكتملة بحمد الله"
                        : "Completed"
                      : activePlan.status === "paused"
                        ? locale === "ar"
                          ? "متوقفة مؤقتاً"
                          : "Paused"
                        : locale === "ar"
                          ? "نشطة"
                          : "Active"}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  {locale === "ar"
                    ? `خطة من الصفحة ${activePlan.startPage} إلى ٦٠٤ • تاريخ الختم المتوقع: ${stats.expectedCompletionDate}`
                    : `Pages ${activePlan.startPage}–604 • Expected completion: ${stats.expectedCompletionDate}`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <WaslShare
                  variant="pill"
                  label={locale === "ar" ? "مشاركة التقدم" : "Share Progress"}
                  payload={{
                    kind: "khatmah",
                    titleAr: activePlan.name,
                    titleEn: activePlan.name,
                    arabicText: `قطعتُ بفضل الله ${stats.completedPages} صفحة من المصحف الشريف (${stats.percentage}٪) في «${activePlan.name}». اللهم بارك لنا في القرآن العظيم وارزقنا تلاوته والعمل به.`,
                    englishText: `Completed ${stats.completedPages} pages (${stats.percentage}%) of my Quran Khatmah plan: ${activePlan.name}.`,
                    referenceAr: `${stats.completedJuz} أجزاء مكتملة • وصل الإسلامية`,
                    referenceEn: `${stats.completedJuz} Juz completed • Wasl Islamic`,
                    shareUrl: "/khatmah",
                  }}
                />

                {activePlan.status !== "completed" ? (
                  <button
                    type="button"
                    onClick={() => togglePausePlan(activePlan.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] px-3 py-1.5 text-xs font-semibold"
                  >
                    {activePlan.status === "paused" ? (
                      <>
                        <Play className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{locale === "ar" ? "استئناف" : "Resume"}</span>
                      </>
                    ) : (
                      <>
                        <Pause className="h-3.5 w-3.5 text-amber-500" />
                        <span>{locale === "ar" ? "إيقاف مؤقت" : "Pause"}</span>
                      </>
                    )}
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() =>
                    setConfirmRestartId(
                      confirmRestartId === activePlan.id ? null : activePlan.id
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{locale === "ar" ? "إعادة من البداية" : "Restart"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeletePlan(activePlan.id)}
                  aria-label="Delete Plan"
                  className="inline-flex items-center gap-1 rounded-xl border border-red-500/25 px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {confirmRestartId === activePlan.id ? (
              <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-amber-800 dark:text-amber-300">
                  {locale === "ar"
                    ? "تأكيد: سيتم إعادة تعيين جميع الأوراد السابقة والبدء من الصفحة ١ اليوم."
                    : "Confirm restart: all completed checkmarks in this plan will reset to Page 1 today."}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmRestartId(null)}
                    className="rounded-lg border border-[var(--border-strong)] px-3 py-1 font-semibold"
                  >
                    {locale === "ar" ? "تراجع" : "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRestartConfirmed(activePlan.id)}
                    className="rounded-lg bg-amber-600 px-3 py-1 font-bold text-white"
                  >
                    {locale === "ar" ? "تأكيد إعادة البدء" : "Confirm Restart"}
                  </button>
                </div>
              </div>
            ) : null}

            {/* Progress Bar & Accurate Metrics */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[var(--brand-emerald)]">
                  {stats.percentage}% {locale === "ar" ? "مكتمل" : "Complete"}
                </span>
                <span className="font-mono text-[var(--text-secondary)]">
                  {stats.completedPages} / {stats.totalPagesInPlan}{" "}
                  {locale === "ar" ? "صفحة" : "pages"}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--brand-emerald)] to-[var(--brand-gold)] transition-all duration-500"
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3.5">
                <p className="text-xl font-bold font-mono text-[var(--brand-emerald)]">
                  {stats.completedPages}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {locale === "ar" ? "الصفحات المقروءة" : "Completed Pages"}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3.5">
                <p className="text-xl font-bold font-mono text-[var(--text-primary)]">
                  {stats.remainingPages}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {locale === "ar" ? "الصفحات المتبقية" : "Remaining Pages"}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3.5">
                <p className="text-xl font-bold font-mono text-[var(--brand-gold)]">
                  {stats.completedJuz} / 30
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {locale === "ar" ? "الأجزاء المكتملة" : "Completed Juz"}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3.5">
                <p className="text-xl font-bold font-mono text-[var(--text-primary)]">
                  {stats.currentPage}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {locale === "ar" ? "الموضع الحالي (صفحة)" : "Current Page"}
                </p>
              </div>
            </div>

            {/* Flexible Recalculation Control */}
            {stats.remainingPages > 0 ? (
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-page)] p-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-[var(--text-secondary)]">
                  {locale === "ar"
                    ? "تحتاج إلى تعديل المدة المتبقية؟ أعد توزيع الصفحات المتبقية دون مساس بما أتممته:"
                    : "Need a calmer or faster pace? Recalculate remaining pages while keeping your progress:"}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={stats.remainingPages}
                    value={adjustDaysInput}
                    onChange={(e) => setAdjustDaysInput(Number(e.target.value) || 1)}
                    aria-label="Remaining target days"
                    className="w-20 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-mono font-bold"
                  />
                  <span className="text-xs text-[var(--text-muted)]">
                    {locale === "ar" ? "أيام متبقية" : "days"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRecalculateRemaining(activePlan.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand-gold)] px-3 py-1.5 text-xs font-bold text-white"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>{locale === "ar" ? "إعادة الجدولة" : "Recalculate"}</span>
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          {/* Daily Schedule & Assignments */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[var(--brand-emerald)]" />
                <span>
                  {locale === "ar" ? "جدول الأوراد اليومية" : "Daily Reading Assignments"}
                </span>
              </h3>
              <span className="text-xs text-[var(--text-muted)]">
                {locale === "ar"
                  ? "اضغط «اقرأ في المصحف» لفتح الصفحات المحددة مباشرة"
                  : "Click Open in Mushaf to jump directly to assigned pages"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {activePlan.assignments.map((a) => {
                const isToday = a.scheduledDate === todayIso;
                return (
                  <div
                    key={`${a.dayIndex}-${a.sessionIndex}`}
                    className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 transition-all ${
                      a.completed
                        ? "border-emerald-500/40 bg-emerald-500/[0.05]"
                        : isToday
                          ? "border-[var(--brand-gold)] bg-[var(--brand-gold-soft)]/35 shadow-sm"
                          : "border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-[var(--brand-emerald)]">
                          {locale === "ar"
                            ? `اليوم ${a.dayIndex}${
                                activePlan.sessionsPerDay > 1
                                  ? ` — الجلسة ${a.sessionIndex}`
                                  : ""
                              }`
                            : `Day ${a.dayIndex}${
                                activePlan.sessionsPerDay > 1
                                  ? ` • Session ${a.sessionIndex}`
                                  : ""
                              }`}
                        </span>
                        <span className="font-mono text-[11px] text-[var(--text-muted)]">
                          {isToday
                            ? locale === "ar"
                              ? "اليوم"
                              : "Today"
                            : a.scheduledDate}
                        </span>
                      </div>

                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        {locale === "ar"
                          ? `صفحة ${a.startPage} إلى ${a.endPage} (${a.pageCount} صفحات)`
                          : `Pages ${a.startPage}–${a.endPage} (${a.pageCount} pp)`}
                      </p>

                      <p className="text-xs text-[var(--text-secondary)]">
                        {describePageSpan(a.startPage, a.endPage, locale)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)]">
                      <Link
                        href={`/mushaf?page=${a.startPage}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-[var(--brand-emerald)]/30 bg-[var(--brand-emerald-soft)] px-3 py-1.5 text-xs font-bold text-[var(--brand-emerald)] hover:bg-[var(--brand-emerald)] hover:text-white transition-colors"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>
                          {locale === "ar" ? "اقرأ في المصحف" : "Open Mushaf"}
                        </span>
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          toggleAssignmentCompleted(
                            activePlan.id,
                            a.dayIndex,
                            a.sessionIndex
                          )
                        }
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                          a.completed
                            ? "bg-emerald-600 text-white"
                            : "border border-[var(--border-strong)] hover:border-[var(--brand-emerald)]"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>
                          {a.completed
                            ? locale === "ar"
                              ? "تمت القراءة"
                              : "Done"
                            : locale === "ar"
                              ? "تحديد كمكتمل"
                              : "Mark Read"}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}
    </PageShell>
  );
}

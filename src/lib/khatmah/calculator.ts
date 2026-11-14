import { MUSHAF_JUZS, MUSHAF_TOTAL_PAGES, getPageIndexInfo } from "@/lib/api/mushaf";
import type {
  KhatmahAssignment,
  KhatmahPlan,
  KhatmahPresetId,
} from "@/types/islamic";

export interface KhatmahStats {
  totalPagesInPlan: number;
  completedPages: number;
  remainingPages: number;
  percentage: number;
  completedJuz: number;
  currentPage: number;
  expectedCompletionDate: string;
  completedSessions: number;
  totalSessions: number;
}

export function getPresetTargetDays(preset: KhatmahPresetId): number {
  switch (preset) {
    case "7d":
      return 7;
    case "15d":
      return 15;
    case "30d":
      return 30;
    case "60d":
      return 60;
    default:
      return 30;
  }
}

function formatDateIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getTodayIso(): string {
  return formatDateIso(new Date());
}

function generateScheduledDates(
  startDateIso: string,
  dayCount: number,
  activeWeekdays: number[]
): string[] {
  const allowed =
    activeWeekdays.length > 0 ? new Set(activeWeekdays) : new Set([0, 1, 2, 3, 4, 5, 6]);
  const base = new Date(`${startDateIso}T12:00:00`);
  if (Number.isNaN(base.getTime())) {
    return Array.from({ length: dayCount }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return formatDateIso(d);
    });
  }

  const dates: string[] = [];
  const cursor = new Date(base);
  let guard = 0;
  while (dates.length < dayCount && guard < 2000) {
    if (allowed.has(cursor.getDay())) {
      dates.push(formatDateIso(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
    guard += 1;
  }
  return dates;
}

function distributePagesIntoAssignments(options: {
  fromPage: number;
  toPage: number;
  startDate: string;
  dayCount: number;
  sessionsPerDay: 1 | 2 | 5;
  activeWeekdays: number[];
  startingDayIndex?: number;
}): KhatmahAssignment[] {
  const safeFrom = Math.max(1, Math.min(MUSHAF_TOTAL_PAGES, options.fromPage));
  const safeTo = Math.max(safeFrom, Math.min(MUSHAF_TOTAL_PAGES, options.toPage));
  const totalPages = safeTo - safeFrom + 1;
  const safeDays = Math.max(1, Math.min(totalPages, Math.round(options.dayCount)));
  const sessions = options.sessionsPerDay;
  const dates = generateScheduledDates(
    options.startDate,
    safeDays,
    options.activeWeekdays
  );

  const assignments: KhatmahAssignment[] = [];
  let pageCursor = safeFrom;

  for (let dayIdx = 0; dayIdx < safeDays; dayIdx += 1) {
    const remainingDays = safeDays - dayIdx;
    const remainingPages = safeTo - pageCursor + 1;
    if (remainingPages <= 0) break;

    const pagesToday = Math.ceil(remainingPages / remainingDays);
    const dayEndPage = Math.min(safeTo, pageCursor + pagesToday - 1);
    const activeSessions = Math.min(sessions, pagesToday);
    let sessionCursor = pageCursor;

    for (let sIdx = 0; sIdx < activeSessions; sIdx += 1) {
      const remSess = activeSessions - sIdx;
      const remDayPages = dayEndPage - sessionCursor + 1;
      if (remDayPages <= 0) break;
      const sessionPages = Math.ceil(remDayPages / remSess);
      const sEnd = Math.min(dayEndPage, sessionCursor + sessionPages - 1);

      assignments.push({
        dayIndex: (options.startingDayIndex ?? 1) + dayIdx,
        sessionIndex: sIdx + 1,
        scheduledDate: dates[dayIdx] ?? options.startDate,
        startPage: sessionCursor,
        endPage: sEnd,
        pageCount: sEnd - sessionCursor + 1,
        completed: false,
      });

      sessionCursor = sEnd + 1;
    }

    pageCursor = dayEndPage + 1;
  }

  return assignments;
}

export function createKhatmahPlan(input: {
  id?: string;
  name: string;
  preset: KhatmahPresetId;
  startDate: string;
  targetDays: number;
  sessionsPerDay: 1 | 2 | 5;
  preferredTime: string;
  activeWeekdays: number[];
  startPage?: number;
}): KhatmahPlan {
  const startPage = Math.max(1, Math.min(MUSHAF_TOTAL_PAGES, input.startPage ?? 1));
  const pagesToRead = MUSHAF_TOTAL_PAGES - startPage + 1;
  const targetDays = Math.max(1, Math.min(pagesToRead, Math.round(input.targetDays)));
  const assignments = distributePagesIntoAssignments({
    fromPage: startPage,
    toPage: MUSHAF_TOTAL_PAGES,
    startDate: input.startDate,
    dayCount: targetDays,
    sessionsPerDay: input.sessionsPerDay,
    activeWeekdays: input.activeWeekdays,
  });

  const nowIso = new Date().toISOString();
  return {
    id: input.id ?? `khatmah-${Date.now()}`,
    name: input.name,
    preset: input.preset,
    startDate: input.startDate,
    targetDays,
    pagesPerDay: Math.max(1, Math.round(pagesToRead / targetDays)),
    sessionsPerDay: input.sessionsPerDay,
    preferredTime: input.preferredTime,
    activeWeekdays: input.activeWeekdays,
    startPage,
    currentPage: startPage,
    status: "active",
    assignments,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export function recalculateRemainingPlan(
  plan: KhatmahPlan,
  options: {
    newTargetDaysForRemaining?: number;
    fromDateIso?: string;
  }
): KhatmahPlan {
  const completedAssignments = plan.assignments.filter((a) => a.completed);
  const completedPageSet = new Set<number>();
  for (const a of completedAssignments) {
    for (let p = a.startPage; p <= a.endPage; p += 1) {
      completedPageSet.add(p);
    }
  }

  // Find lowest uncompleted page from plan.startPage..604
  let nextFromPage = MUSHAF_TOTAL_PAGES + 1;
  for (let p = plan.startPage; p <= MUSHAF_TOTAL_PAGES; p += 1) {
    if (!completedPageSet.has(p)) {
      nextFromPage = p;
      break;
    }
  }

  if (nextFromPage > MUSHAF_TOTAL_PAGES) {
    return {
      ...plan,
      status: "completed",
      currentPage: MUSHAF_TOTAL_PAGES,
      updatedAt: new Date().toISOString(),
    };
  }

  const remainingPages = MUSHAF_TOTAL_PAGES - nextFromPage + 1;
  const remainingDays = Math.max(
    1,
    Math.min(
      remainingPages,
      options.newTargetDaysForRemaining ?? Math.ceil(remainingPages / Math.max(1, plan.pagesPerDay))
    )
  );
  const lastCompletedDay =
    completedAssignments[completedAssignments.length - 1]?.dayIndex ?? 0;

  const newFuture = distributePagesIntoAssignments({
    fromPage: nextFromPage,
    toPage: MUSHAF_TOTAL_PAGES,
    startDate: options.fromDateIso ?? getTodayIso(),
    dayCount: remainingDays,
    sessionsPerDay: plan.sessionsPerDay,
    activeWeekdays: plan.activeWeekdays,
    startingDayIndex: lastCompletedDay + 1,
  });

  return {
    ...plan,
    targetDays: Math.max(1, lastCompletedDay) + remainingDays,
    pagesPerDay: Math.max(1, Math.round(remainingPages / remainingDays)),
    currentPage: nextFromPage,
    assignments: [...completedAssignments, ...newFuture],
    updatedAt: new Date().toISOString(),
  };
}

export function computeKhatmahStats(plan: KhatmahPlan): KhatmahStats {
  const totalPagesInPlan = MUSHAF_TOTAL_PAGES - plan.startPage + 1;
  const completedPageSet = new Set<number>();
  let completedSessions = 0;

  for (const a of plan.assignments) {
    if (a.completed) {
      completedSessions += 1;
      for (let p = a.startPage; p <= a.endPage; p += 1) {
        completedPageSet.add(p);
      }
    }
  }

  const completedPages = completedPageSet.size;
  const remainingPages = Math.max(0, totalPagesInPlan - completedPages);
  const percentage =
    totalPagesInPlan > 0 ? Math.round((completedPages / totalPagesInPlan) * 100) : 0;

  // Determine exact completed Juz count from Madinah Mushaf Juz page boundaries
  let completedJuz = 0;
  for (let i = 0; i < MUSHAF_JUZS.length; i += 1) {
    const start = MUSHAF_JUZS[i].startPage;
    const end =
      i + 1 < MUSHAF_JUZS.length
        ? MUSHAF_JUZS[i + 1].startPage - 1
        : MUSHAF_TOTAL_PAGES;
    let allRead = true;
    for (let p = start; p <= end; p += 1) {
      if (p >= plan.startPage && !completedPageSet.has(p)) {
        allRead = false;
        break;
      }
    }
    if (allRead && end >= plan.startPage) {
      completedJuz += 1;
    }
  }

  const firstUncompleted = plan.assignments.find((a) => !a.completed);
  const currentPage = firstUncompleted?.startPage ?? MUSHAF_TOTAL_PAGES;
  const expectedCompletionDate =
    plan.assignments[plan.assignments.length - 1]?.scheduledDate ?? plan.startDate;

  return {
    totalPagesInPlan,
    completedPages,
    remainingPages,
    percentage,
    completedJuz,
    currentPage,
    expectedCompletionDate,
    completedSessions,
    totalSessions: plan.assignments.length,
  };
}

export function describePageSpan(
  startPage: number,
  endPage: number,
  locale: "ar" | "en"
): string {
  const startInfo = getPageIndexInfo(startPage);
  const endInfo = getPageIndexInfo(endPage);
  if (!startInfo || !endInfo) {
    return locale === "ar"
      ? `صفحة ${startPage} — ${endPage}`
      : `Pages ${startPage}–${endPage}`;
  }

  const cleanSurah = (name: string) => name.replace(/^سُورَةُ\s*/u, "").trim();

  if (locale === "ar") {
    return `${cleanSurah(startInfo.startSurahAr)} (${startInfo.startAyah}) ← ${cleanSurah(
      endInfo.startSurahAr
    )} • ج ${startInfo.juz}`;
  }
  return `Surah ${startInfo.startSurah}:${startInfo.startAyah} → Surah ${endInfo.endSurah}:${endInfo.endAyah} • Juz ${startInfo.juz}`;
}

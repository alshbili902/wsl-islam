"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  History,
  Palette,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { useWasl } from "@/components/providers/WaslProvider";
import {
  RELEASE_CATEGORY_META,
  buildAggregatedReleaseSummary,
} from "@/lib/releases/schema";
import type { PlatformRelease, ReleaseCategoryId } from "@/types/islamic";

const STORAGE_KEY = "wasl_release_state_v2";
const NEW_VISITOR_RECENT_WINDOW_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const inMemorySeenReleaseIds = new Set<string>();

interface VisitorReleaseState {
  lastSeenDeployedAt?: string;
  dismissedIds: string[];
}

function readVisitorReleaseState(): VisitorReleaseState {
  const fallbackDismissed = Array.from(inMemorySeenReleaseIds);
  if (typeof window === "undefined") {
    return { dismissedIds: fallbackDismissed };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { dismissedIds: fallbackDismissed };
    const parsed = JSON.parse(raw) as Partial<VisitorReleaseState>;
    const storedIds = Array.isArray(parsed.dismissedIds)
      ? parsed.dismissedIds.filter((x): x is string => typeof x === "string")
      : [];
    return {
      lastSeenDeployedAt:
        typeof parsed.lastSeenDeployedAt === "string"
          ? parsed.lastSeenDeployedAt
          : undefined,
      dismissedIds: Array.from(new Set([...storedIds, ...fallbackDismissed])),
    };
  } catch {
    return { dismissedIds: fallbackDismissed };
  }
}

function writeVisitorReleaseState(state: VisitorReleaseState): void {
  for (const id of state.dismissedIds) {
    inMemorySeenReleaseIds.add(id);
  }
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        lastSeenDeployedAt: state.lastSeenDeployedAt,
        dismissedIds: state.dismissedIds.slice(-60),
      })
    );
  } catch {
    // Graceful in-memory fallback when storage is unavailable
  }
}

function getCategoryIcon(category: ReleaseCategoryId) {
  switch (category) {
    case "new_feature":
      return <Sparkles className="h-3.5 w-3.5" />;
    case "improvement":
      return <TrendingUp className="h-3.5 w-3.5" />;
    case "bug_fix":
      return <Wrench className="h-3.5 w-3.5" />;
    case "performance":
      return <Zap className="h-3.5 w-3.5" />;
    case "security":
      return <ShieldCheck className="h-3.5 w-3.5" />;
    case "ui_ux":
      return <Palette className="h-3.5 w-3.5" />;
    case "content":
      return <BookOpen className="h-3.5 w-3.5" />;
    default:
      return <Sparkles className="h-3.5 w-3.5" />;
  }
}

export function selectPendingReleasesForVisitor(
  releases: PlatformRelease[],
  state: VisitorReleaseState,
  nowMs = Date.now()
): {
  unseen: PlatformRelease[];
  shouldPersistBaselineOnly: boolean;
  latestDeployedAt?: string;
} {
  if (!Array.isArray(releases) || releases.length === 0) {
    return { unseen: [], shouldPersistBaselineOnly: false };
  }

  const sorted = [...releases].sort(
    (a, b) => Date.parse(b.deployedAt) - Date.parse(a.deployedAt)
  );
  const newest = sorted[0];
  const dismissedSet = new Set(state.dismissedIds);

  // Brand-new visitor: show only the single latest release IF it is genuinely recent (<= 14 days).
  // Never treat old historical updates as new announcements for first-time visitors.
  if (!state.lastSeenDeployedAt) {
    const ageMs = nowMs - Date.parse(newest.deployedAt);
    if (ageMs <= NEW_VISITOR_RECENT_WINDOW_MS && !dismissedSet.has(newest.id)) {
      return {
        unseen: [newest],
        shouldPersistBaselineOnly: false,
        latestDeployedAt: newest.deployedAt,
      };
    }
    return {
      unseen: [],
      shouldPersistBaselineOnly: true,
      latestDeployedAt: newest.deployedAt,
    };
  }

  const lastSeenMs = Date.parse(state.lastSeenDeployedAt);
  const unseen = sorted.filter((rel) => {
    const ts = Date.parse(rel.deployedAt);
    if (Number.isNaN(ts)) return false;
    return ts > lastSeenMs && !dismissedSet.has(rel.id);
  });

  return {
    unseen,
    shouldPersistBaselineOnly: false,
    latestDeployedAt: newest.deployedAt,
  };
}

export function ReleaseAnnouncementModal() {
  const pathname = usePathname();
  const { isRtl } = useWasl();
  const osReducedMotion = useReducedMotion();

  const [pendingReleases, setPendingReleases] = useState<PlatformRelease[]>([]);
  const [latestBaselineTs, setLatestBaselineTs] = useState<string | undefined>(
    undefined
  );
  const [open, setOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (pathname === "/updates") return;

    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/releases?limit=15", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { releases?: PlatformRelease[] };
        const releases = Array.isArray(data.releases) ? data.releases : [];
        if (cancelled || releases.length === 0) return;

        const visitorState = readVisitorReleaseState();
        const selection = selectPendingReleasesForVisitor(releases, visitorState);

        if (selection.shouldPersistBaselineOnly && selection.latestDeployedAt) {
          writeVisitorReleaseState({
            lastSeenDeployedAt: selection.latestDeployedAt,
            dismissedIds: visitorState.dismissedIds,
          });
          return;
        }

        if (selection.unseen.length > 0) {
          setPendingReleases(selection.unseen);
          setLatestBaselineTs(selection.latestDeployedAt);
          setOpen(true);
        }
      } catch {
        // Silent failure: visitor experience never breaks if announcement check fails
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const dismissAnnouncement = useCallback(() => {
    const prev = readVisitorReleaseState();
    const newlyDismissed = pendingReleases.map((r) => r.id);
    const mergedDismissed = Array.from(
      new Set([...prev.dismissedIds, ...newlyDismissed])
    );

    const newestTs =
      latestBaselineTs ||
      pendingReleases[0]?.deployedAt ||
      prev.lastSeenDeployedAt ||
      new Date().toISOString();

    writeVisitorReleaseState({
      lastSeenDeployedAt: newestTs,
      dismissedIds: mergedDismissed,
    });
    setOpen(false);
  }, [latestBaselineTs, pendingReleases]);

  // Mark as seen ONLY after the announcement modal has visibly mounted & painted.
  useEffect(() => {
    if (!open || pendingReleases.length === 0) return;

    const rafId = window.requestAnimationFrame(() => {
      const prev = readVisitorReleaseState();
      const newlyShown = pendingReleases.map((r) => r.id);
      const mergedDismissed = Array.from(
        new Set([...prev.dismissedIds, ...newlyShown])
      );
      const newestTs =
        latestBaselineTs ||
        pendingReleases[0]?.deployedAt ||
        prev.lastSeenDeployedAt ||
        new Date().toISOString();

      writeVisitorReleaseState({
        lastSeenDeployedAt: newestTs,
        dismissedIds: mergedDismissed,
      });
    });

    closeBtnRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismissAnnouncement();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, pendingReleases, latestBaselineTs, dismissAnnouncement]);

  const summary = useMemo(() => {
    if (pendingReleases.length === 0) return null;
    return buildAggregatedReleaseSummary(pendingReleases);
  }, [pendingReleases]);

  const formattedDate = useMemo(() => {
    if (!summary?.deployedAt) return "";
    try {
      return new Intl.DateTimeFormat("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(summary.deployedAt));
    } catch {
      return summary.deployedAt.slice(0, 10);
    }
  }, [summary]);

  const ExploreArrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <AnimatePresence>
      {open && summary ? (
        <div
          dir="rtl"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={osReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={osReducedMotion ? { opacity: 0 } : { opacity: 0 }}
            onClick={dismissAnnouncement}
            className="fixed inset-0 bg-black/55 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wasl-release-modal-title"
            initial={
              osReducedMotion
                ? { opacity: 1 }
                : { opacity: 0, y: 28, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              osReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 20, scale: 0.97 }
            }
            transition={{ duration: osReducedMotion ? 0 : 0.24, ease: "easeOut" }}
            className="relative z-10 w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xl flex flex-col"
          >
            {/* Architectural Emerald & Gold Header Banner */}
            <div className="relative bg-gradient-to-br from-[#0d5c43] via-[#0a4b36] to-[#073626] px-6 py-5 text-white shrink-0">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 85% 20%, #dcb460 0%, transparent 45%)",
                }}
              />

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dcb460]/45 bg-[#dcb460]/18 px-3 py-0.5 font-semibold text-[#f9e19b]">
                      <Sparkles className="h-3.5 w-3.5" />
                      {summary.isAggregated
                        ? `تحديث جديد (${summary.releaseCount} إصدارات)`
                        : "تحديث جديد"}
                    </span>
                    <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-mono text-[11px] text-white">
                      v{summary.versionLabel}
                    </span>
                    {formattedDate && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-white/80">
                        <Calendar className="h-3 w-3" />
                        {formattedDate}
                      </span>
                    )}
                  </div>

                  <h2
                    id="wasl-release-modal-title"
                    className="text-lg sm:text-xl font-bold leading-snug text-white"
                  >
                    {summary.titleAr}
                  </h2>
                </div>

                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={dismissAnnouncement}
                  aria-label="إغلاق إعلان التحديث"
                  className="rounded-xl bg-white/10 p-2 text-white/85 hover:bg-white/20 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-5 space-y-5">
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {summary.summaryAr}
              </p>

              <div className="space-y-3.5">
                {summary.categories.map((group) => {
                  const meta = RELEASE_CATEGORY_META[group.category];
                  return (
                    <div
                      key={group.category}
                      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/55 p-4 space-y-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.badgeClass}`}
                        >
                          {getCategoryIcon(group.category)}
                          {group.labelAr}
                        </span>
                      </div>

                      <ul className="space-y-1.5 text-xs sm:text-sm text-[var(--text-primary)] list-disc list-inside leading-relaxed">
                        {group.items.map((item, idx) => (
                          <li key={`${group.category}-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/75 px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <Link
                  href="/updates"
                  onClick={dismissAnnouncement}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-emerald)] hover:bg-[var(--brand-emerald-strong)] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors shadow-sm"
                >
                  <span>استكشاف التحديثات</span>
                  <ExploreArrow className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  onClick={dismissAnnouncement}
                  className="flex-1 sm:flex-none rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--brand-emerald)] transition-colors cursor-pointer"
                >
                  لاحقاً
                </button>
              </div>

              <Link
                href="/updates"
                onClick={dismissAnnouncement}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-gold)] hover:underline"
              >
                <History className="h-3.5 w-3.5" />
                <span>سجل الإصدارات الكامل</span>
              </Link>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

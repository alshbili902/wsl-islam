"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  Calendar,
  Compass,
  History,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wrench,
  X,
} from "lucide-react";
import { useWasl } from "@/components/providers/WaslProvider";
import {
  RELEASE_CATEGORY_META,
  buildAggregatedReleaseSummary,
} from "@/lib/releases/schema";
import type { PlatformRelease, ReleaseCategoryId } from "@/types/islamic";

const STORAGE_KEY = "wasl_release_state_v2";
const VISITOR_COOKIE_NAME = "wasl_vid";
const NEW_VISITOR_RECENT_WINDOW_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const LOAD_DEFER_MS = 650;

const inMemoryDismissedReleaseIds = new Set<string>();
const inMemoryShownSessionKeys = new Set<string>();

export interface VisitorReleaseState {
  visitorId?: string;
  lastSeenDeployedAt?: string;
  dismissedIds: string[];
}

function generateAnonymousVisitorId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `v_${crypto.randomUUID().replace(/-/g, "")}`;
    }
  } catch {
    // Fallback cleanly
  }
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function readVisitorCookie(): string {
  if (typeof document === "undefined") return "";
  try {
    const m = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${VISITOR_COOKIE_NAME}=([^;]+)`)
    );
    return m?.[1] ? decodeURIComponent(m[1]) : "";
  } catch {
    return "";
  }
}

function writeVisitorCookie(visitorId: string): void {
  if (typeof document === "undefined" || !visitorId) return;
  try {
    document.cookie = `${VISITOR_COOKIE_NAME}=${encodeURIComponent(visitorId)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  } catch {
    // Ignore cookie block in strict privacy modes
  }
}

export function getOrCreateVisitorId(): string {
  const fromCookie = readVisitorCookie();
  if (fromCookie) return fromCookie;

  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<VisitorReleaseState>;
        if (typeof parsed.visitorId === "string" && parsed.visitorId.length >= 8) {
          writeVisitorCookie(parsed.visitorId);
          return parsed.visitorId;
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }

  const generated = generateAnonymousVisitorId();
  writeVisitorCookie(generated);
  return generated;
}

export function readVisitorReleaseState(serverDismissedIds: string[] = []): VisitorReleaseState {
  const fallbackDismissed = Array.from(
    new Set([...inMemoryDismissedReleaseIds, ...serverDismissedIds])
  );
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
      visitorId:
        typeof parsed.visitorId === "string" ? parsed.visitorId : undefined,
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

export function writeVisitorReleaseState(state: VisitorReleaseState): void {
  for (const id of state.dismissedIds) {
    inMemoryDismissedReleaseIds.add(id);
  }
  if (state.visitorId) {
    writeVisitorCookie(state.visitorId);
  }
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        visitorId: state.visitorId,
        lastSeenDeployedAt: state.lastSeenDeployedAt,
        dismissedIds: state.dismissedIds.slice(-60),
      })
    );
  } catch {
    // Graceful in-memory fallback when localStorage is unavailable
  }
}

function getCategoryIcon(category: ReleaseCategoryId) {
  switch (category) {
    case "new_update":
    case "content":
      return <BellRing className="h-3.5 w-3.5" />;
    case "new_feature":
      return <Sparkles className="h-3.5 w-3.5" />;
    case "improvement":
    case "ui_ux":
      return <TrendingUp className="h-3.5 w-3.5" />;
    case "bug_fix":
      return <Wrench className="h-3.5 w-3.5" />;
    case "performance_security":
    case "performance":
    case "security":
      return <ShieldCheck className="h-3.5 w-3.5" />;
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

  const verifiedPublished = releases.filter(
    (rel) =>
      rel.isPublished &&
      rel.verificationStatus === "verified" &&
      rel.releaseStatus === "published" &&
      rel.categories.length > 0
  );
  if (verifiedPublished.length === 0) {
    return { unseen: [], shouldPersistBaselineOnly: false };
  }

  const sorted = [...verifiedPublished].sort(
    (a, b) =>
      Date.parse(b.publishedAt || b.deployedAt) -
      Date.parse(a.publishedAt || a.deployedAt)
  );
  const newest = sorted[0];
  const dismissedSet = new Set(state.dismissedIds);

  // Brand-new visitor: show only the single latest release IF it is genuinely recent (<= 14 days).
  if (!state.lastSeenDeployedAt && dismissedSet.size === 0) {
    const newestTs = newest.publishedAt || newest.deployedAt;
    const ageMs = nowMs - Date.parse(newestTs);
    if (ageMs <= NEW_VISITOR_RECENT_WINDOW_MS) {
      return {
        unseen: [newest],
        shouldPersistBaselineOnly: false,
        latestDeployedAt: newestTs,
      };
    }
    return {
      unseen: [],
      shouldPersistBaselineOnly: true,
      latestDeployedAt: newestTs,
    };
  }

  // Returning visitor: show every verified published release not yet dismissed,
  // preferring strict ID dismissal check first so out-of-order/timestamp skew never suppresses genuine updates.
  const lastSeenMs = state.lastSeenDeployedAt
    ? Date.parse(state.lastSeenDeployedAt)
    : 0;
  const unseen = sorted.filter((rel) => {
    if (dismissedSet.has(rel.id)) return false;
    if (!lastSeenMs || Number.isNaN(lastSeenMs)) return true;
    const ts = Date.parse(rel.publishedAt || rel.deployedAt);
    return !Number.isNaN(ts) && ts >= lastSeenMs;
  });

  return {
    unseen,
    shouldPersistBaselineOnly: false,
    latestDeployedAt: newest.publishedAt || newest.deployedAt,
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
  const visitorIdRef = useRef<string>("");
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (pathname === "/updates") return;

    let cancelled = false;
    let timerId: number | null = null;

    async function load() {
      try {
        const visitorId = getOrCreateVisitorId();
        visitorIdRef.current = visitorId;

        const res = await fetch(
          `/api/releases?limit=15&visitorId=${encodeURIComponent(visitorId)}`,
          { cache: "no-store" }
        );
        if (!res.ok) return;

        const data = (await res.json()) as {
          releases?: PlatformRelease[];
          serverDismissedIds?: string[];
        };
        const releases = Array.isArray(data.releases) ? data.releases : [];
        const serverDismissedIds = Array.isArray(data.serverDismissedIds)
          ? data.serverDismissedIds
          : [];

        if (cancelled || releases.length === 0) return;

        const visitorState = readVisitorReleaseState(serverDismissedIds);
        const selection = selectPendingReleasesForVisitor(releases, visitorState);

        if (selection.shouldPersistBaselineOnly && selection.latestDeployedAt) {
          writeVisitorReleaseState({
            visitorId,
            lastSeenDeployedAt: selection.latestDeployedAt,
            dismissedIds: visitorState.dismissedIds,
          });
          return;
        }

        if (selection.unseen.length > 0) {
          const sessionBatchKey = selection.unseen.map((r) => r.id).join(",");
          if (inMemoryShownSessionKeys.has(sessionBatchKey)) {
            return;
          }
          inMemoryShownSessionKeys.add(sessionBatchKey);
          setPendingReleases(selection.unseen);
          setLatestBaselineTs(selection.latestDeployedAt);
          setOpen(true);
        }
      } catch {
        // Silent failure: visitor browsing never breaks when API or network is unavailable
      }
    }

    // Defer slightly so initial page paint and hydration complete smoothly first
    timerId = window.setTimeout(() => {
      if (!cancelled) void load();
    }, LOAD_DEFER_MS);

    return () => {
      cancelled = true;
      if (timerId !== null) window.clearTimeout(timerId);
    };
  }, [pathname]);

  const dismissAnnouncement = useCallback(() => {
    const visitorId = visitorIdRef.current || getOrCreateVisitorId();
    const prev = readVisitorReleaseState();
    const newlyDismissed = pendingReleases.map((r) => r.id);
    const mergedDismissed = Array.from(
      new Set([...prev.dismissedIds, ...newlyDismissed])
    );

    const newestTs =
      latestBaselineTs ||
      pendingReleases[0]?.publishedAt ||
      pendingReleases[0]?.deployedAt ||
      prev.lastSeenDeployedAt ||
      new Date().toISOString();

    writeVisitorReleaseState({
      visitorId,
      lastSeenDeployedAt: newestTs,
      dismissedIds: mergedDismissed,
    });

    if (newlyDismissed.length > 0 && visitorId) {
      fetch("/api/releases/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          releaseIds: newlyDismissed,
        }),
      }).catch(() => {
        // Non-blocking best-effort server persistence
      });
    }

    setOpen(false);
  }, [latestBaselineTs, pendingReleases]);

  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismissAnnouncement();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, dismissAnnouncement]);

  const summary = useMemo(() => {
    if (pendingReleases.length === 0) return null;
    return buildAggregatedReleaseSummary(pendingReleases);
  }, [pendingReleases]);

  const formattedDate = useMemo(() => {
    const rawDate = summary?.publishedAt || summary?.deployedAt;
    if (!rawDate) return "";
    try {
      return new Intl.DateTimeFormat("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(rawDate));
    } catch {
      return rawDate.slice(0, 10);
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
                : { opacity: 0, y: 24, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              osReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 18, scale: 0.96 }
            }
            transition={{ duration: osReducedMotion ? 0 : 0.26, ease: "easeOut" }}
            className="relative z-10 w-full max-w-2xl max-h-[88dvh] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xl flex flex-col"
          >
            {/* Architectural Emerald & Gold Header Banner */}
            <div className="relative bg-gradient-to-br from-[#0d5c43] via-[#0a4b36] to-[#073626] px-5 py-5 sm:px-6 text-white shrink-0">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 85% 20%, #dcb460 0%, transparent 45%)",
                }}
              />

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <motion.span
                      animate={
                        osReducedMotion
                          ? undefined
                          : { scale: [1, 1.06, 1] }
                      }
                      transition={{ duration: 0.9, repeat: 0 }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#dcb460]/45 bg-[#dcb460]/18 px-3 py-0.5 font-semibold text-[#f9e19b]"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {summary.isAggregated
                        ? `تحديث جديد (${summary.releaseCount} إصدارات)`
                        : "تحديث جديد"}
                    </motion.span>
                    <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-mono text-[11px] text-white">
                      v{summary.versionLabel}
                    </span>
                    {formattedDate && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-white/85">
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
                  className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl bg-white/10 p-2 text-white/90 hover:bg-white/20 hover:text-white transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f9e19b]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-5 py-5 sm:px-6 space-y-4">
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {summary.summaryAr}
              </p>

              <div className="space-y-3">
                {summary.categories.map((group) => {
                  const meta = RELEASE_CATEGORY_META[group.category];
                  return (
                    <div
                      key={group.category}
                      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/55 p-4 space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.badgeClass}`}
                        >
                          {getCategoryIcon(group.category)}
                          {group.labelAr}
                        </span>

                        {group.relatedHref && (
                          <Link
                            href={group.relatedHref}
                            onClick={dismissAnnouncement}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--brand-emerald)] hover:underline"
                          >
                            <Compass className="h-3 w-3" />
                            <span>انتقال مباشر للقسم</span>
                          </Link>
                        )}
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
            <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/75 px-5 py-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <Link
                  href="/updates"
                  onClick={dismissAnnouncement}
                  className="flex-1 sm:flex-none min-h-[42px] inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-emerald)] hover:bg-[var(--brand-emerald-strong)] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors shadow-sm"
                >
                  <span>استكشف التحديثات</span>
                  <ExploreArrow className="h-4 w-4" />
                </Link>

                {summary.relatedHref && (
                  <Link
                    href={summary.relatedHref}
                    onClick={dismissAnnouncement}
                    className="flex-1 sm:flex-none min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--brand-emerald)]/35 bg-[var(--brand-emerald-soft)] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[var(--brand-emerald)] hover:bg-[var(--brand-emerald)] hover:text-white transition-colors"
                  >
                    <Compass className="h-4 w-4" />
                    <span>تصفح القسم الجديد</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={dismissAnnouncement}
                  className="flex-1 sm:flex-none min-h-[42px] rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--brand-emerald)] transition-colors cursor-pointer"
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

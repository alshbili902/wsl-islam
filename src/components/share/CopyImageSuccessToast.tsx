"use client";

import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export interface CopyImageSuccessToastProps {
  visible: boolean;
  instanceKey: number;
  locale: "ar" | "en";
  onDismiss?: () => void;
}

export function CopyImageSuccessToast({
  visible,
  instanceKey,
  locale,
  onDismiss,
}: CopyImageSuccessToastProps) {
  const reducedMotion = useReducedMotion();
  const isEn = locale === "en";

  return (
    <div
      dir={isEn ? "ltr" : "rtl"}
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 top-4 sm:top-6 z-[80] flex justify-center px-4"
    >
      <AnimatePresence mode="wait">
        {visible ? (
          <motion.div
            key={`copy-img-toast-${instanceKey}`}
            role="status"
            onClick={onDismiss}
            initial={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -14, scale: 0.92 }
            }
            animate={
              reducedMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -12, scale: 0.96 }
            }
            transition={
              reducedMotion
                ? { duration: 0.14 }
                : {
                    type: "spring",
                    stiffness: 420,
                    damping: 28,
                    mass: 0.8,
                  }
            }
            className="pointer-events-auto relative inline-flex max-w-[min(92vw,24rem)] items-center gap-3 overflow-hidden rounded-2xl border border-emerald-500/35 dark:border-emerald-400/30 bg-[var(--bg-surface)]/95 px-4 py-3 backdrop-blur-md cursor-pointer select-none shadow-[0_14px_38px_-10px_rgba(13,92,67,0.42),0_0_24px_-6px_rgba(16,185,129,0.28)]"
          >
            {/* Subtle top emerald-gold shimmer hairline */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500/75 via-[#dcb460] to-emerald-500/75 opacity-90"
            />

            {/* Soft radial emerald ambient highlight */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-[#dcb460]/8"
            />

            {/* Animated circular emerald icon badge */}
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
              {!reducedMotion ? (
                <motion.span
                  aria-hidden="true"
                  initial={{ scale: 0.7, opacity: 0.55 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.65, ease: "easeOut", delay: 0.12 }}
                  className="absolute inset-0 rounded-full bg-emerald-500/35"
                />
              ) : null}

              <motion.div
                initial={
                  reducedMotion
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.45 }
                }
                animate={{ opacity: 1, scale: 1 }}
                transition={
                  reducedMotion
                    ? { duration: 0.1 }
                    : {
                        type: "spring",
                        stiffness: 460,
                        damping: 22,
                        delay: 0.05,
                      }
                }
                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#127a57] via-[#0d5c43] to-[#08412f] shadow-[0_4px_14px_-2px_rgba(13,92,67,0.55)] ring-4 ring-emerald-500/18 dark:ring-emerald-400/20"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="h-4.5 w-4.5 text-white"
                >
                  <motion.path
                    d="M5.5 12.5L10 17L18.5 7.5"
                    stroke="currentColor"
                    strokeWidth={2.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={
                      reducedMotion
                        ? { pathLength: 1, opacity: 1 }
                        : { pathLength: 0, opacity: 0 }
                    }
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={
                      reducedMotion
                        ? { duration: 0.05 }
                        : {
                            pathLength: {
                              delay: 0.16,
                              duration: 0.34,
                              ease: [0.22, 1, 0.36, 1],
                            },
                            opacity: {
                              delay: 0.14,
                              duration: 0.12,
                            },
                          }
                    }
                  />
                </svg>
              </motion.div>
            </div>

            {/* Crisp Success Message */}
            <motion.div
              initial={
                reducedMotion
                  ? { opacity: 1 }
                  : { opacity: 0, x: isEn ? 6 : -6 }
              }
              animate={{ opacity: 1, x: 0 }}
              transition={
                reducedMotion
                  ? { duration: 0.1 }
                  : { duration: 0.24, delay: 0.13, ease: "easeOut" }
              }
              className="relative min-w-0"
            >
              <p className="text-sm font-bold leading-snug text-[var(--text-primary)] whitespace-nowrap">
                {isEn ? "Image copied successfully" : "تم نسخ الصورة بنجاح"}
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

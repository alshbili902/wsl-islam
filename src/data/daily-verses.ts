import type { DailyVerse } from "@/types/islamic";
import dailyVersesRaw from "./generated/daily-verses.json";

export const DAILY_VERSES: DailyVerse[] = dailyVersesRaw as DailyVerse[];

/**
 * Deterministic daily verse selection based on UTC day number so every visitor
 * sees the same curated, verified Quranic verse on a given day without SSR/client mismatch.
 */
export function getDailyVerse(date: Date = new Date()): DailyVerse {
  const dayIndex = Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000
  );
  return DAILY_VERSES[Math.abs(dayIndex) % DAILY_VERSES.length];
}

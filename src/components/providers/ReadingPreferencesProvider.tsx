"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  ReadingColumnWidth,
  ReadingFontFamily,
  ReadingPaperTheme,
  ReadingPreferencesState,
} from "@/types/islamic";

export const DEFAULT_READING_PREFERENCES: ReadingPreferencesState = {
  fontFamily: "amiri",
  fontSizeScale: 1,
  quranFontSizePx: 28,
  fontWeight: 400,
  lineHeight: 2.1,
  wordSpacingPx: 0,
  textAlign: "start",
  columnWidth: "medium",
  mushafZoom: 1,
  verseHighlight: true,
  showTranslation: true,
  showTafsirPanel: true,
  readingSurface: "default",
  highContrast: false,
  reducedMotion: false,
};

const STORAGE_KEY = "wasl_reading_prefs_v1";

interface ReadingPreferencesContextValue {
  prefs: ReadingPreferencesState;
  updatePrefs: (partial: Partial<ReadingPreferencesState>) => void;
  resetPrefs: () => void;
  hydrated: boolean;
}

const ReadingPreferencesContext =
  createContext<ReadingPreferencesContextValue | null>(null);

function resolveFontStack(family: ReadingFontFamily): string {
  switch (family) {
    case "amiri":
      return `var(--font-arabic-serif), "Amiri", Georgia, serif`;
    case "ibm-plex":
      return `var(--font-arabic-sans), "IBM Plex Sans Arabic", system-ui, sans-serif`;
    case "naskh-system":
      return `"Traditional Arabic", "Scheherazade New", var(--font-arabic-serif), "Amiri", serif`;
    default:
      return `var(--font-arabic-serif), "Amiri", Georgia, serif`;
  }
}

function resolveMaxWidth(col: ReadingColumnWidth): string {
  switch (col) {
    case "narrow":
      return "44rem";
    case "medium":
      return "58rem";
    case "wide":
      return "76rem";
    default:
      return "58rem";
  }
}

function applyCssPreferences(prefs: ReadingPreferencesState) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--wasl-reading-font", resolveFontStack(prefs.fontFamily));
  root.style.setProperty("--wasl-reading-scale", String(prefs.fontSizeScale));
  root.style.setProperty("--wasl-quran-size", `${prefs.quranFontSizePx}px`);
  root.style.setProperty("--wasl-reading-weight", String(prefs.fontWeight));
  root.style.setProperty("--wasl-reading-line-height", String(prefs.lineHeight));
  root.style.setProperty("--wasl-reading-word-spacing", `${prefs.wordSpacingPx}px`);
  root.style.setProperty("--wasl-reading-align", prefs.textAlign);
  root.style.setProperty("--wasl-reading-max-width", resolveMaxWidth(prefs.columnWidth));
  root.style.setProperty("--wasl-mushaf-zoom", String(prefs.mushafZoom));
  root.setAttribute("data-reading-surface", prefs.readingSurface);
  root.setAttribute("data-high-contrast", prefs.highContrast ? "true" : "false");
  root.setAttribute("data-reduced-motion", prefs.reducedMotion ? "true" : "false");
}

function sanitizePreferences(raw: unknown): ReadingPreferencesState {
  if (!raw || typeof raw !== "object") return DEFAULT_READING_PREFERENCES;
  const r = raw as Partial<ReadingPreferencesState>;

  const validFonts: ReadingFontFamily[] = ["amiri", "ibm-plex", "naskh-system"];
  const validSurfaces: ReadingPaperTheme[] = [
    "default",
    "warm-ivory",
    "classic-white",
    "soft-beige",
    "dark-charcoal",
    "midnight-emerald",
  ];
  const validWidths: ReadingColumnWidth[] = ["narrow", "medium", "wide"];
  const validWeights = [400, 500, 600, 700] as const;

  return {
    fontFamily: validFonts.includes(r.fontFamily as ReadingFontFamily)
      ? (r.fontFamily as ReadingFontFamily)
      : DEFAULT_READING_PREFERENCES.fontFamily,
    fontSizeScale:
      typeof r.fontSizeScale === "number" && r.fontSizeScale >= 0.85 && r.fontSizeScale <= 1.45
        ? r.fontSizeScale
        : DEFAULT_READING_PREFERENCES.fontSizeScale,
    quranFontSizePx:
      typeof r.quranFontSizePx === "number" && r.quranFontSizePx >= 20 && r.quranFontSizePx <= 42
        ? r.quranFontSizePx
        : DEFAULT_READING_PREFERENCES.quranFontSizePx,
    fontWeight: (validWeights as readonly number[]).includes(r.fontWeight as number)
      ? (r.fontWeight as 400 | 500 | 600 | 700)
      : DEFAULT_READING_PREFERENCES.fontWeight,
    lineHeight:
      typeof r.lineHeight === "number" && r.lineHeight >= 1.65 && r.lineHeight <= 2.6
        ? r.lineHeight
        : DEFAULT_READING_PREFERENCES.lineHeight,
    wordSpacingPx:
      typeof r.wordSpacingPx === "number" && r.wordSpacingPx >= 0 && r.wordSpacingPx <= 6
        ? r.wordSpacingPx
        : DEFAULT_READING_PREFERENCES.wordSpacingPx,
    textAlign: r.textAlign === "justify" ? "justify" : "start",
    columnWidth: validWidths.includes(r.columnWidth as ReadingColumnWidth)
      ? (r.columnWidth as ReadingColumnWidth)
      : DEFAULT_READING_PREFERENCES.columnWidth,
    mushafZoom:
      typeof r.mushafZoom === "number" && r.mushafZoom >= 0.85 && r.mushafZoom <= 1.35
        ? r.mushafZoom
        : DEFAULT_READING_PREFERENCES.mushafZoom,
    verseHighlight:
      typeof r.verseHighlight === "boolean"
        ? r.verseHighlight
        : DEFAULT_READING_PREFERENCES.verseHighlight,
    showTranslation:
      typeof r.showTranslation === "boolean"
        ? r.showTranslation
        : DEFAULT_READING_PREFERENCES.showTranslation,
    showTafsirPanel:
      typeof r.showTafsirPanel === "boolean"
        ? r.showTafsirPanel
        : DEFAULT_READING_PREFERENCES.showTafsirPanel,
    readingSurface: validSurfaces.includes(r.readingSurface as ReadingPaperTheme)
      ? (r.readingSurface as ReadingPaperTheme)
      : DEFAULT_READING_PREFERENCES.readingSurface,
    highContrast:
      typeof r.highContrast === "boolean"
        ? r.highContrast
        : DEFAULT_READING_PREFERENCES.highContrast,
    reducedMotion:
      typeof r.reducedMotion === "boolean"
        ? r.reducedMotion
        : DEFAULT_READING_PREFERENCES.reducedMotion,
  };
}

export function ReadingPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [prefs, setPrefs] = useState<ReadingPreferencesState>(
    DEFAULT_READING_PREFERENCES
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const next = sanitizePreferences(JSON.parse(raw));
          setPrefs(next);
          applyCssPreferences(next);
        } else {
          applyCssPreferences(DEFAULT_READING_PREFERENCES);
        }
      } catch {
        applyCssPreferences(DEFAULT_READING_PREFERENCES);
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    applyCssPreferences(prefs);
  }, [prefs, hydrated]);

  const updatePrefs = useCallback(
    (partial: Partial<ReadingPreferencesState>) => {
      setPrefs((prev) => {
        const next = sanitizePreferences({ ...prev, ...partial });
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Ignore storage error
        }
        return next;
      });
    },
    []
  );

  const resetPrefs = useCallback(() => {
    setPrefs(DEFAULT_READING_PREFERENCES);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage error
    }
  }, []);

  const value = useMemo<ReadingPreferencesContextValue>(
    () => ({ prefs, updatePrefs, resetPrefs, hydrated }),
    [prefs, updatePrefs, resetPrefs, hydrated]
  );

  return (
    <ReadingPreferencesContext.Provider value={value}>
      {children}
    </ReadingPreferencesContext.Provider>
  );
}

export function useReadingPreferences() {
  const ctx = useContext(ReadingPreferencesContext);
  if (!ctx) {
    throw new Error(
      "useReadingPreferences must be used within ReadingPreferencesProvider"
    );
  }
  return ctx;
}

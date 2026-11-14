"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DICTIONARY, type Dictionary } from "@/lib/i18n/dictionary";
import type {
  BookmarkItem,
  Locale,
  ShareCardPayload,
  ThemeMode,
} from "@/types/islamic";

export type ThemePreference = ThemeMode | "system";

interface WaslContextValue {
  locale: Locale;
  isRtl: boolean;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: Dictionary;
  themePreference: ThemePreference;
  resolvedTheme: ThemeMode;
  setThemePreference: (pref: ThemePreference) => void;
  bookmarks: BookmarkItem[];
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (item: Omit<BookmarkItem, "savedAt">) => void;
  removeBookmark: (id: string) => void;
  sharePayload: ShareCardPayload | null;
  openShareCard: (payload: ShareCardPayload) => void;
  closeShareCard: () => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

const WaslContext = createContext<WaslContextValue | null>(null);

const THEME_STORAGE_KEY = "wasl_theme_v1";
const LOCALE_STORAGE_KEY = "wasl_locale_v1";
const BOOKMARKS_STORAGE_KEY = "wasl_bookmarks_v1";

function resolveSystemTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function WaslProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>("system");
  const [systemTheme, setSystemTheme] = useState<ThemeMode>("light");
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [sharePayload, setSharePayload] = useState<ShareCardPayload | null>(
    null
  );
  const [searchOpen, setSearchOpen] = useState(false);

  // Hydrate user preferences & bookmarks from localStorage once on mount
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
        if (savedLocale === "ar" || savedLocale === "en") {
          setLocaleState(savedLocale);
        }
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (
          savedTheme === "light" ||
          savedTheme === "dark" ||
          savedTheme === "night" ||
          savedTheme === "system"
        ) {
          setThemePreferenceState(savedTheme);
        }
        const savedBookmarks = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
        if (savedBookmarks) {
          const parsed = JSON.parse(savedBookmarks);
          if (Array.isArray(parsed)) {
            setBookmarks(parsed);
          }
        }
      } catch {
        // Ignore storage access errors in private contexts
      }

      setSystemTheme(resolveSystemTheme());
    }, 0);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", listener);
    return () => {
      window.clearTimeout(id);
      mq.removeEventListener("change", listener);
    };
  }, []);

  const resolvedTheme: ThemeMode =
    themePreference === "system" ? systemTheme : themePreference;

  // Apply theme attribute & RTL/LTR document attributes cleanly
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    document.documentElement.style.colorScheme =
      resolvedTheme === "light" ? "light" : "dark";
  }, [resolvedTheme]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  // Global search keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Ignore
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "ar" ? "en" : "ar");
  }, [locale, setLocale]);

  const setThemePreference = useCallback((pref: ThemePreference) => {
    setThemePreferenceState(pref);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, pref);
    } catch {
      // Ignore
    }
  }, []);

  const persistBookmarks = useCallback((next: BookmarkItem[]) => {
    setBookmarks(next);
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore
    }
  }, []);

  const isBookmarked = useCallback(
    (id: string) => bookmarks.some((b) => b.id === id),
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    (item: Omit<BookmarkItem, "savedAt">) => {
      const exists = bookmarks.some((b) => b.id === item.id);
      if (exists) {
        persistBookmarks(bookmarks.filter((b) => b.id !== item.id));
      } else {
        const entry: BookmarkItem = {
          ...item,
          savedAt: new Date().toISOString(),
        };
        persistBookmarks([entry, ...bookmarks]);
      }
    },
    [bookmarks, persistBookmarks]
  );

  const removeBookmark = useCallback(
    (id: string) => {
      persistBookmarks(bookmarks.filter((b) => b.id !== id));
    },
    [bookmarks, persistBookmarks]
  );

  const openShareCard = useCallback((payload: ShareCardPayload) => {
    setSharePayload(payload);
  }, []);

  const closeShareCard = useCallback(() => {
    setSharePayload(null);
  }, []);

  const value = useMemo<WaslContextValue>(
    () => ({
      locale,
      isRtl: locale === "ar",
      setLocale,
      toggleLocale,
      t: DICTIONARY[locale],
      themePreference,
      resolvedTheme,
      setThemePreference,
      bookmarks,
      isBookmarked,
      toggleBookmark,
      removeBookmark,
      sharePayload,
      openShareCard,
      closeShareCard,
      searchOpen,
      setSearchOpen,
    }),
    [
      locale,
      setLocale,
      toggleLocale,
      themePreference,
      resolvedTheme,
      setThemePreference,
      bookmarks,
      isBookmarked,
      toggleBookmark,
      removeBookmark,
      sharePayload,
      openShareCard,
      closeShareCard,
      searchOpen,
    ]
  );

  return <WaslContext.Provider value={value}>{children}</WaslContext.Provider>;
}

export function useWasl() {
  const ctx = useContext(WaslContext);
  if (!ctx) {
    throw new Error("useWasl must be used within WaslProvider");
  }
  return ctx;
}

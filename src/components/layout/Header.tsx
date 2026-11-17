"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  ChevronDown,
  Globe,
  HandHeart,
  Menu,
  Monitor,
  Moon,
  Search,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { WaslLogo } from "@/components/brand/WaslLogo";
import {
  type ThemePreference,
  useWasl,
} from "@/components/providers/WaslProvider";

export function Header() {
  const pathname = usePathname();
  const {
    locale,
    toggleLocale,
    t,
    themePreference,
    resolvedTheme,
    setThemePreference,
    bookmarks,
    setSearchOpen,
  } = useWasl();

  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<
    "quran" | "adhkar" | "services" | "theme" | null
  >(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setOpenDropdown(null);
      setMobileMenuOpen(false);
    }, 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    const onOutsideClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  const quranDropdownLinks = [
    { href: "/quran", label: t.nav.quran },
    { href: "/mushaf", label: t.nav.mushaf },
    { href: "/tafsir", label: t.nav.tafsir },
    { href: "/khatmah", label: t.nav.khatmah },
    { href: "/listen", label: t.nav.listen },
    { href: "/listen/reciters", label: t.nav.allReciters },
    { href: "/listen/library", label: t.nav.listeningLibrary },
  ];

  const adhkarDropdownLinks = [
    { href: "/adhkar", label: t.nav.adhkar },
    { href: "/hadith", label: t.nav.hadith },
    { href: "/knowledge#names-of-allah", label: t.nav.namesOfAllah },
  ];

  const servicesDropdownLinks: Array<{
    href: string;
    label: string;
    icon?: React.ReactNode;
  }> = [
    { href: "/listen", label: t.nav.listen },
    { href: "/lectures", label: t.nav.lectures },
    { href: "/knowledge", label: t.nav.knowledge },
    { href: "/radio", label: t.nav.radio },
    { href: "/notifications", label: t.nav.notifications },
    { href: "/reading-settings", label: t.nav.readingSettings },
    { href: "/ramadan", label: t.nav.ramadan },
    { href: "/zakat", label: t.nav.zakat },
    {
      href: "/charity",
      label: t.nav.charity,
      icon: <HandHeart className="h-4 w-4 text-[var(--brand-gold)] shrink-0" />,
    },
    { href: "/quiz", label: t.nav.quiz },
    { href: "/calendar", label: t.nav.calendar },
    { href: "/resources", label: t.nav.resources },
    { href: "/updates", label: t.nav.updates },
  ];

  const isQuranGroupActive =
    pathname.startsWith("/quran") ||
    pathname.startsWith("/mushaf") ||
    pathname.startsWith("/tafsir") ||
    pathname.startsWith("/khatmah") ||
    pathname.startsWith("/listen");
  const isAdhkarGroupActive =
    pathname.startsWith("/adhkar") || pathname.startsWith("/hadith");
  const isServicesGroupActive =
    pathname.startsWith("/lectures") ||
    pathname.startsWith("/knowledge") ||
    pathname.startsWith("/radio") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/reading-settings") ||
    pathname.startsWith("/ramadan") ||
    pathname.startsWith("/zakat") ||
    pathname.startsWith("/charity") ||
    pathname.startsWith("/quiz") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/resources");

  const themeOptions: {
    id: ThemePreference;
    labelAr: string;
    labelEn: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "light",
      labelAr: "نهاري دافئ",
      labelEn: "Light Ivory",
      icon: <Sun className="h-4 w-4 text-[var(--brand-gold)]" />,
    },
    {
      id: "dark",
      labelAr: "داكن فحمي",
      labelEn: "Dark Charcoal",
      icon: <Moon className="h-4 w-4" />,
    },
    {
      id: "night",
      labelAr: "ليلي هادئ (زمردي)",
      labelEn: "Night Sanctuary",
      icon: <Sparkles className="h-4 w-4 text-[var(--brand-gold)]" />,
    },
    {
      id: "system",
      labelAr: "تلقائي (حسب النظام)",
      labelEn: "System Default",
      icon: <Monitor className="h-4 w-4" />,
    },
  ];

  const activeThemeIcon =
    resolvedTheme === "night" ? (
      <Sparkles className="h-4 w-4 text-[var(--brand-gold)]" />
    ) : resolvedTheme === "dark" ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Sun className="h-4 w-4 text-[var(--brand-gold)]" />
    );

  return (
    <header
      ref={navRef}
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[var(--header-bg)] backdrop-blur-xl border-b border-[var(--border-subtle)] shadow-sm"
          : "bg-[var(--header-bg)]/80 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-[72px] items-center justify-between gap-3">
          {/* Brand Logo (Desktop/Tablet: full wordmark + emblem; Mobile: standalone emblem) */}
          <Link
            href="/"
            aria-label={t.brand.name}
            className="flex items-center shrink-0 group focus-visible:rounded-xl py-1"
          >
            <span className="hidden sm:inline-flex items-center">
              <WaslLogo
                variant="full"
                className="h-9 sm:h-10 lg:h-11 transition-transform duration-200 group-hover:scale-[1.01]"
                alt={t.brand.name}
                priority
              />
            </span>
            <span className="inline-flex sm:hidden items-center">
              <WaslLogo
                variant="icon"
                className="h-9 w-9 transition-transform duration-200 group-hover:scale-[1.03]"
                alt={t.brand.name}
                priority
              />
            </span>
          </Link>

          {/* Desktop Navigation (Concise 6-slot architecture) */}
          <nav
            aria-label={locale === "ar" ? "التنقل الرئيسي" : "Main navigation"}
            className="hidden lg:flex items-center gap-1"
          >
            <NavLink
              href="/"
              active={pathname === "/"}
              label={t.nav.home}
            />

            {/* Dropdown 0: Quran & Tafsir */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown((prev) => (prev === "quran" ? null : "quran"))
                }
                aria-expanded={openDropdown === "quran"}
                className={`relative inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                  isQuranGroupActive
                    ? "text-[var(--brand-emerald)] font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
                }`}
              >
                {isQuranGroupActive ? (
                  <motion.span
                    layoutId="wasl-nav-pill"
                    className="absolute inset-0 rounded-xl bg-[var(--brand-emerald-soft)] -z-10"
                  />
                ) : null}
                <span>{t.nav.quranAndTafsir}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openDropdown === "quran" ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {openDropdown === "quran" ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="wasl-surface absolute top-full mt-2 w-64 rounded-2xl p-2 start-0"
                  >
                    {quranDropdownLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--brand-emerald)] transition-colors"
                      >
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <NavLink
              href="/prayer-times"
              active={pathname.startsWith("/prayer-times")}
              label={t.nav.prayerTimes}
            />

            {/* Dropdown 1: Adhkar & Hadith */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown((prev) => (prev === "adhkar" ? null : "adhkar"))
                }
                aria-expanded={openDropdown === "adhkar"}
                className={`relative inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                  isAdhkarGroupActive
                    ? "text-[var(--brand-emerald)] font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
                }`}
              >
                {isAdhkarGroupActive ? (
                  <motion.span
                    layoutId="wasl-nav-pill"
                    className="absolute inset-0 rounded-xl bg-[var(--brand-emerald-soft)] -z-10"
                  />
                ) : null}
                <span>{t.nav.adhkarAndHadith}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openDropdown === "adhkar" ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {openDropdown === "adhkar" ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="wasl-surface absolute top-full mt-2 w-60 rounded-2xl p-2 start-0"
                  >
                    {adhkarDropdownLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpenDropdown(null)}
                        className={`block rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                          pathname === item.href
                            ? "bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)] font-semibold"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Dropdown 2: Knowledge & Services */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown((prev) =>
                    prev === "services" ? null : "services"
                  )
                }
                aria-expanded={openDropdown === "services"}
                className={`relative inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                  isServicesGroupActive
                    ? "text-[var(--brand-emerald)] font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
                }`}
              >
                {isServicesGroupActive ? (
                  <motion.span
                    layoutId="wasl-nav-pill"
                    className="absolute inset-0 rounded-xl bg-[var(--brand-emerald-soft)] -z-10"
                  />
                ) : null}
                <span>{t.nav.knowledgeAndServices}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openDropdown === "services" ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {openDropdown === "services" ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="wasl-surface absolute top-full mt-2 w-64 rounded-2xl p-2 start-0"
                  >
                    {servicesDropdownLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpenDropdown(null)}
                        className={`flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                          pathname === item.href
                            ? "bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)] font-semibold"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.icon ?? null}
                      </Link>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </nav>

          {/* Actions: Search, Bookmarks, Language, Theme, Mobile Drawer */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={t.nav.searchShortcut}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 sm:px-3 py-2 text-xs sm:text-sm text-[var(--text-secondary)] hover:border-[var(--brand-gold)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Search className="h-4 w-4" />
              <span className="hidden xl:inline">{t.nav.searchShortcut}</span>
              <kbd className="hidden xl:inline-block rounded bg-[var(--bg-surface-alt)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-muted)]">
                ⌘K
              </kbd>
            </button>

            <Link
              href="/bookmarks"
              aria-label={t.nav.bookmarks}
              className={`relative inline-flex items-center justify-center rounded-xl border px-2.5 py-2 transition-colors ${
                pathname === "/bookmarks"
                  ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--brand-gold)]"
              }`}
            >
              <Bookmark className="h-4 w-4" />
              {bookmarks.length > 0 ? (
                <span className="ms-1 text-[11px] font-bold text-[var(--brand-gold)]">
                  {bookmarks.length}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={toggleLocale}
              aria-label={
                locale === "ar"
                  ? "Switch to English"
                  : "التبديل إلى اللغة العربية"
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--brand-gold)] transition-colors"
            >
              <Globe className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
              <span>{locale === "ar" ? "EN" : "عربي"}</span>
            </button>

            {/* Theme Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown((prev) => (prev === "theme" ? null : "theme"))
                }
                aria-label={t.themes.label}
                aria-expanded={openDropdown === "theme"}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-2 text-xs font-medium hover:border-[var(--brand-gold)] transition-colors"
              >
                {activeThemeIcon}
                <span className="hidden md:inline text-[var(--text-secondary)]">
                  {resolvedTheme === "night"
                    ? t.themes.night
                    : resolvedTheme === "dark"
                      ? t.themes.dark
                      : t.themes.light}
                </span>
              </button>

              <AnimatePresence>
                {openDropdown === "theme" ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="wasl-surface absolute top-full mt-2 w-56 rounded-2xl p-2 end-0"
                  >
                    <p className="px-3 py-1.5 text-[11px] font-semibold text-[var(--text-muted)]">
                      {t.themes.label}
                    </p>
                    {themeOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setThemePreference(opt.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                          themePreference === opt.id
                            ? "bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)] font-semibold"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {opt.icon}
                          <span>
                            {locale === "ar" ? opt.labelAr : opt.labelEn}
                          </span>
                        </span>
                        {themePreference === opt.id ? (
                          <span className="h-2 w-2 rounded-full bg-[var(--brand-gold)]" />
                        ) : null}
                      </button>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={locale === "ar" ? "القائمة" : "Menu"}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden inline-flex items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 text-[var(--text-primary)]"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="lg:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden"
          >
            <div className="mx-auto max-w-7xl px-4 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-center pb-2 border-b border-[var(--border-subtle)]">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={t.brand.name}
                >
                  <WaslLogo
                    variant="full"
                    className="h-10"
                    alt={t.brand.name}
                  />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <MobileLink href="/" label={t.nav.home} active={pathname === "/"} />
                <MobileLink
                  href="/quran"
                  label={t.nav.quran}
                  active={pathname.startsWith("/quran")}
                />
                <MobileLink
                  href="/mushaf"
                  label={t.nav.mushaf}
                  active={pathname.startsWith("/mushaf")}
                />
                <MobileLink
                  href="/tafsir"
                  label={t.nav.tafsir}
                  active={pathname.startsWith("/tafsir")}
                />
                <MobileLink
                  href="/khatmah"
                  label={t.nav.khatmah}
                  active={pathname.startsWith("/khatmah")}
                />
                <MobileLink
                  href="/listen"
                  label={t.nav.listen}
                  active={pathname === "/listen"}
                />
                <MobileLink
                  href="/listen/reciters"
                  label={t.nav.allReciters}
                  active={pathname.startsWith("/listen/reciters")}
                />
                <MobileLink
                  href="/listen/library"
                  label={t.nav.listeningLibrary}
                  active={pathname.startsWith("/listen/library")}
                />
                <MobileLink
                  href="/prayer-times"
                  label={t.nav.prayerTimes}
                  active={pathname.startsWith("/prayer-times")}
                />
                <MobileLink
                  href="/lectures"
                  label={t.nav.lectures}
                  active={pathname.startsWith("/lectures")}
                />
                <MobileLink
                  href="/notifications"
                  label={t.nav.notifications}
                  active={pathname.startsWith("/notifications")}
                />
                <MobileLink
                  href="/reading-settings"
                  label={t.nav.readingSettings}
                  active={pathname.startsWith("/reading-settings")}
                />
                <MobileLink
                  href="/adhkar"
                  label={t.nav.adhkar}
                  active={pathname.startsWith("/adhkar")}
                />
                <MobileLink
                  href="/hadith"
                  label={t.nav.hadith}
                  active={pathname.startsWith("/hadith")}
                />
                <MobileLink
                  href="/radio"
                  label={t.nav.radio}
                  active={pathname.startsWith("/radio")}
                />
                <MobileLink
                  href="/knowledge"
                  label={t.nav.knowledge}
                  active={pathname.startsWith("/knowledge")}
                />
                <MobileLink
                  href="/ramadan"
                  label={t.nav.ramadan}
                  active={pathname.startsWith("/ramadan")}
                />
                <MobileLink
                  href="/zakat"
                  label={t.nav.zakat}
                  active={pathname.startsWith("/zakat")}
                />
                <MobileLink
                  href="/charity"
                  label={t.nav.charity}
                  active={pathname.startsWith("/charity")}
                  icon={<HandHeart className="h-4 w-4 text-[var(--brand-gold)] shrink-0" />}
                />
                <MobileLink
                  href="/quiz"
                  label={t.nav.quiz}
                  active={pathname.startsWith("/quiz")}
                />
                <MobileLink
                  href="/calendar"
                  label={t.nav.calendar}
                  active={pathname.startsWith("/calendar")}
                />
                <MobileLink
                  href="/resources"
                  label={t.nav.resources}
                  active={pathname.startsWith("/resources")}
                />
                <MobileLink
                  href="/updates"
                  label={t.nav.updates}
                  active={pathname.startsWith("/updates")}
                />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function NavLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`relative rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
        active
          ? "text-[var(--brand-emerald)] font-semibold"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
      }`}
    >
      {active ? (
        <motion.span
          layoutId="wasl-nav-pill"
          className="absolute inset-0 rounded-xl bg-[var(--brand-emerald-soft)] -z-10"
        />
      ) : null}
      {label}
    </Link>
  );
}

function MobileLink({
  href,
  label,
  active,
  icon,
}: {
  href: string;
  label: string;
  active: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium text-center transition-colors ${
        active
          ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)] font-semibold"
          : "border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/50 text-[var(--text-primary)]"
      }`}
    >
      {icon ?? null}
      <span>{label}</span>
    </Link>
  );
}

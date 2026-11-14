"use client";

import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { GeometricLattice } from "@/components/brand/IslamicVisuals";
import { WaslLogo } from "@/components/brand/WaslLogo";
import { useWasl } from "@/components/providers/WaslProvider";

export function Footer() {
  const { locale, t } = useWasl();

  const coreLinks = [
    { href: "/quran", label: t.nav.quran },
    { href: "/mushaf", label: t.nav.mushaf },
    { href: "/tafsir", label: t.nav.tafsir },
    { href: "/khatmah", label: t.nav.khatmah },
    { href: "/listen", label: t.nav.listen },
    { href: "/listen/reciters", label: t.nav.allReciters },
    { href: "/prayer-times", label: t.nav.prayerTimes },
    { href: "/adhkar", label: t.nav.adhkar },
    { href: "/hadith", label: t.nav.hadith },
    { href: "/radio", label: t.nav.radio },
  ];

  const serviceLinks = [
    { href: "/listen/library", label: t.nav.listeningLibrary },
    { href: "/lectures", label: t.nav.lectures },
    { href: "/knowledge", label: t.nav.knowledge },
    { href: "/notifications", label: t.nav.notifications },
    { href: "/reading-settings", label: t.nav.readingSettings },
    { href: "/ramadan", label: t.nav.ramadan },
    { href: "/zakat", label: t.nav.zakat },
    { href: "/quiz", label: t.nav.quiz },
    { href: "/calendar", label: t.nav.calendar },
    { href: "/resources", label: t.nav.resources },
  ];

  const officialLinks = [
    {
      href: "https://qurancomplex.gov.sa",
      labelAr: "مجمع الملك فهد للمصحف الشريف",
      labelEn: "King Fahd Quran Complex",
    },
    {
      href: "https://binbaz.org.sa",
      labelAr: "الموقع الرسمي للشيخ ابن باز",
      labelEn: "Sheikh Bin Baz Official Site",
    },
    {
      href: "https://www.alifta.gov.sa",
      labelAr: "الرئاسة العامة للبحوث والإفتاء",
      labelEn: "Saudi Presidency of Ifta",
    },
    {
      href: "https://ehsan.sa",
      labelAr: "منصة إحسان الخيرية",
      labelEn: "Ehsan National Charity",
    },
  ];

  return (
    <footer className="relative mt-20 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 text-[var(--brand-emerald)]">
        <GeometricLattice opacity={0.028} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Identity */}
          <div className="lg:col-span-4 space-y-4">
            <div className="space-y-2">
              <Link
                href="/"
                aria-label={t.brand.name}
                className="inline-flex items-center focus-visible:rounded-xl"
              >
                <WaslLogo
                  variant="full"
                  className="h-12 sm:h-14"
                  alt={t.brand.name}
                />
              </Link>
              <p className="text-xs text-[var(--brand-gold)] font-mono">
                {t.brand.handle}
              </p>
            </div>

            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              {t.footer.about}
            </p>

            <div className="flex items-start gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/60 p-3 text-xs text-[var(--text-secondary)]">
              <ShieldCheck className="h-4 w-4 text-[var(--brand-emerald)] shrink-0 mt-0.5" />
              <span>{t.footer.integrityNote}</span>
            </div>
          </div>

          {/* Core Sections */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {t.footer.sectionsTitle}
            </h3>
            <ul className="space-y-2 text-sm">
              {coreLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[var(--text-secondary)] hover:text-[var(--brand-emerald)] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {t.footer.servicesTitle}
            </h3>
            <ul className="space-y-2 text-sm">
              {serviceLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[var(--text-secondary)] hover:text-[var(--brand-emerald)] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Official Institutions & Contact */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {t.footer.trustedLinksTitle}
            </h3>
            <ul className="space-y-2 text-sm">
              {officialLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--brand-emerald)] transition-colors"
                  >
                    <span>{locale === "ar" ? item.labelAr : item.labelEn}</span>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)] space-y-1">
              <p>{t.footer.contactTitle}: contact@wasl-islamic.org</p>
              <p dir="ltr" className="font-mono text-[var(--brand-gold)]">
                @waslofficiall
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <p>{t.footer.rights}</p>
          <p>{t.brand.cta}</p>
        </div>
      </div>
    </footer>
  );
}

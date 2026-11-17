"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Building2,
  Calculator,
  ChevronDown,
  ExternalLink,
  Globe,
  HandHeart,
  Info,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { GeometricLattice } from "@/components/brand/IslamicVisuals";
import { useWasl } from "@/components/providers/WaslProvider";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  CHARITY_CATEGORIES,
  OFFICIAL_CHARITY_PLATFORMS,
  type CharityCategoryId,
  type OfficialCharityPlatform,
} from "@/data/charity";

const SAFETY_NOTE_AR =
  "لضمان سلامة تبرعك، تأكد من إتمام العملية عبر الموقع الرسمي للمنصة، ولا تشارك بياناتك البنكية أو رموز التحقق مع أي جهة غير موثوقة.";
const SAFETY_NOTE_EN =
  "To keep your donation safe, always verify that you complete transactions on the platform's official website and never share banking credentials or verification codes with untrusted parties.";

function PlatformLogoBox({
  platform,
  isDark,
  isEn,
}: {
  platform: OfficialCharityPlatform;
  isDark: boolean;
  isEn: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const logoSrc = isDark
    ? platform.logoDarkPath || platform.logoLightPath
    : platform.logoLightPath;

  const showImage = Boolean(logoSrc) && !imageFailed;

  return (
    <div
      className="flex h-16 w-20 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/75 px-2.5 py-2 shadow-xs overflow-hidden"
      aria-hidden={!showImage}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoSrc}
          alt={isEn ? `${platform.nameEn} official logo` : `شعار ${platform.nameAr} الرسمي`}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="max-h-11 max-w-full w-auto object-contain"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-center leading-tight">
          <span
            className="text-base font-extrabold tracking-tight"
            style={{ color: platform.accentHex }}
          >
            {platform.monogramAr}
          </span>
          <span className="mt-0.5 text-[9px] font-mono text-[var(--text-muted)]">
            {platform.officialDomain}
          </span>
        </div>
      )}
    </div>
  );
}

export function CharityDirectoryClient() {
  const { locale, resolvedTheme } = useWasl();
  const isEn = locale === "en";
  const isDark = resolvedTheme === "dark" || resolvedTheme === "night";
  const osReducedMotion = useReducedMotion();

  const [selectedCategory, setSelectedCategory] = useState<
    CharityCategoryId | "all"
  >("all");
  const [expandedDetailsId, setExpandedDetailsId] = useState<string | null>(
    null
  );

  const categoryCounts = useMemo(() => {
    const map = new Map<CharityCategoryId, number>();
    for (const def of CHARITY_CATEGORIES) {
      map.set(
        def.id,
        OFFICIAL_CHARITY_PLATFORMS.filter((p) =>
          p.categories.includes(def.id)
        ).length
      );
    }
    return map;
  }, []);

  const filteredPlatforms = useMemo(() => {
    if (selectedCategory === "all") return OFFICIAL_CHARITY_PLATFORMS;
    return OFFICIAL_CHARITY_PLATFORMS.filter((platform) =>
      platform.categories.includes(selectedCategory)
    );
  }, [selectedCategory]);

  const categoryLabelMap = useMemo(() => {
    const map = new Map<CharityCategoryId, { ar: string; en: string }>();
    for (const c of CHARITY_CATEGORIES) {
      map.set(c.id, { ar: c.labelAr, en: c.labelEn });
    }
    return map;
  }, []);

  return (
    <div
      dir={isEn ? "ltr" : "rtl"}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8"
    >
      <Breadcrumbs
        items={[
          {
            labelAr: "الصدقة والتبرع",
            labelEn: "Charity & Donations",
          },
        ]}
      />

      {/* Emerald & Gold Architectural Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-gradient-to-br from-[#0d5c43] via-[#094834] to-[#063223] px-6 py-8 sm:px-10 sm:py-11 text-white shadow-xl">
        <div className="pointer-events-none absolute inset-0 text-white">
          <GeometricLattice opacity={0.07} />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -end-20 h-72 w-72 rounded-full opacity-25 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, #dcb460 0%, rgba(220,180,96,0) 70%)",
          }}
        />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#dcb460]/45 bg-[#dcb460]/15 px-3.5 py-1 text-xs font-semibold text-[#f9e19b]">
            <HandHeart className="h-3.5 w-3.5" />
            <span>
              {isEn
                ? "Verified Saudi Official Donation Directory"
                : "دليل منصات التبرع السعودية الرسمية"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {isEn ? "Charity & Official Donations" : "الصدقة والتبرع"}
          </h1>

          <p className="text-sm sm:text-base leading-relaxed text-white/90">
            {isEn
              ? "The doors of goodness are many. Here is a trusted directory of official Saudi charitable donation platforms that help you reach verified giving opportunities directly."
              : "أبواب الخير كثيرة، وهنا تجد مجموعة من منصات التبرع السعودية الرسمية التي تسهّل عليك الوصول إلى فرص الصدقة والعطاء والمساهمة في الأعمال الخيرية."}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-white/85">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 backdrop-blur-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-[#f9e19b]" />
              {isEn
                ? `${OFFICIAL_CHARITY_PLATFORMS.length} Verified Official Platforms`
                : `${OFFICIAL_CHARITY_PLATFORMS.length} منصات رسمية معتمدة`}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 backdrop-blur-xs">
              <Lock className="h-3.5 w-3.5 text-[#f9e19b]" />
              {isEn
                ? "Direct Official Links • Zero Financial Collection Here"
                : "روابط رسمية مباشرة • بدون أي وساطة مالية"}
            </span>
          </div>
        </div>
      </section>

      {/* Category Filter Toolbar */}
      <section
        aria-label={isEn ? "Filter donation platforms by category" : "تصفية المنصات حسب مجال التبرع"}
        className="wasl-surface rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5 space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--brand-gold)]" />
            <span>
              {isEn
                ? "Browse by Donation Specialization"
                : "تصفّح حسب مجال التبرع"}
            </span>
          </h2>
          <span className="text-xs text-[var(--text-muted)]">
            {isEn
              ? `Showing ${filteredPlatforms.length} of ${OFFICIAL_CHARITY_PLATFORMS.length} platforms`
              : `عرض ${filteredPlatforms.length} من أصل ${OFFICIAL_CHARITY_PLATFORMS.length} منصات رسمية`}
          </span>
        </div>

        <div
          role="group"
          aria-label={isEn ? "Donation Categories" : "تصنيفات التبرع"}
          className="flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            aria-pressed={selectedCategory === "all"}
            className={`rounded-full border px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              selectedCategory === "all"
                ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald)] text-white shadow-xs"
                : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--brand-emerald)]"
            }`}
          >
            {isEn ? "All Platforms" : "جميع المنصات"} (
            {OFFICIAL_CHARITY_PLATFORMS.length})
          </button>

          {CHARITY_CATEGORIES.map((category) => {
            const active = selectedCategory === category.id;
            const count = categoryCounts.get(category.id) ?? 0;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                aria-pressed={active}
                className={`rounded-full border px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  active
                    ? "border-[var(--brand-emerald)] bg-[var(--brand-emerald)] text-white shadow-xs"
                    : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--brand-emerald)]"
                }`}
              >
                {isEn ? category.labelEn : category.labelAr} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* Platforms Grid */}
      <section
        aria-label={isEn ? "Official Donation Platforms" : "المنصات الخيرية الرسمية"}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredPlatforms.map((platform, idx) => {
          const isDetailsOpen = expandedDetailsId === platform.id;
          return (
            <motion.article
              key={platform.id}
              layout={!osReducedMotion}
              initial={osReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: osReducedMotion ? 0 : 0.24,
                delay: osReducedMotion ? 0 : idx * 0.04,
              }}
              className="group wasl-surface relative flex flex-col justify-between rounded-3xl border border-[var(--border-subtle)] hover:border-[var(--brand-emerald)]/60 p-6 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Subtle top emerald & gold accent bar */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand-emerald)] via-[var(--brand-gold)] to-[var(--brand-emerald)] opacity-85"
              />

              <div className="space-y-4">
                {/* Header: Logo + Official Badge */}
                <div className="flex items-start justify-between gap-3 pt-1">
                  <PlatformLogoBox
                    platform={platform}
                    isDark={isDark}
                    isEn={isEn}
                  />

                  <div className="flex flex-col items-end gap-1.5 text-end">
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-[var(--brand-emerald-soft)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--brand-emerald)]">
                      <ShieldCheck className="h-3 w-3 shrink-0" />
                      <span>
                        {isEn
                          ? platform.officialStatusNoteEn
                          : platform.officialStatusNoteAr}
                      </span>
                    </span>

                    <span
                      dir="ltr"
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]"
                    >
                      <Globe className="h-3 w-3 text-[var(--brand-gold)]" />
                      {platform.officialDomain}
                    </span>
                  </div>
                </div>

                {/* Title & Specialization */}
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-emerald)] transition-colors">
                    {isEn ? platform.nameEn : platform.nameAr}
                  </h2>
                  <p className="text-xs font-semibold text-[var(--brand-gold)]">
                    {isEn
                      ? platform.specializationEn
                      : platform.specializationAr}
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {isEn ? platform.descriptionEn : platform.descriptionAr}
                </p>

                {/* Matching Categories */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {platform.categories.map((catId) => {
                    const labels = categoryLabelMap.get(catId);
                    return (
                      <span
                        key={catId}
                        className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/70 px-2.5 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]"
                      >
                        {isEn ? labels?.en : labels?.ar}
                      </span>
                    );
                  })}
                </div>

                {/* Optional Compact Details Accordion */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedDetailsId((prev) =>
                        prev === platform.id ? null : platform.id
                      )
                    }
                    aria-expanded={isDetailsOpen}
                    aria-controls={`charity-details-${platform.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-emerald)] transition-colors cursor-pointer"
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span>
                      {isEn ? "Platform Details" : "تفاصيل المنصة والجهة المشرفة"}
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${
                        isDetailsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isDetailsOpen ? (
                      <motion.div
                        id={`charity-details-${platform.id}`}
                        initial={osReducedMotion ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={osReducedMotion ? undefined : { opacity: 0, height: 0 }}
                        transition={{ duration: osReducedMotion ? 0 : 0.2 }}
                        className="overflow-hidden"
                      >
                        <dl className="mt-2.5 space-y-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/60 p-3.5 text-xs">
                          <div className="flex items-start gap-2">
                            <Building2 className="h-3.5 w-3.5 text-[var(--brand-gold)] shrink-0 mt-0.5" />
                            <div>
                              <dt className="font-semibold text-[var(--text-primary)]">
                                {isEn ? "Supervising Authority:" : "الجهة المشرفة / التابعة:"}
                              </dt>
                              <dd className="text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                                {isEn
                                  ? platform.supervisingEntityEn
                                  : platform.supervisingEntityAr}
                              </dd>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Globe className="h-3.5 w-3.5 text-[var(--brand-emerald)] shrink-0 mt-0.5" />
                            <div>
                              <dt className="font-semibold text-[var(--text-primary)]">
                                {isEn ? "Official Website:" : "الموقع الإلكتروني الرسمي:"}
                              </dt>
                              <dd
                                dir="ltr"
                                className="font-mono text-[11px] text-[var(--brand-emerald)] break-all mt-0.5"
                              >
                                {platform.officialUrl}
                              </dd>
                            </div>
                          </div>
                        </dl>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                <a
                  href={platform.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={
                    isEn
                      ? `Visit ${platform.nameEn} official website (${platform.officialDomain}) in a new tab`
                      : `زيارة ${platform.nameAr} عبر موقعها الرسمي (${platform.officialDomain}) في تبويب جديد`
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-emerald)] hover:bg-[var(--brand-emerald-strong)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)]"
                >
                  <span>{isEn ? "Visit Platform" : "زيارة المنصة"}</span>
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                </a>
              </div>
            </motion.article>
          );
        })}
      </section>

      {/* Donor Trust & Safety Callout */}
      <section
        aria-label={isEn ? "Donor Safety & Transparency Notice" : "إرشادات السلامة والشفافية للتبرع"}
        className="wasl-surface rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/8 via-[var(--bg-surface)] to-[var(--brand-emerald-soft)]/35 p-6 sm:p-7 space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-[var(--brand-gold)]">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              {isEn
                ? "Donor Safety & Direct Navigation Policy"
                : "إرشاد مهم لسلامة التبرع والتحقق من المصدر"}
            </h2>
            <p className="text-sm leading-relaxed font-medium text-[var(--text-primary)]">
              {isEn ? SAFETY_NOTE_EN : SAFETY_NOTE_AR}
            </p>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              {isEn
                ? "Wasl Islamic operates strictly as an informational directory linking directly to official Saudi donation websites. Wasl Islamic does not represent these platforms, never processes donations, and never collects payment or banking details."
                : "تنويه: تقوم منصة «وصل الإسلامية» بدور الدليل التعريفي والربط المباشر فقط نحو المواقع الرسمية المعتمدة أعلاه، ولا تمثل تلك المنصات ولا تُجري أي عمليات دفع أو تحصيل تبرعات أو حفظ لأي بيانات بنكية داخلها."}
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)]">
          <span className="text-xs text-[var(--text-muted)]">
            {isEn
              ? "Need to calculate your Zakat amount before donating?"
              : "هل ترغب في حساب مقدار زكاة مالك قبل التوجه للتبرع؟"}
          </span>
          <Link
            href="/zakat"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--brand-emerald)] hover:border-[var(--brand-emerald)] transition-colors"
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>{isEn ? "Open Zakat Calculator" : "الانتقال إلى حاسبة الزكاة"}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

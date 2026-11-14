"use client";

import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  ExternalLink,
  HandHeart,
  Info,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { useWasl } from "@/components/providers/WaslProvider";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageShell, RevealSection } from "@/components/ui/MotionPrimitives";
import {
  GeometricLattice,
  OrnamentalDivider,
} from "@/components/brand/IslamicVisuals";
import type { ScholarlyResource } from "@/types/islamic";

const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 595;

export function ZakatClient({
  charityPlatforms,
}: {
  charityPlatforms: ScholarlyResource[];
}) {
  const { locale } = useWasl();

  const [nisabStandard, setNisabStandard] = useState<"gold" | "silver">("gold");
  const [goldPricePerGram, setGoldPricePerGram] = useState<string>("330");
  const [silverPricePerGram, setSilverPricePerGram] = useState<string>("4");
  const [currencyCode, setCurrencyCode] = useState<string>("SAR");

  const [cashSavings, setCashSavings] = useState<string>("0");
  const [goldValueOrGrams, setGoldValueOrGrams] = useState<string>("0");
  const [stocksAndTrade, setStocksAndTrade] = useState<string>("0");
  const [debtsDueNow, setDebtsDueNow] = useState<string>("0");

  const toNum = (v: string) => {
    const parsed = Number.parseFloat(v);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  };

  const calculation = useMemo(() => {
    const goldGramPrice = toNum(goldPricePerGram);
    const silverGramPrice = toNum(silverPricePerGram);

    const nisabThreshold =
      nisabStandard === "gold"
        ? GOLD_NISAB_GRAMS * goldGramPrice
        : SILVER_NISAB_GRAMS * silverGramPrice;

    const totalAssets =
      toNum(cashSavings) + toNum(goldValueOrGrams) + toNum(stocksAndTrade);
    const netWealth = Math.max(0, totalAssets - toNum(debtsDueNow));
    const meetsNisab = nisabThreshold > 0 && netWealth >= nisabThreshold;
    const zakatDue = meetsNisab ? netWealth * 0.025 : 0;

    return {
      nisabThreshold,
      totalAssets,
      netWealth,
      meetsNisab,
      zakatDue,
    };
  }, [
    nisabStandard,
    goldPricePerGram,
    silverPricePerGram,
    cashSavings,
    goldValueOrGrams,
    stocksAndTrade,
    debtsDueNow,
  ]);

  const formatMoney = (amount: number) =>
    `${amount.toLocaleString(locale === "ar" ? "ar-SA" : "en-US", {
      maximumFractionDigits: 2,
    })} ${currencyCode}`;

  return (
    <PageShell className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { labelAr: "الزكاة والصدقات", labelEn: "Zakat & Charity" },
        ]}
      />

      {/* Hero Section */}
      <section className="wasl-surface relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
        <GeometricLattice className="opacity-[0.045]" />
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--wasl-border)] bg-[var(--wasl-bg)]/85 px-3.5 py-1.5 text-xs font-medium text-[var(--wasl-primary)]">
            <HandHeart className="h-3.5 w-3.5 text-[var(--wasl-accent)]" />
            <span>
              {locale === "ar"
                ? "إرشاد موثق وروابط مباشرة للمنصات الخيرية الرسمية المعتمدة"
                : "Educational Zakat Guide & Verified Official Charity Platforms"}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-[var(--wasl-text)] sm:text-4xl">
            {locale === "ar"
              ? "الزكاة والصدقات والعمل الخيري"
              : "Zakat Guidance & Verified Charity"}
          </h1>

          <p className="text-sm leading-relaxed text-[var(--wasl-text-muted)]">
            {locale === "ar"
              ? "احسب زكاة مالك بسهولة وفق الضوابط الشرعية لبلوغ النصاب وحولان الحول بنسبة ربع العشر (2.5%)، وتعرّف على المنصات السعودية الرسمية الموثوقة لإخراج الزكاة والصدقات."
              : "Estimate your annual Zakat al-Mal using the 2.5% threshold above Nisab, learn Zakat principles, and navigate directly to verified official Saudi charitable platforms."}
          </p>

          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/35 bg-amber-500/10 p-3.5 text-xs leading-relaxed text-[var(--wasl-text)]">
            <Info className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
            <p>
              {locale === "ar"
                ? "تنبيه مهم: منصة وصل الإسلامية منصة تعليمية إرشادية لا تستقبل أموالًا ولا تجمع تبرعات؛ وتُوجّهك مباشرة إلى المنصات الوطنية الرسمية مثل إحسان وجود الإسكان وشفاء."
                : "Transparency notice: Wasl Islamic does NOT collect payments or process donations directly. All charity links below take you directly to official national government-overseen platforms such as Ehsan."}
            </p>
          </div>
        </div>
      </section>

      {/* Zakat Calculator + Summary */}
      <RevealSection className="grid gap-6 lg:grid-cols-12 mb-10">
        <div className="wasl-surface rounded-3xl p-6 sm:p-7 lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--wasl-border)] pb-4">
            <div className="flex items-center gap-2.5">
              <Calculator className="h-5 w-5 text-[var(--wasl-primary)]" />
              <h2 className="text-xl font-bold text-[var(--wasl-text)]">
                {locale === "ar" ? "حاسبة زكاة المال التقديرية" : "Zakat al-Mal Estimator"}
              </h2>
            </div>

            <select
              aria-label={locale === "ar" ? "العملة" : "Currency"}
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              className="rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--wasl-text)]"
            >
              <option value="SAR">SAR (ر.س)</option>
              <option value="AED">AED (د.إ)</option>
              <option value="KWD">KWD (د.ك)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          {/* Nisab Standard & Editable Price per Gram */}
          <div className="rounded-2xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)]/70 p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-[var(--wasl-text)]">
                {locale === "ar"
                  ? "معيار النصاب وسعر الجرام في بلدك"
                  : "Nisab Benchmark & Current Local Gram Price"}
              </span>
              <div className="inline-flex rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-surface)] p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setNisabStandard("gold")}
                  className={`rounded-lg px-3 py-1 font-semibold transition ${
                    nisabStandard === "gold"
                      ? "bg-[var(--wasl-primary)] text-white"
                      : "text-[var(--wasl-text-muted)]"
                  }`}
                >
                  {locale === "ar" ? "الذهب (85 غرام)" : "Gold (85g)"}
                </button>
                <button
                  type="button"
                  onClick={() => setNisabStandard("silver")}
                  className={`rounded-lg px-3 py-1 font-semibold transition ${
                    nisabStandard === "silver"
                      ? "bg-[var(--wasl-primary)] text-white"
                      : "text-[var(--wasl-text-muted)]"
                  }`}
                >
                  {locale === "ar" ? "الفضة (595 غرام)" : "Silver (595g)"}
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="gold-price"
                  className="mb-1.5 block text-xs text-[var(--wasl-text-muted)]"
                >
                  {locale === "ar"
                    ? `سعر جرام الذهب عيار 24 (${currencyCode}) — قابل للتعديل`
                    : `Gold 24K price per gram (${currencyCode})`}
                </label>
                <input
                  id="gold-price"
                  type="number"
                  min="0"
                  step="any"
                  value={goldPricePerGram}
                  onChange={(e) => setGoldPricePerGram(e.target.value)}
                  className="w-full rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-surface)] px-3.5 py-2 text-sm text-[var(--wasl-text)] focus:border-[var(--wasl-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="silver-price"
                  className="mb-1.5 block text-xs text-[var(--wasl-text-muted)]"
                >
                  {locale === "ar"
                    ? `سعر جرام الفضة (${currencyCode}) — قابل للتعديل`
                    : `Silver price per gram (${currencyCode})`}
                </label>
                <input
                  id="silver-price"
                  type="number"
                  min="0"
                  step="any"
                  value={silverPricePerGram}
                  onChange={(e) => setSilverPricePerGram(e.target.value)}
                  className="w-full rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-surface)] px-3.5 py-2 text-sm text-[var(--wasl-text)] focus:border-[var(--wasl-primary)] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Asset Inputs */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="cash-savings"
                className="mb-1.5 block text-xs font-semibold text-[var(--wasl-text)]"
              >
                {locale === "ar"
                  ? `النقد والأرصدة البنكية المدّخرة (${currencyCode})`
                  : `Cash & Bank Savings (${currencyCode})`}
              </label>
              <input
                id="cash-savings"
                type="number"
                min="0"
                step="any"
                value={cashSavings}
                onChange={(e) => setCashSavings(e.target.value)}
                className="w-full rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-4 py-2.5 text-sm text-[var(--wasl-text)] focus:border-[var(--wasl-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="gold-assets"
                className="mb-1.5 block text-xs font-semibold text-[var(--wasl-text)]"
              >
                {locale === "ar"
                  ? `قيمة الذهب والفضة المدّخرين (${currencyCode})`
                  : `Gold & Silver Savings Value (${currencyCode})`}
              </label>
              <input
                id="gold-assets"
                type="number"
                min="0"
                step="any"
                value={goldValueOrGrams}
                onChange={(e) => setGoldValueOrGrams(e.target.value)}
                className="w-full rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-4 py-2.5 text-sm text-[var(--wasl-text)] focus:border-[var(--wasl-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="stocks-trade"
                className="mb-1.5 block text-xs font-semibold text-[var(--wasl-text)]"
              >
                {locale === "ar"
                  ? `الأسهم وعروض التجارة والودائع (${currencyCode})`
                  : `Investments & Trade Inventory (${currencyCode})`}
              </label>
              <input
                id="stocks-trade"
                type="number"
                min="0"
                step="any"
                value={stocksAndTrade}
                onChange={(e) => setStocksAndTrade(e.target.value)}
                className="w-full rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-4 py-2.5 text-sm text-[var(--wasl-text)] focus:border-[var(--wasl-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="debts-due"
                className="mb-1.5 block text-xs font-semibold text-[var(--wasl-text)]"
              >
                {locale === "ar"
                  ? `الديون الحالة الواجب سدادها (${currencyCode})`
                  : `Short-term Debts Due Now (${currencyCode})`}
              </label>
              <input
                id="debts-due"
                type="number"
                min="0"
                step="any"
                value={debtsDueNow}
                onChange={(e) => setDebtsDueNow(e.target.value)}
                className="w-full rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-4 py-2.5 text-sm text-[var(--wasl-text)] focus:border-[var(--wasl-primary)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Result Box */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-[var(--wasl-accent)]/35 bg-gradient-to-br from-[var(--wasl-primary)] to-[var(--wasl-primary-hover)] p-6 sm:p-7 text-white shadow-lg">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <span className="text-xs font-semibold text-[#F4DDA0]">
                {locale === "ar" ? "ملخص حساب الزكاة" : "Zakat Calculation Summary"}
              </span>
              <Scale className="h-4 w-4 text-[#F4DDA0]" />
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/80">
                  {locale === "ar" ? "مقدار النصاب المقدر" : "Estimated Nisab"}
                </span>
                <span dir="ltr" className="font-mono font-bold">
                  {formatMoney(calculation.nisabThreshold)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">
                  {locale === "ar" ? "صافي المال الزكوي" : "Net Zakatable Wealth"}
                </span>
                <span dir="ltr" className="font-mono font-bold">
                  {formatMoney(calculation.netWealth)}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-5 text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F4DDA0]">
                {calculation.meetsNisab ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {locale === "ar"
                        ? "بلغ المال النصاب (بنسبة 2.5% عند حولان الحول)"
                        : "Nisab Reached (2.5% Due After 1 Lunar Year)"}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      {locale === "ar"
                        ? "لم يبلغ صافي المال النصاب المحدد أعلاه"
                        : "Net wealth is currently below the Nisab threshold"}
                    </span>
                  </>
                )}
              </div>

              <p dir="ltr" className="font-mono text-3xl sm:text-4xl font-bold text-white">
                {formatMoney(calculation.zakatDue)}
              </p>
              <p className="text-[11px] text-white/75">
                {locale === "ar"
                  ? "مقدار الزكاة التقديري (ربع العشر)"
                  : "Estimated Annual Zakat Amount (2.5%)"}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/15 space-y-2 text-xs text-white/80 leading-relaxed">
            <p>
              {locale === "ar"
                ? "• شرط وجوب زكاة المال: بلوغ النصاب ومضيّ سنة هجرية كاملة (حول) عليه."
                : "• Condition: Wealth must meet Nisab and remain above it for a complete Hijri year (Hawl)."}
            </p>
            <p>
              {locale === "ar"
                ? "• للمسائل المالية التفصيلية راجع فتاوى اللجنة الدائمة أو حاسبة منصة إحسان الرسمية."
                : "• For specialized business or mixed holdings, consult official scholars or Ehsan's official calculator."}
            </p>
          </div>
        </div>
      </RevealSection>

      <OrnamentalDivider className="my-8" />

      {/* Trusted Saudi Official Charity Platforms */}
      <RevealSection className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--wasl-primary)]">
              <ShieldCheck className="h-4 w-4 text-[var(--wasl-accent)]" />
              <span>
                {locale === "ar"
                  ? "جهات رسمية معتمدة — انتقال خارجي مباشر"
                  : "Verified Official Saudi Institutions — External Destinations"}
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-[var(--wasl-text)] sm:text-3xl">
              {locale === "ar"
                ? "المنصات الخيرية الرسمية الموثوقة"
                : "Trusted Official Charity Platforms"}
            </h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {charityPlatforms.map((platform) => {
            const isEhsan = platform.slug === "ehsan-charity";
            return (
              <a
                key={platform.slug}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col justify-between rounded-3xl border p-6 transition hover:-translate-y-0.5 hover:shadow-md ${
                  isEhsan
                    ? "border-[var(--wasl-accent)] bg-[var(--wasl-primary)]/[0.06] ring-1 ring-[var(--wasl-accent)]/30"
                    : "border-[var(--wasl-border)] bg-[var(--wasl-surface)] hover:border-[var(--wasl-primary)]/50"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[var(--wasl-primary)]/10 px-3 py-1 text-[11px] font-bold text-[var(--wasl-primary)]">
                      {locale === "ar" ? "منصة خارجية رسمية" : "Official External Site"}
                    </span>
                    <ExternalLink className="h-4 w-4 text-[var(--wasl-text-muted)] group-hover:text-[var(--wasl-primary)]" />
                  </div>

                  <h3 className="text-lg font-bold text-[var(--wasl-text)] group-hover:text-[var(--wasl-primary)] transition">
                    {locale === "ar" ? platform.titleAr : platform.titleEn}
                  </h3>

                  <p className="text-xs leading-relaxed text-[var(--wasl-text-muted)]">
                    {locale === "ar" ? platform.descriptionAr : platform.descriptionEn}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--wasl-border)] flex items-center justify-between text-xs">
                  <span className="text-[var(--wasl-text-muted)] truncate">
                    {locale === "ar"
                      ? platform.organizationAr
                      : platform.organizationEn}
                  </span>
                  <span className="font-bold text-[var(--wasl-primary)] shrink-0">
                    {locale === "ar" ? "زيارة الموقع ↗" : "Visit Site ↗"}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </RevealSection>
    </PageShell>
  );
}

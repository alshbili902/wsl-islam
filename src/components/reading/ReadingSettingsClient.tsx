"use client";

import Link from "next/link";
import {
  AlignJustify,
  AlignRight,
  BookOpen,
  Contrast,
  Eye,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Type,
  ZoomIn,
} from "lucide-react";
import { useReadingPreferences } from "@/components/providers/ReadingPreferencesProvider";
import { useWasl } from "@/components/providers/WaslProvider";
import type {
  ReadingColumnWidth,
  ReadingFontFamily,
  ReadingPaperTheme,
} from "@/types/islamic";

export function ReadingSettingsClient() {
  const { locale } = useWasl();
  const { prefs, updatePrefs, resetPrefs } = useReadingPreferences();
  const isEn = locale === "en";

  const fontFamilies: Array<{
    id: ReadingFontFamily;
    labelAr: string;
    labelEn: string;
    sample: string;
  }> = [
    {
      id: "amiri",
      labelAr: "الخط الأميري الكلاسيكي (عثماني/تراثي)",
      labelEn: "Amiri Classical Serif",
      sample: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
    },
    {
      id: "ibm-plex",
      labelAr: "IBM Plex Arabic (حديث واضح)",
      labelEn: "IBM Plex Sans Arabic",
      sample: "الحمد لله رب العالمين والصلاة والسلام على رسول الله",
    },
    {
      id: "naskh-system",
      labelAr: "خط النسخ النظامي",
      labelEn: "System Naskh / Serif",
      sample: "إن مع العسر يسراً",
    },
  ];

  const surfaces: Array<{
    id: ReadingPaperTheme;
    labelAr: string;
    labelEn: string;
    swatch: string;
  }> = [
    { id: "default", labelAr: "افتراضي المنصة", labelEn: "Platform Default", swatch: "bg-[var(--bg-surface)]" },
    { id: "warm-ivory", labelAr: "ورق عاجي دافئ", labelEn: "Warm Ivory", swatch: "bg-[#fcf8ee]" },
    { id: "classic-white", labelAr: "أبيض كلاسيكي", labelEn: "Classic White", swatch: "bg-[#ffffff]" },
    { id: "soft-beige", labelAr: "ورق المصحف الهادئ", labelEn: "Soft Mushaf Beige", swatch: "bg-[#f4ebd9]" },
    { id: "dark-charcoal", labelAr: "فحمي داكن", labelEn: "Dark Charcoal", swatch: "bg-[#161b19]" },
    { id: "midnight-emerald", labelAr: "زمردي ليلي", labelEn: "Midnight Emerald", swatch: "bg-[#071e17]" },
  ];

  const columnWidths: Array<{ id: ReadingColumnWidth; ar: string; en: string }> = [
    { id: "narrow", ar: "عمود مريح (ضيق)", en: "Narrow" },
    { id: "medium", ar: "متوسط متوازن", en: "Balanced" },
    { id: "wide", ar: "واسع كامل", en: "Wide" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      <section className="wasl-surface rounded-3xl p-6 sm:p-8 border border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {isEn
              ? "Advanced Typography & Accessibility"
              : "إعدادات القراءة والخطوط المتقدمة"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
            {isEn
              ? "Customize Your Sacred Reading Experience"
              : "تخصيص تجربة القراءة القرآنية والمعرفية"}
          </h1>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            {isEn
              ? "Every typography slider, paper tone, and spacing preference updates CSS design tokens across the Mushaf, Tafsir, Surah Reader, Hadith, Adhkar, and Articles immediately."
              : "تنعكس كل هذه التفضيلات فورياً على المصحف الشريف، وموسوعة التفسير، وقارئ السور، والحديث الشريف، والأذكار، والمقالات العلمية."}
          </p>
        </div>

        <button
          type="button"
          onClick={resetPrefs}
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--primary)] cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {isEn ? "Reset Defaults" : "استعادة الإعدادات الافتراضية"}
        </button>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* Font Family */}
          <section className="wasl-surface rounded-3xl p-6 border border-[var(--border)] space-y-4">
            <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <Type className="h-4 w-4 text-[var(--primary)]" />
              {isEn ? "Arabic Font Family" : "نوع الخط العربي"}
            </h2>
            <div className="grid gap-3">
              {fontFamilies.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => updatePrefs({ fontFamily: font.id })}
                  className={`rounded-2xl border p-4 text-start transition-colors cursor-pointer space-y-1 ${
                    prefs.fontFamily === font.id
                      ? "border-[var(--primary)] bg-[var(--accent-soft)]"
                      : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--foreground)]">
                      {isEn ? font.labelEn : font.labelAr}
                    </span>
                    {prefs.fontFamily === font.id && (
                      <span className="text-[11px] font-semibold text-[var(--primary)]">
                        {isEn ? "Active" : "مفعّل"}
                      </span>
                    )}
                  </div>
                  <p className="text-base text-[var(--foreground)]/85">{font.sample}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Typography Sliders */}
          <section className="wasl-surface rounded-3xl p-6 border border-[var(--border)] space-y-5">
            <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <ZoomIn className="h-4 w-4 text-[var(--primary)]" />
              {isEn ? "Sizes, Weight & Spacing" : "المقاسات والوزن والتباعد"}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 block">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{isEn ? "Quran Font Size" : "حجم خط الآيات"}</span>
                  <span className="font-mono text-[var(--primary)]">
                    {prefs.quranFontSizePx}px
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={40}
                  step={1}
                  value={prefs.quranFontSizePx}
                  onChange={(e) =>
                    updatePrefs({ quranFontSizePx: Number(e.target.value) })
                  }
                  className="w-full accent-[var(--primary)]"
                />
              </label>

              <label className="space-y-1.5 block">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{isEn ? "General Text Scale" : "مقياس النصوص والشروح"}</span>
                  <span className="font-mono text-[var(--primary)]">
                    {Math.round(prefs.fontSizeScale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.85}
                  max={1.45}
                  step={0.05}
                  value={prefs.fontSizeScale}
                  onChange={(e) =>
                    updatePrefs({ fontSizeScale: Number(e.target.value) })
                  }
                  className="w-full accent-[var(--primary)]"
                />
              </label>

              <label className="space-y-1.5 block">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{isEn ? "Line Height" : "تباعد الأسطر"}</span>
                  <span className="font-mono text-[var(--primary)]">
                    {prefs.lineHeight.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min={1.7}
                  max={2.4}
                  step={0.1}
                  value={prefs.lineHeight}
                  onChange={(e) =>
                    updatePrefs({ lineHeight: Number(e.target.value) })
                  }
                  className="w-full accent-[var(--primary)]"
                />
              </label>

              <label className="space-y-1.5 block">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{isEn ? "Word Spacing" : "تباعد الكلمات"}</span>
                  <span className="font-mono text-[var(--primary)]">
                    {prefs.wordSpacingPx}px
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={6}
                  step={1}
                  value={prefs.wordSpacingPx}
                  onChange={(e) =>
                    updatePrefs({ wordSpacingPx: Number(e.target.value) })
                  }
                  className="w-full accent-[var(--primary)]"
                />
              </label>

              <label className="space-y-1.5 block">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{isEn ? "Mushaf Page Zoom" : "تكبير صفحات المصحف"}</span>
                  <span className="font-mono text-[var(--primary)]">
                    {Math.round(prefs.mushafZoom * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.9}
                  max={1.3}
                  step={0.05}
                  value={prefs.mushafZoom}
                  onChange={(e) =>
                    updatePrefs({ mushafZoom: Number(e.target.value) })
                  }
                  className="w-full accent-[var(--primary)]"
                />
              </label>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold block">
                  {isEn ? "Font Weight" : "سماكة الخط"}
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {([400, 500, 600, 700] as const).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => updatePrefs({ fontWeight: w })}
                      className={`rounded-xl py-1.5 text-xs font-semibold border cursor-pointer ${
                        prefs.fontWeight === w
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                          : "bg-[var(--card)] border-[var(--border)]"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold block">
                  {isEn ? "Text Alignment" : "محاذاة النص"}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updatePrefs({ textAlign: "start" })}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold border cursor-pointer ${
                      prefs.textAlign === "start"
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                        : "bg-[var(--card)] border-[var(--border)]"
                    }`}
                  >
                    <AlignRight className="h-3.5 w-3.5" />
                    {isEn ? "Natural Start" : "محاذاة طبيعية"}
                  </button>
                  <button
                    type="button"
                    onClick={() => updatePrefs({ textAlign: "justify" })}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold border cursor-pointer ${
                      prefs.textAlign === "justify"
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                        : "bg-[var(--card)] border-[var(--border)]"
                    }`}
                  >
                    <AlignJustify className="h-3.5 w-3.5" />
                    {isEn ? "Justified" : "ضبط الحواف"}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold block">
                  {isEn ? "Column Width" : "عرض عمود القراءة"}
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {columnWidths.map((cw) => (
                    <button
                      key={cw.id}
                      type="button"
                      onClick={() => updatePrefs({ columnWidth: cw.id })}
                      className={`rounded-xl py-2 text-[11px] font-semibold border cursor-pointer ${
                        prefs.columnWidth === cw.id
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                          : "bg-[var(--card)] border-[var(--border)]"
                      }`}
                    >
                      {isEn ? cw.en : cw.ar}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Reading Paper Surfaces & Accessibility */}
          <section className="wasl-surface rounded-3xl p-6 border border-[var(--border)] space-y-5">
            <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <Eye className="h-4 w-4 text-[var(--primary)]" />
              {isEn ? "Paper Surface & Accessibility" : "خلفية الورق وخيارات الراحة البصرية"}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {surfaces.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => updatePrefs({ readingSurface: s.id })}
                  className={`flex items-center gap-2.5 rounded-2xl border p-3 text-start text-xs font-semibold cursor-pointer ${
                    prefs.readingSurface === s.id
                      ? "border-[var(--primary)] bg-[var(--accent-soft)] text-[var(--primary)]"
                      : "border-[var(--border)] bg-[var(--card)]"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full border border-[var(--border)] shrink-0 ${s.swatch}`}
                  />
                  <span>{isEn ? s.labelEn : s.labelAr}</span>
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  key: "verseHighlight" as const,
                  labelAr: "تمييز الآية أثناء التلاوة",
                  labelEn: "Active Verse Audio Highlighting",
                },
                {
                  key: "showTranslation" as const,
                  labelAr: "إظهار الترجمة مع الآيات",
                  labelEn: "Show English Translation",
                },
                {
                  key: "highContrast" as const,
                  labelAr: "تباين عالٍ لوضوح القراءة",
                  labelEn: "High Contrast Outlines",
                },
                {
                  key: "reducedMotion" as const,
                  labelAr: "تقليل الحركة والانتقالات",
                  labelEn: "Reduced Motion",
                },
              ].map((toggle) => (
                <label
                  key={toggle.key}
                  className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-xs font-semibold cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Contrast className="h-3.5 w-3.5 text-[var(--primary)]" />
                    {isEn ? toggle.labelEn : toggle.labelAr}
                  </span>
                  <input
                    type="checkbox"
                    checked={prefs[toggle.key]}
                    onChange={(e) =>
                      updatePrefs({ [toggle.key]: e.target.checked })
                    }
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Live Preview Panel */}
        <aside className="lg:col-span-5">
          <div className="sticky top-24 space-y-4">
            <div className="wasl-reading-surface rounded-3xl border p-6 sm:p-7 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--wasl-paper-border)] pb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {isEn ? "Live Reading Preview" : "معاينة مباشرة للتنسيق"}
                </span>
                <span className="text-[11px] opacity-70">
                  {isEn ? "Surah Al-Fatihah 1:1–4" : "سورة الفاتحة ١–٤"}
                </span>
              </div>

              <div className="wasl-reading-container space-y-4">
                <p dir="rtl" className="font-quran-reading leading-loose">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ﴿١﴾ ٱلْحَمْدُ لِلَّهِ رَبِّ
                  ٱلْعَـٰلَمِينَ ﴿٢﴾ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ﴿٣﴾ مَـٰلِكِ يَوْمِ
                  ٱلدِّينِ ﴿٤﴾
                </p>

                {prefs.showTranslation && (
                  <p dir="ltr" className="text-xs opacity-80 leading-relaxed border-s-2 border-[var(--primary)]/40 ps-3">
                    In the name of Allah, the Entirely Merciful, the Especially Merciful. All praise is due to Allah, Lord of the worlds.
                  </p>
                )}

                <div className="border-t border-[var(--wasl-paper-border)] pt-3">
                  <p dir="rtl" className="wasl-reading-body">
                    التفسير والشروح: يفتتح المؤمن قراءته باسم الله مستعيناً به، حامداً ربه مالك يوم الدين على نعمه وهدايته.
                  </p>
                </div>
              </div>
            </div>

            <div className="wasl-surface rounded-2xl border border-[var(--border)] p-4 flex flex-wrap gap-2 justify-between items-center text-xs">
              <span className="text-[var(--muted)]">
                {isEn ? "Test across reading surfaces:" : "جرّب الإعدادات الآن في:"}
              </span>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/mushaf"
                  className="inline-flex items-center gap-1 rounded-xl bg-[var(--primary)] px-3 py-1.5 font-semibold text-[var(--primary-foreground)]"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  {isEn ? "Mushaf" : "المصحف"}
                </Link>
                <Link
                  href="/tafsir"
                  className="inline-flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 font-semibold"
                >
                  {isEn ? "Tafsir" : "التفسير"}
                </Link>
                <Link
                  href="/quran/1"
                  className="inline-flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 font-semibold"
                >
                  {isEn ? "Surah View" : "عرض السور"}
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

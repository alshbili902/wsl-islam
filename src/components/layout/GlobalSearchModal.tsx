"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  FileText,
  Radio,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { ALL_ADHKAR } from "@/data/adhkar";
import { ARTICLES } from "@/data/articles";
import { GLOSSARY_TERMS } from "@/data/glossary-and-resources";
import { NAWAWI_HADITHS } from "@/data/hadith-books";
import { ALLAH_NAMES } from "@/data/names-of-allah";
import { RADIO_STATIONS } from "@/data/radio-stations";
import { SURAHS } from "@/data/surahs";
import { useWasl } from "@/components/providers/WaslProvider";
import { WaslLogo } from "@/components/brand/WaslLogo";

interface SearchHit {
  id: string;
  type: "surah" | "adhkar" | "hadith" | "article" | "name" | "radio" | "glossary";
  title: string;
  subtitle: string;
  href: string;
}

export function GlobalSearchModal() {
  const { searchOpen, setSearchOpen, locale, t } = useWasl();
  const [query, setQuery] = useState("");

  const results = useMemo<SearchHit[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [
        {
          id: "quick-listen",
          type: "radio",
          title: locale === "ar" ? "مركز الاستماع — 244+ قارئاً ومحاضرات" : "Listening Center — 244+ Reciters & Lectures",
          subtitle: locale === "ar" ? "جميع قراء القرآن والروايات والمحاضرات الصوتية" : "All Quran reciters, Riwayat & verified audio lectures",
          href: "/listen",
        },
        {
          id: "quick-reciters",
          type: "radio",
          title: locale === "ar" ? "جميع قراء القرآن الكريم" : "Complete Quran Reciters Directory",
          subtitle: locale === "ar" ? "ورش، قالون، حفص، مرتل، مجود، المعلم" : "Filter by Riwayah, style, alphabet & Surahs",
          href: "/listen/reciters",
        },
        {
          id: "quick-mushaf",
          type: "surah",
          title: locale === "ar" ? "المصحف الشريف الرقمي (604 صفحة)" : "Digital Madinah Mushaf (604 pp.)",
          subtitle: locale === "ar" ? "تلاوة ومتابعة الصفحة والجزء والحزب" : "Page-by-page Quran & synchronized audio",
          href: "/mushaf",
        },
        {
          id: "quick-tafsir",
          type: "article",
          title: locale === "ar" ? "موسوعة التفسير والتدبر" : "Tafsir & Reflection Encyclopedia",
          subtitle: locale === "ar" ? "تفسير ابن كثير والسعدي والطبري والقرطبي" : "Ibn Kathir, Al-Sa'di, Al-Tabari & Roots",
          href: "/tafsir",
        },
        {
          id: "quick-khatmah",
          type: "article",
          title: locale === "ar" ? "مخطط ختمة القرآن الكريم" : "Quran Khatmah Planner",
          subtitle: locale === "ar" ? "خطط 7 / 15 / 30 / 60 يوماً لختم المصحف" : "Flexible daily 604-page reading tracker",
          href: "/khatmah",
        },
        {
          id: "quick-lectures",
          type: "article",
          title: locale === "ar" ? "مكتبة المحاضرات والدروس" : "Islamic Lectures & Lessons",
          subtitle: locale === "ar" ? "دروس صوتية ومرئية موثقة المصادر" : "Verified audio & video Islamic lessons",
          href: "/lectures",
        },
        {
          id: "quick-adhkar",
          type: "adhkar",
          title: locale === "ar" ? "أذكار الصباح والمساء" : "Morning & Evening Adhkar",
          subtitle: locale === "ar" ? "الأذكار اليومية المأثورة" : "Authentic daily remembrances",
          href: "/adhkar",
        },
        {
          id: "quick-prayer",
          type: "article",
          title: locale === "ar" ? "مواقيت الصلاة والعد التنازلي" : "Prayer Times & Live Countdown",
          subtitle: locale === "ar" ? "حساب دقيق حسب مدينتك" : "Accurate calculation by location",
          href: "/prayer-times",
        },
      ];
    }

    const hits: SearchHit[] = [];

    const featureShortcuts = [
      {
        id: "feat-listen",
        keywords: ["استماع", "مركز الاستماع", "قراء", "قارئ", "مقرئ", "تلاوة", "ورش", "قالون", "listen", "reciters", "reciter", "audio", "murattal", "mujawwad"],
        titleAr: "مركز الاستماع الشامل (244+ قارئاً)",
        titleEn: "Wasl Listening Center (244+ Reciters)",
        subAr: "تلاوات القرآن بالروايات المعتمدة والمحاضرات الصوتية",
        subEn: "Dynamic directory of Quran reciters, Riwayat & audio lectures",
        href: "/listen",
      },
      {
        id: "feat-reciters",
        keywords: ["جميع القراء", "القراء", "قراء القران", "reciters", "directory", "qaris"],
        titleAr: "دليل جميع قراء القرآن الكريم",
        titleEn: "All Quran Reciters Directory",
        subAr: "تصفية بالرواية والأسلوب والحروف الأبجدية والسور",
        subEn: "Filter 244+ reciters by Riwayah, style & available Surahs",
        href: "/listen/reciters",
      },
      {
        id: "feat-listen-library",
        keywords: ["مكتبة الاستماع", "قوائم التشغيل", "سجل الاستماع", "المفضلة الصوتية", "playlist", "history", "listening library"],
        titleAr: "مكتبة الاستماع الشخصية",
        titleEn: "Personal Listening Library",
        subAr: "القراء المفضلون، قوائم التشغيل، وسجل متابعة التلاوة",
        subEn: "Favorite reciters, playlists & listening history",
        href: "/listen/library",
      },
      {
        id: "feat-mushaf",
        keywords: ["مصحف", "المصحف", "mushaf", "page", "صفحة"],
        titleAr: "المصحف الشريف الرقمي",
        titleEn: "Digital Mushaf Reading Experience",
        subAr: "604 صفحة برسم المصحف والتلاوة المتزامنة",
        subEn: "604-page Mushaf with synchronized audio",
        href: "/mushaf",
      },
      {
        id: "feat-tafsir",
        keywords: ["تفسير", "تدبر", "ابن كثير", "السعدي", "الطبري", "القرطبي", "tafsir", "exegesis", "reflection"],
        titleAr: "موسوعة التفسير والتدبر",
        titleEn: "Islamic Tafsir & Reflection Encyclopedia",
        subAr: "تفسير الآيات وشرح المفردات وأسباب النزول",
        subEn: "Classical Tafsir, word roots & Asbab al-Nuzul",
        href: "/tafsir",
      },
      {
        id: "feat-khatmah",
        keywords: ["ختمة", "الختمة", "ورد", "khatmah", "planner"],
        titleAr: "مخطط ختمة القرآن الكريم",
        titleEn: "Quran Khatmah Planner",
        subAr: "تنظيم الورد اليومي ومتابعة الإنجاز",
        subEn: "Daily page goals and progress planner",
        href: "/khatmah",
      },
      {
        id: "feat-lectures",
        keywords: ["محاضرات", "دروس", "خطب", "lecture", "lectures", "lessons", "audio"],
        titleAr: "مكتبة المحاضرات والدروس الإسلامية",
        titleEn: "Islamic Lectures & Lessons Library",
        subAr: "دروس صوتية ومرئية موثقة المصادر",
        subEn: "Curated verified Islamic audio & video library",
        href: "/lectures",
      },
      {
        id: "feat-notifications",
        keywords: ["تنبيهات", "اشعارات", "تذكير", "notifications", "reminders", "push", "اذان"],
        titleAr: "التنبيهات والتذكيرات الذكية",
        titleEn: "Smart Islamic Notifications & Reminders",
        subAr: "تنبيهات الصلاة والأذكار والقرآن وساعات الهدوء",
        subEn: "Prayer, Adhkar, Quran & Web Push reminders",
        href: "/notifications",
      },
      {
        id: "feat-reading-settings",
        keywords: ["قراءة", "خطوط", "الخط", "reading", "font", "typography", "preferences"],
        titleAr: "إعدادات القراءة والخطوط المتقدمة",
        titleEn: "Advanced Reading Preferences",
        subAr: "تخصيص الخط والحجم وتباعد الأسطر وألوان الورق",
        subEn: "Customize font, size, spacing & paper themes",
        href: "/reading-settings",
      },
      {
        id: "feat-updates",
        keywords: ["تحديثات", "التحديثات", "إصدارات", "جديد", "changelog", "updates", "release", "releases"],
        titleAr: "سجل التحديثات والإصدارات",
        titleEn: "Platform Updates & Changelog",
        subAr: "استعرض أحدث الميزات والتحسينات الموثقة في المنصة",
        subEn: "Browse verified platform release history",
        href: "/updates",
      },
    ];

    for (const f of featureShortcuts) {
      if (f.keywords.some((kw) => kw.includes(q) || q.includes(kw))) {
        hits.push({
          id: f.id,
          type: "article",
          title: locale === "ar" ? f.titleAr : f.titleEn,
          subtitle: locale === "ar" ? f.subAr : f.subEn,
          href: f.href,
        });
      }
    }

    for (const s of SURAHS) {
      if (
        s.nameAr.includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        String(s.number) === q
      ) {
        hits.push({
          id: `surah-${s.number}`,
          type: "surah",
          title: `${s.number}. ${locale === "ar" ? s.nameAr : s.englishName}`,
          subtitle:
            locale === "ar"
              ? `${s.revelationType === "Meccan" ? "مكية" : "مدنية"} • ${s.numberOfAyahs} آية`
              : `${s.englishNameTranslation} • ${s.numberOfAyahs} verses`,
          href: `/quran/${s.number}`,
        });
      }
      if (hits.length >= 16) break;
    }

    for (const d of ALL_ADHKAR) {
      if (
        d.arabicText.includes(q) ||
        d.englishTranslation.toLowerCase().includes(q) ||
        d.referenceAr.includes(q)
      ) {
        hits.push({
          id: `dhikr-${d.id}`,
          type: "adhkar",
          title: d.arabicText.slice(0, 72) + "...",
          subtitle: locale === "ar" ? d.referenceAr : d.referenceEn,
          href: `/adhkar?cat=${d.category}`,
        });
      }
      if (hits.length >= 22) break;
    }

    for (const h of NAWAWI_HADITHS) {
      if (
        h.arabicText.includes(q) ||
        h.englishText.toLowerCase().includes(q)
      ) {
        hits.push({
          id: `nawawi-${h.hadithNumber}`,
          type: "hadith",
          title:
            locale === "ar"
              ? `الأربعون النووية #${h.hadithNumber}: ${h.arabicText.slice(0, 58)}...`
              : `Nawawi #${h.hadithNumber}: ${h.englishText.slice(0, 58)}...`,
          subtitle:
            locale === "ar" ? "الأربعون النووية" : "Forty Hadith of an-Nawawi",
          href: "/hadith?collection=nawawi",
        });
      }
    }

    for (const a of ARTICLES) {
      if (
        a.titleAr.includes(q) ||
        a.titleEn.toLowerCase().includes(q) ||
        a.summaryAr.includes(q)
      ) {
        hits.push({
          id: `art-${a.slug}`,
          type: "article",
          title: locale === "ar" ? a.titleAr : a.titleEn,
          subtitle: locale === "ar" ? a.summaryAr.slice(0, 70) + "..." : a.summaryEn.slice(0, 70) + "...",
          href: `/knowledge/${a.slug}`,
        });
      }
    }

    for (const n of ALLAH_NAMES) {
      if (
        n.arabic.includes(q) ||
        n.transliteration.toLowerCase().includes(q) ||
        n.meaningAr.includes(q) ||
        n.meaningEn.toLowerCase().includes(q)
      ) {
        hits.push({
          id: `name-${n.number}`,
          type: "name",
          title: `${n.arabic} (${n.transliteration})`,
          subtitle: locale === "ar" ? n.meaningAr : n.meaningEn,
          href: "/knowledge#names-of-allah",
        });
      }
    }

    for (const r of RADIO_STATIONS) {
      if (
        r.nameAr.includes(q) ||
        r.nameEn.toLowerCase().includes(q)
      ) {
        hits.push({
          id: `radio-${r.slug}`,
          type: "radio",
          title: locale === "ar" ? r.nameAr : r.nameEn,
          subtitle: locale === "ar" ? r.sourceOrgAr : r.sourceOrgEn,
          href: "/radio",
        });
      }
    }

    for (const g of GLOSSARY_TERMS) {
      if (
        g.termAr.includes(q) ||
        g.termEn.toLowerCase().includes(q) ||
        g.definitionAr.includes(q)
      ) {
        hits.push({
          id: `gloss-${g.slug}`,
          type: "glossary",
          title: locale === "ar" ? g.termAr : g.termEn,
          subtitle: locale === "ar" ? g.definitionAr.slice(0, 68) + "..." : g.definitionEn.slice(0, 68) + "...",
          href: "/resources#glossary",
        });
      }
    }

    return hits.slice(0, 18);
  }, [query, locale]);

  if (!searchOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-16 sm:pt-24 px-3"
        onClick={() => setSearchOpen(false)}
        role="dialog"
        aria-modal="true"
        aria-label={t.nav.searchShortcut}
      >
        <motion.div
          initial={{ opacity: 0, y: -14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          onClick={(e) => e.stopPropagation()}
          className="wasl-surface w-full max-w-2xl rounded-2xl overflow-hidden"
        >
          <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3.5">
            <Search className="h-5 w-5 text-[var(--brand-emerald)] shrink-0" />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.nav.searchPlaceholder}
              className="w-full bg-transparent text-sm sm:text-base outline-none placeholder:text-[var(--text-muted)]"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label={locale === "ar" ? "إغلاق" : "Close"}
              className="rounded-lg p-1.5 hover:bg-[var(--bg-surface-alt)] text-[var(--text-muted)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2.5 space-y-1">
            {results.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-3">
                <WaslLogo variant="icon" className="h-11 w-11 mx-auto opacity-85" />
                <p className="text-sm text-[var(--text-muted)]">
                  {locale === "ar"
                    ? "لم يتم العثور على نتائج مطابقة. جرّب كلمة أخرى مثل: الكهف، الصباح، التوحيد، البخاري."
                    : "No matching results found. Try searching: Kahf, Morning, Tawhid, Bukhari."}
                </p>
              </div>
            ) : (
              results.map((hit) => (
                <Link
                  key={hit.id}
                  href={hit.href}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 hover:bg-[var(--bg-surface-alt)] transition-colors"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-emerald-soft)] text-[var(--brand-emerald)]">
                    {hit.type === "surah" ? (
                      <BookOpen className="h-4 w-4" />
                    ) : hit.type === "radio" ? (
                      <Radio className="h-4 w-4" />
                    ) : hit.type === "name" ? (
                      <Sparkles className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                      {hit.title}
                    </p>
                    <p className="truncate text-xs text-[var(--text-muted)]">
                      {hit.subtitle}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

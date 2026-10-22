'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  BookOpen, Compass, Clock, Heart, Star, Users,
  Calculator, Radio, Share2, HelpCircle, GraduationCap,
  Sparkles, ChevronLeft, Volume2, Copy, Check, Flame,
  Sun, Moon, ArrowRight, BookMarked, MapPin
} from 'lucide-react';
import { CITIES, type PrayerData, formatTime12h, getNextPrayer, getCountdown } from '@/lib/api';

// Verified default prayer times for instant, offline-safe display
const DEFAULT_TIMINGS = {
  Fajr: '04:52',
  Sunrise: '06:10',
  Dhuhr: '11:58',
  Asr: '15:18',
  Maghrib: '17:46',
  Isha: '19:16',
};

const FEATURED_AYAH = {
  text: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
  surah: 'سورة الرعد',
  ayahNumber: 28,
  translation: 'Unquestionably, by the remembrance of Allah hearts are assured.',
  reflection: 'الذكر غذاء الروح وسلوة الفؤاد، متى ما عمر القلب بذكر الله زالت عنه الهموم والغموم واطمأن لقضاء ربه.',
};

const FEATURED_HADITH = {
  text: '«خَيْرُكُمْ مَنْ تَعَلَّمَ القُرْآنَ وَعَلَّمَهُ»',
  narrator: 'عثمان بن عفان رضي الله عنه',
  source: 'صحيح البخاري',
  benefit: 'أشرف العلوم وأجلها هو مدارسة كتاب الله العظيم وتعليمه للناس ابتغاء مرضاة الله.',
};

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<string>('riyadh');
  const [timings, setTimings] = useState(DEFAULT_TIMINGS);
  const [hijriDate, setHijriDate] = useState<string>('14 شعبان 1447 هـ');
  const [gregorianDate, setGregorianDate] = useState<string>('');
  const [countdown, setCountdown] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: '00',
    minutes: '00',
    seconds: '00',
  });
  const [nextPrayerInfo, setNextPrayerInfo] = useState<{ name: string; nameAr: string; time: string }>({
    name: 'Asr',
    nameAr: 'العصر',
    time: DEFAULT_TIMINGS.Asr,
  });
  const [copiedAyah, setCopiedAyah] = useState(false);
  const [dailyWirdCount, setDailyWirdCount] = useState<number>(4);
  const [dailyWirdCompleted, setDailyWirdCompleted] = useState<number>(2);

  // Set dates on client
  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setGregorianDate(today.toLocaleDateString('ar-SA', options));
  }, []);

  // Fetch or calculate prayer times when city changes
  useEffect(() => {
    const city = CITIES[selectedCity];
    if (!city) return;

    let isMounted = true;
    async function loadPrayers() {
      try {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const res = await fetch(
          `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${city.lat}&longitude=${city.lng}&method=${city.method}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.data?.timings && isMounted) {
            setTimings(data.data.timings);
            if (data.data.date?.hijri) {
              const h = data.data.date.hijri;
              setHijriDate(`${h.day} ${h.month.ar} ${h.year} هـ`);
            }
          }
        }
      } catch (e) {
        console.warn('Fallback to local prayer times:', e);
      }
    }
    loadPrayers();
    return () => { isMounted = false; };
  }, [selectedCity]);

  // Update countdown every second
  useEffect(() => {
    const next = getNextPrayer(timings);
    if (next) {
      setNextPrayerInfo(next);
      setCountdown(getCountdown(next.time));
    }

    const timer = setInterval(() => {
      const currentNext = getNextPrayer(timings);
      if (currentNext) {
        setNextPrayerInfo(currentNext);
        setCountdown(getCountdown(currentNext.time));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timings]);

  const handleCopyAyah = () => {
    const content = `﴿ ${FEATURED_AYAH.text} ﴾ [${FEATURED_AYAH.surah}: ${FEATURED_AYAH.ayahNumber}]\nعبر منصة وصل الإسلامية: https://waslislam.fun`;
    navigator.clipboard.writeText(content);
    setCopiedAyah(true);
    setTimeout(() => setCopiedAyah(false), 3000);
  };

  const handleAddWirdPage = () => {
    if (dailyWirdCompleted < dailyWirdCount) {
      setDailyWirdCompleted(prev => prev + 1);
    }
  };

  return (
    <main style={{ paddingBottom: '3rem' }}>
      
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(180deg, var(--bg-card-subtle) 0%, var(--bg-main) 100%)',
        padding: '3.5rem 1.25rem 2.5rem',
        borderBottom: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          
          {/* Basmala Calligraphy */}
          <div style={{
            fontFamily: 'var(--font-quran)',
            fontSize: '1.85rem',
            color: 'var(--primary)',
            letterSpacing: '1px',
            marginBottom: '1rem',
          }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-cairo)',
            lineHeight: 1.2,
            marginBottom: '1rem'
          }}>
            منصة <span style={{ color: 'var(--primary)' }}>وصل</span> الإسلامية
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-tajawal)',
            maxWidth: '680px',
            margin: '0 auto 1.5rem',
            lineHeight: 1.7
          }}>
            رفيقك الرقمي اليومي لتلاوة القرآن الكريم، واستماع أعذب الأصوات، ومتابعة مواقيت الصلاة والأذكار النبوية بتصميم عصري راقٍ.
          </p>

          {/* Hijri & Gregorian Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.6rem 1.25rem',
            borderRadius: '999px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            fontSize: '0.9rem',
            color: 'var(--text-main)',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700 }}>
              <Sparkles size={16} />
              {hijriDate}
            </span>
            <span style={{ color: 'var(--border-color)' }}>|</span>
            <span style={{ color: 'var(--text-muted)' }}>
              {gregorianDate || 'اليوم المبارك'}
            </span>
          </div>

        </div>
      </section>

      {/* Main Container */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '2rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

        {/* Next Prayer & Daily Schedule Card */}
        <section className="wasl-prayer-card">
          {/* Subtle background ring */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 168, 83, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.75rem',
            position: 'relative',
            zIndex: 2
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold)', marginBottom: '0.35rem' }}>
                <Clock size={18} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>الصلاة القادمة</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, margin: 0, fontFamily: 'var(--font-cairo)', color: '#FAF8F5' }}>
                صلاة {nextPrayerInfo.nameAr} ({formatTime12h(nextPrayerInfo.time)})
              </h2>
            </div>

            {/* City Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} style={{ color: 'var(--gold)' }} />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#FAF8F5',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-cairo)'
                }}
              >
                {Object.entries(CITIES).map(([key, city]) => (
                  <option key={key} value={key} style={{ background: '#064E3B', color: '#FAF8F5' }}>
                    {city.nameAr} - {city.countryAr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Countdown Blocks */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(0.5rem, 3vw, 1.25rem)',
            marginBottom: '2rem',
            direction: 'ltr'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div className="wasl-countdown-digit">
                {countdown.hours}
              </div>
              <span style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '0.35rem', display: 'block' }}>ساعة</span>
            </div>
            <span style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, opacity: 0.6 }}>:</span>
            <div style={{ textAlign: 'center' }}>
              <div className="wasl-countdown-digit">
                {countdown.minutes}
              </div>
              <span style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '0.35rem', display: 'block' }}>دقيقة</span>
            </div>
            <span style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, opacity: 0.6 }}>:</span>
            <div style={{ textAlign: 'center' }}>
              <div className="wasl-countdown-digit" style={{ color: 'var(--gold)' }}>
                {countdown.seconds}
              </div>
              <span style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '0.35rem', display: 'block' }}>ثانية</span>
            </div>
          </div>

          {/* Today's 6 prayer times row */}
          <div className="wasl-prayer-times-grid">
            {[
              { name: 'الفجر', key: 'Fajr', time: timings.Fajr },
              { name: 'الشروق', key: 'Sunrise', time: timings.Sunrise },
              { name: 'الظهر', key: 'Dhuhr', time: timings.Dhuhr },
              { name: 'العصر', key: 'Asr', time: timings.Asr },
              { name: 'المغرب', key: 'Maghrib', time: timings.Maghrib },
              { name: 'العشاء', key: 'Isha', time: timings.Isha },
            ].map((p) => {
              const isCurrent = nextPrayerInfo.nameAr === p.name;
              return (
                <div
                  key={p.key}
                  style={{
                    background: isCurrent ? 'rgba(212, 168, 83, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem',
                    textAlign: 'center',
                    border: isCurrent ? '1px solid var(--gold)' : '1px solid transparent',
                    transition: 'transform 0.2s',
                  }}
                >
                  <span style={{
                    fontSize: '0.85rem',
                    display: 'block',
                    marginBottom: '0.25rem',
                    color: isCurrent ? 'var(--gold)' : '#FAF8F5'
                  }}>
                    {p.name}
                  </span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                    {formatTime12h(p.time)}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <Link
              href="/prayer-times"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#FAF8F5',
                fontSize: '0.88rem',
                textDecoration: 'none',
                opacity: 0.9,
                fontWeight: 600
              }}
            >
              عرض مواقيت الشهر والقبلة
              <ChevronLeft size={16} />
            </Link>
          </div>
        </section>

        {/* Gateways Grid (بوابات وصل الرقمية) */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-cairo)' }}>
                بوابات وصل الرقمية
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                تصفح جميع الخدمات والأدوات الإسلامية المتاحة بالمنصة
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}>
            {[
              {
                title: 'المصحف الشريف',
                desc: 'قراءة القرآن الكريم مع التفاسير والبحث في السور والآيات',
                href: '/quran',
                icon: BookOpen,
                color: 'var(--primary)',
                badge: '114 سورة'
              },
              {
                title: 'تلاوات واستماع',
                desc: 'استمع لأشهر القراء برواية حفص وروايات أخرى بجودة نقية',
                href: '/quran/listen',
                icon: Volume2,
                color: '#0D9488',
                badge: 'أكثر من 30 قارئ'
              },
              {
                title: 'مواقيت الصلاة',
                desc: 'حساب دقيق للمواقيت حسب مدينتك مع اتجاه القبلة',
                href: '/prayer-times',
                icon: Clock,
                color: '#2563EB',
                badge: 'دقة عالية'
              },
              {
                title: 'حصن المسلم والأذكار',
                desc: 'أذكار الصباح والمساء وأدعية اليوم والليلة مع مسبحة رقمية',
                href: '/adhkar',
                icon: Heart,
                color: '#E11D48',
                badge: 'عداد تفاعلي'
              },
              {
                title: 'أسماء الله الحسنى',
                desc: 'استكشف معاني أسماء الله الـ 99 وتدبرها وأسرار الدعاء بها',
                href: '/names-of-allah',
                icon: Star,
                color: '#D97706',
                badge: '99 اسماً'
              },
              {
                title: 'قصص الأنبياء',
                desc: 'سير الأنبياء والمرسلين والدروس والعبر من قصص القرآن',
                href: '/prophets',
                icon: Users,
                color: '#7C3AED',
                badge: 'سير مباركة'
              },
              {
                title: 'الأحاديث النبوية',
                desc: 'الأربعون النووية وصحيح البخاري ومسلم بشرح ميسر',
                href: '/hadith',
                icon: BookMarked,
                color: '#059669',
                badge: 'أحاديث صحيحة'
              },
              {
                title: 'حاسبة الزكاة',
                desc: 'احسب زكاة مالك والذهب والفضة والأسهم بسهولة ودقة',
                href: '/zakat',
                icon: Calculator,
                color: '#B8860B',
                badge: 'حساب شرعي'
              },
              {
                title: 'الإذاعة الإسلامية',
                desc: 'بث مباشر لإذاعة القرآن الكريم من القاهرة ومكة وقراءات متواصلة',
                href: '/radio',
                icon: Radio,
                color: '#DC2626',
                badge: 'بث مباشر'
              },
              {
                title: 'استوديو البطاقات',
                desc: 'صمم بطاقات قرآنية ودعوية فاخرة وشاركها على شبكات التواصل',
                href: '/share-cards',
                icon: Share2,
                color: '#4F46E5',
                badge: 'تصميم فوري'
              },
              {
                title: 'مسابقة وصل',
                desc: 'اختبر معلوماتك الإسلامية في القرآن والسيرة والتاريخ',
                href: '/quiz',
                icon: HelpCircle,
                color: '#0284C7',
                badge: 'تحدي ثقافي'
              },
              {
                title: 'دليل المسلم الجديد',
                desc: 'خطوة بخطوة لتعلم أركان الإسلام وصفة الوضوء والصلاة',
                href: '/new-muslims',
                icon: GraduationCap,
                color: '#16A34A',
                badge: 'دليل مبسط'
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.5rem',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: `color-mix(in srgb, ${card.color} 15%, transparent)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: card.color
                      }}>
                        <Icon size={24} />
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '20px',
                        background: 'var(--bg-card-subtle)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-color)'
                      }}>
                        {card.badge}
                      </span>
                    </div>

                    <h3 style={{
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      marginBottom: '0.4rem',
                      fontFamily: 'var(--font-cairo)'
                    }}>
                      {card.title}
                    </h3>

                    <p style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.6,
                      fontFamily: 'var(--font-tajawal)'
                    }}>
                      {card.desc}
                    </p>
                  </div>

                  <div style={{
                    marginTop: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: card.color
                  }}>
                    دخول البوابة
                    <ChevronLeft size={16} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Verse and Hadith of the Day */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}>
          {/* Verse Card */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-gold)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--gold)',
                  background: 'var(--gold-light)',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '20px'
                }}>
                  <BookOpen size={16} />
                  آية اليوم الكريمة
                </span>

                <button
                  onClick={handleCopyAyah}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.8rem'
                  }}
                  title="نسخ الآية"
                >
                  {copiedAyah ? <Check size={16} style={{ color: 'var(--primary)' }} /> : <Copy size={16} />}
                  {copiedAyah ? 'تم النسخ' : 'نسخ'}
                </button>
              </div>

              <blockquote style={{
                fontFamily: 'var(--font-quran)',
                fontSize: '1.45rem',
                lineHeight: 2,
                color: 'var(--text-main)',
                textAlign: 'center',
                margin: '1.5rem 0',
                padding: '0.5rem 1rem'
              }}>
                ﴿ {FEATURED_AYAH.text} ﴾
              </blockquote>

              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '1rem' }}>
                {FEATURED_AYAH.surah} — آية {FEATURED_AYAH.ayahNumber}
              </div>

              <p style={{
                fontSize: '0.88rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                background: 'var(--bg-card-subtle)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                fontStyle: 'italic'
              }}>
                💡 {FEATURED_AYAH.reflection}
              </p>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
              <Link
                href="/quran"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--primary)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                تصفح السورة كاملة
                <ChevronLeft size={16} />
              </Link>
            </div>
          </div>

          {/* Hadith Card */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  background: 'var(--primary-light)',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '20px'
                }}>
                  <Sparkles size={16} />
                  حديث شريف
                </span>
              </div>

              <p style={{
                fontFamily: 'var(--font-amiri)',
                fontSize: '1.35rem',
                lineHeight: 1.9,
                color: 'var(--text-main)',
                textAlign: 'center',
                margin: '1.5rem 0',
                fontWeight: 600
              }}>
                {FEATURED_HADITH.text}
              </p>

              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                رواه {FEATURED_HADITH.narrator} — {FEATURED_HADITH.source}
              </div>

              <p style={{
                fontSize: '0.88rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                background: 'var(--bg-card-subtle)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)'
              }}>
                📌 <strong>الفائدة:</strong> {FEATURED_HADITH.benefit}
              </p>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
              <Link
                href="/hadith"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--primary)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                تصفح الأحاديث والنووية
                <ChevronLeft size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Daily Khatmah Quick Goal Tracker */}
        <section style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookMarked size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, fontFamily: 'var(--font-cairo)' }}>
                وردك القرآني اليومي
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                أنجزت اليوم {dailyWirdCompleted} من أصل {dailyWirdCount} صفحات
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Progress Bar */}
            <div style={{ width: '160px', height: '10px', background: 'var(--bg-card-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{
                width: `${(dailyWirdCompleted / dailyWirdCount) * 100}%`,
                height: '100%',
                background: 'var(--primary)',
                transition: 'width 0.3s ease'
              }} />
            </div>

            <button
              onClick={handleAddWirdPage}
              disabled={dailyWirdCompleted >= dailyWirdCount}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: dailyWirdCompleted >= dailyWirdCount ? 'var(--bg-card-subtle)' : 'var(--primary)',
                color: dailyWirdCompleted >= dailyWirdCount ? 'var(--text-muted)' : '#FAF8F5',
                border: 'none',
                cursor: dailyWirdCompleted >= dailyWirdCount ? 'default' : 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                fontFamily: 'inherit'
              }}
            >
              <Check size={16} />
              {dailyWirdCompleted >= dailyWirdCount ? 'أتممت ورد اليوم!' : 'تسجيل قراءة صفحة'}
            </button>

            <Link
              href="/khatmah"
              style={{
                fontSize: '0.85rem',
                color: 'var(--primary)',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              خطة الختمة
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}

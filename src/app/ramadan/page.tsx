'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Moon, Sparkles, Clock, Heart, BookOpen, Gift, ChevronLeft, Calendar } from 'lucide-react';

export default function RamadanPage() {
  const [countdown, setCountdown] = useState({ days: 16, hours: 8, minutes: 24, seconds: 40 });

  useEffect(() => {
    // Simulated countdown until next Ramadan 1st
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main style={{ minHeight: '80vh', padding: '2.5rem 1.25rem 5rem' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.9rem',
            borderRadius: '20px',
            background: 'var(--gold-light)',
            color: 'var(--gold)',
            fontSize: '0.88rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            border: '1px solid var(--border-gold)'
          }}>
            <Flame size={16} />
            شهر القرآن والرحمة والمغفرة
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-cairo)',
            marginBottom: '0.5rem'
          }}>
            موسم رمضان المبارك
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', lineHeight: 1.7 }}>
            برنامج متكامل لاستقبال الشهر الفضيل: العد التنازلي، أدعية الصيام والإفطار، سنن وآداب القيام، وجدول ختم القرآن.
          </p>
        </div>

        {/* Ramadan Countdown Card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--emerald-deep) 100%)',
          color: '#FAF8F5',
          borderRadius: 'var(--radius-2xl)',
          padding: '3rem 2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-gold)',
          marginBottom: '2.5rem',
          position: 'relative'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(212, 168, 83, 0.25)',
            color: 'var(--gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            border: '1px solid var(--border-gold)'
          }}>
            <Moon size={32} />
          </div>

          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-cairo)', margin: '0 0 0.5rem' }}>
            العد التنازلي لحلول شهر رمضان المبارك
          </h2>
          <p style={{ fontSize: '1rem', opacity: 0.85, margin: '0 0 2rem' }}>
            اللهم بلغنا رمضان وبارك لنا فيه، وأعنا على صيامه وقيامه إيماناً واحتساباً.
          </p>

          {/* Countdown Numbers */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            direction: 'ltr',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                minWidth: '75px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                {countdown.days}
              </div>
              <span style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.25rem', display: 'block' }}>يوم</span>
            </div>

            <span style={{ fontSize: '2rem', fontWeight: 700, opacity: 0.6 }}>:</span>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                minWidth: '75px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                {countdown.hours}
              </div>
              <span style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.25rem', display: 'block' }}>ساعة</span>
            </div>

            <span style={{ fontSize: '2rem', fontWeight: 700, opacity: 0.6 }}>:</span>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                minWidth: '75px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                {countdown.minutes}
              </div>
              <span style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.25rem', display: 'block' }}>دقيقة</span>
            </div>

            <span style={{ fontSize: '2rem', fontWeight: 700, opacity: 0.6 }}>:</span>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                minWidth: '75px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'var(--gold)'
              }}>
                {countdown.seconds}
              </div>
              <span style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.25rem', display: 'block' }}>ثانية</span>
            </div>
          </div>
        </div>

        {/* Ramadan Du'as Grid */}
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem', fontFamily: 'var(--font-cairo)' }}>
          أدعية الصيام المباركة المأثورة
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          {[
            {
              title: 'دعاء رؤية هلال رمضان',
              arabic: '«اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالأَمْنِ وَالإِيمَانِ، وَالسَّلاَمَةِ وَالإِسْلاَمِ، رَبِّي وَرَبُّكَ اللَّهُ، هِلاَلُ رُشْدٍ وَخَيْرٍ»',
              source: 'سنن الترمذي وحسنه',
            },
            {
              title: 'دعاء الإفطار عند الفطر',
              arabic: '«ذَهَبَ الظَّمَأُ، وَابْتَلَّتِ العُرُوقُ، وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ»',
              source: 'سنن أبي داود',
            },
            {
              title: 'دعاء ليلة القدر المباركة',
              arabic: '«اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي»',
              source: 'جامع الترمذي - وصية النبي لعائشة',
            },
            {
              title: 'دعاء إذا شاتمه أحد وهو صائم',
              arabic: '«إِنِّي صَائِمٌ، إِنِّي صَائِمٌ»',
              source: 'صحيح البخاري ومسلم',
            },
          ].map((dua, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <span style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--gold)',
                background: 'var(--gold-light)',
                padding: '0.2rem 0.65rem',
                borderRadius: '16px',
                display: 'inline-block',
                marginBottom: '0.75rem'
              }}>
                {dua.title}
              </span>

              <p style={{
                fontFamily: 'var(--font-amiri)',
                fontSize: '1.35rem',
                lineHeight: 1.9,
                color: 'var(--text-main)',
                margin: '0 0 1rem',
                fontWeight: 600
              }}>
                {dua.arabic}
              </p>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {dua.source}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Ramadan Portals */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
        }}>
          <Link
            href="/khatmah"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.2rem', fontFamily: 'var(--font-cairo)' }}>
                خطة ختمة رمضان
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                جدول إتمام ختمة كاملة في 30 يوماً
              </p>
            </div>
          </Link>

          <Link
            href="/zakat"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'var(--gold-light)',
              color: 'var(--gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Gift size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.2rem', fontFamily: 'var(--font-cairo)' }}>
                زكاة الفطر والمال
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                حساب زكاة المال ومقدار زكاة الفطر
              </p>
            </div>
          </Link>

          <Link
            href="/prayer-times"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(37, 99, 235, 0.1)',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.2rem', fontFamily: 'var(--font-cairo)' }}>
                إمساكية رمضان
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                مواقيت الإمساك والإفطار يومياً
              </p>
            </div>
          </Link>
        </div>

      </div>
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { BookMarked, Check, RotateCcw, Calendar, Sparkles, BookOpen, Clock } from 'lucide-react';

export default function KhatmahPage() {
  const [daysTarget, setDaysTarget] = useState<number>(30);
  const [completedJuz, setCompletedJuz] = useState<number[]>([]);

  // 604 pages total in standard Mushaf al-Madinah
  const TOTAL_PAGES = 604;
  const pagesPerDay = Math.ceil(TOTAL_PAGES / daysTarget);
  const pagesPerPrayer = Math.ceil(pagesPerDay / 5);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wasl-khatmah-juz');
      if (saved) setCompletedJuz(JSON.parse(saved));
    } catch {
      // safe fallback
    }
  }, []);

  const toggleJuz = (juzNumber: number) => {
    let next: number[];
    if (completedJuz.includes(juzNumber)) {
      next = completedJuz.filter((j) => j !== juzNumber);
    } else {
      next = [...completedJuz, juzNumber];
    }
    setCompletedJuz(next);
    try {
      localStorage.setItem('wasl-khatmah-juz', JSON.stringify(next));
    } catch {
      // safe fallback
    }
  };

  const handleReset = () => {
    setCompletedJuz([]);
    try {
      localStorage.removeItem('wasl-khatmah-juz');
    } catch {
      // safe fallback
    }
  };

  const percentComplete = Math.round((completedJuz.length / 30) * 100);

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
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.88rem',
            fontWeight: 700,
            marginBottom: '0.75rem'
          }}>
            <BookMarked size={16} />
            خطة وبرنامج ختمة القرآن
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-cairo)',
            marginBottom: '0.5rem'
          }}>
            مخطط ختمة القرآن الكريم
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', lineHeight: 1.7 }}>
            حدد هدفك الزمني لختم كتاب الله (30 يوماً، 15 يوماً، أو غيرها)، وتابع إنجاز الأجزاء الـ 30 أولاً بأول.
          </p>
        </div>

        {/* Target Selector & Calculations Box */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--emerald-deep) 100%)',
          color: '#FAF8F5',
          borderRadius: 'var(--radius-2xl)',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-gold)',
          marginBottom: '2.5rem',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
              اختر المدة الزمنية لإتمام الختمة:
            </span>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              flexWrap: 'wrap'
            }}>
              {[
                { days: 10, label: '10 أيام (مكثفة)' },
                { days: 15, label: '15 يوماً' },
                { days: 20, label: '20 يوماً' },
                { days: 30, label: '30 يوماً (رمضان)' },
                { days: 60, label: '60 يوماً (شهرين)' },
              ].map((item) => (
                <button
                  key={item.days}
                  onClick={() => setDaysTarget(item.days)}
                  style={{
                    padding: '0.55rem 1.15rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid',
                    borderColor: daysTarget === item.days ? 'var(--gold)' : 'rgba(255, 255, 255, 0.25)',
                    background: daysTarget === item.days ? 'var(--gold)' : 'rgba(255, 255, 255, 0.12)',
                    color: '#FAF8F5',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Goal Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            paddingTop: '2rem',
            textAlign: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.85rem', opacity: 0.85, display: 'block' }}>المطلوب يومياً:</span>
              <strong style={{ fontSize: '2rem', display: 'block', margin: '0.2rem 0' }}>{pagesPerDay}</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>صفحة في اليوم</span>
            </div>

            <div>
              <span style={{ fontSize: '0.85rem', opacity: 0.85, display: 'block' }}>المطلوب دبر كل صلاة:</span>
              <strong style={{ fontSize: '2rem', display: 'block', margin: '0.2rem 0' }}>{pagesPerPrayer}</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>صفحات بعد كل فريضة</span>
            </div>

            <div>
              <span style={{ fontSize: '0.85rem', opacity: 0.85, display: 'block' }}>إجمالي الإنجاز:</span>
              <strong style={{ fontSize: '2rem', display: 'block', margin: '0.2rem 0' }}>{percentComplete}%</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>{completedJuz.length} من 30 جزءاً</span>
            </div>
          </div>
        </div>

        {/* 30 Juz Checklist */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-2xl)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem', fontFamily: 'var(--font-cairo)' }}>
                متابعة الأجزاء الـ 30
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                انقر على رقم الجزء فور إتمامه لتسجيل تقدمك وحفظه
              </p>
            </div>

            <button
              onClick={handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} />
              إعادة ضبط الختمة
            </button>
          </div>

          {/* 30 Juz Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
            gap: '0.75rem',
          }}>
            {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => {
              const isDone = completedJuz.includes(juz);
              return (
                <button
                  key={juz}
                  onClick={() => toggleJuz(juz)}
                  style={{
                    padding: '1rem 0.5rem',
                    borderRadius: 'var(--radius-xl)',
                    border: '1.5px solid',
                    borderColor: isDone ? 'var(--primary)' : 'var(--border-color)',
                    background: isDone ? 'var(--primary)' : 'var(--bg-main)',
                    color: isDone ? '#FAF8F5' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'all 0.15s ease',
                    boxShadow: isDone ? 'var(--shadow-md)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '0.72rem', opacity: isDone ? 0.9 : 0.6 }}>الجزء</span>
                  <span style={{ fontSize: '1.3rem', fontFamily: 'var(--font-cairo)' }}>{juz}</span>
                  {isDone ? <Check size={16} /> : <span style={{ width: '16px', height: '16px' }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Khatm Du'a Box */}
        <div style={{
          background: 'var(--gold-light)',
          border: '1px solid var(--border-gold)',
          borderRadius: 'var(--radius-2xl)',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <span style={{
            fontSize: '0.85rem',
            color: 'var(--gold)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '0.75rem'
          }}>
            <Sparkles size={16} />
            دعاء ختم القرآن الكريم المأثور
          </span>

          <p style={{
            fontFamily: 'var(--font-amiri)',
            fontSize: '1.4rem',
            lineHeight: 2.1,
            color: 'var(--text-main)',
            maxWidth: '850px',
            margin: '0 auto',
            fontWeight: 600
          }}>
            «اللَّهُمَّ ارْحَمْنِي بِالقُرْآنِ، وَاجْعَلْهُ لِي إِمَاماً وَنُوراً وَهُدًى وَرَحْمَةً، اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ، وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ، وَارْزُقْنِي تِلاَوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ، وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ العَالَمِينَ»
          </p>
        </div>

      </div>
    </main>
  );
}

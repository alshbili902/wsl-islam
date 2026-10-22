'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Volume2, Sparkles, Filter, ChevronLeft } from 'lucide-react';
import { SURAHS_LIST, type SurahMeta } from '@/data/surahs';

export default function QuranIndexPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Meccan' | 'Medinan'>('all');

  const filteredSurahs = useMemo(() => {
    return SURAHS_LIST.filter((s) => {
      const matchesSearch =
        s.name.includes(search.trim()) ||
        s.englishName.toLowerCase().includes(search.toLowerCase().trim()) ||
        s.englishNameTranslation.toLowerCase().includes(search.toLowerCase().trim()) ||
        String(s.number) === search.trim();

      const matchesFilter = filterType === 'all' || s.revelationType === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [search, filterType]);

  const quickSurahs = [
    { num: 1, name: 'الفاتحة' },
    { num: 18, name: 'الكهف' },
    { num: 36, name: 'يس' },
    { num: 55, name: 'الرحمن' },
    { num: 56, name: 'الواقعة' },
    { num: 67, name: 'الملك' },
  ];

  return (
    <main style={{ minHeight: '80vh', padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* Header Banner */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2.5rem',
          position: 'relative'
        }}>
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
            <BookOpen size={16} />
            المصحف الشريف الرقمي
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-cairo)',
            marginBottom: '0.75rem'
          }}>
            فهرس سور القرآن الكريم
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'var(--text-muted)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.7
          }}>
            تصفح جميع سور القرآن الـ 114 مع خيارات القراءة المتأنية، والاستماع لأعذب التلاوات، والتدبر في معاني الآيات.
          </p>

          {/* Quick jump pills */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginTop: '1.25rem'
          }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>سور مميزة:</span>
            {quickSurahs.map((qs) => (
              <Link
                key={qs.num}
                href={`/quran/${qs.num}`}
                style={{
                  fontSize: '0.82rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  fontWeight: 600
                }}
              >
                سورة {qs.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Search Box */}
          <div style={{
            position: 'relative',
            flex: '1 1 300px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={18} style={{ position: 'absolute', right: '14px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="ابحث باسم السورة (مثلاً: الكهف، Al-Kahf) أو برقمها..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 2.75rem 0.75rem 1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Type Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Filter size={15} />
              النوع:
            </span>
            <button
              onClick={() => setFilterType('all')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: filterType === 'all' ? 'var(--primary)' : 'var(--border-color)',
                background: filterType === 'all' ? 'var(--primary)' : 'var(--bg-main)',
                color: filterType === 'all' ? '#FAF8F5' : 'var(--text-main)',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              الكل (114)
            </button>
            <button
              onClick={() => setFilterType('Meccan')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: filterType === 'Meccan' ? 'var(--primary)' : 'var(--border-color)',
                background: filterType === 'Meccan' ? 'var(--primary)' : 'var(--bg-main)',
                color: filterType === 'Meccan' ? '#FAF8F5' : 'var(--text-main)',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              مكية (86)
            </button>
            <button
              onClick={() => setFilterType('Medinan')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: filterType === 'Medinan' ? 'var(--primary)' : 'var(--border-color)',
                background: filterType === 'Medinan' ? 'var(--primary)' : 'var(--bg-main)',
                color: filterType === 'Medinan' ? '#FAF8F5' : 'var(--text-main)',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              مدنية (28)
            </button>
          </div>
        </div>

        {/* Surahs Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
          gap: '1rem',
        }}>
          {filteredSurahs.map((surah) => {
            const isMeccan = surah.revelationType === 'Meccan';
            return (
              <div
                key={surah.number}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    
                    {/* Surah Number Badge */}
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'var(--bg-card-subtle)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      color: 'var(--primary)',
                      fontFamily: 'var(--font-cairo)'
                    }}>
                      {surah.number}
                    </div>

                    {/* Revelation Type Badge */}
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.65rem',
                      borderRadius: '20px',
                      background: isMeccan ? 'var(--gold-light)' : 'var(--primary-light)',
                      color: isMeccan ? 'var(--gold)' : 'var(--primary)',
                      border: `1px solid ${isMeccan ? 'var(--border-gold)' : 'rgba(6, 95, 70, 0.2)'}`
                    }}>
                      {isMeccan ? 'مكية' : 'مدنية'}
                    </span>
                  </div>

                  {/* Names */}
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <h2 style={{
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      fontFamily: 'var(--font-amiri)',
                      margin: 0
                    }}>
                      سُورَةُ {surah.name}
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {surah.numberOfAyahs} آيات
                    </span>
                  </div>

                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    margin: '0.25rem 0 1rem',
                    fontFamily: 'var(--font-tajawal)'
                  }}>
                    {surah.englishName} • {surah.englishNameTranslation}
                  </p>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '0.75rem',
                  marginTop: '0.5rem'
                }}>
                  <Link
                    href={`/quran/${surah.number}`}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--primary)',
                      color: '#FAF8F5',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'background 0.2s'
                    }}
                  >
                    <BookOpen size={16} />
                    قراءة السورة
                  </Link>

                  <Link
                    href={`/quran/listen?surah=${surah.number}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.55rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                    title="الاستماع لتلاوة السورة"
                  >
                    <Volume2 size={16} />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

        {filteredSurahs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            لم نجد سورة تطابق بحثك: &quot;{search}&quot;
          </div>
        )}

      </div>
    </main>
  );
}

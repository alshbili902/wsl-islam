'use client';

import { useState } from 'react';
import {
  Heart, Sun, Moon, Sparkles, RotateCcw, Check,
  Volume2, VolumeX, Copy, ChevronLeft, Bookmark
} from 'lucide-react';
import { ADHKAR_DATA, type DhikrItem } from '@/data/adhkar';

export default function AdhkarPage() {
  const [activeCategoryId, setActiveCategoryId] = useState('morning');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [tasbihFreeCount, setTasbihFreeCount] = useState<number>(0);
  const [tasbihPhrase, setTasbihPhrase] = useState('سُبْحَانَ اللَّهِ وَبِحَمْدِهِ');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeCategory = ADHKAR_DATA.find((c) => c.id === activeCategoryId) || ADHKAR_DATA[0];

  const handleIncrement = (item: DhikrItem) => {
    const current = counts[item.id] || 0;
    if (current < item.count) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(30);
      }
      setCounts((prev) => ({
        ...prev,
        [item.id]: current + 1,
      }));
    }
  };

  const handleResetCategory = () => {
    const updated = { ...counts };
    activeCategory.items.forEach((item) => {
      delete updated[item.id];
    });
    setCounts(updated);
  };

  const handleCopyDhikr = (item: DhikrItem) => {
    const content = `${item.text}\n[${item.source}]\nعبر منصة وصل الإسلامية: https://waslislam.fun/adhkar`;
    navigator.clipboard.writeText(content);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Completed items in active category
  const completedCount = activeCategory.items.filter(
    (item) => (counts[item.id] || 0) >= item.count
  ).length;

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
            <Heart size={16} />
            حصن المسلم والأذكار النبوية
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-cairo)',
            marginBottom: '0.5rem'
          }}>
            أذكار اليوم والليلة
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            حصن نفسك بذكر الله العظيم، مع عداد تفاعلي لمتابعة كل ذكر والمأثور من فضله وثوابه.
          </p>
        </div>

        {/* Free Digital Tasbih Hero Widget */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--emerald-deep) 100%)',
          color: '#FAF8F5',
          borderRadius: 'var(--radius-2xl)',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-gold)',
          marginBottom: '2.5rem',
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
            المسبحة الإلكترونية الحرة
          </span>

          <div style={{
            fontFamily: 'var(--font-amiri)',
            fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
            fontWeight: 700,
            margin: '0.5rem 0 1rem'
          }}>
            {tasbihPhrase}
          </div>

          {/* Quick Phrase Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '1.5rem'
          }}>
            {[
              'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
              'سُبْحَانَ اللَّهِ العَظِيمِ',
              'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
              'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
              'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
            ].map((p) => (
              <button
                key={p}
                onClick={() => setTasbihPhrase(p)}
                style={{
                  background: tasbihPhrase === p ? 'var(--gold)' : 'rgba(255, 255, 255, 0.12)',
                  color: '#FAF8F5',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: tasbihPhrase === p ? 700 : 500,
                  fontFamily: 'inherit'
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Big Tasbih Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
            <button
              onClick={() => {
                setTasbihFreeCount((prev) => prev + 1);
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                  navigator.vibrate(40);
                }
              }}
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '3px solid var(--gold)',
                color: '#FAF8F5',
                fontSize: '2.5rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                transform: 'scale(1)',
                transition: 'transform 0.1s ease',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.94)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {tasbihFreeCount}
            </button>

            <button
              onClick={() => setTasbihFreeCount(0)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#FAF8F5',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
              title="تصفير العداد"
            >
              <RotateCcw size={16} />
              تصفير
            </button>
          </div>
        </div>

        {/* Categories Tabs Bar */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '2rem'
        }}>
          {ADHKAR_DATA.map((cat) => {
            const isSelected = cat.id === activeCategoryId;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                  background: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                  color: isSelected ? '#FAF8F5' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                <span>{cat.title}</span>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '12px',
                  background: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-card-subtle)',
                  color: isSelected ? '#FAF8F5' : 'var(--text-muted)'
                }}>
                  {cat.items.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Info & Progress Bar */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem', fontFamily: 'var(--font-cairo)' }}>
              {activeCategory.title}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              {activeCategory.description} • أنجزت {completedCount} من {activeCategory.items.length} أذكار
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Progress bar */}
            <div style={{ width: '120px', height: '8px', background: 'var(--bg-card-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{
                width: `${(completedCount / activeCategory.items.length) * 100}%`,
                height: '100%',
                background: 'var(--primary)',
                transition: 'width 0.3s ease'
              }} />
            </div>

            <button
              onClick={handleResetCategory}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              <RotateCcw size={14} />
              إعادة البدء
            </button>
          </div>
        </div>

        {/* Dhikr Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeCategory.items.map((item, index) => {
            const currentCount = counts[item.id] || 0;
            const isCompleted = currentCount >= item.count;

            return (
              <div
                key={item.id}
                style={{
                  background: isCompleted ? 'var(--bg-card-subtle)' : 'var(--bg-card)',
                  border: '1px solid',
                  borderColor: isCompleted ? 'var(--primary)' : 'var(--border-color)',
                  borderRadius: 'var(--radius-2xl)',
                  padding: '2rem',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  opacity: isCompleted ? 0.85 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Header row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      background: isCompleted ? 'var(--primary)' : 'var(--primary-light)',
                      color: isCompleted ? '#FAF8F5' : 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}>
                      {isCompleted ? <Check size={16} /> : index + 1}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.source}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <button
                      onClick={() => handleCopyDhikr(item)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        fontSize: '0.8rem'
                      }}
                      title="نسخ الذكر"
                    >
                      {copiedId === item.id ? <Check size={15} style={{ color: 'var(--primary)' }} /> : <Copy size={15} />}
                      {copiedId === item.id ? 'تم النسخ' : 'نسخ'}
                    </button>
                  </div>
                </div>

                {/* Dhikr Arabic Text */}
                <p style={{
                  fontFamily: 'var(--font-amiri)',
                  fontSize: '1.45rem',
                  lineHeight: 2.1,
                  color: 'var(--text-main)',
                  margin: '0 0 1.25rem',
                  textAlign: 'right'
                }}>
                  {item.text}
                </p>

                {/* Virtue/Fadl */}
                {item.fadl && (
                  <div style={{
                    background: 'var(--bg-main)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    borderRight: '3px solid var(--gold)',
                    marginBottom: '1.5rem',
                    lineHeight: 1.6
                  }}>
                    <strong style={{ color: 'var(--gold)', display: 'block', marginBottom: '0.2rem' }}>فضل هذا الذكر:</strong>
                    {item.fadl}
                  </div>
                )}

                {/* Count Action Button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '1.25rem'
                }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    التكرار المطلوب: <strong style={{ color: 'var(--text-main)' }}>{item.count} مرات</strong>
                  </div>

                  <button
                    onClick={() => handleIncrement(item)}
                    disabled={isCompleted}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.65rem 1.5rem',
                      borderRadius: 'var(--radius-xl)',
                      border: 'none',
                      background: isCompleted ? 'var(--primary)' : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                      color: '#FAF8F5',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: isCompleted ? 'default' : 'pointer',
                      boxShadow: isCompleted ? 'none' : '0 4px 12px rgba(6, 95, 70, 0.25)',
                      fontFamily: 'inherit',
                      transform: 'scale(1)',
                      transition: 'transform 0.1s'
                    }}
                    onMouseDown={(e) => {
                      if (!isCompleted) e.currentTarget.style.transform = 'scale(0.96)';
                    }}
                    onMouseUp={(e) => {
                      if (!isCompleted) e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {isCompleted ? (
                      <>
                        <Check size={18} />
                        تم الإنجاز بنجاح
                      </>
                    ) : (
                      <>
                        <span>سبّح واضغط</span>
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.25)',
                          padding: '0.15rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.85rem'
                        }}>
                          {currentCount} / {item.count}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { Star, Search, X, Copy, Check, Sparkles, BookOpen, Heart } from 'lucide-react';
import { NAMES_OF_ALLAH, type NameOfAllah } from '@/data/names-of-allah';

export default function NamesOfAllahPage() {
  const [search, setSearch] = useState('');
  const [selectedName, setSelectedName] = useState<NameOfAllah | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredNames = useMemo(() => {
    return NAMES_OF_ALLAH.filter(
      (n) =>
        n.name.includes(search.trim()) ||
        n.transliteration.toLowerCase().includes(search.toLowerCase().trim()) ||
        n.meaning.toLowerCase().includes(search.toLowerCase().trim()) ||
        n.explanation.includes(search.trim()) ||
        String(n.number) === search.trim()
    );
  }, [search]);

  const handleCopy = (n: NameOfAllah) => {
    const text = `اسم الله الأعظم: { ${n.name} } (${n.transliteration})\nالمعنى: ${n.meaning}\nالشرح والتدبر: ${n.explanation}\nعبر منصة وصل الإسلامية: https://waslislam.fun/names-of-allah`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <main style={{ minHeight: '80vh', padding: '2.5rem 1.25rem 5rem' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
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
            <Star size={16} />
            ولله الأسماء الحسنى فادعوه بها
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-cairo)',
            marginBottom: '0.5rem'
          }}>
            أسماء الله الحسنى الـ 99
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', lineHeight: 1.7 }}>
            قال رسول الله ﷺ: «إِنَّ لِلَّهِ تِسْعَةً وَتِسْعِينَ اسْمًا مِائَةً إِلَّا وَاحِدًا، مَنْ أَحْصَاهَا دَخَلَ الجَنَّةَ». استكشف معانيها العظيمة وتدبرها.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{
          maxWidth: '560px',
          margin: '0 auto 2.5rem',
          position: 'relative'
        }}>
          <Search size={18} style={{ position: 'absolute', right: '14px', top: '14px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="ابحث بالاسم (مثال: الرحمن، Al-Rahmaan) أو بالمعنى..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 2.8rem 0.8rem 1rem',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              fontSize: '0.95rem',
              outline: 'none',
              boxShadow: 'var(--shadow-sm)',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Names Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}>
          {filteredNames.map((name) => (
            <button
              key={name.number}
              onClick={() => setSelectedName(name)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.5rem 1rem',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'var(--gold)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              {/* Number Badge */}
              <span style={{
                position: 'absolute',
                top: '10px',
                right: '12px',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                fontWeight: 700
              }}>
                #{name.number}
              </span>

              {/* Calligraphy Name */}
              <div style={{
                fontFamily: 'var(--font-amiri)',
                fontSize: '1.9rem',
                fontWeight: 700,
                color: 'var(--primary)',
                marginTop: '0.5rem',
                lineHeight: 1.3
              }}>
                {name.name}
              </div>

              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gold)' }}>
                {name.transliteration}
              </span>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                {name.meaning}
              </p>

              <span style={{
                fontSize: '0.72rem',
                color: 'var(--primary)',
                fontWeight: 600,
                marginTop: '0.4rem'
              }}>
                انقر للتدبر والشرح ←
              </span>
            </button>
          ))}
        </div>

        {/* Detail Modal */}
        {selectedName && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 70,
              padding: '1.25rem',
              backdropFilter: 'blur(6px)'
            }}
            onClick={() => setSelectedName(null)}
          >
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-gold)',
                borderRadius: 'var(--radius-2xl)',
                maxWidth: '560px',
                width: '100%',
                padding: '2.5rem 2rem',
                position: 'relative',
                boxShadow: 'var(--shadow-xl)',
                textAlign: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedName(null)}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '16px',
                  background: 'var(--bg-card-subtle)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                <X size={18} />
              </button>

              <span style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--gold)',
                background: 'var(--gold-light)',
                padding: '0.2rem 0.75rem',
                borderRadius: '20px',
                border: '1px solid var(--border-gold)'
              }}>
                الاسم رقم {selectedName.number} من أسماء الله الحسنى
              </span>

              <h2 style={{
                fontFamily: 'var(--font-amiri)',
                fontSize: '3rem',
                fontWeight: 800,
                color: 'var(--primary)',
                margin: '1rem 0 0.25rem'
              }}>
                {selectedName.name}
              </h2>

              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gold)', marginBottom: '0.25rem' }}>
                {selectedName.transliteration}
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
                {selectedName.meaning}
              </p>

              <div style={{
                background: 'var(--bg-main)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.25rem',
                textAlign: 'right',
                marginBottom: '1.75rem',
                border: '1px solid var(--border-color)',
                lineHeight: 1.8,
                fontSize: '0.95rem',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-tajawal)'
              }}>
                <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                  💡 البيان والتدبر في معنى الاسم:
                </strong>
                {selectedName.explanation}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  onClick={() => handleCopy(selectedName)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary)',
                    color: '#FAF8F5',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'تم النسخ بنجاح' : 'نسخ معلومات الاسم'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

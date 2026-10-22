'use client';

import { useState } from 'react';
import { BookOpenCheck, Copy, Check, Search, Filter, Sparkles, BookMarked } from 'lucide-react';
import { HADITHS_DATA, type Hadith } from '@/data/hadiths';

export default function HadithPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredHadiths = HADITHS_DATA.filter((h) => {
    const matchesCat = activeCategory === 'all' || h.category === activeCategory;
    const matchesSearch =
      h.title.includes(search.trim()) ||
      h.arabic.includes(search.trim()) ||
      h.narrator.includes(search.trim()) ||
      h.source.includes(search.trim()) ||
      h.explanation.includes(search.trim());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (h: Hadith) => {
    const text = `قال رسول الله ﷺ:\n«${h.arabic}»\nرواه ${h.narrator} — ${h.source}\nعبر منصة وصل الإسلامية: https://waslislam.fun/hadith`;
    navigator.clipboard.writeText(text);
    setCopiedId(h.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

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
            <BookOpenCheck size={16} />
            السنة النبوية الشريفة
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-cairo)',
            marginBottom: '0.5rem'
          }}>
            الأحاديث النبوية الشريفة
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', lineHeight: 1.7 }}>
            جوامع الكلم من أحاديث النبي ﷺ: الأربعون النووية وصحيح البخاري ومسلم بشرح ميسر وبيان للفوائد التربوية والإيمانية.
          </p>
        </div>

        {/* Filter and Search Bar */}
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
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={18} style={{ position: 'absolute', right: '14px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="ابحث في نص الحديث، الراوي، أو الموضوع..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 2.6rem 0.65rem 1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'الكل' },
              { id: 'faith', label: 'الإيمان والتوحيد' },
              { id: 'character', label: 'مكارم الأخلاق' },
              { id: 'worship', label: 'العبادات' },
              { id: 'society', label: 'حقوق المسلم' },
              { id: 'daily', label: 'وصايا يومية' },
            ].map((tab) => {
              const isSelected = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                    background: isSelected ? 'var(--primary)' : 'var(--bg-main)',
                    color: isSelected ? '#FAF8F5' : 'var(--text-main)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hadiths Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {filteredHadiths.map((h) => (
            <div
              key={h.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-2xl)',
                padding: '2rem',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative'
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.9rem'
                  }}>
                    {h.id}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, fontFamily: 'var(--font-cairo)' }}>
                    الحديث: {h.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{
                    fontSize: '0.78rem',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '16px',
                    background: 'var(--primary-light)'
                  }}>
                    {h.source}
                  </span>

                  <button
                    onClick={() => handleCopy(h)}
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
                    title="نسخ الحديث الشريف"
                  >
                    {copiedId === h.id ? <Check size={16} style={{ color: 'var(--primary)' }} /> : <Copy size={16} />}
                    {copiedId === h.id ? 'تم النسخ' : 'نسخ'}
                  </button>
                </div>
              </div>

              {/* Narrator */}
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                عن {h.narrator} قال:
              </div>

              {/* Hadith Arabic Body */}
              <p style={{
                fontFamily: 'var(--font-amiri)',
                fontSize: '1.45rem',
                lineHeight: 2.1,
                color: 'var(--text-main)',
                margin: '0 0 1.5rem',
                textAlign: 'right',
                fontWeight: 600
              }}>
                «{h.arabic}»
              </p>

              {/* Explanation Box */}
              <div style={{
                background: 'var(--bg-card-subtle)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.25rem',
                marginBottom: '1.25rem',
                border: '1px solid var(--border-color)',
                fontSize: '0.92rem',
                lineHeight: 1.7,
                color: 'var(--text-main)',
                fontFamily: 'var(--font-tajawal)'
              }}>
                <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.3rem', fontSize: '0.88rem' }}>
                  💡 الشرح والبيان:
                </strong>
                {h.explanation}
              </div>

              {/* Benefits */}
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--gold)', display: 'block', marginBottom: '0.5rem' }}>
                  📌 أبرز الفوائد المستنبطة:
                </strong>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {h.benefits.map((b, bi) => (
                    <span key={bi} style={{
                      background: 'var(--gold-light)',
                      border: '1px solid var(--border-gold)',
                      color: 'var(--text-main)',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '16px',
                      fontSize: '0.8rem'
                    }}>
                      • {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}

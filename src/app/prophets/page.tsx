'use client';

import { useState } from 'react';
import { Users, Sparkles, BookOpen, MapPin, Clock, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { PROPHETS_DATA, type Prophet } from '@/data/prophets';

export default function ProphetsPage() {
  const [expandedId, setExpandedId] = useState<string | null>('adam');
  const [search, setSearch] = useState('');

  const filteredProphets = PROPHETS_DATA.filter(
    (p) =>
      p.name.includes(search.trim()) ||
      p.title.includes(search.trim()) ||
      p.summary.includes(search.trim()) ||
      p.location.includes(search.trim())
  );

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
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
            <Users size={16} />
            أولئك الذين هدى الله فبهداهم اقتده
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-cairo)',
            marginBottom: '0.5rem'
          }}>
            قصص الأنبياء والمرسلين
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', lineHeight: 1.7 }}>
            عبر ودروس خالدة من سير أنبياء الله ورسله الذين أرسلهم هداة للبشرية، ومواقف ثباتهم ومعجزاتهم التي أيدهم الله بها.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ maxWidth: '500px', margin: '0 auto 2.5rem', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', right: '14px', top: '13px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="ابحث باسم النبي (مثال: إبراهيم، موسى، يوسف)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 2.8rem 0.75rem 1rem',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              fontSize: '0.92rem',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Prophets List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredProphets.map((p, index) => {
            const isExpanded = expandedId === p.id;
            return (
              <div
                key={p.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid',
                  borderColor: isExpanded ? 'var(--primary)' : 'var(--border-color)',
                  borderRadius: 'var(--radius-2xl)',
                  boxShadow: isExpanded ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}
              >
                {/* Header banner */}
                <div
                  onClick={() => toggleExpand(p.id)}
                  style={{
                    padding: '1.5rem 1.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: isExpanded ? 'var(--bg-card-subtle)' : 'var(--bg-card)',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem'
                    }}>
                      {index + 1}
                    </div>

                    <div>
                      <h2 style={{
                        fontSize: '1.4rem',
                        fontWeight: 800,
                        color: 'var(--text-main)',
                        margin: 0,
                        fontFamily: 'var(--font-cairo)'
                      }}>
                        {p.name}
                      </h2>
                      <span style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>
                        {p.title}
                      </span>
                    </div>
                  </div>

                  {/* Metadata tags */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      fontSize: '0.78rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '16px',
                      background: 'var(--bg-main)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <BookOpen size={14} />
                      ذُكر {p.mentionedInQuran} مرة بالقرآن
                    </span>

                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        fontSize: '0.85rem',
                        fontWeight: 700
                      }}
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Story & Details */}
                {isExpanded && (
                  <div style={{ padding: '2rem 1.75rem', borderTop: '1px solid var(--border-color)' }}>
                    
                    {/* Meta info pills */}
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      flexWrap: 'wrap',
                      marginBottom: '1.5rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={16} style={{ color: 'var(--primary)' }} />
                        الفترة الزمنية: <strong>{p.period}</strong>
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={16} style={{ color: 'var(--primary)' }} />
                        المكان: <strong>{p.location}</strong>
                      </span>
                    </div>

                    {/* Summary */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                        ملخص القصة:
                      </h4>
                      <p style={{
                        fontSize: '0.98rem',
                        lineHeight: 1.8,
                        color: 'var(--text-main)',
                        fontFamily: 'var(--font-tajawal)',
                        margin: 0
                      }}>
                        {p.summary}
                      </p>
                    </div>

                    {/* Key Moment */}
                    <div style={{
                      background: 'var(--gold-light)',
                      borderRight: '4px solid var(--gold)',
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1.5rem'
                    }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '0.4rem' }}>
                        المشهد المحوري في الدعوة:
                      </h4>
                      <p style={{
                        fontSize: '0.92rem',
                        lineHeight: 1.8,
                        color: 'var(--text-main)',
                        fontFamily: 'var(--font-tajawal)',
                        margin: 0
                      }}>
                        {p.keyStory}
                      </p>
                    </div>

                    {/* Miracles */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.6rem' }}>
                        معجزات النبي بإذن الله:
                      </h4>
                      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {p.miracles.map((m, mi) => (
                          <li key={mi} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem',
                            color: 'var(--text-main)'
                          }}>
                            <span style={{ color: 'var(--gold)', fontSize: '1.2rem' }}>✦</span>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Lessons */}
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.6rem' }}>
                        الدروس والعبر المستفادة:
                      </h4>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {p.lessons.map((lesson, li) => (
                          <span key={li} style={{
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            padding: '0.4rem 0.85rem',
                            borderRadius: '20px',
                            fontSize: '0.82rem',
                            fontWeight: 600
                          }}>
                            ✓ {lesson}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { GraduationCap, Heart, Droplets, Compass, HelpCircle, CheckCircle2 } from 'lucide-react';
import { NEW_MUSLIMS_GUIDE, type GuideSection } from '@/data/new-muslims';

export default function NewMuslimsPage() {
  const [activeTab, setActiveTab] = useState(NEW_MUSLIMS_GUIDE[0].id);

  const activeSection = NEW_MUSLIMS_GUIDE.find((s) => s.id === activeTab) || NEW_MUSLIMS_GUIDE[0];

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
            <GraduationCap size={16} />
            مرحباً بك في رحاب الإسلام
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-cairo)',
            marginBottom: '0.5rem'
          }}>
            دليل المسلم الجديد
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', lineHeight: 1.7 }}>
            دليل عملي مبسط يشرح أركان الإسلام، وكيفية الطهارة والوضوء، وأداء الصلاة خطوة بخطوة بلغة واضحة وميسرة.
          </p>
        </div>

        {/* Section Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '2rem'
        }}>
          {NEW_MUSLIMS_GUIDE.map((section) => {
            const isSelected = section.id === activeTab;
            return (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
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
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                {section.title}
              </button>
            );
          })}
        </div>

        {/* Active Section Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--emerald-deep) 100%)',
          color: '#FAF8F5',
          borderRadius: 'var(--radius-2xl)',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-gold)'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.5rem', fontFamily: 'var(--font-cairo)' }}>
            {activeSection.title}
          </h2>
          <p style={{ fontSize: '1rem', opacity: 0.9, margin: 0 }}>
            {activeSection.subtitle}
          </p>
        </div>

        {/* Steps List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {activeSection.steps.map((step, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                gap: '1.25rem'
              }}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
                flexShrink: 0
              }}>
                {idx + 1}
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  margin: '0 0 0.5rem',
                  fontFamily: 'var(--font-cairo)'
                }}>
                  {step.title}
                </h3>

                <p style={{
                  fontSize: '0.95rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.8,
                  margin: 0,
                  fontFamily: 'var(--font-tajawal)'
                }}>
                  {step.description}
                </p>

                {step.details && step.details.length > 0 && (
                  <div style={{
                    marginTop: '0.85rem',
                    background: 'var(--bg-main)',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    borderRight: '3px solid var(--primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    fontSize: '0.88rem',
                    color: 'var(--text-main)'
                  }}>
                    {step.details.map((d, di) => (
                      <div key={di} style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>•</span>
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}

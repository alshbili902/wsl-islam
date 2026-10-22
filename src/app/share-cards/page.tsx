'use client';

import { useState, useRef } from 'react';
import { Share2, Copy, Check, Download, Sparkles, RefreshCw, Layers } from 'lucide-react';

const PRESETS = [
  {
    title: 'آية الطمأنينة',
    text: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    sub: 'سورة الرعد: 28',
  },
  {
    title: 'آية التوكل',
    text: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    sub: 'سورة الطلاق: 3',
  },
  {
    title: 'آية اليسر',
    text: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    sub: 'سورة الشرح: 5-6',
  },
  {
    title: 'حديث الخيرية',
    text: '«خَيْرُكُمْ مَنْ تَعَلَّمَ القُرْآنَ وَعَلَّمَهُ»',
    sub: 'صحيح البخاري',
  },
  {
    title: 'حديث المحبة',
    text: '«لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ»',
    sub: 'صحيح البخاري ومسلم',
  },
  {
    title: 'سيد الاستغفار',
    text: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ',
    sub: 'صحيح البخاري',
  },
];

const THEMES = [
  { id: 'emerald', name: 'الزمردي الملكي', bg: 'linear-gradient(135deg, #064E3B 0%, #022c22 100%)', text: '#FAF8F5', accent: '#D4A853' },
  { id: 'midnight', name: 'سواد الليل الفاخر', bg: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', text: '#F8FAFC', accent: '#38BDF8' },
  { id: 'gold', name: 'الذهب الدافئ', bg: 'linear-gradient(135deg, #78350F 0%, #451A03 100%)', text: '#FEF3C7', accent: '#FDE68A' },
  { id: 'cream', name: 'العاجي النقي', bg: 'linear-gradient(135deg, #FAF8F5 0%, #F5EFEB 100%)', text: '#1F2937', accent: '#065F46' },
  { id: 'purple', name: 'البنفسج المهيب', bg: 'linear-gradient(135deg, #581C87 0%, #3B0764 100%)', text: '#FAF5FF', accent: '#E9D5FF' },
];

export default function ShareCardsPage() {
  const [selectedText, setSelectedText] = useState(PRESETS[0].text);
  const [selectedSub, setSelectedSub] = useState(PRESETS[0].sub);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [fontSize, setFontSize] = useState<number>(28);
  const [copied, setCopied] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleCopyText = () => {
    const full = `«${selectedText}»\n${selectedSub}\n\nعبر منصة وصل الإسلامية\nhttps://waslislam.fun`;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
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
            <Share2 size={16} />
            استوديو البطاقات الدعوية
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-cairo)',
            marginBottom: '0.5rem'
          }}>
            صمّم وشارك بطاقة دعوية فاخرة
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', lineHeight: 1.7 }}>
            اختر آية كريمة أو حديثاً نبوياً، وخصص المظهر والألوان، ثم شاركها فوراً كصدقة جارية على مواقع التواصل.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start'
        }}>
          
          {/* Controls Column */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            
            {/* Presets */}
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
                نماذج مختارة جاهزة:
              </label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {PRESETS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedText(p.text);
                      setSelectedSub(p.sub);
                    }}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: selectedText === p.text ? 'var(--primary-light)' : 'var(--bg-main)',
                      color: selectedText === p.text ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: selectedText === p.text ? 700 : 500,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Text */}
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
                نص البطاقة:
              </label>
              <textarea
                rows={4}
                value={selectedText}
                onChange={(e) => setSelectedText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-amiri)',
                  lineHeight: 1.8,
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Source Reference */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
                المصدر أو السورة:
              </label>
              <input
                type="text"
                value={selectedSub}
                onChange={(e) => setSelectedSub(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Theme Picker */}
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
                نمط الألوان والخلفية:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setSelectedTheme(th)}
                    style={{
                      padding: '0.5rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid',
                      borderColor: selectedTheme.id === th.id ? 'var(--primary)' : 'var(--border-color)',
                      background: th.bg,
                      color: th.text,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {th.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size slider */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
                حجم خط البطاقة ({fontSize}px):
              </label>
              <input
                type="range"
                min={20}
                max={42}
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={handleCopyText}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary)',
                  color: '#FAF8F5',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'تم نسخ النص والرابط' : 'نسخ نص البطاقة'}
              </button>
            </div>
          </div>

          {/* Live Card Preview */}
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              معاينة البطاقة الحية:
            </div>

            <div
              ref={cardRef}
              style={{
                background: selectedTheme.bg,
                color: selectedTheme.text,
                borderRadius: 'var(--radius-2xl)',
                padding: '3rem 2.25rem',
                minHeight: '380px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-xl)',
                border: `2px solid ${selectedTheme.accent}`,
                position: 'relative',
                textAlign: 'center'
              }}
            >
              {/* Top Basmala or ornament */}
              <div style={{
                fontFamily: 'var(--font-quran)',
                fontSize: '1.4rem',
                color: selectedTheme.accent,
                opacity: 0.9,
                letterSpacing: '1px'
              }}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>

              {/* Main Text */}
              <blockquote style={{
                fontFamily: 'var(--font-quran)',
                fontSize: `${fontSize}px`,
                lineHeight: 2,
                margin: '2rem 0',
                padding: '0 0.5rem'
              }}>
                {selectedText}
              </blockquote>

              {/* Reference & Brand */}
              <div>
                <div style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: selectedTheme.accent,
                  marginBottom: '1.5rem'
                }}>
                  {selectedSub}
                </div>

                <div style={{
                  borderTop: `1px solid color-mix(in srgb, ${selectedTheme.accent} 40%, transparent)`,
                  paddingTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  opacity: 0.85
                }}>
                  <span>منصة وصل الإسلامية</span>
                  <span>waslislam.fun • @waslofficiall</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}

'use client';

import { Gift, ExternalLink, Heart, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

const CHARITY_PLATFORMS = [
  {
    name: 'منصة إحسان الوطنية للعمل الخيري',
    url: 'https://ehsan.sa',
    badge: 'منصة وطنية رسمية موثوقة',
    description: 'المنصة الوطنية الرائدة لخدمة العمل الخيري في المملكة العربية السعودية، تشرف عليها 12 جهة رسمية.',
    categories: ['كفالة أيتام', 'سقيا الماء', 'تفريج كربة', 'الرعاية الصحية', 'مشاريع الإسكان'],
  },
  {
    name: 'منصة جود الإسكان',
    url: 'https://joodeskan.sa',
    badge: 'توفير السكن للأسر الأشد حاجة',
    description: 'مبادرة وطنية تهدف لإشراك المجتمع في توفير حلول سكنية كريمة للأسر الأكثر حاجة في المملكة.',
    categories: ['دعم الإيجار', 'توفير مسكن', 'ترميم منازل'],
  },
  {
    name: 'منصة تبرع (المنصة الوطنية للتبرعات)',
    url: 'https://donations.sa',
    badge: 'وزارة الموارد البشرية والتنمية الاجتماعية',
    description: 'الوجهة الموثوقة للتبرعات الخيرية التي تضمن وصول الصدقات والزكوات لمستحقيها بكل شفافية.',
    categories: ['إغاثة عاجلة', 'إطعام الطعام', 'كسوة الشتاء', 'دعم الأرامل'],
  },
  {
    name: 'منصة شفاء للخدمات العلاجية',
    url: 'https://shefa.org.sa',
    badge: 'علاج المرضى المحتاجين',
    description: 'منصة متخصصة في علاج المرضى والعمليات الجراحية للأسر غير القادرة على تكاليف العلاج الطبي.',
    categories: ['عمليات جراحية', 'أجهزة طبية', 'غسيل كلى', 'أدوية مزمنة'],
  },
];

export default function CharityPage() {
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
            <Gift size={16} />
            وما أنفقتم من شيء فهو يخلفه
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-cairo)',
            marginBottom: '0.5rem'
          }}>
            الصدقة والإحسان الموثوق
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', lineHeight: 1.7 }}>
            دليل المنصات الخيرية الرسمية والمعتمدة لتوجيه زكاتك وصدقاتك إلى المستحقين الحقيقيين بأمان وموثوقية عالية.
          </p>
        </div>

        {/* Hadith Virtues Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--emerald-deep) 100%)',
          color: '#FAF8F5',
          borderRadius: 'var(--radius-2xl)',
          padding: '2.25rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-gold)',
          marginBottom: '2.5rem'
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
            قال رسول الله ﷺ:
          </span>
          <p style={{
            fontFamily: 'var(--font-amiri)',
            fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
            fontWeight: 600,
            lineHeight: 1.9,
            maxWidth: '850px',
            margin: '0 auto 1rem'
          }}>
            «مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ، وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلاَّ عِزًّا، وَمَا تَوَاضَعَ أَحَدٌ لِلَّهِ إِلاَّ رَفَعَهُ اللَّهُ»
          </p>
          <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>رواه مسلم في صحيحه</span>
        </div>

        {/* Verified Platforms List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {CHARITY_PLATFORMS.map((platform, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-2xl)',
                padding: '2rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem'
              }}
            >
              <div style={{ flex: '1 1 500px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
                  <span style={{
                    fontSize: '0.78rem',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    background: 'var(--primary-light)',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '16px'
                  }}>
                    {platform.badge}
                  </span>
                </div>

                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  margin: '0 0 0.5rem',
                  fontFamily: 'var(--font-cairo)'
                }}>
                  {platform.name}
                </h3>

                <p style={{
                  fontSize: '0.92rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.7,
                  margin: '0 0 1rem',
                  fontFamily: 'var(--font-tajawal)'
                }}>
                  {platform.description}
                </p>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {platform.categories.map((cat, ci) => (
                    <span key={ci} style={{
                      fontSize: '0.78rem',
                      background: 'var(--bg-card-subtle)',
                      color: 'var(--text-muted)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)'
                    }}>
                      • {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius-xl)',
                    background: 'var(--primary)',
                    color: '#FAF8F5',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>التبرع عبر المنصة</span>
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}

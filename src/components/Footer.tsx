'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Heart, Clock, Radio, Sparkles, Send,
  ArrowUp, Compass, Star, Users, Calculator, Gift,
  CheckCircle2, Globe
} from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-section" style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border-color)',
      marginTop: 'auto',
      position: 'relative',
      paddingTop: '3.5rem',
      paddingBottom: '5rem', /* extra space for mobile bottom nav */
    }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.25rem' }}>
        
        {/* Top Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}>
          
          {/* Brand Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--emerald-deep) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FAF8F5',
                boxShadow: '0 4px 12px rgba(6, 95, 70, 0.25)',
                border: '1px solid var(--border-gold)',
              }}>
                <Compass size={24} style={{ color: 'var(--gold)' }} />
              </div>
              <div>
                <span style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  display: 'block',
                  lineHeight: 1.2,
                  fontFamily: 'var(--font-cairo)'
                }}>
                  منصة وصل الإسلامية
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--gold)', letterSpacing: '0.5px' }}>
                  Wasl Islamic Platform
                </span>
              </div>
            </Link>

            <p style={{
              fontSize: '0.9rem',
              lineHeight: 1.7,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-tajawal)'
            }}>
              منصة إسلامية رقمية شاملة تجمع بين أصالة المحتوى الشرعي الموثوق وجمالية التصميم الحديث، لتكون رفيق المسلم اليومي في عبادته وتدبره.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                fontWeight: 600
              }}>
                <Globe size={14} />
                @waslofficiall
              </span>
              <a
                href="https://waslislam.fun"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  transition: 'color var(--transition-fast)'
                }}
              >
                waslislam.fun
              </a>
            </div>
          </div>

          {/* Quick Links: Quran & Worship */}
          <div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-cairo)'
            }}>
              <BookOpen size={18} style={{ color: 'var(--primary)' }} />
              القرآن والعبادات
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                <Link href="/quran" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  المصحف الشريف وتلاوته
                </Link>
              </li>
              <li>
                <Link href="/quran/listen" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  الاستماع لكبار القراء
                </Link>
              </li>
              <li>
                <Link href="/prayer-times" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  مواقيت الصلاة والقبلة
                </Link>
              </li>
              <li>
                <Link href="/adhkar" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  حصن المسلم والأذكار
                </Link>
              </li>
              <li>
                <Link href="/khatmah" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  مخطط ختمة القرآن
                </Link>
              </li>
            </ul>
          </div>

          {/* Islamic Knowledge */}
          <div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-cairo)'
            }}>
              <Star size={18} style={{ color: 'var(--gold)' }} />
              المعرفة والأدوات
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                <Link href="/hadith" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  الأحاديث النبوية الشريفة
                </Link>
              </li>
              <li>
                <Link href="/names-of-allah" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  أسماء الله الحسنى ومعانيها
                </Link>
              </li>
              <li>
                <Link href="/prophets" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  قصص الأنبياء والمرسلين
                </Link>
              </li>
              <li>
                <Link href="/zakat" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  حاسبة الزكاة الذكية
                </Link>
              </li>
              <li>
                <Link href="/radio" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  الإذاعات الإسلامية المباشرة
                </Link>
              </li>
              <li>
                <Link href="/share-cards" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  استوديو البطاقات الدعوية
                </Link>
              </li>
              <li>
                <Link href="/new-muslims" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  دليل المسلم الجديد
                </Link>
              </li>
            </ul>
          </div>

          {/* Daily Inspiration & Newsletter */}
          <div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-cairo)'
            }}>
              <Sparkles size={18} style={{ color: 'var(--primary)' }} />
              ورد اليوم والرسائل
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
              اشترك لتصلك آية يومية وحديث نبوي شريف وتذكيرات بأذكار الصباح والمساء.
            </p>
            
            <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ position: 'relative', display: 'flex' }}>
                <input
                  type="email"
                  required
                  placeholder="بريدك الإلكتروني..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    position: 'absolute',
                    left: '6px',
                    top: '6px',
                    bottom: '6px',
                    padding: '0 1rem',
                    borderRadius: 'calc(var(--radius-md) - 4px)',
                    background: 'var(--primary)',
                    color: '#FAF8F5',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s'
                  }}
                  title="اشتراك"
                >
                  <Send size={16} />
                </button>
              </div>
              {subscribed && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--primary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginTop: '0.25rem'
                }}>
                  <CheckCircle2 size={16} />
                  جزاك الله خيراً، تم تسجيل اشتراكك بنجاح!
                </div>
              )}
            </form>

            <div style={{
              marginTop: '1.5rem',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gold-light)',
              border: '1px solid var(--border-gold)',
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                قال رسول الله ﷺ:
              </span>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontStyle: 'italic', margin: 0 }}>
                «الدَّالُّ عَلَى الخَيْرِ كَفَاعِلِهِ»
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © 2026 منصة وصل الإسلامية — Wasl Islamic. جميع الحقوق محفوظة لوجه الله تعالى.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/ramadan" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              موسم رمضان
            </Link>
            <span>•</span>
            <Link href="/quiz" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              مسابقة وصل
            </Link>
            <span>•</span>
            <button
              onClick={scrollToTop}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontFamily: 'inherit'
              }}
            >
              <ArrowUp size={16} />
              للأعلى
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}

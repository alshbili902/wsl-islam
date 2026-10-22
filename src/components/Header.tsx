'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/theme-provider';
import {
  Home, BookOpen, Compass, Layers, Sliders, Flame,
  Search, Sun, Moon, Menu, X, ChevronDown,
  Clock, BookMarked, Radio, Calculator, Share2,
  Heart, Star, Users, HelpCircle, Mic,
  BookOpenCheck, GraduationCap, Sparkles, Gift,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'القرآن الكريم',
    icon: BookOpen,
    items: [
      { label: 'قراءة القرآن', href: '/quran', icon: BookOpen, description: 'تصفح وقراءة جميع السور' },
      { label: 'استماع القرآن', href: '/quran/listen', icon: Mic, description: 'الاستماع لأشهر القراء' },
      { label: 'ختمة القرآن', href: '/khatmah', icon: BookMarked, description: 'خطة لإتمام الختمة' },
    ],
  },
  {
    label: 'العبادات والأذكار',
    icon: Compass,
    items: [
      { label: 'مواقيت الصلاة', href: '/prayer-times', icon: Clock, description: 'أوقات الصلاة والعد التنازلي' },
      { label: 'الأذكار والأدعية', href: '/adhkar', icon: Heart, description: 'حصن المسلم والأذكار اليومية' },
      { label: 'الأحاديث الشريفة', href: '/hadith', icon: BookOpenCheck, description: 'صحيح البخاري ومسلم' },
    ],
  },
  {
    label: 'المعرفة الإسلامية',
    icon: Layers,
    items: [
      { label: 'أسماء الله الحسنى', href: '/names-of-allah', icon: Star, description: '99 اسمًا مع المعاني' },
      { label: 'قصص الأنبياء', href: '/prophets', icon: Users, description: 'قصص أنبياء الله' },
      { label: 'مسابقة إسلامية', href: '/quiz', icon: HelpCircle, description: 'اختبر معلوماتك الإسلامية' },
      { label: 'المسلمون الجدد', href: '/new-muslims', icon: GraduationCap, description: 'دليل شامل للمسلمين الجدد' },
    ],
  },
  {
    label: 'الأدوات والخدمات',
    icon: Sliders,
    items: [
      { label: 'حاسبة الزكاة', href: '/zakat', icon: Calculator, description: 'حساب زكاة المال' },
      { label: 'استوديو البطاقات', href: '/share-cards', icon: Share2, description: 'بطاقات دعوية مميزة' },
      { label: 'الإذاعة الإسلامية', href: '/radio', icon: Radio, description: 'محطات إسلامية مباشرة' },
      { label: 'الصدقة والإحسان', href: '/charity', icon: Gift, description: 'روابط تبرع موثوقة' },
    ],
  },
  {
    label: 'المواسم والمناسبات',
    icon: Flame,
    items: [
      { label: 'رمضان المبارك', href: '/ramadan', icon: Flame, description: 'العد التنازلي والبرامج' },
      { label: 'يومي مع وصل', href: '/daily', icon: Sparkles, description: 'الورد اليومي والمتابعة' },
    ],
  },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleDropdownToggle = useCallback((label: string) => {
    setOpenDropdown(prev => prev === label ? null : label);
  }, []);

  return (
    <>
      <header className="wasl-header">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          {/* Logo */}
          <Link href="/" className="wasl-logo" aria-label="وصل الإسلامية — العودة للرئيسية">
            <div className="wasl-logo-icon">وصل</div>
            <span className="wasl-logo-text">وَصْل الإسلامية</span>
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="القائمة الرئيسية" className="wasl-desktop-nav" ref={dropdownRef}>
            <Link
              href="/"
              className={`wasl-nav-btn ${pathname === '/' ? 'active' : ''}`}
            >
              <Home size={16} />
              <span>الرئيسية</span>
            </Link>

            {NAV_GROUPS.map(group => (
              <div key={group.label} className="wasl-nav-dropdown-container">
                <button
                  className={`wasl-nav-btn ${group.items.some(i => pathname.startsWith(i.href)) ? 'active' : ''}`}
                  onClick={() => handleDropdownToggle(group.label)}
                  aria-expanded={openDropdown === group.label}
                  aria-haspopup="true"
                >
                  <group.icon size={16} />
                  <span>{group.label}</span>
                  <ChevronDown size={12} className={`wasl-chevron ${openDropdown === group.label ? 'open' : ''}`} />
                </button>

                {openDropdown === group.label && (
                  <div className="dropdown">
                    {group.items.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="dropdown-item"
                        onClick={() => setOpenDropdown(null)}
                      >
                        <item.icon size={18} />
                        <div>
                          <div style={{ fontWeight: 700 }}>{item.label}</div>
                          {item.description && (
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                              {item.description}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="wasl-header-actions">
            <button
              className="btn-icon"
              onClick={() => setSearchOpen(true)}
              aria-label="بحث"
              title="بحث شامل في المنصة"
            >
              <Search size={16} />
            </button>

            <button
              className="wasl-theme-btn"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'تفعيل الوضع الليلي' : 'تفعيل الوضع النهاري'}
              title="تغيير المظهر"
            >
              {theme === 'light' ? <Sun size={14} /> : <Moon size={14} />}
              <span className="wasl-theme-label">{theme === 'light' ? 'نهاري' : 'ليلي'}</span>
            </button>

            <button
              className="wasl-mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="فتح القائمة الرئيسية"
              aria-expanded={mobileOpen}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Search size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  type="search"
                  placeholder="ابحث في القرآن، الأحاديث، الأذكار..."
                  autoFocus
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '1rem',
                    fontWeight: 600,
                    width: '100%',
                    outline: 'none',
                    fontFamily: 'var(--font-cairo)',
                    color: 'var(--text-main)',
                  }}
                  dir="rtl"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  style={{ flexShrink: 0, padding: '0.25rem' }}
                  aria-label="إغلاق البحث"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <Search size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
              <p>اكتب كلمة للبحث في محتوى المنصة</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-overlay" onClick={() => setMobileOpen(false)} />
          <div className="mobile-menu-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="wasl-logo-icon" style={{ width: '2.5rem', height: '2.5rem', fontSize: '0.75rem' }}>وصل</div>
                <span style={{ fontWeight: 800, fontSize: '1rem' }}>وَصْل الإسلامية</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="btn-icon"
                aria-label="إغلاق القائمة"
              >
                <X size={18} />
              </button>
            </div>

            <Link
              href="/"
              className={`dropdown-item ${pathname === '/' ? 'active' : ''}`}
              style={{ marginBottom: '0.5rem', borderRadius: 'var(--radius-xl)', padding: '0.75rem' }}
            >
              <Home size={18} />
              <span style={{ fontWeight: 700 }}>الرئيسية</span>
            </Link>

            {NAV_GROUPS.map(group => (
              <div key={group.label} style={{ marginBottom: '0.75rem' }}>
                <button
                  onClick={() => handleDropdownToggle(group.label)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--radius-xl)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: 'var(--text-main)',
                    background: openDropdown === group.label ? 'var(--primary-light)' : 'transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <group.icon size={18} style={{ color: 'var(--primary)' }} />
                    {group.label}
                  </span>
                  <ChevronDown
                    size={14}
                    style={{
                      transition: 'transform 0.2s',
                      transform: openDropdown === group.label ? 'rotate(180deg)' : 'rotate(0)',
                      color: 'var(--text-muted)',
                    }}
                  />
                </button>

                {openDropdown === group.label && (
                  <div style={{ paddingRight: '1rem', marginTop: '0.25rem' }}>
                    {group.items.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="dropdown-item"
                        style={{
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.8125rem',
                          borderRadius: 'var(--radius-lg)',
                        }}
                      >
                        <item.icon size={16} />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={toggleTheme}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-xl)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: 'var(--text-main)',
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                {theme === 'light' ? 'الوضع الليلي' : 'الوضع النهاري'}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

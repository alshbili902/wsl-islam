'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Clock, Heart, Radio } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'الرئيسية', href: '/', icon: Home },
    { label: 'القرآن', href: '/quran', icon: BookOpen },
    { label: 'المواقيت', href: '/prayer-times', icon: Clock },
    { label: 'الأذكار', href: '/adhkar', icon: Heart },
    { label: 'الإذاعة', href: '/radio', icon: Radio },
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="التنقل السريع للهواتف"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            {isActive && <span className="mobile-bottom-nav-indicator" />}
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            <span className="mobile-bottom-nav-label">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

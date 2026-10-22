import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Cairo, Amiri, Tajawal } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-provider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
});

const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
});

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'منصة وصل الإسلامية — Wasl Islamic',
    template: '%s | منصة وصل الإسلامية',
  },
  description: 'منصة إسلامية رقمية شاملة وعصرية تجمع بين أصالة المحتوى الشرعي الموثوق وجمالية التصميم الحديث: القرآن الكريم، مواقيت الصلاة، الأذكار، أسماء الله الحسنى، قصص الأنبياء، وحاسبة الزكاة.',
  keywords: [
    'منصة وصل الإسلامية',
    'القرآن الكريم',
    'مواقيت الصلاة',
    'حصن المسلم',
    'الأذكار',
    'أسماء الله الحسنى',
    'قصص الأنبياء',
    'حاسبة الزكاة',
    'إذاعة القرآن الكريم',
    'Wasl Islamic',
  ],
  authors: [{ name: 'Wasl Islamic Team', url: 'https://waslislam.fun' }],
  creator: 'Wasl Islamic',
  metadataBase: new URL('https://waslislam.fun'),
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://waslislam.fun',
    siteName: 'منصة وصل الإسلامية',
    title: 'منصة وصل الإسلامية — رفيقك اليومي في الذكر والعبادة',
    description: 'المصحف الشريف، تلاوات خاشعة، مواقيت الصلاة، حصن المسلم، أسماء الله الحسنى، والمزيد بتصميم إسلامي فاخر.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@waslofficiall',
    creator: '@waslofficiall',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#065F46',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${amiri.variable} ${tajawal.variable}`} suppressHydrationWarning>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <ThemeProvider>
          <Suspense fallback={<div style={{ height: '70px', background: 'var(--bg-card)' }} />}>
            <Header />
          </Suspense>
          <div style={{ flex: 1 }}>
            {children}
          </div>
          <Footer />
          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}

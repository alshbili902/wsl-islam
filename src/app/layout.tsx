import type { Metadata, Viewport } from "next";
import { Amiri, IBM_Plex_Sans_Arabic, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { WaslProvider } from "@/components/providers/WaslProvider";
import { ReadingPreferencesProvider } from "@/components/providers/ReadingPreferencesProvider";
import { AudioProvider } from "@/components/providers/AudioProvider";
import { MotionWrapper } from "@/components/providers/MotionWrapper";
import { PwaRegistrar } from "@/components/providers/PwaRegistrar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PersistentAudioBar } from "@/components/layout/PersistentAudioBar";
import { GlobalSearchModal } from "@/components/layout/GlobalSearchModal";
import { LazyShareCardModal } from "@/components/share/LazyShareCardModal";
import { NotificationDaemon } from "@/components/notifications/NotificationDaemon";
import { ReleaseAnnouncementModal } from "@/components/releases/ReleaseAnnouncementModal";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_SITE_NAME,
  DEFAULT_TWITTER_HANDLE,
  getCanonicalSiteUrl,
} from "@/lib/seo/config";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic-sans",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-arabic-serif",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-latin-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = getCanonicalSiteUrl();
const googleVerification = (
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || ""
).trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "وصل الإسلامية | Wasl Islamic — القرآن والسنة والأذكار ومواقيت الصلاة",
    template: "%s | وصل الإسلامية",
  },
  description:
    "منصة وصل الإسلامية: تجربة رقمية إسلامية موثوقة للقرآن الكريم تلاوةً وتفسيراً، ومواقيت الصلاة الدقيقة، والأذكار، ومكتبة الحديث الشريف، والإذاعات الإسلامية، والزكاة، والمسابقة الإسلامية.",
  keywords: [
    "وصل الإسلامية",
    "Wasl Islamic",
    "القرآن الكريم",
    "مواقيت الصلاة",
    "الأذكار",
    "صحيح البخاري",
    "صحيح مسلم",
    "الأربعون النووية",
    "إذاعة القرآن الكريم",
    "حساب الزكاة",
  ],
  authors: [{ name: "Wasl Islamic" }],
  openGraph: {
    type: "website",
    locale: "ar_SA",
    alternateLocale: ["en_US"],
    siteName: DEFAULT_SITE_NAME,
    title: "وصل الإسلامية | Wasl Islamic — القرآن والسنة والأذكار ومواقيت الصلاة",
    description:
      "منصة إسلامية متكاملة موثقة المصادر للقرآن الكريم ومواقيت الصلاة والأذكار والحديث والإذاعات الإسلامية.",
    url: `${siteUrl}/`,
    images: [
      {
        url: `${siteUrl}${DEFAULT_OG_IMAGE_PATH}`,
        width: 512,
        height: 512,
        alt: DEFAULT_SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "وصل الإسلامية | Wasl Islamic",
    description:
      "القرآن الكريم، مواقيت الصلاة، الأذكار، الحديث الشريف، والإذاعات الإسلامية المباشرة.",
    images: [`${siteUrl}${DEFAULT_OG_IMAGE_PATH}`],
    creator: DEFAULT_TWITTER_HANDLE,
  },
  ...(googleVerification
    ? { verification: { google: googleVerification } }
    : {}),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/branding/favicon/favicon.ico", sizes: "any" },
      { url: "/branding/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/branding/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: [{ url: "/branding/favicon/favicon.ico" }],
    apple: [
      {
        url: "/branding/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0d5c43" },
    { media: "(prefers-color-scheme: dark)", color: "#051611" },
  ],
  width: "device-width",
  initialScale: 1,
};

const PRE_HYDRATION_SCRIPT = `
(function(){
  try {
    var t = localStorage.getItem('wasl_theme_v1') || 'system';
    var resolved = t === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : t;
    document.documentElement.setAttribute('data-theme', resolved);
    var l = localStorage.getItem('wasl_locale_v1');
    if (l === 'en' || l === 'ar') {
      document.documentElement.lang = l;
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "وصل الإسلامية — Wasl Islamic",
        alternateName: "Wasl Islamic",
        url: `${siteUrl}/`,
        inLanguage: ["ar", "en"],
        description:
          "منصة إسلامية موثوقة للقرآن الكريم ومواقيت الصلاة والأذكار والحديث والإذاعات الإسلامية.",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "وصل الإسلامية — Wasl Islamic",
        url: `${siteUrl}/`,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}${DEFAULT_OG_IMAGE_PATH}`,
          width: 512,
          height: 512,
        },
      },
    ],
  };

  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${ibmPlexArabic.variable} ${amiri.variable} ${plusJakarta.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRE_HYDRATION_SCRIPT }} />
        <JsonLd data={jsonLd} />
      </head>
      <body className="min-h-full flex flex-col">
        <MotionWrapper>
          <WaslProvider>
            <ReadingPreferencesProvider>
              <AudioProvider>
                <PwaRegistrar />
                <NotificationDaemon />
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <PersistentAudioBar />
                <GlobalSearchModal />
                <LazyShareCardModal />
                <ReleaseAnnouncementModal />
              </AudioProvider>
            </ReadingPreferencesProvider>
          </WaslProvider>
        </MotionWrapper>
      </body>
    </html>
  );
}

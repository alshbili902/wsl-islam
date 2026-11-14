import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "وصل الإسلامية — Wasl Islamic",
    short_name: "وصل الإسلامية",
    description:
      "منصة رقمية إسلامية موثوقة للقرآن الكريم ومواقيت الصلاة والأذكار والحديث الشريف والإذاعات الإسلامية.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f0",
    theme_color: "#0d5c43",
    dir: "rtl",
    lang: "ar",
    icons: [
      {
        src: "/branding/favicon/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/branding/favicon/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/branding/favicon/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

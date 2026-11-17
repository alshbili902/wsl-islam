import type { Metadata } from "next";
import { KhatmahClient } from "@/components/khatmah/KhatmahClient";
import { buildPageMetadata } from "@/lib/seo/config";

export const metadata: Metadata = buildPageMetadata({
  title: "مخطط ختمة القرآن",
  description:
    "خطط ختمة القرآن الكريم (٧ أيام، ١٥ يوماً، ٣٠ يوماً، ٦٠ يوماً، أو مخصصة) بحساب دقيق لصفحات المصحف الـ ٦٠٤ وربط مباشر بصفحة القراءة.",
  path: "/khatmah",
});

export default async function KhatmahPage({
  searchParams,
}: {
  searchParams: Promise<{ startPage?: string }>;
}) {
  const sp = await searchParams;
  const raw = sp.startPage ? Number(sp.startPage) : 1;
  const initialStartPage =
    Number.isInteger(raw) && raw >= 1 && raw <= 604 ? raw : 1;

  return <KhatmahClient initialStartPage={initialStartPage} />;
}

import type { Metadata } from "next";
import { RecitersDirectoryClient } from "@/components/listen/RecitersDirectoryClient";
import { syncAndLoadReciterCatalog } from "@/lib/audio/catalog";
import { buildPageMetadata } from "@/lib/seo/config";
import type { RecitationStyleId } from "@/types/islamic";

export const metadata: Metadata = buildPageMetadata({
  title: "جميع قراء القرآن الكريم — مركز الاستماع",
  description:
    "دليل شامل ومحدث ديناميكياً لجميع قراء القرآن الكريم عبر مختلف الروايات وأساليب التلاوة (مرتل، مجود، معلم، ورش، قالون) مع تشغيل مباشر.",
  path: "/listen/reciters",
});

export const revalidate = 3600;

export default async function AllRecitersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const snapshot = await syncAndLoadReciterCatalog();

  const q = typeof sp.q === "string" ? sp.q : "";
  const styleRaw = typeof sp.style === "string" ? sp.style : "all";
  const validStyles: Array<RecitationStyleId | "all"> = [
    "all",
    "murattal",
    "mujawwad",
    "muallim",
    "historic",
    "other",
  ];
  const initialStyle = validStyles.includes(styleRaw as RecitationStyleId | "all")
    ? (styleRaw as RecitationStyleId | "all")
    : "all";
  const initialFullOnly = sp.fullOnly === "1" || sp.fullOnly === "true";
  const riwayahNum =
    typeof sp.riwayah === "string" && Number.isFinite(Number(sp.riwayah))
      ? Number(sp.riwayah)
      : null;
  const initialLetter = typeof sp.letter === "string" ? sp.letter : "all";

  return (
    <RecitersDirectoryClient
      initialSnapshot={snapshot}
      initialQuery={q}
      initialStyle={initialStyle}
      initialFullOnly={initialFullOnly}
      initialRiwayahId={riwayahNum}
      initialLetter={initialLetter}
    />
  );
}

import { NextResponse } from "next/server";
import { filterReciterCatalog, syncAndLoadReciterCatalog } from "@/lib/audio/catalog";
import type { RecitationStyleId, ReciterProviderId } from "@/types/islamic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const refresh = searchParams.get("refresh") === "1";
  const snapshot = await syncAndLoadReciterCatalog({ forceRefresh: refresh });

  const q = searchParams.get("q") || "";
  const letter = searchParams.get("letter") || "";
  const riwayahRaw = searchParams.get("riwayah");
  const riwayahId = riwayahRaw && !Number.isNaN(Number(riwayahRaw)) ? Number(riwayahRaw) : null;
  const styleId = (searchParams.get("style") || "all") as RecitationStyleId | "all";
  const surahRaw = searchParams.get("surah");
  const surahNumber =
    surahRaw && Number(surahRaw) >= 1 && Number(surahRaw) <= 114
      ? Number(surahRaw)
      : null;
  const provider = (searchParams.get("provider") || "all") as ReciterProviderId | "all";
  const fullOnly = searchParams.get("fullOnly") === "1";

  const filtered = filterReciterCatalog(snapshot.reciters, {
    query: q,
    letter,
    riwayahId,
    styleId,
    surahNumber,
    provider,
    fullOnly,
  });

  return NextResponse.json({
    reciters: filtered,
    riwayat: snapshot.riwayat,
    stats: snapshot.stats,
    matchedCount: filtered.length,
  });
}

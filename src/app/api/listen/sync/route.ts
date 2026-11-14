import { NextResponse } from "next/server";
import { syncAndLoadReciterCatalog } from "@/lib/audio/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const snapshot = await syncAndLoadReciterCatalog({ forceRefresh: true });
  return NextResponse.json({
    ok: true,
    stats: snapshot.stats,
    snapshot,
  });
}

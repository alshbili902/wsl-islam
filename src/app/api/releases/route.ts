import { NextResponse } from "next/server";
import { fetchPublishedReleases } from "@/lib/releases/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitRaw = Number(searchParams.get("limit") || "25");
  const limit = Number.isFinite(limitRaw) ? limitRaw : 25;

  const releases = await fetchPublishedReleases(limit);

  return NextResponse.json(
    {
      releases,
      latestRelease: releases[0] ?? null,
      total: releases.length,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

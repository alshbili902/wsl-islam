import { NextResponse } from "next/server";
import {
  fetchDismissedReleaseIds,
  fetchPublishedReleases,
} from "@/lib/releases/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractCookieValue(cookieHeader: string, key: string): string {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]+)`));
  return m?.[1] ? decodeURIComponent(m[1]) : "";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitRaw = Number(searchParams.get("limit") || "25");
  const limit = Number.isFinite(limitRaw) ? limitRaw : 25;

  const cookieHeader = request.headers.get("cookie") || "";
  const visitorId =
    (searchParams.get("visitorId") || "").trim() ||
    extractCookieValue(cookieHeader, "wasl_vid");

  const [releases, serverDismissedIds] = await Promise.all([
    fetchPublishedReleases(limit),
    visitorId ? fetchDismissedReleaseIds(visitorId) : Promise.resolve([]),
  ]);

  return NextResponse.json(
    {
      releases,
      latestRelease: releases[0] ?? null,
      serverDismissedIds,
      total: releases.length,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}

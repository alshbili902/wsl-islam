import { NextResponse } from "next/server";
import { getPublicBuildInfo } from "@/lib/releases/build-info";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const info = getPublicBuildInfo(request.url);

  return NextResponse.json(
    {
      platform: "Wasl Islamic (وصل الإسلامية)",
      ...info,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}

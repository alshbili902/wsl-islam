import { NextRequest, NextResponse } from "next/server";
import { fetchMushafPage } from "@/lib/api/mushaf";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ pageNumber: string }> }
) {
  const { pageNumber } = await context.params;
  const page = Number(pageNumber);

  if (!Number.isInteger(page) || page < 1 || page > 604) {
    return NextResponse.json(
      { error: "Invalid Mushaf page number (must be 1..604)." },
      { status: 400 }
    );
  }

  try {
    const payload = await fetchMushafPage(page);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to load Mushaf page from verified Quran providers." },
      { status: 502 }
    );
  }
}

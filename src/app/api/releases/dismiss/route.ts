import { NextResponse } from "next/server";
import { recordVisitorDismissals } from "@/lib/releases/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SAFE_VISITOR_ID_RE = /^[a-z0-9_-]{8,64}$/i;

function extractCookieValue(cookieHeader: string, key: string): string {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]+)`));
  return m?.[1] ? decodeURIComponent(m[1]) : "";
}

export async function POST(request: Request) {
  let body: { visitorId?: string; releaseIds?: unknown } = {};
  try {
    body = (await request.json()) as { visitorId?: string; releaseIds?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const rawVisitorId =
    (typeof body.visitorId === "string" ? body.visitorId.trim() : "") ||
    extractCookieValue(cookieHeader, "wasl_vid");

  if (!rawVisitorId || !SAFE_VISITOR_ID_RE.test(rawVisitorId)) {
    return NextResponse.json({ error: "Invalid visitorId" }, { status: 400 });
  }

  const releaseIds = Array.isArray(body.releaseIds)
    ? body.releaseIds.filter((id): id is string => typeof id === "string")
    : [];

  const result = await recordVisitorDismissals(rawVisitorId, releaseIds);

  const response = NextResponse.json(
    {
      ok: result.ok,
      persisted: result.persisted,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );

  response.cookies.set("wasl_vid", rawVisitorId, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

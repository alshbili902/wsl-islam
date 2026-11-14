import { NextResponse } from "next/server";

/**
 * Strictly allowlisted HLS relay for verified Islamic broadcasts whose upstream
 * CDN omits Access-Control-Allow-Origin headers (e.g. Iqraa FastTV CDN).
 * Prevents open-proxy / SSRF abuse by permitting only exact verified host+path prefixes.
 */
const ALLOWED_PREFIXES = [
  "https://playlist.fasttvcdn.com/pl/dlkqw1ftuvuuzkcb4pxdcg/",
  "https://dlkqw1ftuvuuzkcb4pxdcg.fasttvcdn.com/",
];

function isAllowedStreamUrl(rawUrl: string): boolean {
  return ALLOWED_PREFIXES.some((prefix) => rawUrl.startsWith(prefix));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url");

  if (!target || !isAllowedStreamUrl(target)) {
    return NextResponse.json(
      { error: "Stream target is not in the verified broadcast allowlist." },
      { status: 403 }
    );
  }

  try {
    const upstream = await fetch(target, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent": "WaslIslamicBroadcastPlayer/1.0",
      },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream broadcast returned HTTP ${upstream.status}` },
        { status: upstream.status }
      );
    }

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const isPlaylist =
      target.includes(".m3u8") ||
      contentType.includes("mpegurl") ||
      contentType.includes("x-mpegURL");

    if (isPlaylist) {
      const text = await upstream.text();
      const base = new URL(target);
      const rewritten = text
        .split(/\r?\n/)
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) return line;
          const resolved = new URL(trimmed, base).toString();
          if (!isAllowedStreamUrl(resolved)) return line;
          return `/api/radio/hls?url=${encodeURIComponent(resolved)}`;
        })
        .join("\n");

      return new NextResponse(rewritten, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    const arrayBuffer = await upstream.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=15",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Broadcast relay failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

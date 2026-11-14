import { NextResponse } from "next/server";
import { isWebPushConfigured, sendWebPushNotification } from "@/lib/push/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TestPushBody {
  subscription?: {
    endpoint?: string;
    keys?: {
      p256dh?: string;
      auth?: string;
    };
  };
  locale?: "ar" | "en";
}

export async function POST(request: Request) {
  if (!isWebPushConfigured()) {
    return NextResponse.json(
      { error: "VAPID Web Push credentials are not configured." },
      { status: 503 }
    );
  }

  let body: TestPushBody;
  try {
    body = (await request.json()) as TestPushBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const endpoint = body.subscription?.endpoint?.trim();
  const p256dh = body.subscription?.keys?.p256dh?.trim();
  const auth = body.subscription?.keys?.auth?.trim();

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json(
      { error: "Missing push subscription fields." },
      { status: 400 }
    );
  }

  const isEn = body.locale === "en";
  const result = await sendWebPushNotification(
    { endpoint, keys: { p256dh, auth } },
    {
      title: isEn
        ? "Wasl Islamic — Test Notification"
        : "وصل الإسلامية — إشعار تجريبي",
      body: isEn
        ? "Web Push delivery is active for your browser subscription."
        : "يعمل نظام إشعارات الويب (Web Push) بنجاح على هذا المتصفح.",
      url: "/notifications",
      tag: "wasl-test-push",
    }
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Failed to send test notification", statusCode: result.statusCode },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, statusCode: result.statusCode });
}

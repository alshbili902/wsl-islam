import { NextResponse } from "next/server";
import { mergeNotificationPreferences } from "@/lib/notifications/scheduler";
import {
  createSupabaseAdminClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/server";
import type { NotificationPreferencesState, PrayerMethodId } from "@/types/islamic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SubscribeBody {
  subscription?: {
    endpoint?: string;
    keys?: {
      p256dh?: string;
      auth?: string;
    };
  };
  locale?: "ar" | "en";
  cityId?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  calculationMethod?: PrayerMethodId;
  preferences?: Partial<NotificationPreferencesState>;
}

export async function POST(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      {
        error: "Supabase service role key is not configured for server push persistence.",
      },
      { status: 503 }
    );
  }

  let body: SubscribeBody;
  try {
    body = (await request.json()) as SubscribeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const endpoint = body.subscription?.endpoint?.trim();
  const p256dh = body.subscription?.keys?.p256dh?.trim();
  const auth = body.subscription?.keys?.auth?.trim();

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json(
      { error: "Missing push subscription endpoint or encryption keys." },
      { status: 400 }
    );
  }

  try {
    const parsedUrl = new URL(endpoint);
    if (parsedUrl.protocol !== "https:") {
      return NextResponse.json(
        { error: "Push endpoint must use HTTPS." },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid push endpoint URL." }, { status: 400 });
  }

  const locale = body.locale === "en" ? "en" : "ar";
  const prefs = mergeNotificationPreferences(body.preferences);

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service role client is unavailable." },
      { status: 503 }
    );
  }
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      endpoint,
      p256dh,
      auth,
      locale,
      city_id: (body.cityId || "makkah").slice(0, 64),
      timezone: (body.timezone || "Asia/Riyadh").slice(0, 64),
      latitude:
        typeof body.latitude === "number" && Number.isFinite(body.latitude)
          ? body.latitude
          : 21.3891,
      longitude:
        typeof body.longitude === "number" && Number.isFinite(body.longitude)
          ? body.longitude
          : 39.8579,
      calculation_method: (body.calculationMethod || "UmmAlQura").slice(0, 64),
      preferences: prefs,
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    return NextResponse.json(
      { error: `Failed to save subscription: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

import crypto from "crypto";
import { NextResponse } from "next/server";
import { CITIES } from "@/data/cities";
import {
  evaluateDueReminders,
  mergeNotificationPreferences,
} from "@/lib/notifications/scheduler";
import { isWebPushConfigured, sendWebPushNotification } from "@/lib/push/server";
import {
  createSupabaseAdminClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/server";
import type {
  CityLocation,
  NotificationPreferencesState,
  PrayerMethodId,
} from "@/types/islamic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function timingSafeMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const cronSecret = process.env.PUSH_CRON_SECRET?.trim();
  if (!cronSecret) {
    return NextResponse.json(
      { error: "PUSH_CRON_SECRET is not configured." },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token || !timingSafeMatch(token, cronSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isWebPushConfigured() || !isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Web Push or Supabase service-role client is not configured." },
      { status: 503 }
    );
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service role client is unavailable." },
      { status: 503 }
    );
  }
  const { data: rows, error } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("is_active", true);

  if (error) {
    return NextResponse.json(
      { error: `Database query failed: ${error.message}` },
      { status: 500 }
    );
  }

  const now = new Date();
  const cutoffIso = new Date(now.getTime() - 48 * 3600_000).toISOString();
  let sentCount = 0;
  let removedCount = 0;

  for (const row of rows || []) {
    const matchedCity = CITIES.find((c) => c.id === row.city_id);
    const city: CityLocation = matchedCity || {
      id: row.city_id || "custom",
      nameAr: "موقعك المحدد",
      nameEn: "Selected City",
      countryAr: "",
      countryEn: "",
      latitude: Number(row.latitude) || 21.3891,
      longitude: Number(row.longitude) || 39.8579,
      timezone: row.timezone || "Asia/Riyadh",
      defaultMethodId: (row.calculation_method as PrayerMethodId) || "UmmAlQura",
    };

    const prefs = mergeNotificationPreferences(
      row.preferences as Partial<NotificationPreferencesState>
    );
    const lastNotified: Record<string, string> = {};
    if (row.last_notified && typeof row.last_notified === "object") {
      for (const [k, v] of Object.entries(row.last_notified as Record<string, string>)) {
        if (typeof v === "string" && v > cutoffIso) {
          lastNotified[k] = v;
        }
      }
    }

    const due = evaluateDueReminders({
      prefs,
      now,
      city,
      methodId: (row.calculation_method as PrayerMethodId) || city.defaultMethodId,
      lastNotified,
      windowMinutes: 5,
    });

    if (due.length === 0) continue;

    let expired = false;
    const isEn = row.locale === "en";
    for (const reminder of due) {
      const dispatch = await sendWebPushNotification(
        {
          endpoint: row.endpoint,
          keys: { p256dh: row.p256dh, auth: row.auth },
        },
        {
          title: isEn ? reminder.titleEn : reminder.titleAr,
          body: isEn ? reminder.bodyEn : reminder.bodyAr,
          url: reminder.url,
          tag: reminder.tag,
        }
      );

      if (dispatch.ok) {
        sentCount += 1;
        lastNotified[reminder.key] = now.toISOString();
      } else if (dispatch.statusCode === 404 || dispatch.statusCode === 410) {
        expired = true;
        break;
      }
    }

    if (expired) {
      await supabase.from("push_subscriptions").delete().eq("id", row.id);
      removedCount += 1;
    } else {
      await supabase
        .from("push_subscriptions")
        .update({
          last_notified: lastNotified,
          updated_at: now.toISOString(),
        })
        .eq("id", row.id);
    }
  }

  return NextResponse.json({
    ok: true,
    checked: (rows || []).length,
    sentCount,
    removedCount,
  });
}

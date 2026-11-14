import * as webpush from "web-push";

let vapidConfigured = false;

export function getVapidPublicKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || "";
}

export function isWebPushConfigured(): boolean {
  return Boolean(
    getVapidPublicKey() &&
      process.env.VAPID_PRIVATE_KEY?.trim() &&
      process.env.VAPID_SUBJECT?.trim()
  );
}

function ensureVapidConfigured(): boolean {
  if (!isWebPushConfigured()) return false;
  if (!vapidConfigured) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!.trim(),
      getVapidPublicKey(),
      process.env.VAPID_PRIVATE_KEY!.trim()
    );
    vapidConfigured = true;
  }
  return true;
}

export interface WebPushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export async function sendWebPushNotification(
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  },
  payload: WebPushPayload
): Promise<{ ok: boolean; statusCode?: number; error?: string }> {
  if (!ensureVapidConfigured()) {
    return { ok: false, error: "VAPID credentials are not configured on the server." };
  }

  try {
    const res = await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload),
      { TTL: 3600 }
    );
    return { ok: true, statusCode: res.statusCode };
  } catch (err: unknown) {
    const pushErr = err as { statusCode?: number; message?: string };
    return {
      ok: false,
      statusCode: pushErr.statusCode,
      error: pushErr.message || "Web Push dispatch failed",
    };
  }
}

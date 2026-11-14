"use client";

import { useEffect } from "react";
import { CITIES } from "@/data/cities";
import { useWasl } from "@/components/providers/WaslProvider";
import {
  DEFAULT_NOTIFICATION_PREFS,
  NOTIFICATION_DEDUP_STORAGE_KEY,
  NOTIFICATION_LOCATION_STORAGE_KEY,
  NOTIFICATION_PREFS_STORAGE_KEY,
  evaluateDueReminders,
  mergeNotificationPreferences,
} from "@/lib/notifications/scheduler";
import type { CityLocation, PrayerMethodId } from "@/types/islamic";

function readDedupMap(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(NOTIFICATION_DEDUP_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    const cutoff = new Date(Date.now() - 48 * 3600_000).toISOString();
    const cleaned: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "string" && v > cutoff) cleaned[k] = v;
    }
    return cleaned;
  } catch {
    return {};
  }
}

export function NotificationDaemon() {
  const { locale } = useWasl();

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const checkAndNotify = async () => {
      if (window.Notification.permission !== "granted") return;

      let prefs = DEFAULT_NOTIFICATION_PREFS;
      try {
        const rawPrefs = window.localStorage.getItem(NOTIFICATION_PREFS_STORAGE_KEY);
        if (rawPrefs) {
          prefs = mergeNotificationPreferences(JSON.parse(rawPrefs));
        }
      } catch {
        return;
      }

      if (!prefs.masterEnabled) return;

      let city: CityLocation = CITIES[0];
      let methodId: PrayerMethodId = city.defaultMethodId;
      try {
        const rawLoc = window.localStorage.getItem(NOTIFICATION_LOCATION_STORAGE_KEY);
        if (rawLoc) {
          const parsedLoc = JSON.parse(rawLoc) as {
            cityId?: string;
            methodId?: PrayerMethodId;
          };
          const found = CITIES.find((c) => c.id === parsedLoc.cityId);
          if (found) city = found;
          if (parsedLoc.methodId) methodId = parsedLoc.methodId;
          else methodId = city.defaultMethodId;
        }
      } catch {
        // fallback to default city
      }

      const dedup = readDedupMap();
      const due = evaluateDueReminders({
        prefs,
        now: new Date(),
        city,
        methodId,
        lastNotified: dedup,
        windowMinutes: 5,
      });

      if (due.length === 0) return;

      const isEn = locale === "en";
      for (const item of due) {
        const title = isEn ? item.titleEn : item.titleAr;
        const body = isEn ? item.bodyEn : item.bodyAr;

        try {
          if ("serviceWorker" in navigator) {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) {
              await reg.showNotification(title, {
                body,
                icon: "/branding/favicon/android-chrome-192x192.png",
                badge: "/branding/favicon/favicon-32x32.png",
                dir: isEn ? "ltr" : "rtl",
                lang: isEn ? "en" : "ar",
                tag: item.tag,
                data: { url: item.url },
              });
              dedup[item.key] = new Date().toISOString();
              continue;
            }
          }

          const notification = new window.Notification(title, {
            body,
            icon: "/branding/favicon/android-chrome-192x192.png",
            tag: item.tag,
          });
          notification.onclick = () => {
            window.focus();
            window.location.href = item.url;
          };
          dedup[item.key] = new Date().toISOString();
        } catch {
          // ignore browser rejection cleanly
        }
      }

      try {
        window.localStorage.setItem(
          NOTIFICATION_DEDUP_STORAGE_KEY,
          JSON.stringify(dedup)
        );
      } catch {
        // ignore storage quota errors
      }
    };

    const initialTimer = window.setTimeout(() => {
      void checkAndNotify();
    }, 3000);
    const interval = window.setInterval(() => {
      void checkAndNotify();
    }, 30_000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [locale]);

  return null;
}

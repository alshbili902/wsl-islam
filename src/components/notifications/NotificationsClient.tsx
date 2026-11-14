"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellOff,
  BellRing,
  BookOpen,
  CheckCircle2,
  Clock,
  Info,
  MapPin,
  Moon,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  Sun,
} from "lucide-react";
import { CITIES, PRAYER_METHODS } from "@/data/cities";
import { useWasl } from "@/components/providers/WaslProvider";
import { computePrayerDay } from "@/lib/prayer/calculator";
import {
  DEFAULT_NOTIFICATION_PREFS,
  NOTIFICATION_LOCATION_STORAGE_KEY,
  NOTIFICATION_PREFS_STORAGE_KEY,
  getZonedClockParts,
  isWithinQuietHours,
  mergeNotificationPreferences,
} from "@/lib/notifications/scheduler";
import type { NotificationPreferencesState, PrayerMethodId } from "@/types/islamic";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationsClient() {
  const { locale } = useWasl();
  const isEn = locale === "en";

  const [prefs, setPrefs] = useState<NotificationPreferencesState>(
    DEFAULT_NOTIFICATION_PREFS
  );
  const [cityId, setCityId] = useState<string>(CITIES[0].id);
  const [methodId, setMethodId] = useState<PrayerMethodId>(CITIES[0].defaultMethodId);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    "default"
  );
  const [hydrated, setHydrated] = useState(false);

  const [pushSupported, setPushSupported] = useState(false);
  const [serverPushInfo, setServerPushInfo] = useState<{
    configured: boolean;
    storageConfigured: boolean;
    publicKey: string | null;
  }>({ configured: false, storageConfigured: false, publicKey: null });
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushEndpoint, setPushEndpoint] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [busyPush, setBusyPush] = useState(false);

  const selectedCity = useMemo(
    () => CITIES.find((c) => c.id === cityId) || CITIES[0],
    [cityId]
  );

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        const raw = window.localStorage.getItem(NOTIFICATION_PREFS_STORAGE_KEY);
        if (raw) {
          setPrefs(mergeNotificationPreferences(JSON.parse(raw)));
        }
        const rawLoc = window.localStorage.getItem(NOTIFICATION_LOCATION_STORAGE_KEY);
        if (rawLoc) {
          const parsedLoc = JSON.parse(rawLoc) as {
            cityId?: string;
            methodId?: PrayerMethodId;
          };
          if (parsedLoc.cityId && CITIES.some((c) => c.id === parsedLoc.cityId)) {
            setCityId(parsedLoc.cityId);
          }
          if (parsedLoc.methodId) {
            setMethodId(parsedLoc.methodId);
          }
        }
      } catch {
        // ignore storage errors
      }

      if (typeof window !== "undefined" && "Notification" in window) {
        setPermission(window.Notification.permission);
      } else {
        setPermission("unsupported");
      }

      const hasSw =
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window;
      setPushSupported(hasSw);

      try {
        const res = await fetch("/api/push/public-key");
        if (res.ok) {
          const data = (await res.json()) as {
            configured: boolean;
            storageConfigured: boolean;
            publicKey: string | null;
          };
          setServerPushInfo(data);
        }
      } catch {
        // ignore
      }

      if (hasSw) {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          const existing = reg ? await reg.pushManager.getSubscription() : null;
          if (existing) {
            setPushSubscribed(true);
            setPushEndpoint(existing.endpoint);
          }
        } catch {
          // ignore
        }
      }

      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const persistPrefs = (
    next: NotificationPreferencesState,
    nextCityId = cityId,
    nextMethodId = methodId
  ) => {
    setPrefs(next);
    try {
      window.localStorage.setItem(
        NOTIFICATION_PREFS_STORAGE_KEY,
        JSON.stringify(next)
      );
      window.localStorage.setItem(
        NOTIFICATION_LOCATION_STORAGE_KEY,
        JSON.stringify({ cityId: nextCityId, methodId: nextMethodId })
      );
    } catch {
      // ignore
    }
  };

  const todayPrayers = useMemo(() => {
    const day = computePrayerDay({
      latitude: selectedCity.latitude,
      longitude: selectedCity.longitude,
      timezone: selectedCity.timezone,
      methodId,
      now: new Date(),
    });
    return day.prayers;
  }, [selectedCity, methodId]);

  const quietNow = useMemo(() => {
    const { hhmm } = getZonedClockParts(new Date(), selectedCity.timezone);
    return isWithinQuietHours(hhmm, prefs.quietHours);
  }, [selectedCity.timezone, prefs.quietHours]);

  const requestBrowserPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    const result = await window.Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      persistPrefs({ ...prefs, masterEnabled: true });
      setStatusMessage(
        isEn
          ? "Browser notifications granted. Open-tab reminders are now active."
          : "تم منح إذن الإشعارات بنجاح؛ التنبيهات المحلية أصبحت مفعلة."
      );
    }
  };

  const triggerLocalPreview = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (window.Notification.permission !== "granted") {
      await requestBrowserPermission();
    }
    if ((window.Notification.permission as NotificationPermission) !== "granted") return;

    const title = isEn
      ? "Wasl Islamic — Sample Prayer & Adhkar Reminder"
      : "وصل الإسلامية — معاينة تنبيه الصلاة والأذكار";
    const body = isEn
      ? `Reminder active for ${selectedCity.nameEn} (${prefs.prayers.leadMinutes} min lead time).`
      : `التذكير مضبوط لمدينة ${selectedCity.nameAr} (قبل الأذان بـ ${prefs.prayers.leadMinutes} دقيقة).`;

    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(title, {
          body,
          icon: "/branding/favicon/android-chrome-192x192.png",
          dir: isEn ? "ltr" : "rtl",
          lang: isEn ? "en" : "ar",
          data: { url: "/notifications" },
        });
        setStatusMessage(
          isEn ? "Sample notification displayed." : "تم إرسال إشعار المعاينة الفوري."
        );
        return;
      }
    }

    new window.Notification(title, {
      body,
      icon: "/branding/favicon/android-chrome-192x192.png",
    });
    setStatusMessage(
      isEn ? "Sample notification displayed." : "تم إرسال إشعار المعاينة الفوري."
    );
  };

  const subscribeWebPush = async () => {
    if (!pushSupported || !serverPushInfo.publicKey) return;
    setBusyPush(true);
    setStatusMessage(null);

    try {
      if (window.Notification.permission !== "granted") {
        const p = await window.Notification.requestPermission();
        setPermission(p);
        if (p !== "granted") {
          setBusyPush(false);
          return;
        }
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      const sub =
        existing ||
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(serverPushInfo.publicKey),
        }));

      const jsonSub = sub.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: {
            endpoint: jsonSub.endpoint,
            keys: jsonSub.keys,
          },
          locale,
          cityId: selectedCity.id,
          timezone: selectedCity.timezone,
          latitude: selectedCity.latitude,
          longitude: selectedCity.longitude,
          calculationMethod: methodId,
          preferences: { ...prefs, masterEnabled: true },
        }),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || "Subscription save failed");
      }

      persistPrefs({ ...prefs, masterEnabled: true });
      setPushSubscribed(true);
      setPushEndpoint(sub.endpoint);
      setStatusMessage(
        isEn
          ? "Subscribed to server-delivered Web Push notifications."
          : "تم تفعيل اشتراك إشعارات الويب الدفعية (Web Push) بنجاح."
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Subscription failed";
      setStatusMessage(msg);
    } finally {
      setBusyPush(false);
    }
  };

  const syncPushPreferences = async (nextPrefs: NotificationPreferencesState) => {
    if (!pushSubscribed || !pushSupported) return;
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (!sub) return;
      const jsonSub = sub.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: { endpoint: jsonSub.endpoint, keys: jsonSub.keys },
          locale,
          cityId: selectedCity.id,
          timezone: selectedCity.timezone,
          latitude: selectedCity.latitude,
          longitude: selectedCity.longitude,
          calculationMethod: methodId,
          preferences: nextPrefs,
        }),
      });
    } catch {
      // silent background sync
    }
  };

  const sendServerTestPush = async () => {
    if (!pushSupported) return;
    setBusyPush(true);
    setStatusMessage(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (!sub) {
        setStatusMessage(
          isEn ? "Subscribe to Web Push first." : "فعّل اشتراك Web Push أولاً."
        );
        setBusyPush(false);
        return;
      }
      const jsonSub = sub.toJSON();
      const res = await fetch("/api/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: { endpoint: jsonSub.endpoint, keys: jsonSub.keys },
          locale,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Test push failed");
      setStatusMessage(
        isEn
          ? "Real Web Push test dispatched via VAPID!"
          : "تم إرسال إشعار Web Push فعلي عبر الخادم بنجاح."
      );
    } catch (err: unknown) {
      setStatusMessage(err instanceof Error ? err.message : "Test push failed");
    } finally {
      setBusyPush(false);
    }
  };

  const unsubscribeWebPush = async () => {
    setBusyPush(true);
    setStatusMessage(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setPushSubscribed(false);
      setPushEndpoint(null);
      setStatusMessage(
        isEn
          ? "Unsubscribed from Web Push notifications."
          : "تم إلغاء اشتراك Web Push من هذا المتصفح."
      );
    } catch {
      setStatusMessage(
        isEn ? "Could not remove subscription cleanly." : "تعذر إلغاء الاشتراك."
      );
    } finally {
      setBusyPush(false);
    }
  };

  const updateAndSync = (next: NotificationPreferencesState) => {
    persistPrefs(next);
    void syncPushPreferences(next);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header */}
      <section className="wasl-surface rounded-3xl p-6 sm:p-8 border border-[var(--border)] relative overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
              <BellRing className="h-3.5 w-3.5" />
              {isEn
                ? "Smart Islamic Reminders & Web Push"
                : "التنبيهات والتذكيرات الإسلامية الذكية"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              {isEn
                ? "Prayer, Quran, Khatmah & Adhkar Reminders"
                : "منظومة التذكيرات الذكية للصلاة والقرآن والأذكار"}
            </h1>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {isEn
                ? "Configure calm, timely reminders computed from real prayer calculation methods, your daily Quran reading, and authentic morning/evening adhkar."
                : "خصّص تنبيهات هادئة ومحسوبة بدقة لمواقيت الصلاة والأذكار وورد القرآن الكريم والختمة مع احترام ساعات الهدوء وعدم الإزعاج."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => updateAndSync({ ...prefs, masterEnabled: !prefs.masterEnabled })}
            className={`inline-flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold transition-all cursor-pointer border ${
              prefs.masterEnabled
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)] shadow-sm"
                : "bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]"
            }`}
          >
            {prefs.masterEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
            <span>
              {prefs.masterEnabled
                ? isEn
                  ? "Reminders Active"
                  : "التنبيهات مفعّلة"
                : isEn
                  ? "Reminders Paused"
                  : "التنبيهات متوقفة"}
            </span>
          </button>
        </div>

        {/* Progressive Permission & Capability Banner */}
        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--background)]/70 p-4 space-y-3">
          {permission === "default" && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-[var(--foreground)]">
                    {isEn
                      ? "Enable Browser Notifications Only When Ready"
                      : "فعّل إشعارات المتصفح اختيارياً حسب رغبتك"}
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {isEn
                      ? "We never prompt automatically. Click below to allow local reminders while Wasl is open, or subscribe to Web Push for background delivery."
                      : "لا تطلب المنصة الإذن تلقائياً؛ عند موافقتك تصلك التذكيرات أثناء فتح التبويب، ويمكنك الاشتراك في Web Push للتوصيل من الخادم."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void requestBrowserPermission()}
                className="rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--primary-foreground)] hover:opacity-95 cursor-pointer"
              >
                {isEn ? "Allow Browser Notifications" : "السماح بالإشعارات"}
              </button>
            </div>
          )}

          {permission === "denied" && (
            <div className="flex items-start gap-3 text-sm text-amber-700 dark:text-amber-300">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  {isEn
                    ? "Browser Notification Permission Is Blocked"
                    : "إذن الإشعارات محظور في إعدادات المتصفح"}
                </p>
                <p className="text-xs opacity-90 mt-1">
                  {isEn
                    ? "To re-enable notifications, click the lock/tune icon next to the browser address bar and change Notifications from Block to Allow."
                    : "لإعادة التفعيل: افتح أيقونة القفل أو الأذونات بجانب شريط عنوان المتصفح، وغيّر خيار الإشعارات (Notifications) إلى السماح (Allow)، ثم حدّث الصفحة."}
                </p>
              </div>
            </div>
          )}

          {permission === "granted" && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  {isEn
                    ? "Browser permission granted. Quiet hours and duplicate prevention are enforced automatically."
                    : "تم منح إذن المتصفح — تعمل ساعات الهدوء ومنع التكرار تلقائياً."}
                </span>
                {quietNow && (
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    {isEn ? "Quiet Hours Active Now" : "ساعات الهدوء نشطة الآن"}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => void triggerLocalPreview()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--primary)] cursor-pointer"
              >
                <Send className="h-3.5 w-3.5 text-[var(--primary)]" />
                {isEn ? "Preview Notification Now" : "معاينة إشعار تجريبي الآن"}
              </button>
            </div>
          )}

          {permission === "unsupported" && (
            <p className="text-xs text-[var(--muted)]">
              {isEn
                ? "This browser or embedded webview does not support Web Notification APIs."
                : "هذا المتصفح أو العرض المضمن لا يدعم واجهة الإشعارات البرمجية."}
            </p>
          )}

          {statusMessage && (
            <p className="text-xs font-medium text-[var(--primary)] bg-[var(--accent-soft)] rounded-xl px-3 py-2">
              {statusMessage}
            </p>
          )}
        </div>
      </section>

      {/* Honest Delivery Capability Clarification + Real Web Push Panel */}
      <section className="wasl-surface rounded-3xl p-6 border border-[var(--border)] space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--gold)]" />
              {isEn
                ? "Background Delivery (Web Push + Service Worker)"
                : "التوصيل في الخلفية (Web Push عبر الخادم)"}
            </h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {isEn
                ? "Local browser timers only fire while a Wasl tab is open. True closed-browser background reminders require subscribing below with VAPID Web Push and running the authenticated /api/push/cron trigger on your hosting schedule."
                : "المؤقتات المحلية في المتصفح تعمل فقط أثناء فتح أحد تبويبات منصة وصل. أما التوصيل الحقيقي عند إغلاق المتصفح فيعتمد على اشتراك Web Push أدناه وتشغيل مجدول الخادم الآمن /api/push/cron بانتظام."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hydrated && pushSupported && serverPushInfo.configured ? (
              pushSubscribed ? (
                <>
                  <button
                    type="button"
                    disabled={busyPush}
                    onClick={() => void sendServerTestPush()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3.5 py-2 text-xs font-semibold text-[var(--primary-foreground)] hover:opacity-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isEn ? "Send Server Test Push" : "إرسال اختبار عبر الخادم"}
                  </button>
                  <button
                    type="button"
                    disabled={busyPush}
                    onClick={() => void unsubscribeWebPush()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--foreground)] hover:border-red-500 cursor-pointer"
                  >
                    {isEn ? "Disable Web Push" : "إلغاء Web Push"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={busyPush || !serverPushInfo.storageConfigured}
                  onClick={() => void subscribeWebPush()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--primary-foreground)] hover:opacity-95 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${busyPush ? "animate-spin" : ""}`} />
                  {isEn ? "Enable Background Web Push" : "تفعيل اشتراك Web Push"}
                </button>
              )
            ) : (
              <span className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--muted)]">
                {isEn
                  ? "Local open-tab mode active (configure VAPID + Supabase Service Role for background push)"
                  : "الوضع المحلي النشط أثناء فتح التبويب"}
              </span>
            )}
          </div>
        </div>

        {pushEndpoint && (
          <p className="text-[11px] text-[var(--muted)] truncate">
            {isEn ? "Active Push Endpoint:" : "نقطة الاتصال المسجلة:"}{" "}
            <span className="font-mono">{pushEndpoint}</span>
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Prayer Reminders */}
        <section className="wasl-surface rounded-3xl p-6 border border-[var(--border)] space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[var(--primary)]" />
              {isEn ? "Daily Prayer Reminders" : "تنبيهات الصلوات الخمس"}
            </h2>
            <Link
              href="/prayer-times"
              className="text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              {isEn ? "Full Timetable" : "جدول المواقيت"}
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 block">
              <span className="text-xs font-semibold text-[var(--muted)]">
                {isEn ? "City & Timezone" : "المدينة والمنطقة الزمنية"}
              </span>
              <select
                value={cityId}
                onChange={(e) => {
                  const nextCity =
                    CITIES.find((c) => c.id === e.target.value) || CITIES[0];
                  setCityId(nextCity.id);
                  setMethodId(nextCity.defaultMethodId);
                  persistPrefs(prefs, nextCity.id, nextCity.defaultMethodId);
                }}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
              >
                {CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isEn ? `${c.nameEn} (${c.countryEn})` : `${c.nameAr} — ${c.countryAr}`}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 block">
              <span className="text-xs font-semibold text-[var(--muted)]">
                {isEn ? "Calculation Method" : "طريقة الحساب الفقهية"}
              </span>
              <select
                value={methodId}
                onChange={(e) => {
                  const nextMethod = e.target.value as PrayerMethodId;
                  setMethodId(nextMethod);
                  persistPrefs(prefs, cityId, nextMethod);
                }}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
              >
                {PRAYER_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {isEn ? m.nameEn : m.nameAr}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-[var(--muted)]">
              {isEn ? "Notify Before Adhan By" : "التنبيه قبل دخول الوقت بـ"}
            </span>
            <div className="flex flex-wrap gap-2">
              {([0, 5, 10, 15, 30] as const).map((min) => (
                <button
                  key={min}
                  type="button"
                  onClick={() =>
                    updateAndSync({
                      ...prefs,
                      prayers: { ...prefs.prayers, leadMinutes: min },
                    })
                  }
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold border cursor-pointer transition-colors ${
                    prefs.prayers.leadMinutes === min
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                      : "bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]"
                  }`}
                >
                  {min === 0
                    ? isEn
                      ? "At Adhan"
                      : "عند الأذان"
                    : isEn
                      ? `${min} min`
                      : `${min} دقيقة`}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)]/60">
            {(
              [
                { id: "fajr", ar: "الفجر", en: "Fajr" },
                { id: "dhuhr", ar: "الظهر", en: "Dhuhr" },
                { id: "asr", ar: "العصر", en: "Asr" },
                { id: "maghrib", ar: "المغرب", en: "Maghrib" },
                { id: "isha", ar: "العشاء", en: "Isha" },
              ] as const
            ).map((p) => {
              const foundPrayer = todayPrayers.find((x) => x.key === p.id);
              const prayerTime = foundPrayer
                ? isEn
                  ? foundPrayer.formatted12En
                  : foundPrayer.formatted12Ar
                : "--:--";
              const checked = prefs.prayers[p.id];
              return (
                <label
                  key={p.id}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        updateAndSync({
                          ...prefs,
                          prayers: { ...prefs.prayers, [p.id]: e.target.checked },
                        })
                      }
                      className="h-4 w-4 accent-[var(--primary)]"
                    />
                    <span className="text-sm font-semibold text-[var(--foreground)]">
                      {isEn ? p.en : p.ar}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[var(--muted)]">{prayerTime}</span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Adhkar & Quran Reminders */}
        <section className="wasl-surface rounded-3xl p-6 border border-[var(--border)] space-y-5">
          <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[var(--primary)]" />
            {isEn ? "Adhkar, Quran & Khatmah Reminders" : "تذكيرات الأذكار والقرآن والختمة"}
          </h2>

          <div className="space-y-3">
            {[
              {
                key: "morning",
                icon: Sun,
                label: isEn ? "Morning Adhkar" : "أذكار الصباح",
                enabled: prefs.adhkar.morningEnabled,
                time: prefs.adhkar.morningTime,
                onToggle: (v: boolean) =>
                  updateAndSync({
                    ...prefs,
                    adhkar: { ...prefs.adhkar, morningEnabled: v },
                  }),
                onTime: (t: string) =>
                  updateAndSync({
                    ...prefs,
                    adhkar: { ...prefs.adhkar, morningTime: t },
                  }),
              },
              {
                key: "evening",
                icon: Moon,
                label: isEn ? "Evening Adhkar" : "أذكار المساء",
                enabled: prefs.adhkar.eveningEnabled,
                time: prefs.adhkar.eveningTime,
                onToggle: (v: boolean) =>
                  updateAndSync({
                    ...prefs,
                    adhkar: { ...prefs.adhkar, eveningEnabled: v },
                  }),
                onTime: (t: string) =>
                  updateAndSync({
                    ...prefs,
                    adhkar: { ...prefs.adhkar, eveningTime: t },
                  }),
              },
              {
                key: "bedtime",
                icon: Moon,
                label: isEn ? "Bedtime Adhkar" : "أذكار النوم",
                enabled: prefs.adhkar.bedtimeEnabled,
                time: prefs.adhkar.bedtimeTime,
                onToggle: (v: boolean) =>
                  updateAndSync({
                    ...prefs,
                    adhkar: { ...prefs.adhkar, bedtimeEnabled: v },
                  }),
                onTime: (t: string) =>
                  updateAndSync({
                    ...prefs,
                    adhkar: { ...prefs.adhkar, bedtimeTime: t },
                  }),
              },
              {
                key: "quranMorning",
                icon: BookOpen,
                label: isEn ? "Morning Quran Reading" : "ورد القرآن الصباحي",
                enabled: prefs.quran.morningEnabled,
                time: prefs.quran.morningTime,
                onToggle: (v: boolean) =>
                  updateAndSync({
                    ...prefs,
                    quran: { ...prefs.quran, morningEnabled: v },
                  }),
                onTime: (t: string) =>
                  updateAndSync({
                    ...prefs,
                    quran: { ...prefs.quran, morningTime: t },
                  }),
              },
              {
                key: "khatmah",
                icon: Clock,
                label: isEn ? "Daily Khatmah Check-in" : "مراجعة ورد الختمة اليومي",
                enabled: prefs.quran.khatmahEnabled,
                time: prefs.quran.khatmahTime,
                onToggle: (v: boolean) =>
                  updateAndSync({
                    ...prefs,
                    quran: { ...prefs.quran, khatmahEnabled: v },
                  }),
                onTime: (t: string) =>
                  updateAndSync({
                    ...prefs,
                    quran: { ...prefs.quran, khatmahTime: t },
                  }),
              },
            ].map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 px-4 py-2.5"
              >
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={row.enabled}
                    onChange={(e) => row.onToggle(e.target.checked)}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                  <row.icon className="h-4 w-4 text-[var(--primary)]" />
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    {row.label}
                  </span>
                </label>
                <input
                  type="time"
                  value={row.time}
                  onChange={(e) => row.onTime(e.target.value)}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-xs font-mono text-[var(--foreground)]"
                />
              </div>
            ))}

            <label className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 px-4 py-3 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={prefs.adhkar.afterPrayerEnabled}
                  onChange={(e) =>
                    updateAndSync({
                      ...prefs,
                      adhkar: {
                        ...prefs.adhkar,
                        afterPrayerEnabled: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  {isEn
                    ? "Post-Prayer Adhkar (+20 min after each prayer)"
                    : "أذكار ما بعد الصلاة (بعد كل صلاة بـ 20 دقيقة)"}
                </span>
              </div>
            </label>
          </div>

          {/* Custom Reminder & Quiet Hours */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)]/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={prefs.quran.customEnabled}
                  onChange={(e) =>
                    updateAndSync({
                      ...prefs,
                      quran: { ...prefs.quran, customEnabled: e.target.checked },
                    })
                  }
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                <span>{isEn ? "Custom Daily Reminder" : "تذكير يومي مخصص"}</span>
              </label>
              <input
                type="time"
                value={prefs.quran.customTime}
                onChange={(e) =>
                  updateAndSync({
                    ...prefs,
                    quran: { ...prefs.quran, customTime: e.target.value },
                  })
                }
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-xs font-mono"
              />
            </div>
            <input
              type="text"
              value={isEn ? prefs.quran.customLabelEn : prefs.quran.customLabelAr}
              onChange={(e) =>
                updateAndSync({
                  ...prefs,
                  quran: {
                    ...prefs.quran,
                    ...(isEn
                      ? { customLabelEn: e.target.value }
                      : { customLabelAr: e.target.value }),
                  },
                })
              }
              placeholder={
                isEn
                  ? "e.g. Daily Tafsir or Suratul-Kahf review"
                  : "مثال: قراءة التفسير أو سورة الكهف يوم الجمعة"
              }
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--foreground)]"
            />
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)]/70 p-4 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-semibold text-[var(--foreground)]">
                {isEn
                  ? "Quiet Hours (Pause all notifications)"
                  : "ساعات الهدوء (عدم الإزعاج)"}
              </span>
              <input
                type="checkbox"
                checked={prefs.quietHours.enabled}
                onChange={(e) =>
                  updateAndSync({
                    ...prefs,
                    quietHours: { ...prefs.quietHours, enabled: e.target.checked },
                  })
                }
                className="h-4 w-4 accent-[var(--primary)]"
              />
            </label>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="space-y-1 block">
                <span className="text-[var(--muted)]">{isEn ? "From" : "من الساعة"}</span>
                <input
                  type="time"
                  value={prefs.quietHours.start}
                  onChange={(e) =>
                    updateAndSync({
                      ...prefs,
                      quietHours: { ...prefs.quietHours, start: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 font-mono"
                />
              </label>
              <label className="space-y-1 block">
                <span className="text-[var(--muted)]">{isEn ? "Until" : "إلى الساعة"}</span>
                <input
                  type="time"
                  value={prefs.quietHours.end}
                  onChange={(e) =>
                    updateAndSync({
                      ...prefs,
                      quietHours: { ...prefs.quietHours, end: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 font-mono"
                />
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

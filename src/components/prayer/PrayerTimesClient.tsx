"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Clock,
  Compass,
  Globe,
  LocateFixed,
  MapPin,
  Moon,
  Settings2,
  Sun,
  Sunrise,
  Sunset,
  AlertCircle,
} from "lucide-react";
import { useWasl } from "@/components/providers/WaslProvider";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageShell, RevealSection } from "@/components/ui/MotionPrimitives";
import {
  GeometricLattice,
  OrnamentalDivider,
} from "@/components/brand/IslamicVisuals";
import { CITIES, PRAYER_METHODS } from "@/data/cities";
import {
  computePrayerDay,
  formatCountdown,
  type PrayerNameKey,
} from "@/lib/prayer/calculator";
import type { PrayerMethodId } from "@/types/islamic";

const PREFS_STORAGE_KEY = "wasl-prayer-prefs-v1";
const STATIC_ANCHOR_DATE = new Date("2026-11-14T09:00:00Z");

interface ActiveLocation {
  mode: "city" | "geo";
  cityId: string;
  labelAr: string;
  labelEn: string;
  countryAr: string;
  countryEn: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

const DEFAULT_CITY = CITIES[0]; // Makkah

function getPrayerIcon(key: PrayerNameKey) {
  switch (key) {
    case "fajr":
      return Sunrise;
    case "sunrise":
      return Sun;
    case "dhuhr":
      return Sun;
    case "asr":
      return Sun;
    case "maghrib":
      return Sunset;
    case "isha":
      return Moon;
  }
}

export function PrayerTimesClient() {
  const { locale, isRtl } = useWasl();

  const [location, setLocation] = useState<ActiveLocation>({
    mode: "city",
    cityId: DEFAULT_CITY.id,
    labelAr: DEFAULT_CITY.nameAr,
    labelEn: DEFAULT_CITY.nameEn,
    countryAr: DEFAULT_CITY.countryAr,
    countryEn: DEFAULT_CITY.countryEn,
    latitude: DEFAULT_CITY.latitude,
    longitude: DEFAULT_CITY.longitude,
    timezone: DEFAULT_CITY.timezone,
  });

  const [methodId, setMethodId] = useState<PrayerMethodId>(
    DEFAULT_CITY.defaultMethodId
  );
  const [asrSchool, setAsrSchool] = useState<"shafi" | "hanafi">("shafi");
  const [geoState, setGeoState] = useState<
    "idle" | "requesting" | "granted" | "denied" | "unsupported"
  >("idle");
  const [geoErrorMsg, setGeoErrorMsg] = useState<string | null>(null);
  const [liveNow, setLiveNow] = useState<Date | null>(null);
  const now = liveNow ?? STATIC_ANCHOR_DATE;

  // Hydrate saved preferences safely after mount
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(PREFS_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as {
          cityId?: string;
          methodId?: PrayerMethodId;
          asrSchool?: "shafi" | "hanafi";
          geoLocation?: ActiveLocation;
        };
        if (parsed.geoLocation && parsed.geoLocation.mode === "geo") {
          setLocation(parsed.geoLocation);
          setGeoState("granted");
        } else if (parsed.cityId) {
          const found = CITIES.find((c) => c.id === parsed.cityId);
          if (found) {
            setLocation({
              mode: "city",
              cityId: found.id,
              labelAr: found.nameAr,
              labelEn: found.nameEn,
              countryAr: found.countryAr,
              countryEn: found.countryEn,
              latitude: found.latitude,
              longitude: found.longitude,
              timezone: found.timezone,
            });
          }
        }
        if (parsed.methodId) setMethodId(parsed.methodId);
        if (parsed.asrSchool === "shafi" || parsed.asrSchool === "hanafi") {
          setAsrSchool(parsed.asrSchool);
        }
      } catch {
        // Ignore invalid JSON
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Persist preference changes
  useEffect(() => {
    try {
      localStorage.setItem(
        PREFS_STORAGE_KEY,
        JSON.stringify({
          cityId: location.cityId,
          methodId,
          asrSchool,
          geoLocation: location.mode === "geo" ? location : undefined,
        })
      );
    } catch {
      // Storage unavailable
    }
  }, [location, methodId, asrSchool]);

  // Live 1-second tick for countdown and local clock after hydration
  useEffect(() => {
    const startId = window.setTimeout(() => setLiveNow(new Date()), 0);
    const interval = window.setInterval(() => {
      setLiveNow(new Date());
    }, 1000);
    return () => {
      window.clearTimeout(startId);
      window.clearInterval(interval);
    };
  }, []);

  const schedule = useMemo(
    () =>
      computePrayerDay({
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
        methodId,
        asrSchool,
        now,
      }),
    [location.latitude, location.longitude, location.timezone, methodId, asrSchool, now]
  );

  const selectedMethod = useMemo(
    () => PRAYER_METHODS.find((m) => m.id === methodId) ?? PRAYER_METHODS[0],
    [methodId]
  );

  const localClockText = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
        timeZone: location.timezone,
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(now);
    } catch {
      return "";
    }
  }, [locale, location.timezone, now]);

  const handleSelectCity = (cityId: string) => {
    const found = CITIES.find((c) => c.id === cityId);
    if (!found) return;
    setLocation({
      mode: "city",
      cityId: found.id,
      labelAr: found.nameAr,
      labelEn: found.nameEn,
      countryAr: found.countryAr,
      countryEn: found.countryEn,
      latitude: found.latitude,
      longitude: found.longitude,
      timezone: found.timezone,
    });
    setMethodId(found.defaultMethodId);
    setGeoState("idle");
    setGeoErrorMsg(null);
  };

  const handleRequestGeolocation = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeoState("unsupported");
      setGeoErrorMsg(
        locale === "ar"
          ? "متصفحك لا يدعم خدمة تحديد الموقع الجغرافي. يمكنك اختيار المدينة يدويًا من القائمة أدناه."
          : "Your browser does not support geolocation. Please choose your city manually below."
      );
      return;
    }

    setGeoState("requesting");
    setGeoErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const tz =
          Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Riyadh";
        setLocation({
          mode: "geo",
          cityId: "custom-geo",
          labelAr: "موقعك الحالي",
          labelEn: "Current Location",
          countryAr: "تحديد جغرافي مباشر",
          countryEn: "Browser Geolocation",
          latitude: Number(pos.coords.latitude.toFixed(4)),
          longitude: Number(pos.coords.longitude.toFixed(4)),
          timezone: tz,
        });
        setGeoState("granted");
      },
      (err) => {
        setGeoState("denied");
        if (err.code === err.PERMISSION_DENIED) {
          setGeoErrorMsg(
            locale === "ar"
              ? "لم يتم السماح بالوصول إلى الموقع. نعرض لك المواقيت للمدينة المختارة، ويمكنك اختيار أي مدينة يدويًا."
              : "Location permission was denied. Showing times for the selected city — you can choose any city manually below."
          );
        } else {
          setGeoErrorMsg(
            locale === "ar"
              ? "تعذّر الحصول على إحداثيات الموقع حاليًا. يُرجى اختيار المدينة يدويًا."
              : "Unable to acquire location right now. Please select a city manually."
          );
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300_000 }
    );
  };

  const quickCityIds = ["makkah", "madinah", "riyadh", "jeddah", "cairo", "dubai", "london"];

  return (
    <PageShell className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { labelAr: "مواقيت الصلاة", labelEn: "Prayer Times" },
        ]}
      />

      {/* Hero Highlight Card: Upcoming Prayer + Live Countdown */}
      <section className="wasl-surface relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10 mb-8 shadow-sm">
        <GeometricLattice className="opacity-[0.045]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--wasl-border)] bg-[var(--wasl-bg)]/80 px-3.5 py-1.5 text-xs font-medium text-[var(--wasl-primary)]">
              <MapPin className="h-3.5 w-3.5 text-[var(--wasl-accent)]" />
              <span>
                {locale === "ar"
                  ? `${location.labelAr} — ${location.countryAr}`
                  : `${location.labelEn} — ${location.countryEn}`}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[var(--wasl-text)] sm:text-4xl">
              {locale === "ar" ? "مواقيت الصلاة اليومية" : "Daily Prayer Times"}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--wasl-text-muted)]">
              <span suppressHydrationWarning>
                {locale === "ar" ? schedule.hijriAr : schedule.hijriEn}
              </span>
              <span aria-hidden="true" className="text-[var(--wasl-accent)]">•</span>
              <span suppressHydrationWarning>
                {locale === "ar" ? schedule.gregorianAr : schedule.gregorianEn}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleRequestGeolocation}
                disabled={geoState === "requesting"}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--wasl-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--wasl-primary-hover)] disabled:opacity-60"
              >
                <LocateFixed className="h-4 w-4" />
                <span>
                  {geoState === "requesting"
                    ? locale === "ar"
                      ? "جارٍ تحديد الموقع..."
                      : "Locating..."
                    : locale === "ar"
                      ? "استخدام موقعي الجغرافي"
                      : "Use My Location"}
                </span>
              </button>

              <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-3.5 py-2.5 text-xs text-[var(--wasl-text-muted)]">
                <Globe className="h-4 w-4 text-[var(--wasl-primary)]" />
                <span dir="ltr" className="font-mono">
                  {location.timezone}
                </span>
              </div>

              {localClockText && (
                <div
                  suppressHydrationWarning
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-3.5 py-2.5 text-xs font-medium text-[var(--wasl-text)]"
                >
                  <Clock className="h-3.5 w-3.5 text-[var(--wasl-accent)]" />
                  <span>{localClockText}</span>
                </div>
              )}
            </div>

            {geoErrorMsg && (
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs leading-relaxed text-[var(--wasl-text)]"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                <p>{geoErrorMsg}</p>
              </div>
            )}
          </div>

          {/* Upcoming Prayer Countdown Architectural Box */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-[var(--wasl-accent)]/35 bg-gradient-to-br from-[var(--wasl-primary)] to-[var(--wasl-primary-hover)] p-6 text-white shadow-lg">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <span className="text-xs font-medium uppercase tracking-wider text-white/80">
                  {locale === "ar" ? "الصلاة القادمة" : "Next Prayer"}
                </span>
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-[#F4DDA0]">
                  {locale === "ar"
                    ? schedule.nextPrayer.formatted12Ar
                    : schedule.nextPrayer.formatted12En}
                </span>
              </div>

              <div className="my-5 flex items-baseline justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold sm:text-4xl">
                    {locale === "ar"
                      ? `صلاة ${schedule.nextPrayer.nameAr}`
                      : schedule.nextPrayer.nameEn}
                  </h2>
                  <p className="mt-1 text-xs text-white/75">
                    {locale === "ar" ? "المتبقي على الأذان" : "Time remaining"}
                  </p>
                </div>
                <div
                  dir="ltr"
                  suppressHydrationWarning
                  className="font-mono text-3xl font-bold tracking-wider text-[#F4DDA0] sm:text-4xl"
                >
                  {formatCountdown(schedule.countdownMs)}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/80 pt-2 border-t border-white/15">
                <span>
                  {locale === "ar"
                    ? selectedMethod.nameAr
                    : selectedMethod.nameEn}
                </span>
                <span dir="ltr">
                  {location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Prayer Cards Grid */}
      <RevealSection className="mb-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
          {schedule.prayers.map((prayer) => {
            const Icon = getPrayerIcon(prayer.key);
            const isNext =
              prayer.key === schedule.nextPrayer.key &&
              schedule.nextPrayer.time.getTime() === prayer.time.getTime();
            const isSunrise = prayer.key === "sunrise";

            return (
              <div
                key={prayer.key}
                className={`relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all ${
                  isNext
                    ? "border-[var(--wasl-accent)] bg-[var(--wasl-primary)]/10 ring-2 ring-[var(--wasl-accent)]/25 shadow-sm"
                    : "border-[var(--wasl-border)] bg-[var(--wasl-surface)] hover:border-[var(--wasl-primary)]/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      isNext
                        ? "bg-[var(--wasl-primary)] text-white"
                        : "bg-[var(--wasl-primary)]/10 text-[var(--wasl-primary)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {isNext && (
                    <span className="rounded-full bg-[var(--wasl-accent)]/20 px-2 py-0.5 text-[10px] font-bold text-[var(--wasl-accent-strong)]">
                      {locale === "ar" ? "القادمة" : "Next"}
                    </span>
                  )}
                  {isSunrise && !isNext && (
                    <span className="text-[10px] text-[var(--wasl-text-muted)]">
                      {locale === "ar" ? "شروق" : "Rise"}
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-sm font-semibold text-[var(--wasl-text-muted)]">
                    {locale === "ar" ? prayer.nameAr : prayer.nameEn}
                  </p>
                  <p
                    suppressHydrationWarning
                    className="mt-1 text-xl font-bold tracking-tight text-[var(--wasl-text)] sm:text-2xl"
                  >
                    {locale === "ar" ? prayer.formatted12Ar : prayer.formatted12En}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </RevealSection>

      <OrnamentalDivider className="my-8" />

      {/* Manual City Selection + Calculation Settings */}
      <RevealSection className="grid gap-6 lg:grid-cols-12">
        {/* Manual Location Selection */}
        <div className="wasl-surface rounded-3xl p-6 lg:col-span-7 space-y-5">
          <div className="flex items-center gap-2.5">
            <Compass className="h-5 w-5 text-[var(--wasl-primary)]" />
            <h2 className="text-lg font-bold text-[var(--wasl-text)]">
              {locale === "ar"
                ? "اختيار المدينة يدويًا"
                : "Manual City Selection"}
            </h2>
          </div>

          <div>
            <label
              htmlFor="city-select"
              className="mb-2 block text-xs font-semibold text-[var(--wasl-text-muted)]"
            >
              {locale === "ar"
                ? "اختر مدينة من القائمة العالمية"
                : "Select a city from the global list"}
            </label>
            <select
              id="city-select"
              value={location.mode === "city" ? location.cityId : ""}
              onChange={(e) => {
                if (e.target.value) handleSelectCity(e.target.value);
              }}
              className="w-full rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-4 py-3 text-sm text-[var(--wasl-text)] focus:border-[var(--wasl-primary)] focus:outline-none"
            >
              {location.mode === "geo" && (
                <option value="">
                  {locale === "ar"
                    ? "موقعك الجغرافي الحالي — اختر مدينة للتبديل"
                    : "Using browser geolocation — choose a city to switch"}
                </option>
              )}
              {CITIES.map((city) => (
                <option key={city.id} value={city.id}>
                  {locale === "ar"
                    ? `${city.nameAr} (${city.countryAr})`
                    : `${city.nameEn} (${city.countryEn})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-2.5 text-xs font-semibold text-[var(--wasl-text-muted)]">
              {locale === "ar" ? "مدن سريعة الاختيار" : "Quick Cities"}
            </p>
            <div className="flex flex-wrap gap-2">
              {CITIES.filter((c) => quickCityIds.includes(c.id)).map((city) => {
                const active =
                  location.mode === "city" && location.cityId === city.id;
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelectCity(city.id)}
                    className={`rounded-xl border px-3.5 py-2 text-xs font-medium transition ${
                      active
                        ? "border-[var(--wasl-primary)] bg-[var(--wasl-primary)] text-white"
                        : "border-[var(--wasl-border)] bg-[var(--wasl-bg)] text-[var(--wasl-text)] hover:border-[var(--wasl-primary)]"
                    }`}
                  >
                    {locale === "ar" ? city.nameAr : city.nameEn}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Calculation Method & School Settings */}
        <div className="wasl-surface rounded-3xl p-6 lg:col-span-5 space-y-5">
          <div className="flex items-center gap-2.5">
            <Settings2 className="h-5 w-5 text-[var(--wasl-primary)]" />
            <h2 className="text-lg font-bold text-[var(--wasl-text)]">
              {locale === "ar" ? "إعدادات الحساب" : "Calculation Settings"}
            </h2>
          </div>

          <div>
            <label
              htmlFor="method-select"
              className="mb-2 block text-xs font-semibold text-[var(--wasl-text-muted)]"
            >
              {locale === "ar" ? "طريقة حساب الفجر والعشاء" : "Calculation Method"}
            </label>
            <select
              id="method-select"
              value={methodId}
              onChange={(e) => setMethodId(e.target.value as PrayerMethodId)}
              className="w-full rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-4 py-3 text-sm text-[var(--wasl-text)] focus:border-[var(--wasl-primary)] focus:outline-none"
            >
              {PRAYER_METHODS.map((method) => (
                <option key={method.id} value={method.id}>
                  {locale === "ar" ? method.nameAr : method.nameEn}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[var(--wasl-text-muted)]">
              {locale === "ar"
                ? selectedMethod.authorityAr
                : selectedMethod.authorityEn}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-[var(--wasl-text-muted)]">
              {locale === "ar" ? "مذهب حساب وقت العصر" : "Asr Juristic Method"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAsrSchool("shafi")}
                className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                  asrSchool === "shafi"
                    ? "border-[var(--wasl-primary)] bg-[var(--wasl-primary)] text-white"
                    : "border-[var(--wasl-border)] bg-[var(--wasl-bg)] text-[var(--wasl-text)]"
                }`}
              >
                {locale === "ar" ? "الجمهور (الشافعي والمالكي والحنبلي)" : "Standard (Majority)"}
              </button>
              <button
                type="button"
                onClick={() => setAsrSchool("hanafi")}
                className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                  asrSchool === "hanafi"
                    ? "border-[var(--wasl-primary)] bg-[var(--wasl-primary)] text-white"
                    : "border-[var(--wasl-border)] bg-[var(--wasl-bg)] text-[var(--wasl-text)]"
                }`}
              >
                {locale === "ar" ? "المذهب الحنفي" : "Hanafi"}
              </button>
            </div>
          </div>

          <div
            className={`rounded-2xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)]/70 p-3.5 text-xs leading-relaxed text-[var(--wasl-text-muted)] ${
              isRtl ? "text-right" : "text-left"
            }`}
          >
            {locale === "ar"
              ? "يتم حساب المواقيت محليًا بدقة فلكية عالية عبر مكتبة adhan المعتمدة مع تقويم أم القرى الرسمي."
              : "Prayer times are computed locally using the verified adhan astronomical engine paired with the Umm al-Qura calendar."}
          </div>
        </div>
      </RevealSection>
    </PageShell>
  );
}

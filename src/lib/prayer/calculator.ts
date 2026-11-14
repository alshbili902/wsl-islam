import {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  Madhab,
  PrayerTimes,
} from "adhan";
import type { PrayerMethodId } from "@/types/islamic";

export type PrayerNameKey =
  | "fajr"
  | "sunrise"
  | "dhuhr"
  | "asr"
  | "maghrib"
  | "isha";

export interface PrayerScheduleItem {
  key: PrayerNameKey;
  nameAr: string;
  nameEn: string;
  time: Date;
  formatted12Ar: string;
  formatted12En: string;
}

export interface ComputedPrayerDay {
  prayers: PrayerScheduleItem[];
  nextPrayer: PrayerScheduleItem;
  countdownMs: number;
  hijriAr: string;
  hijriEn: string;
  gregorianAr: string;
  gregorianEn: string;
  timezone: string;
}

function getMethodParams(methodId: PrayerMethodId): CalculationParameters {
  switch (methodId) {
    case "UmmAlQura":
      return CalculationMethod.UmmAlQura();
    case "MuslimWorldLeague":
      return CalculationMethod.MuslimWorldLeague();
    case "Egyptian":
      return CalculationMethod.Egyptian();
    case "Dubai":
      return CalculationMethod.Dubai();
    case "Qatar":
      return CalculationMethod.Qatar();
    case "Kuwait":
      return CalculationMethod.Kuwait();
    case "NorthAmerica":
      return CalculationMethod.NorthAmerica();
    case "Karachi":
      return CalculationMethod.Karachi();
    case "Singapore":
      return CalculationMethod.Singapore();
    case "Turkey":
      return CalculationMethod.Turkey();
    default:
      return CalculationMethod.UmmAlQura();
  }
}

export function formatTime12Hour(
  date: Date,
  timezone: string,
  locale: "ar" | "en"
): string {
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  }
}

export function getHijriParts(date: Date, timezone: string = "Asia/Riyadh") {
  const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    timeZone: timezone,
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(date);

  const day = Number(parts.find((p) => p.type === "day")?.value ?? 1);
  const month = Number(parts.find((p) => p.type === "month")?.value ?? 1);
  const year = Number(parts.find((p) => p.type === "year")?.value ?? 1448);

  return { day, month, year };
}

export function formatHijriDate(
  date: Date,
  timezone: string = "Asia/Riyadh",
  locale: "ar" | "en" = "ar"
): string {
  try {
    return new Intl.DateTimeFormat(
      locale === "ar"
        ? "ar-SA-u-ca-islamic-umalqura"
        : "en-US-u-ca-islamic-umalqura",
      {
        timeZone: timezone,
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    ).format(date);
  } catch {
    return date.toDateString();
  }
}

export function formatGregorianDate(
  date: Date,
  timezone: string = "Asia/Riyadh",
  locale: "ar" | "en" = "ar"
): string {
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
      timeZone: timezone,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

export function computePrayerDay(options: {
  latitude: number;
  longitude: number;
  timezone: string;
  methodId: PrayerMethodId;
  asrSchool?: "shafi" | "hanafi";
  now?: Date;
}): ComputedPrayerDay {
  const now = options.now ?? new Date();
  const coords = new Coordinates(options.latitude, options.longitude);
  const params = getMethodParams(options.methodId);
  params.madhab = options.asrSchool === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;

  const pt = new PrayerTimes(coords, now, params);

  const buildList = (times: PrayerTimes): PrayerScheduleItem[] => [
    {
      key: "fajr",
      nameAr: "الفجر",
      nameEn: "Fajr",
      time: times.fajr,
      formatted12Ar: formatTime12Hour(times.fajr, options.timezone, "ar"),
      formatted12En: formatTime12Hour(times.fajr, options.timezone, "en"),
    },
    {
      key: "sunrise",
      nameAr: "الشروق",
      nameEn: "Sunrise",
      time: times.sunrise,
      formatted12Ar: formatTime12Hour(times.sunrise, options.timezone, "ar"),
      formatted12En: formatTime12Hour(times.sunrise, options.timezone, "en"),
    },
    {
      key: "dhuhr",
      nameAr: "الظهر",
      nameEn: "Dhuhr",
      time: times.dhuhr,
      formatted12Ar: formatTime12Hour(times.dhuhr, options.timezone, "ar"),
      formatted12En: formatTime12Hour(times.dhuhr, options.timezone, "en"),
    },
    {
      key: "asr",
      nameAr: "العصر",
      nameEn: "Asr",
      time: times.asr,
      formatted12Ar: formatTime12Hour(times.asr, options.timezone, "ar"),
      formatted12En: formatTime12Hour(times.asr, options.timezone, "en"),
    },
    {
      key: "maghrib",
      nameAr: "المغرب",
      nameEn: "Maghrib",
      time: times.maghrib,
      formatted12Ar: formatTime12Hour(times.maghrib, options.timezone, "ar"),
      formatted12En: formatTime12Hour(times.maghrib, options.timezone, "en"),
    },
    {
      key: "isha",
      nameAr: "العشاء",
      nameEn: "Isha",
      time: times.isha,
      formatted12Ar: formatTime12Hour(times.isha, options.timezone, "ar"),
      formatted12En: formatTime12Hour(times.isha, options.timezone, "en"),
    },
  ];

  const todayPrayers = buildList(pt);
  const upcoming = todayPrayers.find(
    (p) => p.key !== "sunrise" && p.time.getTime() > now.getTime()
  );

  let nextPrayer: PrayerScheduleItem;
  if (upcoming) {
    nextPrayer = upcoming;
  } else {
    const tomorrow = new Date(now.getTime() + 86_400_000);
    const tomorrowPt = new PrayerTimes(coords, tomorrow, params);
    const tomorrowList = buildList(tomorrowPt);
    nextPrayer = tomorrowList[0];
  }

  return {
    prayers: todayPrayers,
    nextPrayer,
    countdownMs: Math.max(0, nextPrayer.time.getTime() - now.getTime()),
    hijriAr: formatHijriDate(now, options.timezone, "ar"),
    hijriEn: formatHijriDate(now, options.timezone, "en"),
    gregorianAr: formatGregorianDate(now, options.timezone, "ar"),
    gregorianEn: formatGregorianDate(now, options.timezone, "en"),
    timezone: options.timezone,
  };
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");
}

export interface RamadanStatus {
  isRamadan: boolean;
  currentRamadanDay?: number;
  currentHijriYear: number;
  daysUntilRamadan: number;
  hoursUntilRamadan: number;
  minutesUntilRamadan: number;
  secondsUntilRamadan: number;
  targetGregorianDate: Date;
  targetHijriYear: number;
}

/**
 * Computes exact Ramadan status and countdown using the official Umm al-Qura calendar.
 */
export function getRamadanStatus(
  now: Date = new Date(),
  timezone: string = "Asia/Riyadh"
): RamadanStatus {
  const current = getHijriParts(now, timezone);

  if (current.month === 9) {
    // Currently in Ramadan — find 1 Shawwal for Eid al-Fitr reference
    let probe = new Date(now.getTime());
    for (let i = 1; i <= 32; i++) {
      probe = new Date(now.getTime() + i * 86_400_000);
      const hp = getHijriParts(probe, timezone);
      if (hp.month === 10 && hp.day === 1) break;
    }
    const target = new Date(
      Date.UTC(probe.getUTCFullYear(), probe.getUTCMonth(), probe.getUTCDate(), 0, 0, 0)
    );
    const diff = Math.max(0, target.getTime() - now.getTime());
    return {
      isRamadan: true,
      currentRamadanDay: current.day,
      currentHijriYear: current.year,
      daysUntilRamadan: Math.floor(diff / 86_400_000),
      hoursUntilRamadan: Math.floor((diff % 86_400_000) / 3_600_000),
      minutesUntilRamadan: Math.floor((diff % 3_600_000) / 60_000),
      secondsUntilRamadan: Math.floor((diff % 60_000) / 1000),
      targetGregorianDate: target,
      targetHijriYear: current.year,
    };
  }

  let targetDate = new Date(now.getTime());
  let targetYear = current.year;
  for (let i = 1; i <= 360; i++) {
    const candidate = new Date(now.getTime() + i * 86_400_000);
    const hp = getHijriParts(candidate, timezone);
    if (hp.month === 9 && hp.day === 1) {
      targetDate = new Date(
        candidate.getFullYear(),
        candidate.getMonth(),
        candidate.getDate(),
        0,
        0,
        0
      );
      targetYear = hp.year;
      break;
    }
  }

  const diff = Math.max(0, targetDate.getTime() - now.getTime());
  return {
    isRamadan: false,
    currentHijriYear: current.year,
    daysUntilRamadan: Math.floor(diff / 86_400_000),
    hoursUntilRamadan: Math.floor((diff % 86_400_000) / 3_600_000),
    minutesUntilRamadan: Math.floor((diff % 3_600_000) / 60_000),
    secondsUntilRamadan: Math.floor((diff % 60_000) / 1000),
    targetGregorianDate: targetDate,
    targetHijriYear: targetYear,
  };
}

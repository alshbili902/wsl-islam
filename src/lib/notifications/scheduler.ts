import { CITIES } from "@/data/cities";
import { computePrayerDay, type PrayerNameKey } from "@/lib/prayer/calculator";
import type {
  CityLocation,
  NotificationPreferencesState,
  PrayerMethodId,
} from "@/types/islamic";

export const NOTIFICATION_PREFS_STORAGE_KEY = "wasl_notification_prefs_v1";
export const NOTIFICATION_DEDUP_STORAGE_KEY = "wasl_notification_dedup_v1";
export const NOTIFICATION_LOCATION_STORAGE_KEY = "wasl_notification_city_v1";

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferencesState = {
  masterEnabled: false,
  prayers: {
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
    leadMinutes: 10,
  },
  quran: {
    morningEnabled: true,
    morningTime: "06:30",
    afternoonEnabled: false,
    afternoonTime: "16:30",
    eveningEnabled: false,
    eveningTime: "20:30",
    khatmahEnabled: true,
    khatmahTime: "21:00",
    customEnabled: false,
    customTime: "14:00",
    customLabelAr: "ورد التدبر والمراجعة اليومي",
    customLabelEn: "Daily Quran Reflection & Review",
  },
  adhkar: {
    morningEnabled: true,
    morningTime: "06:00",
    eveningEnabled: true,
    eveningTime: "17:30",
    afterPrayerEnabled: false,
    bedtimeEnabled: true,
    bedtimeTime: "22:30",
  },
  quietHours: {
    enabled: false,
    start: "23:30",
    end: "04:00",
  },
};

export interface DueReminder {
  key: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  url: string;
  tag: string;
}

export function parseHhMmToMinutes(hhmm: string): number | null {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(hhmm.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function isWithinQuietHours(
  hhmm: string,
  quiet: { enabled: boolean; start: string; end: string }
): boolean {
  if (!quiet.enabled) return false;
  const current = parseHhMmToMinutes(hhmm);
  const start = parseHhMmToMinutes(quiet.start);
  const end = parseHhMmToMinutes(quiet.end);
  if (current === null || start === null || end === null) return false;
  if (start === end) return false;
  if (start < end) {
    return current >= start && current < end;
  }
  return current >= start || current < end;
}

export function getZonedClockParts(
  date: Date,
  timeZone: string
): { dateKey: string; hhmm: string; minutesOfDay: number } {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value || "00";
    const year = get("year");
    const month = get("month");
    const day = get("day");
    let hour = Number(get("hour"));
    if (hour === 24) hour = 0;
    const minute = Number(get("minute"));
    const hhmm = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    return {
      dateKey: `${year}-${month}-${day}`,
      hhmm,
      minutesOfDay: hour * 60 + minute,
    };
  } catch {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const hhmm = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    const dateKey = date.toISOString().slice(0, 10);
    return { dateKey, hhmm, minutesOfDay: hour * 60 + minute };
  }
}

const PRAYER_NAMES: Record<PrayerNameKey, { ar: string; en: string }> = {
  fajr: { ar: "الفجر", en: "Fajr" },
  sunrise: { ar: "الشروق", en: "Sunrise" },
  dhuhr: { ar: "الظهر", en: "Dhuhr" },
  asr: { ar: "العصر", en: "Asr" },
  maghrib: { ar: "المغرب", en: "Maghrib" },
  isha: { ar: "العشاء", en: "Isha" },
};

function isMinuteTriggered(
  nowMinutes: number,
  targetHhMm: string,
  windowMinutes: number
): boolean {
  const targetMinutes = parseHhMmToMinutes(targetHhMm);
  if (targetMinutes === null) return false;
  const diff = (nowMinutes - targetMinutes + 1440) % 1440;
  return diff >= 0 && diff < windowMinutes;
}

export function evaluateDueReminders(options: {
  prefs: NotificationPreferencesState;
  now?: Date;
  city?: CityLocation;
  methodId?: PrayerMethodId;
  lastNotified?: Record<string, string>;
  windowMinutes?: number;
}): DueReminder[] {
  const {
    prefs,
    now = new Date(),
    city = CITIES[0],
    methodId = city.defaultMethodId,
    lastNotified = {},
    windowMinutes = 5,
  } = options;

  if (!prefs.masterEnabled) return [];

  const { dateKey, hhmm, minutesOfDay } = getZonedClockParts(now, city.timezone);
  if (isWithinQuietHours(hhmm, prefs.quietHours)) {
    return [];
  }

  const due: DueReminder[] = [];
  const windowMs = windowMinutes * 60_000;
  const prayerDay = computePrayerDay({
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone,
    methodId,
    now,
  });

  const enabledPrayers: Array<"fajr" | "dhuhr" | "asr" | "maghrib" | "isha"> = [
    "fajr",
    "dhuhr",
    "asr",
    "maghrib",
    "isha",
  ];

  for (const prayerId of enabledPrayers) {
    const prayerEntry = prayerDay.prayers.find((p) => p.key === prayerId);
    if (!prayerEntry) continue;

    if (prefs.prayers[prayerId]) {
      const triggerAtMs = prayerEntry.time.getTime() - prefs.prayers.leadMinutes * 60_000;
      const elapsed = now.getTime() - triggerAtMs;
      const key = `${dateKey}:prayer:${prayerId}:lead-${prefs.prayers.leadMinutes}`;
      if (elapsed >= 0 && elapsed < windowMs && !lastNotified[key]) {
        const label = PRAYER_NAMES[prayerId];
        const leadNoteAr =
          prefs.prayers.leadMinutes === 0
            ? `حان الآن وقت صلاة ${label.ar} (${city.nameAr}).`
            : `متبقٍ ${prefs.prayers.leadMinutes} دقائق على صلاة ${label.ar} (${city.nameAr}).`;
        const leadNoteEn =
          prefs.prayers.leadMinutes === 0
            ? `It is time for ${label.en} prayer (${city.nameEn}).`
            : `${prefs.prayers.leadMinutes} minutes until ${label.en} prayer (${city.nameEn}).`;

        due.push({
          key,
          titleAr: `تذكير صلاة ${label.ar} — وصل الإسلامية`,
          titleEn: `${label.en} Prayer Reminder — Wasl Islamic`,
          bodyAr: leadNoteAr,
          bodyEn: leadNoteEn,
          url: "/prayer-times",
          tag: `wasl-prayer-${prayerId}`,
        });
      }
    }

    if (prefs.adhkar.afterPrayerEnabled) {
      const afterAtMs = prayerEntry.time.getTime() + 20 * 60_000;
      const elapsedAfter = now.getTime() - afterAtMs;
      const afterKey = `${dateKey}:adhkar-after:${prayerId}`;
      if (elapsedAfter >= 0 && elapsedAfter < windowMs && !lastNotified[afterKey]) {
        const label = PRAYER_NAMES[prayerId];
        due.push({
          key: afterKey,
          titleAr: `أذكار بعد صلاة ${label.ar}`,
          titleEn: `Adhkar After ${label.en} Prayer`,
          bodyAr: "لا تنسَ الأذكار المأثورة بعد السلام من الصلاة المكتوبة.",
          bodyEn: "Remember the authentic post-prayer remembrances.",
          url: "/adhkar",
          tag: `wasl-after-prayer-${prayerId}`,
        });
      }
    }
  }

  const fixedSlots: Array<{
    enabled: boolean;
    time: string;
    id: string;
    titleAr: string;
    titleEn: string;
    bodyAr: string;
    bodyEn: string;
    url: string;
  }> = [
    {
      enabled: prefs.adhkar.morningEnabled,
      time: prefs.adhkar.morningTime,
      id: "adhkar-morning",
      titleAr: "أذكار الصباح — وصل الإسلامية",
      titleEn: "Morning Adhkar — Wasl Islamic",
      bodyAr: "ابدأ يومك بذكر الله وحصن المسلم من أذكار الصباح الصحيحة.",
      bodyEn: "Begin your morning with authentic Morning Adhkar.",
      url: "/adhkar?category=morning",
    },
    {
      enabled: prefs.adhkar.eveningEnabled,
      time: prefs.adhkar.eveningTime,
      id: "adhkar-evening",
      titleAr: "أذكار المساء — وصل الإسلامية",
      titleEn: "Evening Adhkar — Wasl Islamic",
      bodyAr: "حان وقت أذكار المساء المأثورة للسكينة والطمأنينة.",
      bodyEn: "Time for authentic Evening Adhkar.",
      url: "/adhkar?category=evening",
    },
    {
      enabled: prefs.adhkar.bedtimeEnabled,
      time: prefs.adhkar.bedtimeTime,
      id: "adhkar-bedtime",
      titleAr: "أذكار النوم — وصل الإسلامية",
      titleEn: "Bedtime Adhkar — Wasl Islamic",
      bodyAr: "اختم يومك بأذكار النوم وآية الكرسي وخواتيم البقرة.",
      bodyEn: "End your day with authentic Bedtime Adhkar.",
      url: "/adhkar?category=sleep",
    },
    {
      enabled: prefs.quran.morningEnabled,
      time: prefs.quran.morningTime,
      id: "quran-morning",
      titleAr: "ورد القرآن الصباحي — وصل الإسلامية",
      titleEn: "Morning Quran Reading — Wasl Islamic",
      bodyAr: "وقت مخصص لتلاوة وردك الصباحي من كتاب الله بتدبر.",
      bodyEn: "Time for your morning Quran recitation and reflection.",
      url: "/mushaf",
    },
    {
      enabled: prefs.quran.afternoonEnabled,
      time: prefs.quran.afternoonTime,
      id: "quran-afternoon",
      titleAr: "ورد القرآن العصري — وصل الإسلامية",
      titleEn: "Afternoon Quran Reading — Wasl Islamic",
      bodyAr: "تذكير بتلاوة وردك القرآني في فترة العصر.",
      bodyEn: "Reminder for your afternoon Quran reading.",
      url: "/mushaf",
    },
    {
      enabled: prefs.quran.eveningEnabled,
      time: prefs.quran.eveningTime,
      id: "quran-evening",
      titleAr: "ورد القرآن المسائي — وصل الإسلامية",
      titleEn: "Evening Quran Reading — Wasl Islamic",
      bodyAr: "اجعل لنفسك نصيبًا من تلاوة القرآن وتدبره هذا المساء.",
      bodyEn: "Take time for Quran recitation and Tafsir this evening.",
      url: "/mushaf",
    },
    {
      enabled: prefs.quran.khatmahEnabled,
      time: prefs.quran.khatmahTime,
      id: "quran-khatmah",
      titleAr: "متابعة ورد الختمة اليومي — وصل الإسلامية",
      titleEn: "Daily Khatmah Progress Reminder",
      bodyAr: "تذكير بمراجعة ورد ختمة القرآن الكريم وتسجيل إنجازك اليومي.",
      bodyEn: "Check off today's pages in your Quran Khatmah planner.",
      url: "/khatmah",
    },
    {
      enabled: prefs.quran.customEnabled,
      time: prefs.quran.customTime,
      id: "quran-custom",
      titleAr: prefs.quran.customLabelAr || "تذكير مخصص — وصل الإسلامية",
      titleEn: prefs.quran.customLabelEn || "Custom Reminder — Wasl Islamic",
      bodyAr: "موعد تذكيرك الشخصي في منصة وصل الإسلامية.",
      bodyEn: "Your scheduled personal Islamic learning reminder.",
      url: "/tafsir",
    },
  ];

  for (const slot of fixedSlots) {
    if (!slot.enabled) continue;
    const key = `${dateKey}:${slot.id}`;
    if (!lastNotified[key] && isMinuteTriggered(minutesOfDay, slot.time, windowMinutes)) {
      due.push({
        key,
        titleAr: slot.titleAr,
        titleEn: slot.titleEn,
        bodyAr: slot.bodyAr,
        bodyEn: slot.bodyEn,
        url: slot.url,
        tag: `wasl-${slot.id}`,
      });
    }
  }

  return due;
}

export function mergeNotificationPreferences(
  raw: Partial<NotificationPreferencesState> | null | undefined
): NotificationPreferencesState {
  if (!raw) return DEFAULT_NOTIFICATION_PREFS;
  return {
    masterEnabled:
      typeof raw.masterEnabled === "boolean"
        ? raw.masterEnabled
        : DEFAULT_NOTIFICATION_PREFS.masterEnabled,
    prayers: { ...DEFAULT_NOTIFICATION_PREFS.prayers, ...(raw.prayers || {}) },
    quran: { ...DEFAULT_NOTIFICATION_PREFS.quran, ...(raw.quran || {}) },
    adhkar: { ...DEFAULT_NOTIFICATION_PREFS.adhkar, ...(raw.adhkar || {}) },
    quietHours: { ...DEFAULT_NOTIFICATION_PREFS.quietHours, ...(raw.quietHours || {}) },
  };
}

// Quran API utilities using api.alquran.cloud
const QURAN_API = 'https://api.alquran.cloud/v1';
const PRAYER_API = 'https://api.aladhan.com/v1';

// ============ Quran Data ============

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  hizbQuarter: number;
}

export interface SurahFull {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export interface Reciter {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
}

export async function fetchSurahs(): Promise<Surah[]> {
  try {
    const res = await fetch(`${QURAN_API}/surah`, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error('Error fetching surahs:', err);
    return [];
  }
}

export async function fetchSurah(number: number): Promise<SurahFull | null> {
  try {
    const res = await fetch(`${QURAN_API}/surah/${number}`, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.data || null;
  } catch (err) {
    console.error('Error fetching surah:', err);
    return null;
  }
}

export async function fetchSurahWithTranslation(number: number, edition: string = 'ar.muyassar'): Promise<SurahFull | null> {
  try {
    const res = await fetch(`${QURAN_API}/surah/${number}/${edition}`, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.data || null;
  } catch (err) {
    console.error('Error fetching translation:', err);
    return null;
  }
}

export async function fetchReciters(): Promise<Reciter[]> {
  try {
    const res = await fetch(`${QURAN_API}/edition?format=audio&language=ar`, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.data || []).filter((r: Reciter) => r.format === 'audio');
  } catch (err) {
    console.error('Error fetching reciters:', err);
    return [];
  }
}

export async function fetchSurahAudio(surahNumber: number, reciterEdition: string): Promise<Ayah[]> {
  try {
    const res = await fetch(`${QURAN_API}/surah/${surahNumber}/${reciterEdition}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.data?.ayahs || [];
  } catch (err) {
    console.error('Error fetching audio:', err);
    return [];
  }
}

export const RECITER_AUDIO_SERVERS: Record<string, string> = {
  'ar.alafasy': 'https://server8.mp3quran.net/afs/',
  'ar.abdulbasitmurattal': 'https://server7.mp3quran.net/basit/',
  'ar.abdulbasitmujawwad': 'https://server7.mp3quran.net/basit/Almusshaf-Al-Mojawwad/',
  'ar.husary': 'https://server13.mp3quran.net/husr/',
  'ar.minshawi': 'https://server10.mp3quran.net/minsh/',
  'ar.minshawimujawwad': 'https://server10.mp3quran.net/minsh/Almusshaf-Al-Mojawwad/',
  'ar.saoodshuraym': 'https://server7.mp3quran.net/shur/',
  'ar.mahermuaiqly': 'https://server12.mp3quran.net/maher/',
  'ar.saadalghamidi': 'https://server7.mp3quran.net/s_gmd/',
  'ar.ahmedajamy': 'https://server10.mp3quran.net/ajm/',
  'ar.hudhaify': 'https://server9.mp3quran.net/hthfi/',
  'ar.sudais': 'https://server11.mp3quran.net/sds/',
  'ar.yasser': 'https://server11.mp3quran.net/yasser/',
  'ar.qatami': 'https://server6.mp3quran.net/qtm/',
  'ar.shatri': 'https://server11.mp3quran.net/shatri/',
};

export function getAudioUrl(reciterEdition: string, surahNumber: number): string {
  const formatted = String(surahNumber).padStart(3, '0');
  const baseUrl = RECITER_AUDIO_SERVERS[reciterEdition] || RECITER_AUDIO_SERVERS['ar.alafasy'];
  return `${baseUrl}${formatted}.mp3`;
}

// ============ Prayer Times ============

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface PrayerData {
  timings: PrayerTimings;
  date: {
    readable: string;
    timestamp: string;
    hijri: {
      date: string;
      day: string;
      month: { number: number; en: string; ar: string };
      year: string;
      weekday: { en: string; ar: string };
    };
    gregorian: {
      date: string;
      day: string;
      month: { number: number; en: string };
      year: string;
      weekday: { en: string };
    };
  };
}

export interface CityCoords {
  name: string;
  nameAr: string;
  country: string;
  countryAr: string;
  lat: number;
  lng: number;
  timezone: string;
  method: number; // calculation method
}

export const CITIES: Record<string, CityCoords> = {
  riyadh:    { name: 'Riyadh',    nameAr: 'الرياض',         country: 'Saudi Arabia', countryAr: 'المملكة العربية السعودية', lat: 24.7136, lng: 46.6753, timezone: 'Asia/Riyadh',    method: 4 },
  makkah:    { name: 'Makkah',    nameAr: 'مكة المكرمة',    country: 'Saudi Arabia', countryAr: 'المملكة العربية السعودية', lat: 21.4225, lng: 39.8262, timezone: 'Asia/Riyadh',    method: 4 },
  madinah:   { name: 'Madinah',   nameAr: 'المدينة المنورة', country: 'Saudi Arabia', countryAr: 'المملكة العربية السعودية', lat: 24.4539, lng: 39.6142, timezone: 'Asia/Riyadh',    method: 4 },
  jeddah:    { name: 'Jeddah',    nameAr: 'جدة',            country: 'Saudi Arabia', countryAr: 'المملكة العربية السعودية', lat: 21.5433, lng: 39.1728, timezone: 'Asia/Riyadh',    method: 4 },
  cairo:     { name: 'Cairo',     nameAr: 'القاهرة',        country: 'Egypt',        countryAr: 'مصر',                     lat: 30.0444, lng: 31.2357, timezone: 'Africa/Cairo',   method: 5 },
  dubai:     { name: 'Dubai',     nameAr: 'دبي',            country: 'UAE',          countryAr: 'الإمارات العربية المتحدة', lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai',     method: 16 },
  jerusalem: { name: 'Jerusalem', nameAr: 'القدس الشريف',   country: 'Palestine',    countryAr: 'فلسطين',                  lat: 31.7683, lng: 35.2137, timezone: 'Asia/Jerusalem', method: 4 },
  amman:     { name: 'Amman',     nameAr: 'عَمّان',          country: 'Jordan',       countryAr: 'الأردن',                  lat: 31.9454, lng: 35.9284, timezone: 'Asia/Amman',     method: 4 },
  kuwait:    { name: 'Kuwait',    nameAr: 'الكويت',         country: 'Kuwait',       countryAr: 'الكويت',                  lat: 29.3759, lng: 47.9774, timezone: 'Asia/Kuwait',    method: 9 },
  doha:      { name: 'Doha',      nameAr: 'الدوحة',         country: 'Qatar',        countryAr: 'قطر',                     lat: 25.2854, lng: 51.5310, timezone: 'Asia/Qatar',     method: 10 },
  istanbul:  { name: 'Istanbul',  nameAr: 'إسطنبول',        country: 'Turkey',       countryAr: 'تركيا',                   lat: 41.0082, lng: 28.9784, timezone: 'Europe/Istanbul',method: 13 },
  london:    { name: 'London',    nameAr: 'لندن',           country: 'UK',           countryAr: 'المملكة المتحدة',         lat: 51.5074, lng: -0.1278, timezone: 'Europe/London',  method: 15 },
  baghdad:   { name: 'Baghdad',   nameAr: 'بغداد',          country: 'Iraq',         countryAr: 'العراق',                  lat: 33.3152, lng: 44.3661, timezone: 'Asia/Baghdad',   method: 4 },
  beirut:    { name: 'Beirut',    nameAr: 'بيروت',          country: 'Lebanon',      countryAr: 'لبنان',                   lat: 33.8938, lng: 35.5018, timezone: 'Asia/Beirut',    method: 4 },
  manama:    { name: 'Manama',    nameAr: 'المنامة',        country: 'Bahrain',      countryAr: 'البحرين',                 lat: 26.2285, lng: 50.5860, timezone: 'Asia/Bahrain',   method: 4 },
  muscat:    { name: 'Muscat',    nameAr: 'مسقط',           country: 'Oman',         countryAr: 'عُمان',                   lat: 23.5880, lng: 58.3829, timezone: 'Asia/Muscat',    method: 4 },
};

export async function fetchPrayerTimes(lat: number, lng: number, method: number = 4): Promise<PrayerData | null> {
  try {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const res = await fetch(
      `${PRAYER_API}/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=${method}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.data || null;
  } catch (err) {
    console.error('Error fetching prayer times:', err);
    return null;
  }
}

// ============ Hijri Date ============

export async function fetchHijriDate(): Promise<PrayerData['date'] | null> {
  try {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const res = await fetch(
      `${PRAYER_API}/gpiToH/${dd}-${mm}-${yyyy}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.data || null;
  } catch (err) {
    console.error('Error fetching Hijri date:', err);
    return null;
  }
}

// ============ Time Utilities ============

export function formatTime12h(time24: string): string {
  // Input like "04:31" or "04:31 (AST)"
  const cleaned = time24.replace(/\s*\(.*\)/, '').trim();
  const [hStr, mStr] = cleaned.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr;
  const period = h >= 12 ? 'م' : 'ص';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${period}`;
}

export function getNextPrayer(timings: PrayerTimings): { name: string; nameAr: string; time: string } | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const prayers = [
    { name: 'Fajr',    nameAr: 'الفجر',   time: timings.Fajr },
    { name: 'Sunrise', nameAr: 'الشروق',  time: timings.Sunrise },
    { name: 'Dhuhr',   nameAr: 'الظهر',   time: timings.Dhuhr },
    { name: 'Asr',     nameAr: 'العصر',   time: timings.Asr },
    { name: 'Maghrib', nameAr: 'المغرب',  time: timings.Maghrib },
    { name: 'Isha',    nameAr: 'العشاء',  time: timings.Isha },
  ];

  for (const prayer of prayers) {
    const cleaned = prayer.time.replace(/\s*\(.*\)/, '').trim();
    const [h, m] = cleaned.split(':').map(Number);
    const prayerMinutes = h * 60 + m;
    if (prayerMinutes > currentMinutes) {
      return prayer;
    }
  }
  // If all prayers passed, next is Fajr tomorrow
  return { ...prayers[0], time: prayers[0].time };
}

export function getCountdown(timeStr: string): { hours: string; minutes: string; seconds: string } {
  const cleaned = timeStr.replace(/\s*\(.*\)/, '').trim();
  const [h, m] = cleaned.split(':').map(Number);
  const now = new Date();
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  const diff = target.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

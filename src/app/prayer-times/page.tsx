'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock, Compass as CompassIcon, MapPin, Calendar, Sun, Moon,
  Volume2, Sparkles, ChevronLeft, Bell, CheckCircle2
} from 'lucide-react';
import { CITIES, type PrayerTimings, formatTime12h, getNextPrayer, getCountdown } from '@/lib/api';

const CALC_METHODS = [
  { id: 4, name: 'جامعة أم القرى - مكة المكرمة' },
  { id: 3, name: 'رابطة العالم الإسلامي' },
  { id: 5, name: 'الهيئة المصرية العامة للمساحة' },
  { id: 9, name: 'وزارة الأوقاف والشؤون الإسلامية - الكويت' },
  { id: 10, name: 'قطر - الشؤون الإسلامية' },
  { id: 16, name: 'دبي - الشؤون الإسلامية' },
  { id: 13, name: 'رئاسة الشؤون الدينية - تركيا' },
  { id: 2, name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)' },
];

export default function PrayerTimesPage() {
  const [selectedCityKey, setSelectedCityKey] = useState<string>('riyadh');
  const [selectedMethod, setSelectedMethod] = useState<number>(4);
  const [timings, setTimings] = useState<PrayerTimings>({
    Fajr: '04:52',
    Sunrise: '06:10',
    Dhuhr: '11:58',
    Asr: '15:18',
    Maghrib: '17:46',
    Isha: '19:16',
  });
  const [hijriDate, setHijriDate] = useState('14 شعبان 1447 هـ');
  const [gregorianDate, setGregorianDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [athanTest, setAthanTest] = useState(false);

  const city = CITIES[selectedCityKey] || CITIES.riyadh;

  // Qibla calculation from lat/lng to Makkah (21.4225, 39.8262)
  const calculateQiblaAngle = (lat: number, lng: number) => {
    const makkahLat = (21.4225 * Math.PI) / 180;
    const makkahLng = (39.8262 * Math.PI) / 180;
    const userLat = (lat * Math.PI) / 180;
    const userLng = (lng * Math.PI) / 180;

    const y = Math.sin(makkahLng - userLng);
    const x = Math.cos(userLat) * Math.tan(makkahLat) - Math.sin(userLat) * Math.cos(makkahLng - userLng);
    let qibla = (Math.atan2(y, x) * 180) / Math.PI;
    qibla = (qibla + 360) % 360;
    return Math.round(qibla);
  };

  const qiblaAngle = calculateQiblaAngle(city.lat, city.lng);

  // Set Gregorian client-side
  useEffect(() => {
    const today = new Date();
    setGregorianDate(today.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  // Fetch Prayer Times
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();

        const res = await fetch(
          `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${city.lat}&longitude=${city.lng}&method=${selectedMethod}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.data?.timings && isMounted) {
            setTimings(data.data.timings);
            if (data.data.date?.hijri) {
              const h = data.data.date.hijri;
              setHijriDate(`${h.day} ${h.month.ar} ${h.year} هـ`);
            }
          }
        }
      } catch (err) {
        console.warn('API error, keeping fallback timings:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [city, selectedMethod]);

  const [nextPrayer, setNextPrayer] = useState<{ name: string; nameAr: string; time: string } | null>(null);

  useEffect(() => {
    setNextPrayer(getNextPrayer(timings));
  }, [timings]);

  const [athanAudio, setAthanAudio] = useState<HTMLAudioElement | null>(null);

  const playAthanDemo = () => {
    if (athanTest && athanAudio) {
      athanAudio.pause();
      athanAudio.currentTime = 0;
      setAthanTest(false);
      return;
    }

    const audio = new Audio('/audio/adhan.mp3');
    setAthanAudio(audio);
    setAthanTest(true);

    audio.play().catch((err) => {
      console.warn('Local adhan error, trying fallback:', err);
      audio.src = 'https://www.islamcan.com/audio/adhan/azan2.mp3';
      audio.play().catch(console.error);
    });

    audio.onended = () => {
      setAthanTest(false);
    };
  };

  return (
    <main style={{ minHeight: '80vh', padding: '2.5rem 1.25rem 5rem' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.9rem',
            borderRadius: '20px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.88rem',
            fontWeight: 700,
            marginBottom: '0.75rem'
          }}>
            <Clock size={16} />
            مواقيت الصلاة والقبلة
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-cairo)',
            marginBottom: '0.5rem'
          }}>
            مواقيت الصلاة في {city.nameAr}
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
            {hijriDate} • الموافق {gregorianDate}
          </p>
        </div>

        {/* Location & Method Bar */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* City Selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <MapPin size={20} style={{ color: 'var(--primary)' }} />
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>المدينة والدولة</label>
              <select
                value={selectedCityKey}
                onChange={(e) => {
                  setSelectedCityKey(e.target.value);
                  const newCity = CITIES[e.target.value];
                  if (newCity) setSelectedMethod(newCity.method);
                }}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              >
                {Object.entries(CITIES).map(([key, c]) => (
                  <option key={key} value={key}>
                    {c.nameAr} ({c.countryAr})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Method Selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Calendar size={20} style={{ color: 'var(--gold)' }} />
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>طريقة الحساب الفقهية</label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(parseInt(e.target.value, 10))}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              >
                {CALC_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Test Adhan */}
          <button
            onClick={playAthanDemo}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-gold)',
              background: 'var(--gold-light)',
              color: 'var(--gold)',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            <Volume2 size={16} />
            {athanTest ? 'جارٍ تشغيل الأذان...' : 'سماع صوت الأذان'}
          </button>
        </div>

        {/* 6 Prayers Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          {[
            { name: 'الفجر', key: 'Fajr', time: timings.Fajr, desc: 'وقت الإمساك وبداية الصيام', icon: Sun },
            { name: 'الشروق', key: 'Sunrise', time: timings.Sunrise, desc: 'نهاية وقت صلاة الفجر', icon: Sun },
            { name: 'الظهر', key: 'Dhuhr', time: timings.Dhuhr, desc: 'زوال الشمس عن كبد السماء', icon: Sun },
            { name: 'العصر', key: 'Asr', time: timings.Asr, desc: 'صيرورة ظل الشيء مثليه', icon: Sun },
            { name: 'المغرب', key: 'Maghrib', time: timings.Maghrib, desc: 'غروب الشمس ووقت الإفطار', icon: Moon },
            { name: 'العشاء', key: 'Isha', time: timings.Isha, desc: 'مغيب الشفق الأحمر', icon: Moon },
          ].map((prayer) => {
            const isNext = nextPrayer?.nameAr === prayer.name;
            const Icon = prayer.icon;

            return (
              <div
                key={prayer.key}
                style={{
                  background: isNext
                    ? 'linear-gradient(135deg, var(--primary) 0%, var(--emerald-deep) 100%)'
                    : 'var(--bg-card)',
                  color: isNext ? '#FAF8F5' : 'var(--text-main)',
                  border: isNext ? '1px solid var(--border-gold)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.5rem 1.25rem',
                  textAlign: 'center',
                  boxShadow: isNext ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                  position: 'relative',
                  transform: isNext ? 'scale(1.03)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {isNext && (
                  <span style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '50%',
                    transform: 'translateX(50%)',
                    background: 'var(--gold)',
                    color: '#FAF8F5',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.75rem',
                    borderRadius: '20px',
                    whiteSpace: 'nowrap'
                  }}>
                    الصلاة القادمة
                  </span>
                )}

                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: isNext ? 'rgba(255, 255, 255, 0.15)' : 'var(--bg-card-subtle)',
                  color: isNext ? 'var(--gold)' : 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem'
                }}>
                  <Icon size={22} />
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.4rem', fontFamily: 'var(--font-cairo)' }}>
                  صلاة {prayer.name}
                </h3>

                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: isNext ? '#FAF8F5' : 'var(--primary)',
                  marginBottom: '0.5rem'
                }}>
                  {formatTime12h(prayer.time)}
                </div>

                <p style={{
                  fontSize: '0.75rem',
                  color: isNext ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-muted)',
                  margin: 0
                }}>
                  {prayer.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Qibla Direction & Fasting Suhur/Iftar Guide */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
        }}>
          
          {/* Qibla Compass Card */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              marginBottom: '1rem'
            }}>
              <CompassIcon size={18} />
              اتجاه القبلة الشريفة (الكعبة المشرفة)
            </div>

            {/* Compass graphic */}
            <div style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              border: '4px dashed var(--border-gold)',
              margin: '1.5rem auto',
              position: 'relative',
              background: 'var(--bg-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Needle */}
              <div style={{
                position: 'absolute',
                width: '6px',
                height: '80px',
                background: 'linear-gradient(to top, var(--text-muted) 50%, #EF4444 50%)',
                borderRadius: '4px',
                transform: `rotate(${qiblaAngle}deg)`,
                transformOrigin: 'bottom center',
                top: '10px',
                transition: 'transform 0.5s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }} />

              {/* Cardinal points */}
              <span style={{ position: 'absolute', top: '8px', fontSize: '0.75rem', fontWeight: 700 }}>شمال</span>
              <span style={{ position: 'absolute', bottom: '8px', fontSize: '0.75rem', fontWeight: 700 }}>جنوب</span>
              <span style={{ position: 'absolute', right: '8px', fontSize: '0.75rem', fontWeight: 700 }}>شرق</span>
              <span style={{ position: 'absolute', left: '8px', fontSize: '0.75rem', fontWeight: 700 }}>غرب</span>

              {/* Center point */}
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'var(--gold)',
                border: '2px solid #FAF8F5',
                zIndex: 2
              }} />
            </div>

            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
              {qiblaAngle}° درجة من الشمال
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              المسافة المقدرة إلى مكة المكرمة من {city.nameAr}: تقع الكعبة المشرفة على إحداثيات (21.42° N, 39.82° E).
            </p>
          </div>

          {/* Fasting & Virtues Box */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--gold)',
                fontWeight: 700,
                fontSize: '0.9rem',
                marginBottom: '1rem'
              }}>
                <Sparkles size={18} />
                أوقات الصيام والإفطار اليوم
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                margin: '1rem 0 1.5rem'
              }}>
                <div style={{
                  background: 'var(--bg-card-subtle)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>الإمساك (أذان الفجر)</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--primary)', marginTop: '0.2rem', display: 'block' }}>
                    {formatTime12h(timings.Fajr)}
                  </strong>
                </div>

                <div style={{
                  background: 'var(--bg-card-subtle)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>الإفطار (أذان المغرب)</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--gold)', marginTop: '0.2rem', display: 'block' }}>
                    {formatTime12h(timings.Maghrib)}
                  </strong>
                </div>
              </div>

              <blockquote style={{
                background: 'var(--primary-light)',
                borderRight: '4px solid var(--primary)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                lineHeight: 1.7,
                color: 'var(--primary-dark)',
                margin: 0
              }}>
                <strong>دعاء الإفطار المأثور:</strong><br />
                «ذَهَبَ الظَّمَأُ، وَابْتَلَّتِ العُرُوقُ، وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ»
              </blockquote>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
              <Link
                href="/ramadan"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--primary)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                برنامج ومواقيت شهر رمضان
                <ChevronLeft size={16} />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}

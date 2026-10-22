'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Play, Pause, Volume2, VolumeX, SkipBack, SkipForward,
  BookOpen, Mic, Search, Download, AlertCircle, RefreshCw
} from 'lucide-react';
import { SURAHS_LIST } from '@/data/surahs';
import { getAudioUrl } from '@/lib/api';

interface Reciter {
  id: string;
  name: string;
  rewaya: string;
  quality: string;
  country: string;
}

const RECITERS_LIST: Reciter[] = [
  { id: 'ar.alafasy', name: 'مشاري راشد العفاسي', rewaya: 'حفص عن عاصم', quality: '128 kbps', country: 'الكويت' },
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد (مرتل)', rewaya: 'حفص عن عاصم', quality: '128 kbps', country: 'مصر' },
  { id: 'ar.abdulbasitmujawwad', name: 'عبد الباسط عبد الصمد (مجود)', rewaya: 'تجويد خاشع', quality: '128 kbps', country: 'مصر' },
  { id: 'ar.husary', name: 'محمود خليل الحصري (مرتل)', rewaya: 'حفص عن عاصم', quality: '128 kbps', country: 'مصر' },
  { id: 'ar.minshawi', name: 'محمد صديق المنشاوي (مرتل)', rewaya: 'حفص عن عاصم', quality: '128 kbps', country: 'مصر' },
  { id: 'ar.minshawimujawwad', name: 'محمد صديق المنشاوي (مجود)', rewaya: 'تجويد متقن', quality: '128 kbps', country: 'مصر' },
  { id: 'ar.mahermuaiqly', name: 'ماهر المعيقلي', rewaya: 'حفص عن عاصم', quality: '128 kbps', country: 'المملكة العربية السعودية' },
  { id: 'ar.saoodshuraym', name: 'سعود الشريم', rewaya: 'حفص عن عاصم', quality: '128 kbps', country: 'المملكة العربية السعودية' },
  { id: 'ar.saadalghamidi', name: 'سعد الغامدي', rewaya: 'حفص عن عاصم', quality: '128 kbps', country: 'المملكة العربية السعودية' },
  { id: 'ar.ahmedajamy', name: 'أحمد بن علي العجمي', rewaya: 'حفص عن عاصم', quality: '128 kbps', country: 'المملكة العربية السعودية' },
  { id: 'ar.hudhaify', name: 'علي بن عبد الرحمن الحذيفي', rewaya: 'حفص عن عاصم', quality: '128 kbps', country: 'المملكة العربية السعودية' },
  { id: 'ar.sudais', name: 'عبد الرحمن السديس', rewaya: 'حفص عن عاصم', quality: '128 kbps', country: 'المملكة العربية السعودية' },
  { id: 'ar.yasser', name: 'ياسر الدوسري', rewaya: 'حفص عن عاصم', quality: '128 kbps', country: 'المملكة العربية السعودية' },
  { id: 'ar.qatami', name: 'ناصر القطامي', rewaya: 'حفص عن عاصم', quality: '128 kbps', country: 'المملكة العربية السعودية' },
  { id: 'ar.shatri', name: 'أبو بكر الشاطري', rewaya: 'حفص عن عاصم', quality: '128 kbps', country: 'المملكة العربية السعودية' },
];

function AudioHubContent() {
  const searchParams = useSearchParams();
  const initialSurah = parseInt(searchParams.get('surah') || '1', 10);

  const [currentSurahNumber, setCurrentSurahNumber] = useState<number>(initialSurah || 1);
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(RECITERS_LIST[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [searchSurah, setSearchSurah] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSurah = SURAHS_LIST.find((s) => s.number === currentSurahNumber) || SURAHS_LIST[0];
  const audioUrl = getAudioUrl(selectedReciter.id, currentSurah.number);

  // Update audio source ONLY when surah or reciter changes
  useEffect(() => {
    setAudioError(null);
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      if (isPlaying) {
        setIsLoadingAudio(true);
        audioRef.current.play().then(() => {
          setIsLoadingAudio(false);
        }).catch((err) => {
          console.warn('Playback error:', err);
          setIsPlaying(false);
          setIsLoadingAudio(false);
        });
      }
    }
  }, [currentSurahNumber, selectedReciter, audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    setAudioError(null);
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoadingAudio(true);
      if (!audioRef.current.src || audioRef.current.src !== audioUrl) {
        audioRef.current.src = audioUrl;
      }
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsLoadingAudio(false);
      }).catch((err) => {
        console.error('Play failed:', err);
        setAudioError('تعذر تشغيل التلاوة حالياً، يرجى المحاولة مرة أخرى.');
        setIsPlaying(false);
        setIsLoadingAudio(false);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const nextSurah = () => {
    if (currentSurahNumber < 114) {
      setCurrentSurahNumber((prev) => prev + 1);
    }
  };

  const prevSurah = () => {
    if (currentSurahNumber > 1) {
      setCurrentSurahNumber((prev) => prev - 1);
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const filteredSurahs = SURAHS_LIST.filter(
    (s) =>
      s.name.includes(searchSurah.trim()) ||
      s.englishName.toLowerCase().includes(searchSurah.toLowerCase().trim()) ||
      String(s.number) === searchSurah.trim()
  );

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onWaiting={() => setIsLoadingAudio(true)}
        onCanPlay={() => setIsLoadingAudio(false)}
        onEnded={nextSurah}
        onPlay={() => {
          setIsPlaying(true);
          setIsLoadingAudio(false);
        }}
        onPause={() => setIsPlaying(false)}
        onError={(e) => {
          console.warn('Audio tag error:', e);
          setIsPlaying(false);
          setIsLoadingAudio(false);
          setAudioError('تعذر جلب ملف الصوت من الخادم. اضغط تشغيل لإعادة المحاولة.');
        }}
      />

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
          <Mic size={16} />
          إذاعة وتلاوات القرآن الكريم
        </div>

        <h1 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
          fontWeight: 800,
          color: 'var(--text-main)',
          fontFamily: 'var(--font-cairo)',
          marginBottom: '0.5rem'
        }}>
          استمع لأعذب التلاوات القرآنية
        </h1>

        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          استمع إلى سور القرآن الكريم كاملة بأصوات نخبة من كبار قراء العالم الإسلامي عبر سيرفرات سريعة ونقية.
        </p>
      </div>

      {/* Main Player Box */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--emerald-deep) 100%)',
        color: '#FAF8F5',
        borderRadius: 'var(--radius-2xl)',
        padding: '2.5rem 2rem',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-gold)',
        marginBottom: '2.5rem',
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
              السورة الحالية • {currentSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-amiri)', margin: 0 }}>
              سورة {currentSurah.name} ({currentSurah.numberOfAyahs} آيات)
            </h2>
            <p style={{ margin: '0.3rem 0 0', opacity: 0.85, fontSize: '0.95rem' }}>
              بصوت القارئ: <strong>{selectedReciter.name}</strong> • رواية {selectedReciter.rewaya}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link
              href={`/quran/${currentSurah.number}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#FAF8F5',
                padding: '0.55rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.25)'
              }}
            >
              <BookOpen size={16} />
              قراءة السورة
            </Link>

            <a
              href={audioUrl}
              download={`Surah_${currentSurah.number}_${selectedReciter.name}.mp3`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#FAF8F5',
                padding: '0.55rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.25)'
              }}
            >
              <Download size={16} />
              تحميل
            </a>
          </div>
        </div>

        {/* Error Alert if any */}
        {audioError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.25)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.88rem',
            color: '#FCA5A5'
          }}>
            <AlertCircle size={18} />
            <span>{audioError}</span>
          </div>
        )}

        {/* Scrubber Slider */}
        <div style={{ marginBottom: '1.5rem', direction: 'ltr' }}>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            style={{
              width: '100%',
              accentColor: 'var(--gold)',
              cursor: 'pointer',
              height: '6px',
              borderRadius: '4px'
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            opacity: 0.85,
            marginTop: '0.4rem'
          }}>
            <span>{formatSeconds(currentTime)}</span>
            <span>{formatSeconds(duration)}</span>
          </div>
        </div>

        {/* Audio Controls */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}>
          {/* Main Play Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0 auto' }}>
            <button
              onClick={prevSurah}
              disabled={currentSurahNumber <= 1}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#FAF8F5',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentSurahNumber <= 1 ? 'not-allowed' : 'pointer',
                opacity: currentSurahNumber <= 1 ? 0.4 : 1,
              }}
              title="السورة السابقة"
            >
              <SkipForward size={20} />
            </button>

            <button
              onClick={togglePlay}
              disabled={isLoadingAudio}
              style={{
                background: 'var(--gold)',
                border: 'none',
                color: '#FAF8F5',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(184, 134, 11, 0.4)',
                transform: 'scale(1)',
                transition: 'transform 0.2s',
              }}
              title={isPlaying ? 'إيقاف' : 'تشغيل'}
            >
              {isLoadingAudio ? (
                <RefreshCw size={26} className="spin-animation" />
              ) : isPlaying ? (
                <Pause size={28} />
              ) : (
                <Play size={28} style={{ marginRight: '-2px' }} />
              )}
            </button>

            <button
              onClick={nextSurah}
              disabled={currentSurahNumber >= 114}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#FAF8F5',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentSurahNumber >= 114 ? 'not-allowed' : 'pointer',
                opacity: currentSurahNumber >= 114 ? 0.4 : 1,
              }}
              title="السورة التالية"
            >
              <SkipBack size={20} />
            </button>
          </div>

          {/* Volume Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={toggleMute}
              style={{ background: 'none', border: 'none', color: '#FAF8F5', cursor: 'pointer' }}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              style={{ width: '90px', accentColor: 'var(--gold)', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Reciters & Surah Selector Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem'
      }}>
        
        {/* Reciters Selection Column */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-2xl)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--font-cairo)'
          }}>
            <Mic size={18} style={{ color: 'var(--primary)' }} />
            اختر القارئ المفضل ({RECITERS_LIST.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {RECITERS_LIST.map((r) => {
              const isSelected = selectedReciter.id === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedReciter(r);
                    setIsPlaying(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                    background: isSelected ? 'var(--primary-light)' : 'var(--bg-main)',
                    color: 'var(--text-main)',
                    textAlign: 'right',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                >
                  <div>
                    <span style={{
                      fontWeight: isSelected ? 700 : 600,
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      display: 'block',
                      fontSize: '0.95rem'
                    }}>
                      {r.name}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      رواية {r.rewaya} • {r.country}
                    </span>
                  </div>

                  {isSelected && (
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      color: '#FAF8F5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Surah List Column */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-2xl)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '620px'
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--font-cairo)'
          }}>
            <BookOpen size={18} style={{ color: 'var(--primary)' }} />
            اختر السورة للاستماع
          </h3>

          {/* Quick Filter */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={16} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="ابحث برقم أو اسم السورة..."
              value={searchSurah}
              onChange={(e) => setSearchSurah(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 2.5rem 0.65rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Scrollable Surah list */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            paddingRight: '0.25rem'
          }}>
            {filteredSurahs.map((s) => {
              const isSelected = s.number === currentSurahNumber;
              return (
                <button
                  key={s.number}
                  onClick={() => {
                    setCurrentSurahNumber(s.number);
                    setIsPlaying(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--primary)' : 'transparent',
                    background: isSelected ? 'var(--primary-light)' : 'var(--bg-main)',
                    color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                    textAlign: 'right',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: isSelected ? 700 : 500,
                    fontFamily: 'inherit',
                    transition: 'background 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: 'var(--bg-card-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)'
                    }}>
                      {s.number}
                    </span>
                    <span>سورة {s.name}</span>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {s.numberOfAyahs} آيات
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function QuranAudioPage() {
  return (
    <main style={{ minHeight: '80vh', padding: '2.5rem 1.25rem 5rem' }}>
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem' }}>جارٍ تحميل مشغل التلاوات...</div>}>
        <AudioHubContent />
      </Suspense>
    </main>
  );
}

'use client';

import { useState, useEffect, useRef, use, Suspense } from 'react';
import Link from 'next/link';
import {
  BookOpen, Volume2, Pause, Play, ChevronLeft, ChevronRight,
  Copy, Check, BookMarked, Settings2, Sparkles, RefreshCw
} from 'lucide-react';
import { SURAHS_LIST } from '@/data/surahs';
import { getAudioUrl } from '@/lib/api';

interface AyahItem {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  translation?: string;
}

interface ReciterOption {
  id: string;
  name: string;
}

const RECITERS: ReciterOption[] = [
  { id: 'ar.alafasy', name: 'مشاري راشد العفاسي' },
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد' },
  { id: 'ar.husary', name: 'محمود خليل الحصري' },
  { id: 'ar.minshawi', name: 'محمد صديق المنشاوي' },
  { id: 'ar.mahermuaiqly', name: 'ماهر المعيقلي' },
  { id: 'ar.saoodshuraym', name: 'سعود الشريم' },
  { id: 'ar.saadalghamidi', name: 'سعد الغامدي' },
  { id: 'ar.ahmedajamy', name: 'أحمد بن علي العجمي' },
  { id: 'ar.yasser', name: 'ياسر الدوسري' },
];

function SurahReaderContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const surahNumber = parseInt(resolvedParams.id, 10);
  const surahMeta = SURAHS_LIST.find((s) => s.number === surahNumber) || SURAHS_LIST[0];

  const [ayahs, setAyahs] = useState<AyahItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [fontSize, setFontSize] = useState<number>(28);
  const [showTafsir, setShowTafsir] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState('ar.alafasy');

  // Audio Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Copy feedback
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);

  // Fetch Surah Ayahs & Tafsir
  useEffect(() => {
    let isMounted = true;
    async function loadSurah() {
      setLoading(true);
      setError(null);
      try {
        // Fetch Arabic text
        const resArabic = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
        if (!resArabic.ok) throw new Error('فشل تحميل نص السورة');
        const dataArabic = await resArabic.json();

        // Fetch Tafsir Muyassar
        let tafsirMap: Record<number, string> = {};
        try {
          const resTafsir = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.muyassar`);
          if (resTafsir.ok) {
            const dataTafsir = await resTafsir.json();
            dataTafsir.data?.ayahs?.forEach((a: { numberInSurah: number; text: string }) => {
              tafsirMap[a.numberInSurah] = a.text;
            });
          }
        } catch {
          // Tafsir optional
        }

        if (isMounted && dataArabic.data?.ayahs) {
          const merged: AyahItem[] = dataArabic.data.ayahs.map((a: AyahItem) => ({
            ...a,
            translation: tafsirMap[a.numberInSurah] || '',
          }));
          setAyahs(merged);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError('تعذر الاتصال بالخادم لجلب السورة، يرجى المحاولة مرة أخرى.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSurah();
    return () => { isMounted = false; };
  }, [surahNumber]);

  // Audio Handler
  const togglePlaySurah = () => {
    if (!audioRef.current) return;
    setAudioError(null);
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setLoadingAudio(true);
      const url = getAudioUrl(selectedReciter, surahNumber);
      audioRef.current.src = url;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setLoadingAudio(false);
      }).catch((e) => {
        console.warn('Audio play error:', e);
        setIsPlaying(false);
        setLoadingAudio(false);
        setAudioError('تعذر تشغيل التلاوة حالياً. يرجى إعادة المحاولة.');
      });
    }
  };

  const handleCopy = (ayah: AyahItem) => {
    const text = `﴿ ${ayah.text} ﴾ [سورة ${surahMeta.name}: آية ${ayah.numberInSurah}]\nمنصة وصل الإسلامية: https://waslislam.fun`;
    navigator.clipboard.writeText(text);
    setCopiedAyah(ayah.numberInSurah);
    setTimeout(() => setCopiedAyah(null), 3000);
  };

  const prevSurah = surahNumber > 1 ? surahNumber - 1 : null;
  const nextSurah = surahNumber < 114 ? surahNumber + 1 : null;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="metadata"
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onError={() => {
          setIsPlaying(false);
          setLoadingAudio(false);
          setAudioError('تعذر جلب التلاوة. يرجى المحاولة مجدداً.');
        }}
      />

      {/* Navigation Breadcrumb */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <Link
          href="/quran"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--primary)',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}
        >
          <ChevronRight size={18} />
          العودة لفهرس السور
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {prevSurah && (
            <Link
              href={`/quran/${prevSurah}`}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              السابقة: {SURAHS_LIST[prevSurah - 1].name}
            </Link>
          )}
          {nextSurah && (
            <Link
              href={`/quran/${nextSurah}`}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              التالية: {SURAHS_LIST[nextSurah - 1].name}
            </Link>
          )}
        </div>
      </div>

      {/* Surah Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--emerald-deep) 100%)',
        color: '#FAF8F5',
        borderRadius: 'var(--radius-2xl)',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-gold)',
        marginBottom: '2rem',
        position: 'relative',
      }}>
        <span style={{
          fontSize: '0.85rem',
          color: 'var(--gold)',
          fontWeight: 700,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: '0.5rem'
        }}>
          سُورَةُ رَقْم {surahMeta.number} • {surahMeta.revelationType === 'Meccan' ? 'مَكِّيَّة' : 'مَدَنِيَّة'}
        </span>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
          fontWeight: 800,
          fontFamily: 'var(--font-amiri)',
          margin: '0 0 0.5rem'
        }}>
          سُورَةُ {surahMeta.name}
        </h1>

        <p style={{ fontSize: '1rem', opacity: 0.9, margin: 0 }}>
          {surahMeta.englishName} ({surahMeta.englishNameTranslation}) • {surahMeta.numberOfAyahs} آيات
        </p>

        {/* Audio & Reciter Quick Controls */}
        <div style={{
          marginTop: '1.75rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(255, 255, 255, 0.12)',
          padding: '0.5rem 1rem',
          borderRadius: '999px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button
            onClick={togglePlaySurah}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: isPlaying ? 'var(--gold)' : '#FAF8F5',
              color: isPlaying ? '#FAF8F5' : 'var(--primary)',
              border: 'none',
              borderRadius: '999px',
              padding: '0.45rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'إيقاف مؤقت' : 'استماع للسورة كاملة'}
          </button>

          <select
            value={selectedReciter}
            onChange={(e) => {
              setSelectedReciter(e.target.value);
              if (isPlaying) {
                setIsPlaying(false);
                if (audioRef.current) audioRef.current.pause();
              }
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              color: '#FAF8F5',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '999px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.82rem',
              outline: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            {RECITERS.map((r) => (
              <option key={r.id} value={r.id} style={{ background: '#064E3B', color: '#FAF8F5' }}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reader Customization Toolbar */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '1rem 1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Font Size Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>حجم الخط:</span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {[
              { label: 'صغير', size: 22 },
              { label: 'متوسط', size: 28 },
              { label: 'كبير', size: 34 },
              { label: 'جلي', size: 40 },
            ].map((opt) => (
              <button
                key={opt.size}
                onClick={() => setFontSize(opt.size)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: fontSize === opt.size ? 'var(--primary)' : 'var(--border-color)',
                  background: fontSize === opt.size ? 'var(--primary)' : 'var(--bg-main)',
                  color: fontSize === opt.size ? '#FAF8F5' : 'var(--text-main)',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tafsir Toggle */}
        <button
          onClick={() => setShowTafsir(!showTafsir)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid',
            borderColor: showTafsir ? 'var(--gold)' : 'var(--border-color)',
            background: showTafsir ? 'var(--gold-light)' : 'var(--bg-main)',
            color: showTafsir ? 'var(--gold)' : 'var(--text-main)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          <Sparkles size={16} />
          {showTafsir ? 'إخفاء التفسير الميسر' : 'عرض التفسير الميسر'}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <RefreshCw size={36} className="spin-animation" style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>جارٍ تحميل آيات سورة {surahMeta.name} المباركة...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          textAlign: 'center',
          color: '#DC2626'
        }}>
          <p style={{ fontWeight: 600, marginBottom: '1rem' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary)',
              color: '#FAF8F5',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Ayahs Display */}
      {!loading && !error && ayahs.length > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-2xl)',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative'
        }}>
          {/* Basmala */}
          {surahNumber !== 9 && surahNumber !== 1 && (
            <div style={{
              textAlign: 'center',
              fontFamily: 'var(--font-quran)',
              fontSize: '2rem',
              color: 'var(--primary)',
              margin: '0 0 2.5rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px dashed var(--border-color)'
            }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
          )}

          {/* Ayahs List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {ayahs.map((ayah) => {
              let cleanedText = ayah.text;
              if (surahNumber !== 1 && ayah.numberInSurah === 1 && cleanedText.startsWith('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')) {
                cleanedText = cleanedText.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '').trim();
              }

              return (
                <div
                  key={ayah.number}
                  id={`ayah-${ayah.numberInSurah}`}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '1.75rem',
                    transition: 'background 0.2s',
                  }}
                >
                  {/* Ayah Header & Actions */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.8rem'
                      }}>
                        {ayah.numberInSurah}
                      </span>
                      <span>جزء {ayah.juz} • صفحة {ayah.page}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleCopy(ayah)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '0.3rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}
                        title="نسخ الآية"
                      >
                        {copiedAyah === ayah.numberInSurah ? (
                          <Check size={16} style={{ color: 'var(--primary)' }} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Ayah Text */}
                  <p style={{
                    fontFamily: 'var(--font-quran)',
                    fontSize: `${fontSize}px`,
                    lineHeight: 2.2,
                    color: 'var(--text-main)',
                    textAlign: 'right',
                    margin: 0,
                    wordSpacing: '2px',
                  }}>
                    {cleanedText}
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gold)',
                      margin: '0 0.5rem',
                      fontSize: '0.85em',
                      userSelect: 'none'
                    }}>
                      ﴿{ayah.numberInSurah}﴾
                    </span>
                  </p>

                  {/* Tafsir (if enabled) */}
                  {showTafsir && ayah.translation && (
                    <div style={{
                      marginTop: '1rem',
                      background: 'var(--bg-card-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1.15rem',
                      borderRight: '3px solid var(--gold)',
                      fontSize: '0.92rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.7,
                      fontFamily: 'var(--font-tajawal)'
                    }}>
                      <strong style={{ color: 'var(--gold)', display: 'block', marginBottom: '0.2rem', fontSize: '0.85rem' }}>
                        التفسير الميسر:
                      </strong>
                      {ayah.translation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SurahReadingPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main style={{ minHeight: '80vh', padding: '2rem 1.25rem 5rem' }}>
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem 1rem' }}>جارٍ تحميل السورة...</div>}>
        <SurahReaderContent params={params} />
      </Suspense>
    </main>
  );
}

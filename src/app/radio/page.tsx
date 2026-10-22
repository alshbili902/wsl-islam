'use client';

import { useState, useRef, useEffect } from 'react';
import { Radio, Play, Pause, Volume2, VolumeX, Sparkles, Activity, ShieldCheck } from 'lucide-react';
import { RADIO_STATIONS, type RadioStation } from '@/data/radio';

export default function RadioPage() {
  const [selectedStation, setSelectedStation] = useState<RadioStation>(RADIO_STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    setStreamError(null);
    if (audioRef.current) {
      audioRef.current.src = selectedStation.streamUrl;
      if (isPlaying) {
        setLoadingAudio(true);
        audioRef.current.play().then(() => {
          setLoadingAudio(false);
        }).catch((e) => {
          console.warn('Radio stream playback error:', e);
          setIsPlaying(false);
          setLoadingAudio(false);
          setStreamError('تعذر الاتصال بالبث المباشر لهذه القناة حالياً. جرب محطة أخرى.');
        });
      }
    }
  }, [selectedStation]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    setStreamError(null);
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setLoadingAudio(true);
      audioRef.current.src = selectedStation.streamUrl;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setLoadingAudio(false);
      }).catch((e) => {
        console.warn('Radio play error:', e);
        setIsPlaying(false);
        setLoadingAudio(false);
        setStreamError('تعذر تشغيل البث المباشر. يرجى المحاولة أو اختيار محطة أخرى.');
      });
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

  return (
    <main style={{ minHeight: '80vh', padding: '2.5rem 1.25rem 5rem' }}>
      <audio
        ref={audioRef}
        onWaiting={() => setLoadingAudio(true)}
        onPlaying={() => setLoadingAudio(false)}
        onError={() => {
          setIsPlaying(false);
          setLoadingAudio(false);
        }}
      />

      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        
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
            <Radio size={16} />
            البث المباشر للقرآن الكريم
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-cairo)',
            marginBottom: '0.5rem'
          }}>
            الإذاعات الإسلامية المباشرة
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', lineHeight: 1.7 }}>
            استمع مباشرة وعلى مدار الساعة لبث إذاعة القرآن الكريم من القاهرة ومكة المكرمة وقنوات التلاوات الخاشعة لأشهر القراء.
          </p>
        </div>

        {/* Live Player Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--emerald-deep) 100%)',
          color: '#FAF8F5',
          borderRadius: 'var(--radius-2xl)',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-gold)',
          marginBottom: '2.5rem',
          position: 'relative'
        }}>
          {/* Live indicator badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(239, 68, 68, 0.25)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            color: '#FCA5A5',
            padding: '0.3rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#EF4444',
              display: 'inline-block',
              animation: 'pulse 1.5s infinite'
            }} />
            بث مباشر عبر الإنترنت
          </div>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 800,
            fontFamily: 'var(--font-cairo)',
            margin: '0 0 0.5rem'
          }}>
            {selectedStation.name}
          </h2>

          <p style={{ fontSize: '0.95rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 1.5rem' }}>
            {selectedStation.description}
          </p>

          {streamError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.25)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 1rem',
              maxWidth: '500px',
              margin: '0 auto 1.5rem',
              fontSize: '0.88rem',
              color: '#FCA5A5'
            }}>
              {streamError}
            </div>
          )}

          {/* Sound waves animation effect if playing */}
          {isPlaying && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              height: '36px',
              marginBottom: '1.5rem'
            }}>
              {[40, 70, 100, 60, 90, 50, 80, 45, 95, 65, 85].map((h, i) => (
                <span
                  key={i}
                  style={{
                    width: '4px',
                    height: `${h}%`,
                    background: 'var(--gold)',
                    borderRadius: '4px',
                    animation: `pulse ${0.6 + (i % 4) * 0.2}s infinite alternate`
                  }}
                />
              ))}
            </div>
          )}

          {/* Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={togglePlay}
              disabled={loadingAudio}
              style={{
                background: 'var(--gold)',
                color: '#FAF8F5',
                border: 'none',
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(184, 134, 11, 0.4)',
                transform: 'scale(1)',
                transition: 'transform 0.15s'
              }}
              title={isPlaying ? 'إيقاف' : 'تشغيل'}
            >
              {loadingAudio ? (
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>جارٍ...</span>
              ) : isPlaying ? (
                <Pause size={30} />
              ) : (
                <Play size={30} style={{ marginRight: '-2px' }} />
              )}
            </button>

            {/* Volume */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.15)', padding: '0.5rem 1rem', borderRadius: '20px' }}>
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
                style={{ width: '80px', accentColor: 'var(--gold)', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Stations Selection Grid */}
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem', fontFamily: 'var(--font-cairo)' }}>
          اختر الإذاعة أو القناة المفضلة ({RADIO_STATIONS.length})
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          {RADIO_STATIONS.map((station) => {
            const isSelected = selectedStation.id === station.id;
            return (
              <button
                key={station.id}
                onClick={() => {
                  setSelectedStation(station);
                  setIsPlaying(true);
                }}
                style={{
                  background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  cursor: 'pointer',
                  textAlign: 'right',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: isSelected ? 'var(--primary)' : 'var(--bg-card-subtle)',
                    color: isSelected ? '#FAF8F5' : 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Radio size={22} />
                  </div>

                  <div>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      margin: '0 0 0.2rem'
                    }}>
                      {station.name}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {station.description}
                    </span>
                  </div>
                </div>

                {isSelected && isPlaying ? (
                  <span style={{
                    fontSize: '0.75rem',
                    background: 'var(--primary)',
                    color: '#FAF8F5',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontWeight: 700
                  }}>
                    يشتغل الآن
                  </span>
                ) : (
                  <Play size={18} style={{ color: 'var(--text-muted)' }} />
                )}
              </button>
            );
          })}
        </div>

      </div>
    </main>
  );
}

"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Hls from "hls.js";
import { SURAHS } from "@/data/surahs";
import { buildSurahAudioUrl, VERIFIED_RECITERS } from "@/data/reciters";
import type {
  AudioQueueItem,
  LectureItem,
  ListeningHistoryEntry,
  ListeningPreferencesState,
  RadioStation,
  RecitationStyleId,
  Reciter,
  UserPlaylist,
} from "@/types/islamic";

export type AudioTrack =
  | {
      kind: "quran";
      surahNumber: number;
      surahNameAr: string;
      surahNameEn: string;
      reciter: Reciter;
      audioUrl: string;
    }
  | {
      kind: "radio";
      station: RadioStation;
    }
  | {
      kind: "lecture";
      lecture: LectureItem;
      attachmentIndex: number;
      attachmentTitle?: string;
      audioUrl: string;
    };

export interface SavedQuranPosition {
  surahNumber: number;
  reciterSlug: string;
  moshafId?: string;
  currentTime: number;
  duration: number;
  updatedAt: string;
}

export type PlaybackStatus = "idle" | "loading" | "playing" | "paused" | "error";
export type RepeatMode = "off" | "one" | "all";

const DEFAULT_LISTENING_PREFS: ListeningPreferencesState = {
  favoriteReciterSlugs: [],
  favoriteSurahs: [],
  favoriteLectureIds: [],
  recentSearches: [],
};

interface AudioContextValue {
  track: AudioTrack | null;
  status: PlaybackStatus;
  errorMessage: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  savedPosition: SavedQuranPosition | null;
  repeatMode: RepeatMode;
  shuffle: boolean;
  sleepTimerRemainingSec: number | null;
  playerExpanded: boolean;
  setPlayerExpanded: (open: boolean) => void;
  queue: AudioQueueItem[];
  queueIndex: number;
  playlists: UserPlaylist[];
  history: ListeningHistoryEntry[];
  listeningPrefs: ListeningPreferencesState;
  playSurah: (
    surahNumber: number,
    reciter?: Reciter,
    startSeconds?: number,
    audioUrlOverride?: string
  ) => void;
  playRadio: (station: RadioStation) => void;
  playLecture: (
    lecture: LectureItem,
    audioUrl: string,
    attachmentIndex?: number,
    attachmentTitle?: string,
    startSeconds?: number
  ) => void;
  togglePlayPause: () => void;
  stop: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  nextSurah: () => void;
  prevSurah: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  cycleRepeatMode: () => void;
  toggleShuffle: () => void;
  setSleepTimer: (minutes: number | null) => void;
  addToQueue: (item: AudioQueueItem) => void;
  addNextToQueue: (item: AudioQueueItem) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  playQueueItem: (index: number) => void;
  saveQueueAsPlaylist: (name: string) => void;
  createPlaylist: (name: string, items: AudioQueueItem[]) => void;
  deletePlaylist: (id: string) => void;
  removePlaylistItem: (playlistId: string, itemId: string) => void;
  playPlaylist: (playlist: UserPlaylist) => void;
  toggleFavoriteReciter: (slug: string) => void;
  toggleFavoriteSurah: (
    surahNumber: number,
    reciterSlug: string,
    moshafId?: string
  ) => void;
  toggleFavoriteLecture: (lectureId: string) => void;
  setPreferredReciter: (slug: string, moshafId?: string) => void;
  setPreferredRiwayah: (riwayahId?: number) => void;
  setPreferredStyle: (styleId?: RecitationStyleId) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  removeHistoryEntry: (id: string) => void;
  clearHistory: () => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

const RESUME_STORAGE_KEY = "wasl_quran_resume_v1";
const VOLUME_STORAGE_KEY = "wasl_audio_volume_v1";
const QUEUE_STORAGE_KEY = "wasl_audio_queue_v1";
const PLAYLISTS_STORAGE_KEY = "wasl_listening_playlists_v1";
const HISTORY_STORAGE_KEY = "wasl_listening_history_v1";
const LISTENING_PREFS_STORAGE_KEY = "wasl_listening_prefs_v1";

function safeParseStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSaveStorage(key: string, val: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Ignore storage quota errors
  }
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsVideoRef = useRef<HTMLVideoElement | null>(null);
  const hlsInstanceRef = useRef<Hls | null>(null);
  const pendingSeekRef = useRef<number | null>(null);

  const [track, setTrack] = useState<AudioTrack | null>(null);
  const [status, setStatus] = useState<PlaybackStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [savedPosition, setSavedPosition] = useState<SavedQuranPosition | null>(
    null
  );
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [shuffle, setShuffle] = useState(false);
  const [sleepTimerRemainingSec, setSleepTimerRemainingSec] = useState<
    number | null
  >(null);
  const [playerExpanded, setPlayerExpanded] = useState(false);

  const [queue, setQueue] = useState<AudioQueueItem[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [history, setHistory] = useState<ListeningHistoryEntry[]>([]);
  const [listeningPrefs, setListeningPrefs] =
    useState<ListeningPreferencesState>(DEFAULT_LISTENING_PREFS);

  // Restore saved preferences, history, queue & resume pointers
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const savedVol = localStorage.getItem(VOLUME_STORAGE_KEY);
        if (savedVol) {
          const parsed = Number(savedVol);
          if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 1) {
            setVolumeState(parsed);
          }
        }
        const savedPos = safeParseStorage<SavedQuranPosition | null>(
          RESUME_STORAGE_KEY,
          null
        );
        if (savedPos && savedPos.surahNumber >= 1 && savedPos.surahNumber <= 114) {
          setSavedPosition(savedPos);
        }
        setQueue(safeParseStorage<AudioQueueItem[]>(QUEUE_STORAGE_KEY, []));
        setPlaylists(safeParseStorage<UserPlaylist[]>(PLAYLISTS_STORAGE_KEY, []));
        setHistory(safeParseStorage<ListeningHistoryEntry[]>(HISTORY_STORAGE_KEY, []));
        const prefs = safeParseStorage<Partial<ListeningPreferencesState>>(
          LISTENING_PREFS_STORAGE_KEY,
          {}
        );
        setListeningPrefs({
          ...DEFAULT_LISTENING_PREFS,
          ...prefs,
          favoriteReciterSlugs: Array.isArray(prefs.favoriteReciterSlugs)
            ? prefs.favoriteReciterSlugs
            : [],
          favoriteSurahs: Array.isArray(prefs.favoriteSurahs)
            ? prefs.favoriteSurahs
            : [],
          favoriteLectureIds: Array.isArray(prefs.favoriteLectureIds)
            ? prefs.favoriteLectureIds
            : [],
          recentSearches: Array.isArray(prefs.recentSearches)
            ? prefs.recentSearches
            : [],
        });
      } catch {
        // Ignore storage error
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const recordHistoryEntry = useCallback(
    (entry: Omit<ListeningHistoryEntry, "playedAt">) => {
      setHistory((prev) => {
        const filtered = prev.filter((item) => item.id !== entry.id);
        const next: ListeningHistoryEntry[] = [
          { ...entry, playedAt: new Date().toISOString() },
          ...filtered,
        ].slice(0, 60);
        safeSaveStorage(HISTORY_STORAGE_KEY, next);
        return next;
      });
    },
    []
  );

  const updateHistoryProgress = useCallback(
    (id: string, positionSeconds: number, durationSeconds: number) => {
      setHistory((prev) => {
        const idx = prev.findIndex((h) => h.id === id);
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          positionSeconds: Math.floor(positionSeconds),
          durationSeconds: Math.floor(durationSeconds || 0),
        };
        safeSaveStorage(HISTORY_STORAGE_KEY, copy);
        return copy;
      });
    },
    []
  );

  const saveQuranPosition = useCallback(
    (
      surahNumber: number,
      reciterSlug: string,
      time: number,
      dur: number,
      moshafId?: string
    ) => {
      if (time < 1 && dur <= 0) return;
      const entry: SavedQuranPosition = {
        surahNumber,
        reciterSlug,
        moshafId,
        currentTime: Math.floor(time),
        duration: Math.floor(dur || 0),
        updatedAt: new Date().toISOString(),
      };
      setSavedPosition(entry);
      safeSaveStorage(RESUME_STORAGE_KEY, entry);
      updateHistoryProgress(`quran-${reciterSlug}-${surahNumber}`, time, dur);
    },
    [updateHistoryProgress]
  );

  const cleanupHls = useCallback(() => {
    if (hlsInstanceRef.current) {
      hlsInstanceRef.current.destroy();
      hlsInstanceRef.current = null;
    }
    if (hlsVideoRef.current) {
      hlsVideoRef.current.pause();
      hlsVideoRef.current.removeAttribute("src");
      hlsVideoRef.current.load();
    }
  }, []);

  const stopStandardAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
  }, []);

  const getActiveMediaElement = useCallback((): HTMLMediaElement | null => {
    if (!track) return null;
    if (track.kind === "radio" && track.station.streamType === "hls") {
      return hlsVideoRef.current;
    }
    return audioRef.current;
  }, [track]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
      audioRef.current.playbackRate = playbackRate;
    }
    if (hlsVideoRef.current) {
      hlsVideoRef.current.volume = volume;
      hlsVideoRef.current.muted = muted;
    }
  }, [volume, muted, playbackRate]);

  const updateMediaSession = useCallback((nextTrack: AudioTrack) => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
      return;
    }
    try {
      navigator.mediaSession.metadata = new MediaMetadata(
        nextTrack.kind === "quran"
          ? {
              title: nextTrack.surahNameAr,
              artist: nextTrack.reciter.nameAr,
              album: `وصل الإسلامية — ${nextTrack.reciter.rewayahAr}`,
            }
          : nextTrack.kind === "lecture"
            ? {
                title: nextTrack.lecture.titleAr,
                artist: nextTrack.lecture.speakerAr,
                album: "وصل الإسلامية — المحاضرات والدروس",
              }
            : {
                title: nextTrack.station.nameAr,
                artist: nextTrack.station.sourceOrgAr,
                album: "وصل الإسلامية — البث المباشر",
              }
      );
    } catch {
      // Ignore environments without MediaMetadata support
    }
  }, []);

  const resolveAudioUrlForReciter = useCallback(
    async (reciter: Reciter, surahNumber: number): Promise<string | null> => {
      if (
        Array.isArray(reciter.availableSurahs) &&
        reciter.availableSurahs.length > 0 &&
        !reciter.availableSurahs.includes(surahNumber)
      ) {
        return null;
      }

      if (reciter.provider === "quran_com_v4") {
        try {
          const qs = new URLSearchParams({
            reciter: reciter.slug,
            surah: String(surahNumber),
          });
          if (reciter.moshafId) qs.set("moshaf", reciter.moshafId);
          const res = await fetch(`/api/listen/audio-url?${qs.toString()}`);
          if (!res.ok) return null;
          const data = (await res.json()) as { audioUrl?: string };
          return data.audioUrl || null;
        } catch {
          return null;
        }
      }

      return buildSurahAudioUrl(reciter, surahNumber);
    },
    []
  );

  const playSurah = useCallback(
    (
      surahNumber: number,
      reciter: Reciter = VERIFIED_RECITERS[0],
      startSeconds: number = 0,
      audioUrlOverride?: string
    ) => {
      const surah = SURAHS.find((s) => s.number === surahNumber) ?? SURAHS[0];

      if (
        !audioUrlOverride &&
        Array.isArray(reciter.availableSurahs) &&
        reciter.availableSurahs.length > 0 &&
        !reciter.availableSurahs.includes(surah.number)
      ) {
        setStatus("error");
        setErrorMessage(
          `سورة ${surah.nameAr} غير متوفرة ضمن هذا التسجيل للقارئ ${reciter.nameAr}.`
        );
        return;
      }

      const startWithResolvedUrl = (resolvedUrl: string) => {
        const nextTrack: AudioTrack = {
          kind: "quran",
          surahNumber: surah.number,
          surahNameAr: surah.nameAr,
          surahNameEn: surah.englishName,
          reciter,
          audioUrl: resolvedUrl,
        };

        cleanupHls();
        setErrorMessage(null);
        setStatus("loading");
        setCurrentTime(startSeconds);
        setDuration(0);
        pendingSeekRef.current = startSeconds > 0 ? startSeconds : null;
        setTrack(nextTrack);
        updateMediaSession(nextTrack);
        recordHistoryEntry({
          id: `quran-${reciter.slug}-${surah.number}`,
          kind: "quran",
          titleAr: `سورة ${surah.nameAr}`,
          titleEn: `Surah ${surah.englishName}`,
          subtitleAr: `${reciter.nameAr} • ${reciter.rewayahAr}`,
          subtitleEn: `${reciter.nameEn} • ${reciter.rewayahEn}`,
          href: `/listen/reciters/${reciter.slug}?surah=${surah.number}`,
          surahNumber: surah.number,
          reciterSlug: reciter.slug,
          moshafId: reciter.moshafId,
          positionSeconds: startSeconds,
        });

        const audio = audioRef.current;
        if (audio) {
          audio.src = resolvedUrl;
          audio.playbackRate = playbackRate;
          audio.volume = volume;
          audio.muted = muted;
          audio.load();
          audio.play().catch(() => {
            setStatus("paused");
          });
        }
      };

      if (audioUrlOverride) {
        startWithResolvedUrl(audioUrlOverride);
        return;
      }

      if (reciter.provider === "quran_com_v4") {
        setStatus("loading");
        setErrorMessage(null);
        void resolveAudioUrlForReciter(reciter, surah.number).then((url) => {
          if (!url) {
            setStatus("error");
            setErrorMessage(
              `تعذر جلب رابط التلاوة الرسمي لسورة ${surah.nameAr} من المصدر.`
            );
            return;
          }
          startWithResolvedUrl(url);
        });
        return;
      }

      startWithResolvedUrl(buildSurahAudioUrl(reciter, surah.number));
    },
    [
      cleanupHls,
      muted,
      playbackRate,
      recordHistoryEntry,
      resolveAudioUrlForReciter,
      updateMediaSession,
      volume,
    ]
  );

  const attachHlsSource = useCallback(
    (station: RadioStation, urlToUse: string, triedFallback: boolean) => {
      const attach = (targetUrl: string, isRetry: boolean) => {
        const video = hlsVideoRef.current;
        if (!video) return;

        cleanupHls();
        const effectiveUrl = station.needsProxy
          ? `/api/radio/hls?url=${encodeURIComponent(targetUrl)}`
          : targetUrl;

        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 30,
          });
          hlsInstanceRef.current = hls;
          hls.loadSource(effectiveUrl);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.volume = volume;
            video.muted = muted;
            video.play().catch(() => {
              setStatus("paused");
            });
          });

          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              if (!isRetry && station.fallbackUrl) {
                attach(station.fallbackUrl, true);
                return;
              }
              cleanupHls();
              setStatus("error");
              setErrorMessage(
                "تعذر الاتصال بالبث المباشر لهذه الإذاعة حالياً. قد يكون المصدر غير متاح مؤقتاً."
              );
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = effectiveUrl;
          video.volume = volume;
          video.muted = muted;
          video.play().catch(() => {
            setStatus("paused");
          });
        } else {
          setStatus("error");
          setErrorMessage("متصفحك لا يدعم تشغيل بث HLS المباشر.");
        }
      };

      attach(urlToUse, triedFallback);
    },
    [cleanupHls, muted, volume]
  );

  const playRadio = useCallback(
    (station: RadioStation) => {
      stopStandardAudio();
      cleanupHls();
      setErrorMessage(null);
      setStatus("loading");
      setCurrentTime(0);
      setDuration(0);

      const nextTrack: AudioTrack = { kind: "radio", station };
      setTrack(nextTrack);
      updateMediaSession(nextTrack);

      if (station.streamType === "hls") {
        attachHlsSource(station, station.streamUrl, false);
      } else {
        const audio = audioRef.current;
        if (audio) {
          audio.src = station.streamUrl;
          audio.playbackRate = 1;
          audio.volume = volume;
          audio.muted = muted;
          audio.load();
          audio.play().catch(() => {
            setStatus("paused");
          });
        }
      }
    },
    [
      attachHlsSource,
      cleanupHls,
      muted,
      stopStandardAudio,
      updateMediaSession,
      volume,
    ]
  );

  const playLecture = useCallback(
    (
      lecture: LectureItem,
      audioUrl: string,
      attachmentIndex: number = 0,
      attachmentTitle?: string,
      startSeconds: number = 0
    ) => {
      stopStandardAudio();
      cleanupHls();
      setErrorMessage(null);
      setStatus("loading");
      setCurrentTime(startSeconds);
      setDuration(0);
      pendingSeekRef.current = startSeconds > 0 ? startSeconds : null;

      const nextTrack: AudioTrack = {
        kind: "lecture",
        lecture,
        attachmentIndex,
        attachmentTitle,
        audioUrl,
      };
      setTrack(nextTrack);
      updateMediaSession(nextTrack);
      recordHistoryEntry({
        id: `lecture-${lecture.id}`,
        kind: "lecture",
        titleAr: lecture.titleAr,
        titleEn: lecture.titleEn,
        subtitleAr: `${lecture.speakerAr} • ${lecture.sourceNameAr}`,
        subtitleEn: `${lecture.speakerEn} • ${lecture.sourceNameEn}`,
        href: `/lectures/${lecture.slug}`,
        lectureSlug: lecture.slug,
        positionSeconds: startSeconds,
      });

      const audio = audioRef.current;
      if (audio) {
        audio.src = audioUrl;
        audio.playbackRate = playbackRate;
        audio.volume = volume;
        audio.muted = muted;
        audio.load();
        audio.play().catch(() => {
          setStatus("paused");
        });
      }
    },
    [
      cleanupHls,
      muted,
      playbackRate,
      recordHistoryEntry,
      stopStandardAudio,
      updateMediaSession,
      volume,
    ]
  );

  const playQueueItem = useCallback(
    (index: number) => {
      const target = queue[index];
      if (!target) return;
      setQueueIndex(index);
      if (target.kind === "quran" && target.surahNumber) {
        playSurah(
          target.surahNumber,
          target.reciter || VERIFIED_RECITERS[0],
          0,
          target.audioUrl
        );
      } else if (target.kind === "lecture" && target.lecture) {
        playLecture(
          target.lecture,
          target.audioUrl,
          target.attachmentIndex ?? 0,
          target.attachmentTitle
        );
      }
    },
    [playLecture, playSurah, queue]
  );

  const togglePlayPause = useCallback(() => {
    const el = getActiveMediaElement();
    if (!el) return;
    if (el.paused) {
      setErrorMessage(null);
      el.play().catch(() => {
        setStatus("error");
        setErrorMessage("تعذر استئناف التشغيل. يرجى التحقق من اتصال الإنترنت أو المصدر.");
      });
    } else {
      el.pause();
    }
  }, [getActiveMediaElement]);

  const stop = useCallback(() => {
    stopStandardAudio();
    cleanupHls();
    setTrack(null);
    setStatus("idle");
    setErrorMessage(null);
    setCurrentTime(0);
    setDuration(0);
    setPlayerExpanded(false);
    setSleepTimerRemainingSec(null);
  }, [cleanupHls, stopStandardAudio]);

  const seekTo = useCallback(
    (seconds: number) => {
      if (!track || track.kind === "radio" || !audioRef.current) return;
      const clamped = Math.max(0, Math.min(seconds, duration || seconds));
      audioRef.current.currentTime = clamped;
      setCurrentTime(clamped);
      if (track.kind === "quran") {
        saveQuranPosition(
          track.surahNumber,
          track.reciter.slug,
          clamped,
          duration,
          track.reciter.moshafId
        );
      } else if (track.kind === "lecture") {
        updateHistoryProgress(`lecture-${track.lecture.id}`, clamped, duration);
      }
    },
    [duration, saveQuranPosition, track, updateHistoryProgress]
  );

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (clamped > 0) setMuted(false);
    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, String(clamped));
    } catch {
      // Ignore
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
  }, []);

  const getAdjacentAvailableSurah = useCallback(
    (current: number, direction: 1 | -1, reciter: Reciter): number | null => {
      const avail =
        Array.isArray(reciter.availableSurahs) && reciter.availableSurahs.length > 0
          ? reciter.availableSurahs
          : Array.from({ length: 114 }, (_, i) => i + 1);
      if (shuffle && avail.length > 1) {
        const candidates = avail.filter((n) => n !== current);
        return candidates[Math.floor(Math.random() * candidates.length)] ?? avail[0];
      }
      const idx = avail.indexOf(current);
      if (idx === -1) return avail[0];
      const nextIdx = (idx + direction + avail.length) % avail.length;
      if (direction === 1 && idx === avail.length - 1 && repeatMode === "off") {
        return null;
      }
      return avail[nextIdx];
    },
    [repeatMode, shuffle]
  );

  const nextSurah = useCallback(() => {
    if (queue.length > 0 && queueIndex >= 0) {
      const nextQueueIdx = shuffle
        ? Math.floor(Math.random() * queue.length)
        : queueIndex + 1;
      if (nextQueueIdx < queue.length) {
        playQueueItem(nextQueueIdx);
        return;
      }
      if (repeatMode === "all" && queue.length > 0) {
        playQueueItem(0);
        return;
      }
    }
    if (!track || track.kind !== "quran") return;
    const nextNum = getAdjacentAvailableSurah(track.surahNumber, 1, track.reciter);
    if (nextNum) {
      playSurah(nextNum, track.reciter);
    }
  }, [
    getAdjacentAvailableSurah,
    playQueueItem,
    playSurah,
    queue.length,
    queueIndex,
    repeatMode,
    shuffle,
    track,
  ]);

  const prevSurah = useCallback(() => {
    if (queue.length > 0 && queueIndex > 0) {
      playQueueItem(queueIndex - 1);
      return;
    }
    if (!track || track.kind !== "quran") return;
    const prevNum = getAdjacentAvailableSurah(track.surahNumber, -1, track.reciter);
    if (prevNum) {
      playSurah(prevNum, track.reciter);
    }
  }, [getAdjacentAvailableSurah, playQueueItem, playSurah, queue.length, queueIndex, track]);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) =>
      prev === "off" ? "all" : prev === "all" ? "one" : "off"
    );
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => !prev);
  }, []);

  const setSleepTimer = useCallback((minutes: number | null) => {
    if (!minutes || minutes <= 0) {
      setSleepTimerRemainingSec(null);
      return;
    }
    setSleepTimerRemainingSec(Math.round(minutes * 60));
  }, []);

  // Sleep timer countdown tick
  useEffect(() => {
    if (sleepTimerRemainingSec === null) return;
    const id = window.setInterval(() => {
      setSleepTimerRemainingSec((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          const el = getActiveMediaElement();
          if (el && !el.paused) el.pause();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [getActiveMediaElement, sleepTimerRemainingSec]);

  // Wire Media Session action handlers for lock-screen / keyboard controls where supported
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
      return;
    }
    const ms = navigator.mediaSession;
    try {
      ms.setActionHandler("play", () => {
        const el = getActiveMediaElement();
        if (el) void el.play();
      });
      ms.setActionHandler("pause", () => {
        const el = getActiveMediaElement();
        if (el) el.pause();
      });
      ms.setActionHandler("nexttrack", () => nextSurah());
      ms.setActionHandler("previoustrack", () => prevSurah());
      ms.setActionHandler("seekbackward", (details) => {
        seekTo(Math.max(0, currentTime - (details.seekOffset || 15)));
      });
      ms.setActionHandler("seekforward", (details) => {
        seekTo(currentTime + (details.seekOffset || 15));
      });
      ms.setActionHandler("seekto", (details) => {
        if (typeof details.seekTime === "number") {
          seekTo(details.seekTime);
        }
      });
    } catch {
      // Unsupported MediaSession actions in some browsers
    }
  }, [currentTime, getActiveMediaElement, nextSurah, prevSurah, seekTo]);

  // Queue manipulation methods
  const addToQueue = useCallback((item: AudioQueueItem) => {
    setQueue((prev) => {
      const next = [...prev, item];
      safeSaveStorage(QUEUE_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const addNextToQueue = useCallback(
    (item: AudioQueueItem) => {
      setQueue((prev) => {
        const insertAt = queueIndex >= 0 ? queueIndex + 1 : 0;
        const next = [...prev.slice(0, insertAt), item, ...prev.slice(insertAt)];
        safeSaveStorage(QUEUE_STORAGE_KEY, next);
        return next;
      });
    },
    [queueIndex]
  );

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => {
      const next = prev.filter((_, i) => i !== index);
      safeSaveStorage(QUEUE_STORAGE_KEY, next);
      return next;
    });
    setQueueIndex((prevIdx) =>
      index < prevIdx ? prevIdx - 1 : index === prevIdx ? -1 : prevIdx
    );
  }, []);

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    setQueue((prev) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex >= prev.length
      ) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      safeSaveStorage(QUEUE_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(-1);
    safeSaveStorage(QUEUE_STORAGE_KEY, []);
  }, []);

  // Playlist methods
  const createPlaylist = useCallback((name: string, items: AudioQueueItem[]) => {
    const clean = name.trim();
    if (!clean) return;
    const nowIso = new Date().toISOString();
    const pl: UserPlaylist = {
      id: `pl-${Date.now()}`,
      name: clean,
      items,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setPlaylists((prev) => {
      const next = [pl, ...prev];
      safeSaveStorage(PLAYLISTS_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const saveQueueAsPlaylist = useCallback(
    (name: string) => {
      if (queue.length === 0) return;
      createPlaylist(name, queue);
    },
    [createPlaylist, queue]
  );

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists((prev) => {
      const next = prev.filter((p) => p.id !== id);
      safeSaveStorage(PLAYLISTS_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const removePlaylistItem = useCallback((playlistId: string, itemId: string) => {
    setPlaylists((prev) => {
      const next = prev.map((p) =>
        p.id === playlistId
          ? {
              ...p,
              items: p.items.filter((i) => i.id !== itemId),
              updatedAt: new Date().toISOString(),
            }
          : p
      );
      safeSaveStorage(PLAYLISTS_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const playPlaylist = useCallback(
    (playlist: UserPlaylist) => {
      if (playlist.items.length === 0) return;
      setQueue(playlist.items);
      safeSaveStorage(QUEUE_STORAGE_KEY, playlist.items);
      setQueueIndex(0);
      const first = playlist.items[0];
      if (first.kind === "quran" && first.surahNumber) {
        playSurah(
          first.surahNumber,
          first.reciter || VERIFIED_RECITERS[0],
          0,
          first.audioUrl
        );
      } else if (first.kind === "lecture" && first.lecture) {
        playLecture(
          first.lecture,
          first.audioUrl,
          first.attachmentIndex ?? 0,
          first.attachmentTitle
        );
      }
    },
    [playLecture, playSurah]
  );

  // Personal Listening Preferences mutations
  const updateListeningPrefs = useCallback(
    (updater: (prev: ListeningPreferencesState) => ListeningPreferencesState) => {
      setListeningPrefs((prev) => {
        const next = updater(prev);
        safeSaveStorage(LISTENING_PREFS_STORAGE_KEY, next);
        return next;
      });
    },
    []
  );

  const toggleFavoriteReciter = useCallback(
    (slug: string) => {
      updateListeningPrefs((prev) => {
        const exists = prev.favoriteReciterSlugs.includes(slug);
        return {
          ...prev,
          favoriteReciterSlugs: exists
            ? prev.favoriteReciterSlugs.filter((s) => s !== slug)
            : [slug, ...prev.favoriteReciterSlugs],
        };
      });
    },
    [updateListeningPrefs]
  );

  const toggleFavoriteSurah = useCallback(
    (surahNumber: number, reciterSlug: string, moshafId?: string) => {
      updateListeningPrefs((prev) => {
        const exists = prev.favoriteSurahs.some(
          (f) => f.surahNumber === surahNumber && f.reciterSlug === reciterSlug
        );
        return {
          ...prev,
          favoriteSurahs: exists
            ? prev.favoriteSurahs.filter(
                (f) =>
                  !(f.surahNumber === surahNumber && f.reciterSlug === reciterSlug)
              )
            : [{ surahNumber, reciterSlug, moshafId }, ...prev.favoriteSurahs],
        };
      });
    },
    [updateListeningPrefs]
  );

  const toggleFavoriteLecture = useCallback(
    (lectureId: string) => {
      updateListeningPrefs((prev) => {
        const exists = prev.favoriteLectureIds.includes(lectureId);
        return {
          ...prev,
          favoriteLectureIds: exists
            ? prev.favoriteLectureIds.filter((id) => id !== lectureId)
            : [lectureId, ...prev.favoriteLectureIds],
        };
      });
    },
    [updateListeningPrefs]
  );

  const setPreferredReciter = useCallback(
    (slug: string, moshafId?: string) => {
      updateListeningPrefs((prev) => ({
        ...prev,
        preferredReciterSlug: slug,
        preferredMoshafId: moshafId,
      }));
    },
    [updateListeningPrefs]
  );

  const setPreferredRiwayah = useCallback(
    (riwayahId?: number) => {
      updateListeningPrefs((prev) => ({ ...prev, preferredRiwayahId: riwayahId }));
    },
    [updateListeningPrefs]
  );

  const setPreferredStyle = useCallback(
    (styleId?: RecitationStyleId) => {
      updateListeningPrefs((prev) => ({ ...prev, preferredStyleId: styleId }));
    },
    [updateListeningPrefs]
  );

  const addRecentSearch = useCallback(
    (query: string) => {
      const clean = query.trim();
      if (clean.length < 2) return;
      updateListeningPrefs((prev) => ({
        ...prev,
        recentSearches: [
          clean,
          ...prev.recentSearches.filter((q) => q !== clean),
        ].slice(0, 8),
      }));
    },
    [updateListeningPrefs]
  );

  const clearRecentSearches = useCallback(() => {
    updateListeningPrefs((prev) => ({ ...prev, recentSearches: [] }));
  }, [updateListeningPrefs]);

  const removeHistoryEntry = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((item) => item.id !== id);
      safeSaveStorage(HISTORY_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    safeSaveStorage(HISTORY_STORAGE_KEY, []);
  }, []);

  // Periodically persist current Quran / Lecture position while playing
  useEffect(() => {
    if (!track || track.kind === "radio" || status !== "playing") return;
    const interval = setInterval(() => {
      if (audioRef.current && !audioRef.current.paused) {
        if (track.kind === "quran") {
          saveQuranPosition(
            track.surahNumber,
            track.reciter.slug,
            audioRef.current.currentTime,
            audioRef.current.duration,
            track.reciter.moshafId
          );
        } else if (track.kind === "lecture") {
          updateHistoryProgress(
            `lecture-${track.lecture.id}`,
            audioRef.current.currentTime,
            audioRef.current.duration
          );
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [saveQuranPosition, status, track, updateHistoryProgress]);

  useEffect(() => {
    return () => {
      cleanupHls();
      stopStandardAudio();
    };
  }, [cleanupHls, stopStandardAudio]);

  const value = useMemo<AudioContextValue>(
    () => ({
      track,
      status,
      errorMessage,
      currentTime,
      duration,
      volume,
      muted,
      playbackRate,
      savedPosition,
      repeatMode,
      shuffle,
      sleepTimerRemainingSec,
      playerExpanded,
      setPlayerExpanded,
      queue,
      queueIndex,
      playlists,
      history,
      listeningPrefs,
      playSurah,
      playRadio,
      playLecture,
      togglePlayPause,
      stop,
      seekTo,
      setVolume,
      toggleMute,
      setPlaybackRate,
      nextSurah,
      prevSurah,
      setRepeatMode,
      cycleRepeatMode,
      toggleShuffle,
      setSleepTimer,
      addToQueue,
      addNextToQueue,
      removeFromQueue,
      reorderQueue,
      clearQueue,
      playQueueItem,
      saveQueueAsPlaylist,
      createPlaylist,
      deletePlaylist,
      removePlaylistItem,
      playPlaylist,
      toggleFavoriteReciter,
      toggleFavoriteSurah,
      toggleFavoriteLecture,
      setPreferredReciter,
      setPreferredRiwayah,
      setPreferredStyle,
      addRecentSearch,
      clearRecentSearches,
      removeHistoryEntry,
      clearHistory,
    }),
    [
      track,
      status,
      errorMessage,
      currentTime,
      duration,
      volume,
      muted,
      playbackRate,
      savedPosition,
      repeatMode,
      shuffle,
      sleepTimerRemainingSec,
      playerExpanded,
      queue,
      queueIndex,
      playlists,
      history,
      listeningPrefs,
      playSurah,
      playRadio,
      playLecture,
      togglePlayPause,
      stop,
      seekTo,
      setVolume,
      toggleMute,
      setPlaybackRate,
      nextSurah,
      prevSurah,
      cycleRepeatMode,
      toggleShuffle,
      setSleepTimer,
      addToQueue,
      addNextToQueue,
      removeFromQueue,
      reorderQueue,
      clearQueue,
      playQueueItem,
      saveQueueAsPlaylist,
      createPlaylist,
      deletePlaylist,
      removePlaylistItem,
      playPlaylist,
      toggleFavoriteReciter,
      toggleFavoriteSurah,
      toggleFavoriteLecture,
      setPreferredReciter,
      setPreferredRiwayah,
      setPreferredStyle,
      addRecentSearch,
      clearRecentSearches,
      removeHistoryEntry,
      clearHistory,
    ]
  );

  return (
    <AudioContext.Provider value={value}>
      {children}
      {/* Persistent Audio Element */}
      <audio
        ref={audioRef}
        preload="none"
        onLoadStart={() => setStatus("loading")}
        onCanPlay={() => {
          if (pendingSeekRef.current && audioRef.current) {
            audioRef.current.currentTime = pendingSeekRef.current;
            pendingSeekRef.current = null;
          }
        }}
        onPlaying={() => {
          setStatus("playing");
          setErrorMessage(null);
        }}
        onPause={() => {
          if (track?.kind === "quran" && audioRef.current) {
            saveQuranPosition(
              track.surahNumber,
              track.reciter.slug,
              audioRef.current.currentTime,
              audioRef.current.duration,
              track.reciter.moshafId
            );
          }
          setStatus((prev) => (prev === "idle" || prev === "error" ? prev : "paused"));
        }}
        onWaiting={() => setStatus("loading")}
        onStalled={() => {
          setErrorMessage("تأخر تحميل الصوت من الشبكة؛ جاري إعادة المحاولة...");
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onDurationChange={() => {
          if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => {
          if (repeatMode === "one" && audioRef.current) {
            audioRef.current.currentTime = 0;
            void audioRef.current.play();
            return;
          }
          if (queue.length > 0 && queueIndex >= 0) {
            nextSurah();
            return;
          }
          if (track?.kind === "quran") {
            const nextNum = getAdjacentAvailableSurah(
              track.surahNumber,
              1,
              track.reciter
            );
            if (nextNum) {
              playSurah(nextNum, track.reciter);
            } else {
              setStatus("paused");
            }
          } else {
            setStatus("paused");
          }
        }}
        onError={() => {
          if (!track) return;
          const mediaErr = audioRef.current?.error;
          setStatus("error");
          if (mediaErr?.code === 2) {
            setErrorMessage(
              "تعذر التحميل بسبب انقطاع الشبكة أو قيود الاتصال. تحقق من الإنترنت وأعد المحاولة."
            );
          } else if (mediaErr?.code === 3 || mediaErr?.code === 4) {
            setErrorMessage(
              "ملف الصوت غير مدعوم أو غير متاح حالياً من المصدر الأصلي."
            );
          } else {
            setErrorMessage(
              "تعذر تشغيل الملف الصوتي من المصدر. يرجى اختيار تسجيل أو سورة أخرى."
            );
          }
        }}
      />
      {/* Hidden Video Element for HLS Radio Streams */}
      <video
        ref={hlsVideoRef}
        playsInline
        className="sr-only"
        aria-hidden="true"
        onWaiting={() => {
          if (track?.kind === "radio") setStatus("loading");
        }}
        onPlaying={() => {
          if (track?.kind === "radio") {
            setStatus("playing");
            setErrorMessage(null);
          }
        }}
        onPause={() => {
          if (track?.kind === "radio") {
            setStatus((prev) => (prev === "idle" || prev === "error" ? prev : "paused"));
          }
        }}
        onError={() => {
          if (track?.kind === "radio") {
            setStatus("error");
            setErrorMessage(
              "انقطع البث المباشر حالياً، حاول إعادة التشغيل أو تبديل المحطة."
            );
          }
        }}
      />
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return ctx;
}

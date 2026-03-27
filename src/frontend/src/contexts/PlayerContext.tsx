import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Station } from "../types";

export interface NowPlaying {
  title: string;
  artist: string;
  coverUrl: string | null;
}

interface PlayerState {
  currentStation: Station | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  stationList: Station[];
  nowPlaying: NowPlaying | null;
  isExpanded: boolean;
  play: (station: Station) => void;
  pause: () => void;
  togglePlay: () => void;
  setVolume: (v: number) => void;
  setStationList: (s: Station[]) => void;
  playNext: () => void;
  playPrev: () => void;
  setExpanded: (v: boolean) => void;
}

const PlayerContext = createContext<PlayerState | null>(null);

// Singleton audio element
const audio = new Audio();

async function fetchIcyMetadata(
  streamUrl: string,
): Promise<{ title: string; artist: string } | null> {
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(streamUrl)}`;
    const response = await fetch(proxyUrl, {
      headers: { "Icy-MetaData": "1" },
      signal: AbortSignal.timeout(6000),
    });
    const reader = response.body?.getReader();
    if (!reader) return null;
    const { value } = await reader.read();
    reader.cancel();
    if (!value) return null;
    const text = new TextDecoder("latin1").decode(value);
    const match = text.match(/StreamTitle='([^;]*)'/i);
    if (match) {
      const streamTitle = match[1].trim();
      const parts = streamTitle.split(" - ");
      if (parts.length >= 2) {
        return {
          artist: parts[0].trim(),
          title: parts.slice(1).join(" - ").trim(),
        };
      }
      if (streamTitle) return { artist: "", title: streamTitle };
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchCoverArt(
  artist: string,
  title: string,
): Promise<string | null> {
  if (!artist && !title) return null;
  try {
    const term = [artist, title].filter(Boolean).join(" ");
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&limit=1`,
    );
    const data = await res.json();
    if (data.results?.[0]?.artworkUrl100) {
      return data.results[0].artworkUrl100.replace("100x100bb", "500x500bb");
    }
    return null;
  } catch {
    return null;
  }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [stationList, setStationList] = useState<Station[]>([]);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [isExpanded, setExpanded] = useState(false);
  const currentStationRef = useRef<Station | null>(null);
  const metadataIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const lastMetadataRef = useRef<string>("");

  audio.volume = volume;

  const startMetadataPolling = useCallback((station: Station) => {
    if (metadataIntervalRef.current) {
      clearInterval(metadataIntervalRef.current);
    }
    lastMetadataRef.current = "";

    const poll = async () => {
      const meta = await fetchIcyMetadata(station.url_resolved);
      if (!meta) return;
      const key = `${meta.artist}|${meta.title}`;
      if (key === lastMetadataRef.current) return;
      lastMetadataRef.current = key;
      // fetch cover async without blocking
      const coverUrl = await fetchCoverArt(meta.artist, meta.title);
      setNowPlaying({ artist: meta.artist, title: meta.title, coverUrl });
    };

    poll();
    metadataIntervalRef.current = setInterval(poll, 15000);
  }, []);

  const stopMetadataPolling = useCallback(() => {
    if (metadataIntervalRef.current) {
      clearInterval(metadataIntervalRef.current);
      metadataIntervalRef.current = null;
    }
    setNowPlaying(null);
    lastMetadataRef.current = "";
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (metadataIntervalRef.current)
        clearInterval(metadataIntervalRef.current);
    };
  }, []);

  const play = useCallback(
    (station: Station) => {
      const isSameStation =
        currentStationRef.current?.stationuuid === station.stationuuid;

      if (isSameStation && isPlaying) {
        return;
      }

      stopMetadataPolling();

      setCurrentStation(station);
      currentStationRef.current = station;
      setIsPlaying(true);
      setIsLoading(true);

      audio.src = station.url_resolved;
      audio.load();

      const onCanPlay = () => {
        setIsLoading(false);
        audio.play().catch(() => setIsPlaying(false));
      };

      const onError = () => {
        setIsLoading(false);
        setIsPlaying(false);
      };

      audio.oncanplay = onCanPlay;
      audio.onerror = onError;
      audio.onended = () => setIsPlaying(false);
      audio.onplaying = () => {
        setIsPlaying(true);
        setIsLoading(false);
        startMetadataPolling(station);
      };

      audio.play().catch(() => {});
    },
    [isPlaying, startMetadataPolling, stopMetadataPolling],
  );

  const pause = useCallback(() => {
    audio.pause();
    setIsPlaying(false);
    stopMetadataPolling();
  }, [stopMetadataPolling]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else if (currentStation) {
      setIsPlaying(true);
      audio.play().catch(() => setIsPlaying(false));
      if (currentStation) startMetadataPolling(currentStation);
    }
  }, [isPlaying, currentStation, pause, startMetadataPolling]);

  const setVolume = useCallback((v: number) => {
    audio.volume = v;
    setVolumeState(v);
  }, []);

  const playNext = useCallback(() => {
    if (!currentStationRef.current || stationList.length === 0) return;
    const idx = stationList.findIndex(
      (s) => s.stationuuid === currentStationRef.current?.stationuuid,
    );
    const nextIdx = idx === -1 ? 0 : (idx + 1) % stationList.length;
    play(stationList[nextIdx]);
  }, [stationList, play]);

  const playPrev = useCallback(() => {
    if (!currentStationRef.current || stationList.length === 0) return;
    const idx = stationList.findIndex(
      (s) => s.stationuuid === currentStationRef.current?.stationuuid,
    );
    const prevIdx = idx <= 0 ? stationList.length - 1 : idx - 1;
    play(stationList[prevIdx]);
  }, [stationList, play]);

  return (
    <PlayerContext.Provider
      value={{
        currentStation,
        isPlaying,
        isLoading,
        volume,
        stationList,
        nowPlaying,
        isExpanded,
        play,
        pause,
        togglePlay,
        setVolume,
        setStationList,
        playNext,
        playPrev,
        setExpanded,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be inside PlayerProvider");
  return ctx;
}

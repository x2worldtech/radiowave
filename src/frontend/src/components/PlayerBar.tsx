import { Slider } from "@/components/ui/slider";
import {
  Pause,
  Play,
  Radio,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState } from "react";
import { usePlayer } from "../contexts/PlayerContext";

export function PlayerBar() {
  const {
    currentStation,
    isPlaying,
    isLoading,
    volume,
    nowPlaying,
    togglePlay,
    setVolume,
    playNext,
    playPrev,
    setExpanded,
  } = usePlayer();
  const [imgError, setImgError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  if (!currentStation) return null;

  const coverUrl =
    nowPlaying?.coverUrl && !coverError ? nowPlaying.coverUrl : null;
  const showFavicon = !coverUrl && currentStation.favicon && !imgError;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 player-blur border-t border-border mb-[56px] md:mb-0"
      data-ocid="player.panel"
    >
      <div className="max-w-screen-xl mx-auto px-4 h-[72px] md:h-[80px] flex items-center gap-3 md:gap-6">
        {/* Left: station info — clickable to expand */}
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex items-center gap-3 min-w-0 flex-1 text-left"
          data-ocid="player.open_modal_button"
          aria-label="Open full player"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted/50 flex items-center justify-center">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={nowPlaying?.title || currentStation.name}
                className="w-full h-full object-cover"
                onError={() => setCoverError(true)}
              />
            ) : showFavicon ? (
              <img
                src={currentStation.favicon}
                alt={currentStation.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <Radio className="h-5 w-5 text-primary/60" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-0.5">
              NOW PLAYING
            </p>
            {nowPlaying?.title ? (
              <>
                <p className="text-sm font-semibold text-foreground line-clamp-1">
                  {nowPlaying.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {nowPlaying.artist || currentStation.name}
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold text-foreground line-clamp-1">
                {currentStation.name}
              </p>
            )}
          </div>
        </button>

        {/* Center: prev / play / next */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={playPrev}
            className="hidden sm:flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="player.pagination_prev"
            aria-label="Previous station"
          >
            <SkipBack className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            disabled={isLoading}
            className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 teal-glow disabled:opacity-60"
            data-ocid="player.button"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isLoading ? (
              <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={playNext}
            className="hidden sm:flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="player.pagination_next"
            aria-label="Next station"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Right: volume (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-3 flex-1 justify-end">
          <button
            type="button"
            onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle mute"
          >
            {volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          <div className="w-28">
            <Slider
              value={[volume * 100]}
              onValueChange={([v]) => setVolume(v / 100)}
              min={0}
              max={100}
              step={1}
              className="[&_[data-slot=slider-thumb]]:bg-primary [&_[data-slot=slider-range]]:bg-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

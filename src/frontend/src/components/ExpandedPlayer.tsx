import { Slider } from "@/components/ui/slider";
import {
  ChevronDown,
  Pause,
  Play,
  Radio,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { usePlayer } from "../contexts/PlayerContext";

export function ExpandedPlayer() {
  const {
    currentStation,
    isPlaying,
    isLoading,
    volume,
    nowPlaying,
    isExpanded,
    togglePlay,
    setVolume,
    playNext,
    playPrev,
    setExpanded,
  } = usePlayer();

  const [imgError, setImgError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  const coverUrl =
    nowPlaying?.coverUrl && !coverError ? nowPlaying.coverUrl : null;
  const faviconUrl =
    currentStation?.favicon && !imgError ? currentStation.favicon : null;

  return (
    <AnimatePresence>
      {isExpanded && currentStation && (
        <motion.div
          key="expanded-player"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 35 }}
          className="fixed inset-0 z-[100] flex flex-col"
          data-ocid="expanded_player.panel"
        >
          {/* Dynamic background */}
          <div className="absolute inset-0 overflow-hidden">
            {coverUrl ? (
              <>
                <img
                  src={coverUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover scale-110"
                  style={{
                    filter: "blur(60px) brightness(0.35) saturate(1.6)",
                  }}
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-background/60" />
              </>
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 60% at 30% 30%, oklch(0.35 0.1 193 / 0.6) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 70% 70%, oklch(0.25 0.08 220 / 0.5) 0%, transparent 60%), oklch(0.09 0.012 222)",
                }}
              />
            )}
          </div>

          {/* Content */}
          <div className="relative flex flex-col h-full px-6 pt-safe-top">
            {/* Top bar */}
            <div className="flex items-center justify-between pt-12 pb-6">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                data-ocid="expanded_player.close_button"
                aria-label="Close player"
              >
                <ChevronDown className="h-6 w-6 text-foreground" />
              </button>
              <div className="text-center">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                  Now Playing
                </p>
                <p className="text-sm font-semibold text-foreground/80 line-clamp-1 max-w-[200px]">
                  {currentStation.name}
                </p>
              </div>
              <div className="w-10 h-10" />
            </div>

            {/* Album art */}
            <div className="flex-1 flex items-center justify-center py-4">
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden shadow-2xl"
                style={{ boxShadow: "0 25px 60px oklch(0 0 0 / 0.6)" }}
              >
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={nowPlaying?.title || currentStation.name}
                    className="w-full h-full object-cover"
                    onError={() => setCoverError(true)}
                  />
                ) : faviconUrl ? (
                  <div className="w-full h-full bg-card flex items-center justify-center">
                    <img
                      src={faviconUrl}
                      alt={currentStation.name}
                      className="w-32 h-32 object-contain"
                      onError={() => setImgError(true)}
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.25 0.06 193), oklch(0.2 0.05 220))",
                    }}
                  >
                    <Radio className="h-24 w-24 text-primary/40" />
                  </div>
                )}
              </motion.div>
            </div>

            {/* Song info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="pb-4"
            >
              {nowPlaying?.title ? (
                <>
                  <h2 className="text-2xl font-bold text-foreground line-clamp-1 mb-1">
                    {nowPlaying.title}
                  </h2>
                  <p className="text-base text-muted-foreground line-clamp-1">
                    {nowPlaying.artist || currentStation.name}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-foreground line-clamp-1 mb-1">
                    {currentStation.name}
                  </h2>
                  <p className="text-base text-muted-foreground">
                    {currentStation.country || "Live Radio"}
                  </p>
                </>
              )}
            </motion.div>

            {/* Controls */}
            <div className="pb-8">
              {/* Prev / Play / Next */}
              <div className="flex items-center justify-center gap-8 mb-8">
                <button
                  type="button"
                  onClick={playPrev}
                  className="w-12 h-12 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
                  data-ocid="expanded_player.pagination_prev"
                  aria-label="Previous station"
                >
                  <SkipBack className="h-7 w-7 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={isLoading}
                  className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 disabled:opacity-60"
                  style={{ boxShadow: "0 0 30px oklch(0.74 0.115 193 / 0.4)" }}
                  data-ocid="expanded_player.button"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isLoading ? (
                    <span className="h-6 w-6 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-7 w-7 fill-current" />
                  ) : (
                    <Play className="h-7 w-7 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={playNext}
                  className="w-12 h-12 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
                  data-ocid="expanded_player.pagination_next"
                  aria-label="Next station"
                >
                  <SkipForward className="h-7 w-7 fill-current" />
                </button>
              </div>

              {/* Volume slider */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  aria-label="Toggle mute"
                >
                  {volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
                <Slider
                  value={[volume * 100]}
                  onValueChange={([v]) => setVolume(v / 100)}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1 [&_[data-slot=slider-thumb]]:bg-primary [&_[data-slot=slider-range]]:bg-primary"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

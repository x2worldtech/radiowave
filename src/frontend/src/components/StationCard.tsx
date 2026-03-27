import { Heart, Pause, Play, Radio } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useFavorites } from "../contexts/FavoritesContext";
import { usePlayer } from "../contexts/PlayerContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { getFlagEmoji, parseTags } from "../hooks/useRadioAPI";
import type { Station } from "../types";

interface Props {
  station: Station;
  index?: number;
}

export function StationCard({ station, index = 0 }: Props) {
  const { currentStation, isPlaying, play, pause } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { identity } = useInternetIdentity();
  const [imgError, setImgError] = useState(false);

  const isActive = currentStation?.stationuuid === station.stationuuid;
  const isCurrentlyPlaying = isActive && isPlaying;
  const liked = isFavorite(station.stationuuid);
  const tags = parseTags(station.tags);
  const flag = getFlagEmoji(station.countrycode);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentlyPlaying) {
      pause();
    } else {
      play(station);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!identity) return;
    toggleFavorite(station.stationuuid);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onClick={() => play(station)}
      className={`card-gradient rounded-2xl border p-4 flex flex-col gap-3 cursor-pointer shadow-card transition-all duration-200 hover:border-primary/50 hover:shadow-glow group relative ${
        isActive ? "border-primary/70 shadow-glow" : "border-border"
      }`}
      data-ocid="station.card"
    >
      {/* Favorite button */}
      {identity && (
        <button
          type="button"
          onClick={handleFavorite}
          className={`absolute top-3 right-3 p-1.5 rounded-full transition-all duration-150 z-10 ${
            liked
              ? "text-destructive"
              : "text-muted-foreground opacity-0 group-hover:opacity-100"
          }`}
          data-ocid="station.toggle"
          aria-label={liked ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
        </button>
      )}

      {/* Station logo */}
      <div className="mx-auto w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center bg-muted/50 flex-shrink-0">
        {station.favicon && !imgError ? (
          <img
            src={station.favicon}
            alt={station.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <Radio className="h-9 w-9 text-primary/60" />
        )}
      </div>

      {/* Info */}
      <div className="text-center space-y-1 flex-1">
        <p className="text-sm font-semibold text-foreground line-clamp-1">
          {station.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {flag} {station.country || "Unknown"}
        </p>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium capitalize"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
          <span className="text-[10px] font-semibold text-destructive uppercase tracking-widest">
            LIVE
          </span>
        </div>
        <button
          type="button"
          onClick={handlePlay}
          className={`h-9 w-9 rounded-full flex items-center justify-center transition-all duration-150 flex-shrink-0 ${
            isActive
              ? "bg-primary text-primary-foreground teal-glow"
              : "bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
          }`}
          data-ocid="station.button"
          aria-label={isCurrentlyPlaying ? "Pause" : "Play"}
        >
          {isCurrentlyPlaying ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="h-4 w-4 fill-current ml-0.5" />
          )}
        </button>
      </div>
    </motion.div>
  );
}

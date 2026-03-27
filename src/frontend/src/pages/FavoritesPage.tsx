import { Button } from "@/components/ui/button";
import { Heart, LogIn, Radio } from "lucide-react";
import { useEffect } from "react";
import { SkeletonGrid } from "../components/SkeletonCard";
import { StationCard } from "../components/StationCard";
import { useFavorites } from "../contexts/FavoritesContext";
import { usePlayer } from "../contexts/PlayerContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useStationsByUUID } from "../hooks/useRadioAPI";

export function FavoritesPage() {
  const { favorites, isLoaded } = useFavorites();
  const { stations, loading, fetchByUUIDs } = useStationsByUUID();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { setStationList } = usePlayer();

  useEffect(() => {
    if (isLoaded && favorites.length > 0) {
      fetchByUUIDs(favorites);
    }
  }, [favorites, isLoaded, fetchByUUIDs]);

  useEffect(() => {
    if (stations.length > 0) {
      setStationList(stations);
    }
  }, [stations, setStationList]);

  if (!identity) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 pt-8 pb-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
          <Heart className="h-9 w-9 text-primary/50" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Your Favorites
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xs">
          Sign in to save and access your favorite radio stations from any
          device.
        </p>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="bg-primary text-primary-foreground hover:bg-primary/90 teal-glow rounded-xl h-11 px-8"
          data-ocid="favorites.login.button"
        >
          {isLoggingIn ? (
            <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <LogIn className="h-4 w-4 mr-2" />
          )}
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 pt-8 pb-10">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold text-foreground">Favorites</h1>
        {isLoaded && (
          <span className="text-sm text-muted-foreground px-2 py-0.5 bg-muted/50 rounded-full">
            {favorites.length}
          </span>
        )}
      </div>

      {!isLoaded || loading ? (
        <SkeletonGrid count={4} />
      ) : favorites.length === 0 ? (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="favorites.empty_state"
        >
          <Radio className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No favorites yet</p>
          <p className="text-sm mt-1">
            Tap the heart on any station to save it here
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          data-ocid="favorites.list"
        >
          {stations.map((s, i) => (
            <StationCard key={s.stationuuid} station={s} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

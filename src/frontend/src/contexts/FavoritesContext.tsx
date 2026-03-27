import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface FavoritesState {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  isLoaded: boolean;
}

const FavoritesContext = createContext<FavoritesState | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  // Load favorites when actor is available
  useEffect(() => {
    if (!actor || !identity) {
      setFavorites([]);
      setIsLoaded(false);
      return;
    }

    actor
      .getFavoriteStationIds()
      .then((res) => {
        if (res.__kind__ === "ok") {
          setFavorites(res.ok);
        } else {
          setFavorites([]);
        }
        setIsLoaded(true);
      })
      .catch(() => {
        setFavorites([]);
        setIsLoaded(true);
      });
  }, [actor, identity]);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      if (!actor || !identity) return;

      const wasLiked = favorites.includes(id);

      // Optimistic update
      setFavorites((prev) =>
        wasLiked ? prev.filter((f) => f !== id) : [...prev, id],
      );

      const call = wasLiked ? actor.removeFavorite(id) : actor.addFavorite(id);
      call.catch(() => {
        // Revert on error
        setFavorites((prev) =>
          wasLiked ? [...prev, id] : prev.filter((f) => f !== id),
        );
      });
    },
    [actor, identity, favorites],
  );

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, toggleFavorite, isLoaded }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be inside FavoritesProvider");
  return ctx;
}

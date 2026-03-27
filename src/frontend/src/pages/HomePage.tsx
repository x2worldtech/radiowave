import { Input } from "@/components/ui/input";
import { Loader2, Radio, Search, X } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FilterBar } from "../components/FilterBar";
import { SkeletonGrid } from "../components/SkeletonCard";
import { StationCard } from "../components/StationCard";
import { usePlayer } from "../contexts/PlayerContext";
import { useStations } from "../hooks/useRadioAPI";
import type { Page } from "../types";

interface Props {
  onNavigate: (page: Page) => void;
}

export function HomePage({ onNavigate: _onNavigate }: Props) {
  const {
    stations,
    loading,
    loadingMore,
    hasMore,
    initialize,
    applyFilters,
    fetchMore,
  } = useStations();
  const [country, setCountry] = useState("all");
  const [genre, setGenre] = useState("all");
  const [query, setQuery] = useState("");
  const { setStationList } = usePlayer();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const triggerSearch = useCallback(
    (q: string, c: string, g: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        applyFilters(q, c === "all" ? "" : c, g === "all" ? "" : g);
      }, 350);
    },
    [applyFilters],
  );

  useEffect(() => {
    triggerSearch(query, country, genre);
  }, [query, country, genre, triggerSearch]);

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchMore();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchMore, hasMore, loadingMore]);

  useEffect(() => {
    if (stations.length > 0) {
      setStationList(stations);
    }
  }, [stations, setStationList]);

  const hasFilters = query || country !== "all" || genre !== "all";

  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient pt-16 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/8 blur-3xl" />
        </div>
        <div className="relative max-w-screen-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold mb-6">
              <Radio className="h-3 w-3" />
              30,000+ Radio Stations Worldwide
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4 leading-tight">
              Discover World
              <br />
              <span className="text-primary">Radio</span>
            </h1>
            <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto">
              Stream live radio from every corner of the globe. Filter by
              country, genre, and more.
            </p>

            {/* Search bar in hero */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by station name..."
                className="pl-10 pr-10 h-12 rounded-xl bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                data-ocid="search.input"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter + grid */}
      <section className="max-w-screen-xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
        >
          <FilterBar
            country={country}
            genre={genre}
            onCountryChange={setCountry}
            onGenreChange={setGenre}
          />
        </motion.div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            {hasFilters ? "Search Results" : "Trending Stations"}
          </h2>
          {!loading && (
            <span className="text-sm text-muted-foreground">
              {stations.length} stations{hasMore ? "+" : ""}
            </span>
          )}
        </div>

        {loading ? (
          <SkeletonGrid count={12} />
        ) : stations.length === 0 ? (
          <div
            className="text-center py-20 text-muted-foreground"
            data-ocid="stations.empty_state"
          >
            <Radio className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No stations found</p>
            <p className="text-sm mt-1">Try a different search or filter</p>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            data-ocid="stations.list"
          >
            {stations.map((s, i) => (
              <StationCard key={s.stationuuid} station={s} index={i} />
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        {hasMore && (
          <div
            ref={sentinelRef}
            className="h-16 flex items-center justify-center mt-4"
            data-ocid="stations.loading_state"
          >
            {loadingMore && (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </div>
        )}
        {!hasMore && stations.length > 0 && (
          <p className="text-center text-sm text-muted-foreground py-6">
            {stations.length} stations loaded
          </p>
        )}
      </section>
    </div>
  );
}

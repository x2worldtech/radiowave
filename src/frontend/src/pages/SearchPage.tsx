import { Input } from "@/components/ui/input";
import { Radio, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FilterBar } from "../components/FilterBar";
import { SkeletonGrid } from "../components/SkeletonCard";
import { StationCard } from "../components/StationCard";
import { usePlayer } from "../contexts/PlayerContext";
import { useSearchStations } from "../hooks/useRadioAPI";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");
  const [genre, setGenre] = useState("all");
  const { stations, loading, search } = useSearchStations();
  const inputRef = useRef<HTMLInputElement>(null);
  const { setStationList } = usePlayer();

  useEffect(() => {
    inputRef.current?.focus();
    search("", "", "");
  }, [search]);

  useEffect(() => {
    search(
      query,
      country === "all" ? "" : country,
      genre === "all" ? "" : genre,
    );
  }, [query, country, genre, search]);

  useEffect(() => {
    if (stations.length > 0) {
      setStationList(stations);
    }
  }, [stations, setStationList]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 pt-24 pb-10">
      <h1 className="text-3xl font-bold text-foreground mb-6">
        Search Stations
      </h1>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by station name..."
          className="pl-11 pr-10 h-12 bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50"
          data-ocid="search.search_input"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="search.close_button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mb-8">
        <FilterBar
          country={country}
          genre={genre}
          onCountryChange={setCountry}
          onGenreChange={setGenre}
        />
      </div>

      {loading ? (
        <SkeletonGrid count={8} />
      ) : stations.length === 0 ? (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="search.empty_state"
        >
          <Radio className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No stations found</p>
          <p className="text-sm mt-1">Try a different search term or filters</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {stations.length} stations found
          </p>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            data-ocid="search.list"
          >
            {stations.map((s, i) => (
              <StationCard key={s.stationuuid} station={s} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

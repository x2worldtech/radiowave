import { useCallback, useRef, useState } from "react";
import type { Country, Station, Tag } from "../types";

const BASE = "https://de1.api.radio-browser.info/json";

// In-memory cache
const cache = new Map<string, unknown>();

async function fetchJSON<T>(url: string): Promise<T> {
  if (cache.has(url)) return cache.get(url) as T;
  const res = await fetch(url, {
    headers: { "User-Agent": "RadioWave/1.0", Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  cache.set(url, data);
  return data;
}

const PAGE_SIZE = 50;

function buildSearchUrl(
  query: string,
  country: string,
  tag: string,
  offset: number,
): string {
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(offset),
    hidebroken: "true",
    order: "votes",
    reverse: "true",
  });
  if (query) params.set("name", query);
  if (country) params.set("countrycode", country);
  if (tag) params.set("tag", tag);
  return `${BASE}/stations/search?${params}`;
}

/** Unified hook: top stations when no filters, search when any filter/query is set. Both support infinite scroll with no upper limit. */
export function useStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const offsetRef = useRef(0);
  const queryRef = useRef("");
  const countryRef = useRef("");
  const tagRef = useRef("");
  const isFilteredRef = useRef(false);
  const loadingMoreRef = useRef(false);

  const load = useCallback(
    async (query: string, country: string, tag: string, reset: boolean) => {
      const filtered = !!(query || country || tag);
      const offset = reset ? 0 : offsetRef.current;

      if (reset) {
        setLoading(true);
        setError(null);
        setStations([]);
        setHasMore(true);
        offsetRef.current = 0;
      } else {
        if (loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
      }

      queryRef.current = query;
      countryRef.current = country;
      tagRef.current = tag;
      isFilteredRef.current = filtered;

      try {
        let data: Station[];
        if (filtered) {
          data = await fetchJSON<Station[]>(
            buildSearchUrl(query, country, tag, offset),
          );
        } else {
          data = await fetchJSON<Station[]>(
            `${BASE}/stations/topvote?limit=${PAGE_SIZE}&offset=${offset}&hidebroken=true&order=votes`,
          );
        }

        setStations((prev) => (reset ? data : [...prev, ...data]));
        const newOffset = offset + data.length;
        offsetRef.current = newOffset;
        setHasMore(data.length === PAGE_SIZE);
      } catch (e) {
        setError(String(e));
      } finally {
        if (reset) {
          setLoading(false);
        } else {
          loadingMoreRef.current = false;
          setLoadingMore(false);
        }
      }
    },
    [],
  );

  const initialize = useCallback(() => {
    load("", "", "", true);
  }, [load]);

  const applyFilters = useCallback(
    (query: string, country: string, tag: string) => {
      load(query, country, tag, true);
    },
    [load],
  );

  const fetchMore = useCallback(() => {
    load(queryRef.current, countryRef.current, tagRef.current, false);
  }, [load]);

  return {
    stations,
    loading,
    loadingMore,
    hasMore,
    error,
    initialize,
    applyFilters,
    fetchMore,
  };
}

// Keep legacy hooks for other pages
export function useTopStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const loadingMoreRef = useRef(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    offsetRef.current = 0;
    try {
      const data = await fetchJSON<Station[]>(
        `${BASE}/stations/topvote?limit=${PAGE_SIZE}&offset=0&hidebroken=true&order=votes`,
      );
      setStations(data);
      offsetRef.current = data.length;
      setHasMore(data.length === PAGE_SIZE);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const data = await fetchJSON<Station[]>(
        `${BASE}/stations/topvote?limit=${PAGE_SIZE}&offset=${offsetRef.current}&hidebroken=true&order=votes`,
      );
      setStations((prev) => {
        const combined = [...prev, ...data];
        offsetRef.current = combined.length;
        setHasMore(data.length === PAGE_SIZE);
        return combined;
      });
    } catch {
      // silently ignore
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore]);

  return { stations, loading, loadingMore, hasMore, error, fetch, fetchMore };
}

export function useSearchStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((query: string, country: string, tag: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await fetchJSON<Station[]>(
          buildSearchUrl(query, country, tag, 0),
        );
        setStations(data);
      } catch {
        setStations([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, []);

  return { stations, loading, search };
}

export function useStationsByUUID() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchByUUIDs = useCallback(async (uuids: string[]) => {
    if (!uuids.length) {
      setStations([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchJSON<Station[]>(
        `${BASE}/stations/byuuid?uuids=${uuids.join(",")}`,
      );
      setStations(data);
    } catch {
      setStations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stations, loading, fetchByUUIDs };
}

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchJSON<Country[]>(
        `${BASE}/countries?limit=200&order=stationcount&reverse=true&hidebroken=true`,
      );
      setCountries(data.filter((c) => c.name && c.iso_3166_1));
    } catch {
      setCountries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { countries, loading, fetchCountries };
}

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchJSON<Tag[]>(
        `${BASE}/tags?limit=80&order=stationcount&reverse=true&hidebroken=true`,
      );
      setTags(data.filter((t) => t.name && t.stationcount > 100));
    } catch {
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { tags, loading, fetchTags };
}

export function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌍";
  const code = countryCode.toUpperCase();
  return String.fromCodePoint(
    ...code.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

export function parseTags(tags: string, limit = 3): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && t.length < 20)
    .slice(0, limit);
}

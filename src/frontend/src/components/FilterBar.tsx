import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import { useCountries, useTags } from "../hooks/useRadioAPI";

interface Props {
  country: string;
  genre: string;
  onCountryChange: (v: string) => void;
  onGenreChange: (v: string) => void;
}

export function FilterBar({
  country,
  genre,
  onCountryChange,
  onGenreChange,
}: Props) {
  const { countries, fetchCountries } = useCountries();
  const { tags, fetchTags } = useTags();

  useEffect(() => {
    fetchCountries();
    fetchTags();
  }, [fetchCountries, fetchTags]);

  return (
    <div
      className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mx-auto"
      data-ocid="filter.panel"
    >
      <Select value={country} onValueChange={onCountryChange}>
        <SelectTrigger
          className="flex-1 bg-card border-border text-foreground h-11 rounded-xl"
          data-ocid="filter.country.select"
        >
          <SelectValue placeholder="🌍 All Countries" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border max-h-72">
          <SelectItem value="all">🌍 All Countries</SelectItem>
          {countries.slice(0, 100).map((c) => (
            <SelectItem key={c.iso_3166_1} value={c.iso_3166_1}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={genre} onValueChange={onGenreChange}>
        <SelectTrigger
          className="flex-1 bg-card border-border text-foreground h-11 rounded-xl"
          data-ocid="filter.genre.select"
        >
          <SelectValue placeholder="🎵 All Genres" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border max-h-72">
          <SelectItem value="all">🎵 All Genres</SelectItem>
          {tags.map((t) => (
            <SelectItem key={t.name} value={t.name}>
              {t.name.charAt(0).toUpperCase() + t.name.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

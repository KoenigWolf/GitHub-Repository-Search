"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { GITHUB_API, SORT_VALUES, type SortValue } from "@/lib/constants";
import { DEFAULT_LOCALE, type Locale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";
import { normalizeSortParam } from "@/lib/validators";
import { useSearchNavigation } from "@/hooks/useSearchNavigation";

interface SearchFormProps {
  locale?: Locale;
  initialQuery?: string;
  initialSort?: SortValue;
}

export function SearchForm({
  locale = DEFAULT_LOCALE,
  initialQuery = "",
  initialSort = SORT_VALUES[0],
}: SearchFormProps) {
  const { navigate, getParam, searchParams } = useSearchNavigation();
  const m = getMessages(locale);

  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortValue>(initialSort);

  useEffect(() => {
    setQuery(getParam("q") ?? "");
    setSort(normalizeSortParam(getParam("sort")));
  }, [searchParams, getParam]);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  const sortLabels = useMemo(
    (): Record<SortValue, string> => ({
      "best-match": m.sortBestMatch,
      "stars-desc": m.sortMostStars,
      "stars-asc": m.sortFewestStars,
      "forks-desc": m.sortMostForks,
      "forks-asc": m.sortFewestForks,
      "updated-desc": m.sortRecentlyUpdated,
      "updated-asc": m.sortLeastRecentlyUpdated,
    }),
    [m]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!trimmedQuery) return;

      navigate({ q: trimmedQuery, sort, page: 1 });
    },
    [trimmedQuery, sort, navigate]
  );

  const handleClear = useCallback(() => {
    setQuery("");
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label={m.searchAriaLabel}
      className="flex flex-col gap-4 sm:flex-row sm:items-center"
      suppressHydrationWarning
    >
      <SearchInput
        placeholder={m.searchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={handleClear}
        clearAriaLabel={m.clearSearch}
        maxLength={GITHUB_API.MAX_QUERY_LENGTH}
      />

      <Select
        value={sort}
        onChange={(e) => setSort(normalizeSortParam(e.target.value))}
        className="w-full sm:w-48"
        aria-label={m.sortAriaLabel}
      >
        {SORT_VALUES.map((value) => (
          <option key={value} value={value}>
            {sortLabels[value]}
          </option>
        ))}
      </Select>

      <Button type="submit" disabled={!trimmedQuery}>
        <Search className="mr-2 h-4 w-4" />
        {m.searchButton}
      </Button>
    </form>
  );
}

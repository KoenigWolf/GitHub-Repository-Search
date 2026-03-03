"use client";

import { useState, useCallback, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SORT_OPTIONS, type SortValue } from "@/lib/constants";
import type { Locale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";
import { normalizeSortParam } from "@/lib/validators";
import { useSearchNavigation } from "@/hooks/useSearchNavigation";

interface SearchFormProps {
  locale?: Locale;
}

export function SearchForm({ locale = "ja-JP" }: SearchFormProps) {
  const { navigate, getParam } = useSearchNavigation();
  const m = getMessages(locale);

  const [query, setQuery] = useState(getParam("q") ?? "");
  const [sort, setSort] = useState<SortValue>(
    normalizeSortParam(getParam("sort") ?? undefined)
  );

  const trimmedQuery = useMemo(() => query.trim(), [query]);

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
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={m.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={m.clearSearch}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Select
        value={sort}
        onChange={(e) => setSort(normalizeSortParam(e.target.value))}
        className="w-full sm:w-40"
        aria-label={m.sortAriaLabel}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
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

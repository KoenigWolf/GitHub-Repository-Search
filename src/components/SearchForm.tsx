"use client";

import { useState, useCallback, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { GITHUB_API } from "@/lib/constants";
import { DEFAULT_LOCALE, type Locale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";
import { useSearchNavigation } from "@/hooks/useSearchNavigation";

interface SearchFormProps {
  locale?: Locale;
  initialQuery?: string;
}

export function SearchForm({
  locale = DEFAULT_LOCALE,
  initialQuery = "",
}: SearchFormProps) {
  const { navigate, getParam, searchParams } = useSearchNavigation();
  const m = getMessages(locale);

  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(getParam("q") ?? "");
  }, [searchParams, getParam]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;

      navigate({ q: trimmed, page: 1 });
    },
    [query, navigate]
  );

  const isSubmitDisabled = !query.trim();

  const handleClear = useCallback(() => {
    setQuery("");
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label={m.searchAriaLabel}
      className="flex gap-2"
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

      <Button type="submit" disabled={isSubmitDisabled} className="shrink-0">
        <Search className="mr-2 h-4 w-4" />
        {m.searchButton}
      </Button>
    </form>
  );
}

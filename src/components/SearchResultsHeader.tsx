"use client";

import { useMemo, useCallback } from "react";
import { Select } from "@/components/ui/select";
import { SORT_VALUES, type SortValue } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import { DEFAULT_LOCALE, type Locale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";
import { normalizeSortParam } from "@/lib/validators";
import { useSearchNavigation } from "@/hooks/useSearchNavigation";

interface SearchResultsHeaderProps {
  totalCount: number;
  sort: SortValue;
  locale?: Locale;
}

export function SearchResultsHeader({
  totalCount,
  sort,
  locale = DEFAULT_LOCALE,
}: SearchResultsHeaderProps) {
  const { navigate } = useSearchNavigation();
  const m = getMessages(locale);

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

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSort = normalizeSortParam(e.target.value);
      navigate({ sort: newSort, page: 1 }, true);
    },
    [navigate]
  );

  return (
    <div className="flex items-center justify-between border-b border-border pb-4">
      <h2 className="text-sm font-semibold text-foreground">
        {formatNumber(totalCount, locale)} {m.repositoryResults}
      </h2>
      <div className="flex items-center gap-2">
        <label htmlFor="sort-select" className="text-sm text-muted-foreground">
          {m.sortLabel}
        </label>
        <Select
          id="sort-select"
          value={sort}
          onChange={handleSortChange}
          className="w-auto text-sm"
          aria-label={m.sortAriaLabel}
        >
          {SORT_VALUES.map((value) => (
            <option key={value} value={value}>
              {sortLabels[value]}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

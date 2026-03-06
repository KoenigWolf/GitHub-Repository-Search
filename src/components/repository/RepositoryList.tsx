import { RepositoryCard } from "./RepositoryCard";
import { Pagination } from "@/components/common";
import { SearchResultsHeader } from "@/components/search";
import type { GitHubRepository } from "@/lib/schemas";
import { GITHUB_API, type SortValue } from "@/lib/constants";
import { DEFAULT_LOCALE, type Locale, getMessages } from "@/lib/i18n";

interface RepositoryListProps {
  repositories: GitHubRepository[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  sort: SortValue;
  locale?: Locale;
  returnTo?: string;
}

export function RepositoryList({
  repositories,
  totalCount,
  currentPage,
  totalPages,
  sort,
  locale = DEFAULT_LOCALE,
  returnTo,
}: RepositoryListProps) {
  const m = getMessages(locale);

  return (
    <div className="space-y-4">
      <SearchResultsHeader totalCount={totalCount} sort={sort} locale={locale} />

      {totalCount > GITHUB_API.MAX_SEARCH_RESULTS && (
        <p className="text-xs text-muted-foreground">
          {m.apiLimitPrefix}
          {GITHUB_API.MAX_SEARCH_RESULTS.toLocaleString(locale)}
          {m.apiLimitSuffix}
        </p>
      )}

      <ul role="list">
        {repositories.map((repo) => (
          <li key={repo.id}>
            <RepositoryCard
              repository={repo}
              locale={locale}
              {...(returnTo !== undefined && { returnTo })}
            />
          </li>
        ))}
      </ul>

      <Pagination currentPage={currentPage} totalPages={totalPages} locale={locale} />
    </div>
  );
}

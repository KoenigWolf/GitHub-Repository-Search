import { RepositoryCard } from "@/components/RepositoryCard";
import { Pagination } from "@/components/Pagination";
import type { GitHubRepository } from "@/lib/schemas/github";
import { formatNumber } from "@/lib/utils";
import { GITHUB_API } from "@/lib/constants";
import { DEFAULT_LOCALE, type Locale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";

interface RepositoryListProps {
  repositories: GitHubRepository[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  query: string;
  locale?: Locale;
  returnTo?: string;
}

export function RepositoryList({
  repositories,
  totalCount,
  currentPage,
  totalPages,
  query,
  locale = DEFAULT_LOCALE,
  returnTo,
}: RepositoryListProps) {
  const m = getMessages(locale);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        &ldquo;{query}&rdquo; {m.searchResultSummary}: {formatNumber(totalCount, locale)}{" "}
        {m.itemsSuffix}
        {totalCount > GITHUB_API.MAX_SEARCH_RESULTS && (
          <span className="ml-2 text-xs">
            ({m.apiLimitPrefix}
            {GITHUB_API.MAX_SEARCH_RESULTS.toLocaleString(locale)}
            {m.apiLimitSuffix})
          </span>
        )}
      </div>

      <ul className="space-y-4" role="list">
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

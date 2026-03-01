import { RepositoryCard } from "@/components/RepositoryCard";
import { Pagination } from "@/components/Pagination";
import type { GitHubRepository } from "@/lib/schemas/github";
import { formatNumber } from "@/lib/utils";
import { GITHUB_API } from "@/lib/constants";

interface RepositoryListProps {
  repositories: GitHubRepository[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  query: string;
}

export function RepositoryList({
  repositories,
  totalCount,
  currentPage,
  totalPages,
  query,
}: RepositoryListProps) {
  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        &ldquo;{query}&rdquo; の検索結果: {formatNumber(totalCount)} 件
        {totalCount > GITHUB_API.MAX_SEARCH_RESULTS && (
          <span className="ml-2 text-xs">
            (GitHub APIの制限により最大{GITHUB_API.MAX_SEARCH_RESULTS.toLocaleString()}件まで表示)
          </span>
        )}
      </div>

      <ul className="space-y-4" role="list">
        {repositories.map((repo) => (
          <li key={repo.id}>
            <RepositoryCard repository={repo} />
          </li>
        ))}
      </ul>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}

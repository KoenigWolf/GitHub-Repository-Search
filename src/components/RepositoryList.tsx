import { RepositoryCard } from "@/components/RepositoryCard";
import { Pagination } from "@/components/Pagination";
import type { GitHubRepository } from "@/types/github";
import { formatNumber } from "@/lib/utils";

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
        {totalCount > 1000 && (
          <span className="ml-2 text-xs">
            (GitHub APIの制限により最大1,000件まで表示)
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

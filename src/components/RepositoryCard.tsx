import Image from "next/image";
import Link from "next/link";
import { Star, GitFork, AlertCircle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { GitHubRepository } from "@/types/github";
import { formatNumber, formatDate } from "@/lib/utils";

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
};

interface RepositoryCardProps {
  repository: GitHubRepository;
}

export function RepositoryCard({ repository }: RepositoryCardProps) {
  const {
    full_name,
    description,
    owner,
    language,
    stargazers_count,
    forks_count,
    open_issues_count,
    updated_at,
    topics,
  } = repository;

  const displayTopics = topics.slice(0, 5);
  const remainingTopics = topics.length - 5;

  return (
    <article
      className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
      aria-label={`${full_name} リポジトリ`}
    >
      <div className="flex items-start gap-3">
        <Image
          src={owner.avatar_url}
          alt={`${owner.login} のアバター`}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="min-w-0 flex-1">
          <Link
            href={`/repositories/${owner.login}/${repository.name}`}
            className="text-lg font-semibold text-primary hover:underline"
          >
            {full_name}
          </Link>

          {description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {language && (
              <span className="flex items-center gap-1">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: LANGUAGE_COLORS[language] ?? "#808080",
                  }}
                  aria-hidden="true"
                />
                {language}
              </span>
            )}

            <span className="flex items-center gap-1" title="スター数">
              <Star className="h-4 w-4" aria-hidden="true" />
              <span aria-label={`${stargazers_count} スター`}>
                {formatNumber(stargazers_count)}
              </span>
            </span>

            <span className="flex items-center gap-1" title="フォーク数">
              <GitFork className="h-4 w-4" aria-hidden="true" />
              <span aria-label={`${forks_count} フォーク`}>
                {formatNumber(forks_count)}
              </span>
            </span>

            <span className="flex items-center gap-1" title="Issue数">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <span aria-label={`${open_issues_count} イシュー`}>
                {formatNumber(open_issues_count)}
              </span>
            </span>

            <span className="flex items-center gap-1" title="更新日">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <time dateTime={updated_at}>{formatDate(updated_at)}</time>
            </span>
          </div>

          {displayTopics.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {displayTopics.map((topic) => (
                <Badge key={topic} variant="secondary">
                  {topic}
                </Badge>
              ))}
              {remainingTopics > 0 && (
                <Badge variant="outline">+{remainingTopics}</Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

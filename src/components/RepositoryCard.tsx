import Image from "next/image";
import Link from "next/link";
import { Star, GitFork, AlertCircle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { GitHubRepository } from "@/types/github";
import { formatNumber, formatDate } from "@/lib/utils";
import { LANGUAGE_COLORS, DEFAULT_LANGUAGE_COLOR } from "@/lib/constants";

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
                    backgroundColor: LANGUAGE_COLORS[language] ?? DEFAULT_LANGUAGE_COLOR,
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

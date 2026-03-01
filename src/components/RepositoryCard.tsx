import Image from "next/image";
import Link from "next/link";
import { Star, GitFork, AlertCircle, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { IconText } from "@/components/ui/icon-text";
import { RepositoryTopics } from "@/components/RepositoryTopics";
import type { GitHubRepository } from "@/lib/schemas/github";
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

  return (
    <Card as="article" hover className="p-4" aria-label={`${full_name} リポジトリ`}>
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

            <IconText icon={Star} title="スター数">
              <span aria-label={`${stargazers_count} スター`}>
                {formatNumber(stargazers_count)}
              </span>
            </IconText>

            <IconText icon={GitFork} title="フォーク数">
              <span aria-label={`${forks_count} フォーク`}>
                {formatNumber(forks_count)}
              </span>
            </IconText>

            <IconText icon={AlertCircle} title="Issue数">
              <span aria-label={`${open_issues_count} イシュー`}>
                {formatNumber(open_issues_count)}
              </span>
            </IconText>

            <IconText icon={Calendar} title="更新日">
              <time dateTime={updated_at}>{formatDate(updated_at)}</time>
            </IconText>
          </div>

          {topics.length > 0 && (
            <div className="mt-3">
              <RepositoryTopics topics={topics} />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

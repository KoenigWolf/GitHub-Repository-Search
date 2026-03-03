import Link from "next/link";
import { Star, GitFork, AlertCircle, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { IconText } from "@/components/ui/icon-text";
import { OwnerAvatar } from "@/components/OwnerAvatar";
import { RepositoryTopics } from "@/components/RepositoryTopics";
import type { GitHubRepository } from "@/lib/schemas/github";
import { formatNumber, formatDate } from "@/lib/utils";
import { LANGUAGE_COLORS, DEFAULT_LANGUAGE_COLOR } from "@/lib/constants";
import { DEFAULT_LOCALE, type Locale, toLangParam } from "@/lib/locale";
import { getMessages } from "@/lib/messages";

interface RepositoryCardProps {
  repository: GitHubRepository;
  locale?: Locale;
}

export function RepositoryCard({
  repository,
  locale = DEFAULT_LOCALE,
}: RepositoryCardProps) {
  const m = getMessages(locale);
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
  const lang = toLangParam(locale);
  const repositoryHref = `/repositories/${owner.login}/${repository.name}${
    lang === "en" ? "?lang=en" : ""
  }`;

  return (
    <Card
      as="article"
      hover
      className="p-4"
      aria-label={`${full_name} ${m.repositoryAriaSuffix}`}
    >
      <div className="flex items-start gap-3">
        <OwnerAvatar login={owner.login} avatarUrl={owner.avatar_url} locale={locale} />
        <div className="min-w-0 flex-1">
          <Link
            href={repositoryHref}
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

            <IconText icon={Star} title={m.stars}>
              <span aria-label={`${stargazers_count} ${m.starsSuffix}`}>
                {formatNumber(stargazers_count, locale)}
              </span>
            </IconText>

            <IconText icon={GitFork} title={m.forks}>
              <span aria-label={`${forks_count} ${m.forksSuffix}`}>
                {formatNumber(forks_count, locale)}
              </span>
            </IconText>

            <IconText icon={AlertCircle} title={m.issues}>
              <span aria-label={`${open_issues_count} ${m.issuesSuffix}`}>
                {formatNumber(open_issues_count, locale)}
              </span>
            </IconText>

            <IconText icon={Calendar} title={m.updatedAt}>
              <time dateTime={updated_at}>{formatDate(updated_at, locale)}</time>
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

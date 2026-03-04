import { memo } from "react";
import Link from "next/link";
import { Star, GitFork, Calendar } from "lucide-react";
import { IconText } from "@/components/ui/icon-text";
import { LanguageBadge } from "@/components/ui/language-badge";
import { StatDisplay } from "@/components/ui/stat-display";
import { OwnerAvatar } from "@/components/OwnerAvatar";
import { RepositoryTopics } from "@/components/RepositoryTopics";
import type { GitHubRepository } from "@/lib/schemas/github";
import { formatDate } from "@/lib/utils";
import { DEFAULT_LOCALE, type Locale, toLangParam } from "@/lib/locale";
import { getMessages } from "@/lib/messages";

interface RepositoryCardProps {
  repository: GitHubRepository;
  locale?: Locale;
  returnTo?: string;
}

export const RepositoryCard = memo(function RepositoryCard({
  repository,
  locale = DEFAULT_LOCALE,
  returnTo,
}: RepositoryCardProps) {
  const m = getMessages(locale);
  const {
    full_name,
    description,
    owner,
    language,
    stargazers_count,
    forks_count,
    updated_at,
    topics,
  } = repository;
  const lang = toLangParam(locale);
  const queryParams = new URLSearchParams();
  if (lang === "en") {
    queryParams.set("lang", "en");
  }
  if (returnTo) {
    queryParams.set("returnTo", returnTo);
  }
  const queryString = queryParams.toString();
  const repositoryHref = `/repositories/${owner.login}/${repository.name}${
    queryString ? `?${queryString}` : ""
  }`;

  return (
    <article
      className="border-b border-border py-6 first:pt-0 last:border-b-0"
      aria-label={`${full_name} ${m.repositoryAriaSuffix}`}
    >
      <div className="flex items-start gap-4">
        <OwnerAvatar login={owner.login} avatarUrl={owner.avatar_url} locale={locale} />
        <div className="min-w-0 flex-1">
          <Link
            href={repositoryHref}
            className="text-xl font-semibold text-primary hover:underline"
          >
            {full_name}
          </Link>

          {description && (
            <p className="mt-2 text-sm text-foreground">
              {description}
            </p>
          )}

          {topics.length > 0 && (
            <div className="mt-2">
              <RepositoryTopics topics={topics} />
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {language && <LanguageBadge language={language} />}

            <StatDisplay
              icon={Star}
              value={stargazers_count}
              title={m.stars}
              suffix={m.starsSuffix}
              locale={locale}
            />

            <StatDisplay
              icon={GitFork}
              value={forks_count}
              title={m.forks}
              suffix={m.forksSuffix}
              locale={locale}
            />

            <IconText icon={Calendar} title={m.updatedAt}>
              <time dateTime={updated_at}>{formatDate(updated_at, locale)}</time>
            </IconText>
          </div>
        </div>
      </div>
    </article>
  );
});

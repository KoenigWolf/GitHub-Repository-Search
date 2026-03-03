import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ExternalLink,
  Star,
  Eye,
  GitFork,
  AlertCircle,
  Code,
  GitBranch,
  Calendar,
  Lock,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconText } from "@/components/ui/icon-text";
import { StatCard } from "@/components/ui/stat-card";
import { BackButton } from "@/components/BackButton";
import { ErrorPanel } from "@/components/ErrorPanel";
import { OwnerAvatar } from "@/components/OwnerAvatar";
import { RepositoryTopics } from "@/components/RepositoryTopics";
import { RepositoryDetailSkeleton } from "@/components/Skeleton";
import { getRepository } from "@/lib/api/github-client";
import { APP_NAME } from "@/lib/constants";
import { resolveLocale, toLangParam, type Locale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";
import { formatDate } from "@/lib/utils";

interface RepositoryPageProps {
  params: Promise<{ owner: string; repo: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({
  params,
}: RepositoryPageProps): Promise<Metadata> {
  const { owner, repo } = await params;
  return {
    title: `${owner}/${repo} - ${APP_NAME}`,
  };
}

async function RepositoryDetail({
  owner,
  repo,
  locale,
}: {
  owner: string;
  repo: string;
  locale: Locale;
}) {
  const m = getMessages(locale);
  const lang = toLangParam(locale);
  const result = await getRepository(owner, repo);

  if (!result.success) {
    if (result.error.code === "NOT_FOUND") {
      notFound();
    }
    return <ErrorPanel message={result.error.message} variant="inline" locale={locale} />;
  }

  const repository = result.data;

  const stats = [
    {
      icon: Star,
      value: repository.stargazers_count,
      label: "Stars",
      iconClassName: "text-yellow-500",
    },
    {
      icon: Eye,
      value: repository.watchers_count,
      label: "Watchers",
      iconClassName: "text-blue-500",
    },
    {
      icon: GitFork,
      value: repository.forks_count,
      label: "Forks",
      iconClassName: "text-green-500",
    },
    {
      icon: AlertCircle,
      value: repository.open_issues_count,
      label: "Open Issues",
      iconClassName: "text-orange-500",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <BackButton fallbackHref={lang === "en" ? "/search?lang=en" : "/search"} locale={locale} />

      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <OwnerAvatar
            login={repository.owner.login}
            avatarUrl={repository.owner.avatar_url}
            size={64}
          />
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{repository.full_name}</h1>
              <Badge variant={repository.visibility === "public" ? "secondary" : "outline"}>
                {repository.visibility === "public" ? (
                  <Globe className="mr-1 h-3 w-3" />
                ) : (
                  <Lock className="mr-1 h-3 w-3" />
                )}
                {repository.visibility}
              </Badge>
            </div>

            {repository.description && (
              <p className="text-muted-foreground">{repository.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {repository.language && (
                <IconText icon={Code}>{repository.language}</IconText>
              )}
              <IconText icon={GitBranch}>{repository.default_branch}</IconText>
              <IconText icon={Calendar}>
                <time dateTime={repository.updated_at}>
                  {formatDate(repository.updated_at, locale)}
                </time>
              </IconText>
            </div>

            <div>
              <a
                href={repository.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", className: "gap-2" })}
              >
                <ExternalLink className="h-4 w-4" />
                {m.openInGitHub}
              </a>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} locale={locale} />
        ))}
      </div>

      <RepositoryTopics
        topics={repository.topics}
        maxDisplay={Infinity}
        showTitle
      />
    </div>
  );
}

export default async function RepositoryPage({
  params,
  searchParams,
}: RepositoryPageProps) {
  const { owner, repo } = await params;
  const search = await searchParams;
  const locale = resolveLocale(search.lang);

  return (
    <Suspense fallback={<RepositoryDetailSkeleton />}>
      <RepositoryDetail owner={owner} repo={repo} locale={locale} />
    </Suspense>
  );
}

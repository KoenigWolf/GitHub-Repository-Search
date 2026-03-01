import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
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
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { getRepository } from "@/lib/api/github-client";
import { formatNumber, formatDate } from "@/lib/utils";

interface RepositoryPageProps {
  params: Promise<{ owner: string; repo: string }>;
}

export async function generateMetadata({
  params,
}: RepositoryPageProps): Promise<Metadata> {
  const { owner, repo } = await params;
  return {
    title: `${owner}/${repo} - GitHub Repository Search`,
  };
}

function RepositoryDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="h-8 w-32 animate-pulse rounded bg-muted" />
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-7 w-64 animate-pulse rounded bg-muted" />
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border border-border bg-card"
          />
        ))}
      </div>
    </div>
  );
}

async function RepositoryDetail({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const result = await getRepository(owner, repo);

  // Result型パターン: 成功/失敗を型で判別
  if (!result.success) {
    if (result.error.code === "NOT_FOUND") {
      notFound();
    }
    return <ErrorDisplay message={result.error.message} />;
  }

  const repository = result.data;

  const stats = [
    {
      icon: Star,
      value: repository.stargazers_count,
      label: "Stars",
      color: "text-yellow-500",
    },
    {
      icon: Eye,
      value: repository.watchers_count,
      label: "Watchers",
      color: "text-blue-500",
    },
    {
      icon: GitFork,
      value: repository.forks_count,
      label: "Forks",
      color: "text-green-500",
    },
    {
      icon: AlertCircle,
      value: repository.open_issues_count,
      label: "Open Issues",
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/search"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        検索に戻る
      </Link>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Image
            src={repository.owner.avatar_url}
            alt={`${repository.owner.login} のアバター`}
            width={64}
            height={64}
            className="rounded-full"
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
                <span className="flex items-center gap-1">
                  <Code className="h-4 w-4" />
                  {repository.language}
                </span>
              )}
              <span className="flex items-center gap-1">
                <GitBranch className="h-4 w-4" />
                {repository.default_branch}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <time dateTime={repository.updated_at}>
                  {formatDate(repository.updated_at)}
                </time>
              </span>
            </div>

            <div>
              <a
                href={repository.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                GitHubで開く
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, value, label, color }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
          >
            <Icon className={`h-8 w-8 ${color}`} />
            <div>
              <div className="text-2xl font-bold">{formatNumber(value)}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {repository.topics.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Topics</h2>
          <div className="flex flex-wrap gap-2">
            {repository.topics.map((topic) => (
              <Badge key={topic} variant="secondary">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default async function RepositoryPage({ params }: RepositoryPageProps) {
  const { owner, repo } = await params;

  return (
    <Suspense fallback={<RepositoryDetailSkeleton />}>
      <RepositoryDetail owner={owner} repo={repo} />
    </Suspense>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { Github } from "lucide-react";
import { SearchForm } from "@/components/SearchForm";
import { RepositoryList } from "@/components/RepositoryList";
import { SearchResultsSkeleton } from "@/components/Skeleton";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { EmptyState } from "@/components/EmptyState";
import { searchRepositories } from "@/lib/api/github-client";
import { GITHUB_API, type SortValue } from "@/lib/constants";
import {
  normalizeQuery,
  normalizePageNumber,
  normalizeSortParam,
} from "@/lib/validators";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = normalizeQuery(params.q ?? "");

  if (query) {
    return {
      title: `"${query}" の検索結果 - GitHub Repository Search`,
    };
  }

  return {
    title: "GitHub Repository Search",
  };
}

async function SearchResults({
  query,
  sort,
  page,
}: {
  query: string;
  sort: SortValue;
  page: number;
}) {
  const result = await searchRepositories({
    query,
    sort,
    page,
    per_page: GITHUB_API.DEFAULT_PER_PAGE,
  });

  if (!result.success) {
    return <ErrorDisplay message={result.error.message} />;
  }

  const { data } = result;

  if (data.repositories.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p>&ldquo;{query}&rdquo; に一致するリポジトリが見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <RepositoryList
      repositories={data.repositories}
      totalCount={data.totalCount}
      currentPage={data.currentPage}
      totalPages={data.totalPages}
      query={query}
    />
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = normalizeQuery(params.q ?? "");
  const sort = normalizeSortParam(params.sort);
  const page = normalizePageNumber(params.page ?? "1");

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <SearchForm />
      </Suspense>

      {!query ? (
        <EmptyState
          icon={Github}
          title="GitHubリポジトリを検索"
          description="キーワードを入力して、リポジトリを検索してみましょう"
        />
      ) : (
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults query={query} sort={sort} page={page} />
        </Suspense>
      )}
    </div>
  );
}

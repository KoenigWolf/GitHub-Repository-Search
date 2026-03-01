import { Suspense } from "react";
import type { Metadata } from "next";
import { Github } from "lucide-react";
import { SearchForm } from "@/components/SearchForm";
import { RepositoryList } from "@/components/RepositoryList";
import { SearchResultsSkeleton } from "@/components/Skeleton";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { searchRepositories } from "@/lib/api/github-client";
import type { SearchParams } from "@/lib/schemas/github";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q;

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
  sort: SearchParams["sort"];
  page: number;
}) {
  const result = await searchRepositories({
    query,
    sort,
    page,
    per_page: 30,
  });

  // Result型パターン: 成功/失敗を型で判別
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
  const query = params.q ?? "";
  const sort = (params.sort ?? "best-match") as SearchParams["sort"];
  const page = parseInt(params.page ?? "1", 10);

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <SearchForm />
      </Suspense>

      {!query ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Github className="h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">
            GitHubリポジトリを検索
          </h2>
          <p className="mt-2 text-muted-foreground">
            キーワードを入力して、リポジトリを検索してみましょう
          </p>
        </div>
      ) : (
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults query={query} sort={sort} page={page} />
        </Suspense>
      )}
    </div>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { Github } from "lucide-react";
import { SearchForm } from "@/components/SearchForm";
import { RepositoryList } from "@/components/RepositoryList";
import { SearchResultsSkeleton } from "@/components/Skeleton";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { searchRepositories, GitHubApiError } from "@/lib/github";

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
  sort: string;
  page: number;
}) {
  try {
    const result = await searchRepositories({
      query,
      sort: sort as "stars" | "forks" | "updated" | "best-match",
      page,
      per_page: 30,
    });

    if (result.repositories.length === 0) {
      return (
        <div className="text-center text-muted-foreground">
          <p>&ldquo;{query}&rdquo; に一致するリポジトリが見つかりませんでした。</p>
        </div>
      );
    }

    return (
      <RepositoryList
        repositories={result.repositories}
        totalCount={result.totalCount}
        currentPage={result.currentPage}
        totalPages={result.totalPages}
        query={query}
      />
    );
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return <ErrorDisplay message={error.message} />;
    }
    return <ErrorDisplay message="リポジトリの検索中にエラーが発生しました。" />;
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const sort = params.sort ?? "best-match";
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

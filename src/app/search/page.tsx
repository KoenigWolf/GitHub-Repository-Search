import { Suspense } from "react";
import type { Metadata } from "next";
import { Github } from "lucide-react";
import { SearchForm } from "@/components/SearchForm";
import { RepositoryList } from "@/components/RepositoryList";
import { SearchResultsSkeleton, SearchFormSkeleton } from "@/components/Skeleton";
import { ErrorPanel } from "@/components/ErrorPanel";
import { EmptyState } from "@/components/EmptyState";
import { searchRepositories } from "@/lib/api/github-client";
import { APP_NAME, GITHUB_API, type SortValue } from "@/lib/constants";
import { resolveLocale, type Locale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";
import {
  normalizeParam,
  normalizeQuery,
  normalizePageNumber,
  normalizeSortParam,
} from "@/lib/validators";

type SearchParamValue = string | string[] | undefined;

interface SearchPageProps {
  searchParams: Promise<Record<string, SearchParamValue>>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = normalizeQuery(normalizeParam(params.q) ?? "");
  const locale = resolveLocale(normalizeParam(params.lang));
  const m = getMessages(locale);

  if (query) {
    const title =
      locale === "en-US"
        ? `Search results for "${query}"`
        : `"${query}" ${m.searchResultSummary}`;
    const description =
      locale === "en-US"
        ? `Search GitHub repositories related to "${query}"`
        : `GitHub で "${query}" に関連するリポジトリを検索`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
    };
  }

  return {
    title: APP_NAME,
  };
}

async function SearchResults({
  query,
  sort,
  page,
  locale,
}: {
  query: string;
  sort: SortValue;
  page: number;
  locale: Locale;
}) {
  const m = getMessages(locale);
  const result = await searchRepositories({
    query,
    sort,
    page,
    per_page: GITHUB_API.DEFAULT_PER_PAGE,
  });

  if (!result.success) {
    return <ErrorPanel message={result.error.message} variant="inline" locale={locale} />;
  }

  const { data } = result;

  if (data.repositories.length === 0) {
    const noResultMessage =
      locale === "en-US"
        ? `${m.noResultPrefix} "${query}".`
        : `「${query}」${m.noResultPrefix}`;
    return (
      <div className="text-center text-muted-foreground">
        <p>{noResultMessage}</p>
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
      locale={locale}
    />
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(normalizeParam(params.lang));
  const m = getMessages(locale);
  const query = normalizeQuery(normalizeParam(params.q) ?? "");
  const sort = normalizeSortParam(normalizeParam(params.sort));
  const page = normalizePageNumber(normalizeParam(params.page) ?? "1");

  return (
    <div className="space-y-8">
      <Suspense fallback={<SearchFormSkeleton locale={locale} />}>
        <SearchForm locale={locale} />
      </Suspense>

      {!query ? (
        <EmptyState
          icon={Github}
          title={m.emptyTitle}
          description={m.emptyDescription}
        />
      ) : (
        <Suspense fallback={<SearchResultsSkeleton locale={locale} />}>
          <SearchResults query={query} sort={sort} page={page} locale={locale} />
        </Suspense>
      )}
    </div>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { Github } from "lucide-react";
import { SearchForm } from "@/components/SearchForm";
import { RepositoryList } from "@/components/RepositoryList";
import { SearchResultsSkeleton, SearchFormSkeleton } from "@/components/Skeleton";
import { ErrorPanel } from "@/components/ErrorPanel";
import { EmptyState } from "@/components/EmptyState";
import { searchRepositories, ERROR_CODE_MESSAGE_KEYS } from "@/lib/api/github-client";
import { APP_NAME, GITHUB_API, type SortValue } from "@/lib/constants";
import { resolveLocale, toLangParam, type Locale } from "@/lib/locale";
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
    const title = m.searchResultsTitle.replace("{query}", query);
    const description = m.searchResultsDescription.replace("{query}", query);

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
    const messageKey = ERROR_CODE_MESSAGE_KEYS[result.error.code];
    return <ErrorPanel message={m[messageKey]} variant="inline" locale={locale} />;
  }

  const { data } = result;

  if (data.repositories.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p>{m.noResultMessage.replace("{query}", query)}</p>
      </div>
    );
  }

  return (
    <RepositoryList
      repositories={data.repositories}
      totalCount={data.totalCount}
      currentPage={data.currentPage}
      totalPages={data.totalPages}
      sort={sort}
      locale={locale}
      returnTo={buildSearchPath({ query, sort, page, locale })}
    />
  );
}

function buildSearchPath({
  query,
  sort,
  page,
  locale,
}: {
  query: string;
  sort: SortValue;
  page: number;
  locale: Locale;
}): string {
  const params = new URLSearchParams();
  params.set("q", query);
  if (sort !== "best-match") {
    params.set("sort", sort);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  if (toLangParam(locale) === "en") {
    params.set("lang", "en");
  }
  return `/search?${params.toString()}`;
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
        <SearchForm locale={locale} initialQuery={query} />
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

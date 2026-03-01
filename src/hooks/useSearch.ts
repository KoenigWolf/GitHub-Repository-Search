"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { SearchParams } from "@/lib/schemas/github";

function normalizePageNumber(value: number | string): number {
  const num = typeof value === "string" ? parseInt(value, 10) : value;
  if (Number.isNaN(num) || num < 1) {
    return 1;
  }
  return Math.floor(num);
}

export function useSearchQueryParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const params = useMemo((): Partial<SearchParams> => ({
    query: searchParams.get("q") ?? "",
    sort: (searchParams.get("sort") as SearchParams["sort"]) ?? "best-match",
    page: normalizePageNumber(searchParams.get("page") ?? "1"),
  }), [searchParams]);

  const search = useCallback(
    (query: string, sort: SearchParams["sort"] = "best-match") => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) return;

      const newParams = new URLSearchParams();
      newParams.set("q", trimmedQuery);
      newParams.set("sort", sort);
      newParams.set("page", "1");

      router.push(`/search?${newParams.toString()}`);
    },
    [router]
  );

  const setPage = useCallback(
    (page: number) => {
      const validPage = normalizePageNumber(page);
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("page", String(validPage));
      router.push(`/search?${newParams.toString()}`);
    },
    [router, searchParams]
  );

  const setSort = useCallback(
    (sort: SearchParams["sort"]) => {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("sort", sort);
      newParams.set("page", "1");
      router.push(`/search?${newParams.toString()}`);
    },
    [router, searchParams]
  );

  const clear = useCallback(() => {
    router.push("/search");
  }, [router]);

  return { params, search, setPage, setSort, clear };
}

export function usePagination(currentPage: number, totalPages: number) {
  const { setPage } = useSearchQueryParams();

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setPage(page);
      }
    },
    [setPage, totalPages]
  );

  const goToPrevious = useCallback(() => {
    if (canGoPrevious) {
      setPage(currentPage - 1);
    }
  }, [canGoPrevious, currentPage, setPage]);

  const goToNext = useCallback(() => {
    if (canGoNext) {
      setPage(currentPage + 1);
    }
  }, [canGoNext, currentPage, setPage]);

  const pageNumbers = useMemo((): (number | "ellipsis")[] => {
    if (totalPages <= 1) return [];

    const pages: (number | "ellipsis")[] = [1];
    const delta = 1;

    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    if (rangeStart > 2) {
      pages.push("ellipsis");
    }

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    if (rangeEnd < totalPages - 1) {
      pages.push("ellipsis");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  return {
    currentPage,
    totalPages,
    pageNumbers,
    canGoPrevious,
    canGoNext,
    goToPage,
    goToPrevious,
    goToNext,
  };
}

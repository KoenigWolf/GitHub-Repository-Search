"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { SearchParams } from "@/lib/schemas/github";

/**
 * 検索パラメータを管理するカスタムフック
 *
 * URL検索パラメータと同期し、型安全な検索機能を提供
 */
export function useSearchParams_() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * 現在の検索パラメータ
   */
  const params = useMemo((): Partial<SearchParams> => ({
    query: searchParams.get("q") ?? "",
    sort: (searchParams.get("sort") as SearchParams["sort"]) ?? "best-match",
    page: parseInt(searchParams.get("page") ?? "1", 10),
  }), [searchParams]);

  /**
   * 検索を実行
   */
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

  /**
   * ページを変更
   */
  const setPage = useCallback(
    (page: number) => {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("page", String(page));
      router.push(`/search?${newParams.toString()}`);
    },
    [router, searchParams]
  );

  /**
   * ソートを変更
   */
  const setSort = useCallback(
    (sort: SearchParams["sort"]) => {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("sort", sort);
      newParams.set("page", "1");
      router.push(`/search?${newParams.toString()}`);
    },
    [router, searchParams]
  );

  /**
   * 検索をクリア
   */
  const clear = useCallback(() => {
    router.push("/search");
  }, [router]);

  return {
    params,
    search,
    setPage,
    setSort,
    clear,
  };
}

/**
 * ページネーション状態を管理するカスタムフック
 */
export function usePagination(currentPage: number, totalPages: number) {
  const { setPage } = useSearchParams_();

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

  /**
   * ページ番号の配列を生成（省略記号付き）
   */
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

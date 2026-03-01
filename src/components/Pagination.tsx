"use client";

import { useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigateToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  const pageNumbers = useMemo((): (number | "ellipsis")[] => {
    if (totalPages <= 1) {
      return [];
    }

    const pages: (number | "ellipsis")[] = [];
    const delta = 1;

    pages.push(1);

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

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="ページネーション" className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigateToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="前のページ"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pageNumbers.map((page, index) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-2 text-muted-foreground"
            aria-hidden="true"
          >
            &hellip;
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="icon"
            onClick={() => navigateToPage(page)}
            aria-current={page === currentPage ? "page" : undefined}
            aria-label={`ページ ${page}`}
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => navigateToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="次のページ"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

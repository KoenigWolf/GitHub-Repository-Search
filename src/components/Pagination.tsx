"use client";

import { useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculatePageNumbers } from "@/lib/pagination";
import { useSearchNavigation } from "@/hooks/useSearchNavigation";
import type { Locale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  locale?: Locale;
}

export function Pagination({
  currentPage,
  totalPages,
  locale = "ja-JP",
}: PaginationProps) {
  const { navigate } = useSearchNavigation();
  const m = getMessages(locale);

  const navigateToPage = useCallback(
    (page: number) => {
      const target = Math.max(1, Math.min(page, totalPages));
      navigate({ page: target }, true);
    },
    [navigate, totalPages]
  );

  const pageNumbers = useMemo(
    () => calculatePageNumbers(currentPage, totalPages),
    [currentPage, totalPages]
  );

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label={m.pagination} className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigateToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label={m.prevPage}
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
            aria-label={`${m.pageLabel} ${page}`}
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
        aria-label={m.nextPage}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

"use client";

import { useMemo, useCallback } from "react";
import { calculatePageNumbers } from "@/lib/utils";
import { useSearchNavigation } from "@/hooks/useSearchNavigation";
import { DEFAULT_LOCALE, type Locale, getMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  locale?: Locale;
}

export function Pagination({
  currentPage,
  totalPages,
  locale = DEFAULT_LOCALE,
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

  const linkClass =
    "px-3 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors";
  const disabledClass = "pointer-events-none opacity-50";
  const pageClass =
    "min-w-[40px] px-3 py-2 text-sm text-center border border-border rounded-md hover:bg-accent transition-colors";
  const activePageClass = "bg-primary text-primary-foreground border-primary hover:bg-primary/90";

  return (
    <nav
      aria-label={m.pagination}
      className="flex items-center justify-center gap-2 pt-4"
    >
      <button
        type="button"
        onClick={() => navigateToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label={m.prevPage}
        className={cn(linkClass, currentPage <= 1 && disabledClass)}
      >
        {m.prevPage}
      </button>

      {pageNumbers.map((page, index) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-2 text-muted-foreground"
            role="separator"
            aria-label={m.pagesOmitted}
          >
            &hellip;
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => navigateToPage(page)}
            aria-current={page === currentPage ? "page" : undefined}
            aria-label={`${m.pageLabel} ${page}`}
            className={cn(pageClass, page === currentPage && activePageClass)}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => navigateToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label={m.nextPage}
        className={cn(linkClass, currentPage >= totalPages && disabledClass)}
      >
        {m.nextPage}
      </button>
    </nav>
  );
}

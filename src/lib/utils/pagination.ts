import { UI } from "@/lib/constants";

type PageItem = number | "ellipsis";

export function calculatePageNumbers(
  currentPage: number,
  totalPages: number,
  delta: number = UI.PAGINATION_DELTA
): PageItem[] {
  if (totalPages <= 1) {
    return [];
  }

  const pages: PageItem[] = [];
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

  pages.push(totalPages);

  return pages;
}

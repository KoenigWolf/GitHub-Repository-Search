import { UI } from "@/lib/constants";

export type PageItem = number | "ellipsis";

/**
 * ページネーションに表示するページ番号の配列を計算する
 *
 * @param currentPage - 現在のページ番号
 * @param totalPages - 総ページ数
 * @param delta - 現在ページの前後に表示するページ数（デフォルト: UI.PAGINATION_DELTA）
 * @returns ページ番号と省略記号の配列
 *
 * @example
 * calculatePageNumbers(5, 10) // [1, "ellipsis", 4, 5, 6, "ellipsis", 10]
 * calculatePageNumbers(1, 5)  // [1, 2, "ellipsis", 5]
 */
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

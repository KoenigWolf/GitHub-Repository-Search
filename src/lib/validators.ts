import { SORT_VALUES, type SortValue } from "@/lib/constants";

/**
 * 検索クエリを正規化する
 * - 前後の空白を削除
 * - 連続する空白を1つに
 */
export function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

/**
 * ページ番号を正規化する
 * - 数値に変換できない場合や1未満の場合は1を返す
 */
export function normalizePageNumber(pageStr: string): number {
  const parsed = parseInt(pageStr, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

/**
 * ソートパラメータを正規化する
 * - 無効な値の場合は "best-match" を返す
 */
export function normalizeSortParam(value: string | undefined): SortValue {
  if (value && SORT_VALUES.includes(value as SortValue)) {
    return value as SortValue;
  }
  return "best-match";
}

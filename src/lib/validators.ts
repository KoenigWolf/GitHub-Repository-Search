import { GITHUB_API, SORT_VALUES, type SortValue } from "@/lib/constants";

export function normalizeParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function normalizeQuery(query: string): string {
  return query
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, GITHUB_API.MAX_QUERY_LENGTH);
}

export function normalizePageNumber(pageStr: string): number {
  const parsed = parseInt(pageStr, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

const LEGACY_SORT_MAP: Record<string, SortValue> = {
  stars: "stars-desc",
  forks: "forks-desc",
  updated: "updated-desc",
};

export function normalizeSortParam(value: string | null | undefined): SortValue {
  if (!value) {
    return "best-match";
  }
  if (SORT_VALUES.includes(value as SortValue)) {
    return value as SortValue;
  }
  const legacyValue = LEGACY_SORT_MAP[value];
  if (legacyValue) {
    return legacyValue;
  }
  return "best-match";
}

export type GitHubSortField = "stars" | "forks" | "updated";
export type GitHubSortOrder = "asc" | "desc";

export interface ParsedSort {
  field: GitHubSortField | null;
  order: GitHubSortOrder;
}

export function parseSortValue(value: SortValue): ParsedSort {
  if (value === "best-match") {
    return { field: null, order: "desc" };
  }
  const [field, order] = value.split("-") as [GitHubSortField, GitHubSortOrder];
  return { field, order };
}

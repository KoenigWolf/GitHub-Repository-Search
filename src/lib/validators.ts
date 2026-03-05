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

export function isValidReturnPath(path: string | null | undefined): path is string {
  if (!path) {
    return false;
  }
  if (!path.startsWith("/")) {
    return false;
  }
  if (path.startsWith("//")) {
    return false;
  }
  try {
    const url = new URL(path, "http://localhost");
    return url.pathname === path.split("?")[0];
  } catch {
    return false;
  }
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

type GitHubSortField = "stars" | "forks" | "updated";
type GitHubSortOrder = "asc" | "desc";

interface ParsedSort {
  field: GitHubSortField | null;
  order: GitHubSortOrder;
}

const SORT_VALUE_MAP: Record<SortValue, ParsedSort> = {
  "best-match": { field: null, order: "desc" },
  "stars-desc": { field: "stars", order: "desc" },
  "stars-asc": { field: "stars", order: "asc" },
  "forks-desc": { field: "forks", order: "desc" },
  "forks-asc": { field: "forks", order: "asc" },
  "updated-desc": { field: "updated", order: "desc" },
  "updated-asc": { field: "updated", order: "asc" },
};

export function parseSortValue(value: SortValue): ParsedSort {
  return SORT_VALUE_MAP[value];
}

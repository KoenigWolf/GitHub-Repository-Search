import { SORT_VALUES, type SortValue } from "@/lib/constants";

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

export interface ParsedSort {
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

import { GITHUB_API } from "@/lib/constants";

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

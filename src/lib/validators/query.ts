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

const POSITIVE_INTEGER_REGEX = /^[1-9]\d*$/;

export function normalizePageNumber(pageStr: string): number {
  if (!POSITIVE_INTEGER_REGEX.test(pageStr)) {
    return 1;
  }
  return Number(pageStr);
}

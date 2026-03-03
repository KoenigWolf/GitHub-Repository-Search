import { z } from "zod";
import { type Result, ok, err } from "@/lib/result";
import {
  GitHubRepositorySchema,
  GitHubSearchResponseSchema,
  SearchParamsSchema,
  type GitHubRepository,
  type SearchParamsInput,
  type SearchResult,
} from "@/lib/schemas/github";
import { GITHUB_API } from "@/lib/constants";
import { env, hasGitHubToken, isProduction } from "@/lib/env";

export type GitHubApiErrorCode =
  | "NETWORK_ERROR"
  | "RATE_LIMIT"
  | "INVALID_QUERY"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "UNKNOWN_ERROR";

export interface GitHubApiError {
  code: GitHubApiErrorCode;
  message: string;
  status: number;
  details?: unknown;
}

const ERROR_MESSAGES: Record<GitHubApiErrorCode, string> = {
  NETWORK_ERROR: "ネットワークエラーが発生しました。インターネット接続を確認してください。",
  RATE_LIMIT: "APIレート制限に達しました。しばらく待ってから再試行してください。",
  INVALID_QUERY: "検索クエリが無効です。",
  NOT_FOUND: "リポジトリが見つかりませんでした。",
  VALIDATION_ERROR: "APIレスポンスの形式が不正です。",
  UNKNOWN_ERROR: "予期しないエラーが発生しました。",
};

function createApiError(
  code: GitHubApiErrorCode,
  status: number,
  details?: unknown
): GitHubApiError {
  return {
    code,
    message: ERROR_MESSAGES[code],
    status,
    details,
  };
}

function getErrorCodeFromStatus(status: number): GitHubApiErrorCode {
  switch (status) {
    case 403:
    case 429:
      return "RATE_LIMIT";
    case 404:
      return "NOT_FOUND";
    case 422:
      return "INVALID_QUERY";
    default:
      return "UNKNOWN_ERROR";
  }
}

if (typeof window === "undefined") {
  if (isProduction() && !hasGitHubToken()) {
    console.warn(
      "[GitHub API] GITHUB_TOKEN が設定されていません。レート制限 (60 req/h) が適用されます。"
    );
  }
}

function createHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const token = env.GITHUB_TOKEN?.trim();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  totalTimeoutMs: 30000,
  requestTimeoutMs: 10000,
} as const;

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      error.name === "AbortError" ||
      error.name === "TypeError" ||
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("econnreset")
    );
  }
  return false;
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 503 || status === 502 || status === 504;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateBackoff(attempt: number): number {
  const exponentialDelay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 100;
  return Math.min(exponentialDelay + jitter, RETRY_CONFIG.maxDelayMs);
}

async function safeFetch(
  url: string,
  options: RequestInit
): Promise<Result<Response, GitHubApiError>> {
  const deadline = Date.now() + RETRY_CONFIG.totalTimeoutMs;
  let lastError: unknown;

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    if (Date.now() >= deadline) {
      return err(createApiError("NETWORK_ERROR", 0, { message: "Total timeout exceeded" }));
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), RETRY_CONFIG.requestTimeoutMs);
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      if (isRetryableStatus(response.status) && attempt < RETRY_CONFIG.maxRetries - 1) {
        const backoff = calculateBackoff(attempt);
        const remainingTime = deadline - Date.now();
        if (remainingTime <= 0) {
          return err(createApiError("NETWORK_ERROR", 0, { message: "Total timeout exceeded" }));
        }
        await delay(Math.min(backoff, remainingTime));
        continue;
      }

      return ok(response);
    } catch (error) {
      lastError = error;

      if (isRetryableError(error) && attempt < RETRY_CONFIG.maxRetries - 1) {
        const backoff = calculateBackoff(attempt);
        const remainingTime = deadline - Date.now();
        if (remainingTime <= 0) {
          return err(createApiError("NETWORK_ERROR", 0, { message: "Total timeout exceeded" }));
        }
        await delay(Math.min(backoff, remainingTime));
        continue;
      }

      break;
    }
  }

  const errorDetails = lastError instanceof Error
    ? isProduction()
      ? { message: lastError.message }
      : { message: lastError.message, stack: lastError.stack }
    : lastError;
  return err(createApiError("NETWORK_ERROR", 0, errorDetails));
}

async function validateResponse<T>(
  response: Response,
  schema: z.ZodType<T>
): Promise<Result<T, GitHubApiError>> {
  try {
    const json = await response.json();
    const parsed = schema.safeParse(json);

    if (!parsed.success) {
      return err(
        createApiError("VALIDATION_ERROR", response.status, parsed.error.issues)
      );
    }

    return ok(parsed.data);
  } catch {
    return err(createApiError("VALIDATION_ERROR", response.status));
  }
}

async function handleApiResponse<T>(
  fetchResult: Result<Response, GitHubApiError>,
  schema: z.ZodType<T>
): Promise<Result<T, GitHubApiError>> {
  if (!fetchResult.success) {
    return fetchResult;
  }

  const response = fetchResult.data;

  if (!response.ok) {
    return err(createApiError(getErrorCodeFromStatus(response.status), response.status));
  }

  return validateResponse(response, schema);
}

export async function searchRepositories(
  params: SearchParamsInput
): Promise<Result<SearchResult, GitHubApiError>> {
  const normalizedQuery = params.query.trim();
  if (!normalizedQuery) {
    return ok({
      repositories: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
    });
  }

  const parsedParams = SearchParamsSchema.safeParse({
    ...params,
    query: normalizedQuery,
  });

  if (!parsedParams.success) {
    return err(createApiError("INVALID_QUERY", 422, parsedParams.error.issues));
  }

  const {
    query,
    sort = "best-match",
    order = "desc",
    page = 1,
    per_page = GITHUB_API.DEFAULT_PER_PAGE,
  } = parsedParams.data;

  const url = new URL(`${GITHUB_API.BASE_URL}${GITHUB_API.SEARCH_REPOS_ENDPOINT}`);
  url.searchParams.set("q", query);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(per_page));

  if (sort !== "best-match") {
    url.searchParams.set("sort", sort);
    url.searchParams.set("order", order);
  }

  const fetchResult = await safeFetch(url.toString(), {
    headers: createHeaders(),
    next: { revalidate: GITHUB_API.CACHE_SEARCH },
  });

  const validationResult = await handleApiResponse(fetchResult, GitHubSearchResponseSchema);

  if (!validationResult.success) {
    return validationResult;
  }

  const data = validationResult.data;

  const maxResults = Math.min(data.total_count, GITHUB_API.MAX_SEARCH_RESULTS);
  const totalPages = Math.ceil(maxResults / per_page);

  return ok({
    repositories: data.items,
    totalCount: data.total_count,
    currentPage: page,
    totalPages,
  });
}

export async function getRepository(
  owner: string,
  repo: string
): Promise<Result<GitHubRepository, GitHubApiError>> {
  const url = new URL(
    `${GITHUB_API.REPOS_ENDPOINT}/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    GITHUB_API.BASE_URL
  );

  const fetchResult = await safeFetch(url.toString(), {
    headers: createHeaders(),
    next: { revalidate: GITHUB_API.CACHE_REPO },
  });

  return handleApiResponse(fetchResult, GitHubRepositorySchema);
}

import { z } from "zod";
import { Result, ok, err } from "@/lib/result";
import {
  GitHubRepositorySchema,
  GitHubSearchResponseSchema,
  type GitHubRepository,
  type SearchParamsInput,
  type SearchResult,
} from "@/lib/schemas/github";
import { GITHUB_API } from "@/lib/constants";

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
  if (process.env.NODE_ENV === "production" && !process.env.GITHUB_TOKEN) {
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

  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function safeFetch(
  url: string,
  options: RequestInit
): Promise<Result<Response, GitHubApiError>> {
  try {
    const response = await fetch(url, options);
    return ok(response);
  } catch (error) {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;
    return err(createApiError("NETWORK_ERROR", 0, errorDetails));
  }
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

export async function searchRepositories(
  params: SearchParamsInput
): Promise<Result<SearchResult, GitHubApiError>> {
  const {
    query,
    sort = "best-match",
    order = "desc",
    page = 1,
    per_page = GITHUB_API.DEFAULT_PER_PAGE,
  } = params;

  if (!query.trim()) {
    return ok({
      repositories: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
    });
  }

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

  if (!fetchResult.success) {
    return fetchResult;
  }

  const response = fetchResult.data;

  if (!response.ok) {
    return err(createApiError(getErrorCodeFromStatus(response.status), response.status));
  }

  const validationResult = await validateResponse(
    response,
    GitHubSearchResponseSchema
  );

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
  const url = `${GITHUB_API.BASE_URL}${GITHUB_API.REPOS_ENDPOINT}/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

  const fetchResult = await safeFetch(url, {
    headers: createHeaders(),
    next: { revalidate: GITHUB_API.CACHE_REPO },
  });

  if (!fetchResult.success) {
    return fetchResult;
  }

  const response = fetchResult.data;

  if (!response.ok) {
    return err(createApiError(getErrorCodeFromStatus(response.status), response.status));
  }

  return validateResponse(response, GitHubRepositorySchema);
}

/**
 * 後方互換性のためのエラークラス（非推奨）
 * @deprecated Result型パターンを使用してください
 */
export class GitHubApiErrorLegacy extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

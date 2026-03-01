import type {
  GitHubRepository,
  GitHubSearchResponse,
  SearchParams,
  SearchResult,
} from "@/types/github";

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

export async function searchRepositories(
  params: SearchParams
): Promise<SearchResult> {
  const { query, sort = "best-match", order = "desc", page = 1, per_page = 30 } = params;

  if (!query.trim()) {
    return {
      repositories: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
    };
  }

  const url = new URL("https://api.github.com/search/repositories");
  url.searchParams.set("q", query);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(per_page));

  if (sort !== "best-match") {
    url.searchParams.set("sort", sort);
    url.searchParams.set("order", order);
  }

  const response = await fetch(url.toString(), {
    headers: getHeaders(),
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 403) {
      throw new GitHubApiError(
        "APIレート制限に達しました。しばらく待ってから再試行してください。",
        403
      );
    }

    if (response.status === 422) {
      throw new GitHubApiError("検索クエリが無効です。", 422);
    }

    throw new GitHubApiError(
      errorData.message ?? "リポジトリの検索中にエラーが発生しました。",
      response.status
    );
  }

  const data: GitHubSearchResponse = await response.json();

  const maxResults = Math.min(data.total_count, 1000);
  const totalPages = Math.ceil(maxResults / per_page);

  return {
    repositories: data.items,
    totalCount: data.total_count,
    currentPage: page,
    totalPages,
  };
}

export async function getRepository(
  owner: string,
  repo: string
): Promise<GitHubRepository> {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

  const response = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 404) {
      throw new GitHubApiError("リポジトリが見つかりませんでした。", 404);
    }

    throw new GitHubApiError(
      errorData.message ?? "リポジトリの取得中にエラーが発生しました。",
      response.status
    );
  }

  return response.json();
}

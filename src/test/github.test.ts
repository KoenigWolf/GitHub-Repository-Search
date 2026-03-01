import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchRepositories, getRepository } from "@/lib/api/github-client";
import { mockRepository, mockSearchResponse } from "./fixtures";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("searchRepositories", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env.GITHUB_TOKEN;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("空クエリの場合はfetchを呼び出さずに空の結果を返す", async () => {
    const result = await searchRepositories({ query: "" });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        repositories: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
      });
    }
  });

  it("空白のみのクエリの場合もfetchを呼び出さない", async () => {
    const result = await searchRepositories({ query: "   " });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        repositories: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
      });
    }
  });

  it("正常なレスポンスを正しく変換する", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSearchResponse),
    });

    const result = await searchRepositories({ query: "react" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.repositories).toEqual(mockSearchResponse.items);
      expect(result.data.totalCount).toBe(2);
      expect(result.data.currentPage).toBe(1);
    }
  });

  it("pageパラメータが正しく送信される", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSearchResponse),
    });

    await searchRepositories({ query: "react", page: 3 });

    const call = mockFetch.mock.calls[0];
    expect(call).toBeDefined();
    const url = new URL(call![0] as string);
    expect(url.searchParams.get("page")).toBe("3");
  });

  it("sortパラメータが正しく送信される", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSearchResponse),
    });

    await searchRepositories({ query: "react", sort: "stars" });

    const call = mockFetch.mock.calls[0];
    expect(call).toBeDefined();
    const url = new URL(call![0] as string);
    expect(url.searchParams.get("sort")).toBe("stars");
  });

  it("best-matchの場合はsortパラメータを送信しない", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSearchResponse),
    });

    await searchRepositories({ query: "react", sort: "best-match" });

    const call = mockFetch.mock.calls[0];
    expect(call).toBeDefined();
    const url = new URL(call![0] as string);
    expect(url.searchParams.has("sort")).toBe(false);
    expect(url.searchParams.has("order")).toBe(false);
  });

  it("403エラーの場合はレート制限エラーを返す", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () => Promise.resolve({}),
    });

    const result = await searchRepositories({ query: "react" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("RATE_LIMIT");
      expect(result.error.message).toBe(
        "APIレート制限に達しました。しばらく待ってから再試行してください。"
      );
    }
  });

  it("422エラーの場合は無効なクエリエラーを返す", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: () => Promise.resolve({}),
    });

    const result = await searchRepositories({ query: "invalid::query" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INVALID_QUERY");
      expect(result.error.message).toBe("検索クエリが無効です。");
    }
  });

  it("GITHUB_TOKENが設定されている場合はAuthorizationヘッダーに含まれる", async () => {
    process.env.GITHUB_TOKEN = "test-token";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSearchResponse),
    });

    await searchRepositories({ query: "react" });

    const call = mockFetch.mock.calls[0];
    expect(call).toBeDefined();
    const options = call![1] as { headers: Record<string, string> };
    expect(options.headers.Authorization).toBe("Bearer test-token");
  });

  it("ネットワークエラーの場合はNETWORK_ERRORを返す", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await searchRepositories({ query: "react" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("NETWORK_ERROR");
      expect(result.error.message).toBe(
        "ネットワークエラーが発生しました。インターネット接続を確認してください。"
      );
      expect(result.error.status).toBe(0);
    }
  });
});

describe("getRepository", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env.GITHUB_TOKEN;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("正常なレスポンスを返す", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRepository),
    });

    const result = await getRepository("facebook", "react");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(mockRepository);
    }
  });

  it("正しいエンドポイントURLを使用する", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRepository),
    });

    await getRepository("facebook", "react");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/facebook/react",
      expect.any(Object)
    );
  });

  it("404エラーの場合はNOT_FOUNDエラーを返す", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({}),
    });

    const result = await getRepository("unknown", "repo");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("NOT_FOUND");
      expect(result.error.message).toBe("リポジトリが見つかりませんでした。");
      expect(result.error.status).toBe(404);
    }
  });

  it("ネットワークエラーの場合はNETWORK_ERRORを返す", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await getRepository("facebook", "react");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("NETWORK_ERROR");
      expect(result.error.message).toBe(
        "ネットワークエラーが発生しました。インターネット接続を確認してください。"
      );
      expect(result.error.status).toBe(0);
    }
  });
});

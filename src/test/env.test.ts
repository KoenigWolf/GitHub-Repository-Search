import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { env, hasGitHubToken, isProduction } from "@/lib/env";

describe("env", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("GITHUB_TOKEN", () => {
    it("returns undefined when not set", () => {
      delete process.env.GITHUB_TOKEN;
      expect(env.GITHUB_TOKEN).toBeUndefined();
    });

    it("returns token when set", () => {
      process.env.GITHUB_TOKEN = "test-token";
      expect(env.GITHUB_TOKEN).toBe("test-token");
    });
  });

  describe("NODE_ENV", () => {
    it("returns test in test environment", () => {
      expect(env.NODE_ENV).toBe("test");
    });
  });
});

describe("hasGitHubToken", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns false when token not set", () => {
    delete process.env.GITHUB_TOKEN;
    expect(hasGitHubToken()).toBe(false);
  });

  it("returns true when token is set", () => {
    process.env.GITHUB_TOKEN = "test-token";
    expect(hasGitHubToken()).toBe(true);
  });

  it("returns false for empty string", () => {
    process.env.GITHUB_TOKEN = "";
    expect(hasGitHubToken()).toBe(false);
  });
});

describe("isProduction", () => {
  it("returns false in test environment", () => {
    expect(isProduction()).toBe(false);
  });
});

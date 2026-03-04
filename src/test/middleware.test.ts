import { describe, it, expect, beforeEach } from "vitest";
import {
  RATE_LIMIT_CONFIG,
  createRateLimitState,
  isValidIp,
  normalizeIp,
  cleanupStaleEntries,
  isRateLimited,
  type RateLimitState,
} from "@/middleware";

describe("isValidIp", () => {
  it("validates IPv4 addresses", () => {
    expect(isValidIp("192.168.1.1")).toBe(true);
    expect(isValidIp("10.0.0.1")).toBe(true);
    expect(isValidIp("255.255.255.255")).toBe(true);
    expect(isValidIp("0.0.0.0")).toBe(true);
  });

  it("rejects invalid IPv4 addresses", () => {
    expect(isValidIp("256.1.1.1")).toBe(false);
    expect(isValidIp("192.168.1")).toBe(false);
    expect(isValidIp("192.168.1.1.1")).toBe(false);
    expect(isValidIp("invalid")).toBe(false);
  });

  it("validates IPv6 addresses", () => {
    expect(isValidIp("2001:db8:85a3:0000:0000:8a2e:0370:7334")).toBe(true);
    expect(isValidIp("::1")).toBe(true);
    expect(isValidIp("::")).toBe(true);
  });

  it("rejects invalid IPv6 addresses", () => {
    expect(isValidIp("2001:db8:85a3:0000:0000:8a2e:0370:7334:extra")).toBe(
      false
    );
  });
});

describe("normalizeIp", () => {
  it("returns null for empty values", () => {
    expect(normalizeIp(null)).toBeNull();
    expect(normalizeIp(undefined)).toBeNull();
    expect(normalizeIp("")).toBeNull();
    expect(normalizeIp("   ")).toBeNull();
  });

  it("trims and returns valid IPs", () => {
    expect(normalizeIp("  192.168.1.1  ")).toBe("192.168.1.1");
  });

  it("returns null for invalid IPs", () => {
    expect(normalizeIp("invalid")).toBeNull();
    expect(normalizeIp("not-an-ip")).toBeNull();
  });
});

describe("cleanupStaleEntries", () => {
  let state: RateLimitState;

  beforeEach(() => {
    state = createRateLimitState();
  });

  it("removes entries older than window", () => {
    const now = Date.now();
    const oldTime = now - RATE_LIMIT_CONFIG.windowMs - 1000;
    state.requestLog.set("old-client", [oldTime]);
    state.requestLog.set("recent-client", [now - 1000]);

    cleanupStaleEntries(state, now);

    expect(state.requestLog.has("old-client")).toBe(false);
    expect(state.requestLog.has("recent-client")).toBe(true);
  });

  it("filters old timestamps from active entries", () => {
    const now = Date.now();
    const oldTime = now - RATE_LIMIT_CONFIG.windowMs - 1000;
    const recentTime = now - 1000;
    state.requestLog.set("mixed-client", [oldTime, recentTime]);

    cleanupStaleEntries(state, now);

    expect(state.requestLog.get("mixed-client")).toEqual([recentTime]);
  });
});

describe("isRateLimited", () => {
  let state: RateLimitState;

  beforeEach(() => {
    state = createRateLimitState();
  });

  it("returns false for new clients", () => {
    const now = Date.now();
    expect(isRateLimited(state, "new-client", now)).toBe(false);
  });

  it("returns false within rate limit", () => {
    const now = Date.now();
    for (let i = 0; i < RATE_LIMIT_CONFIG.maxRequests; i++) {
      expect(isRateLimited(state, "test-client", now + i)).toBe(false);
    }
  });

  it("returns true when rate limit exceeded", () => {
    const now = Date.now();
    for (let i = 0; i < RATE_LIMIT_CONFIG.maxRequests; i++) {
      isRateLimited(state, "test-client", now + i);
    }
    expect(isRateLimited(state, "test-client", now + RATE_LIMIT_CONFIG.maxRequests)).toBe(true);
  });

  it("excludes old requests from count", () => {
    const now = Date.now();
    const oldTime = now - RATE_LIMIT_CONFIG.windowMs - 1000;
    state.requestLog.set("old-client", Array(RATE_LIMIT_CONFIG.maxRequests).fill(oldTime));

    expect(isRateLimited(state, "old-client", now)).toBe(false);
  });

  it("evicts oldest client when max clients reached", () => {
    const now = Date.now();

    for (let i = 0; i < RATE_LIMIT_CONFIG.maxClients; i++) {
      state.requestLog.set(`client-${i}`, [now - (RATE_LIMIT_CONFIG.maxClients - i)]);
    }

    expect(state.requestLog.size).toBe(RATE_LIMIT_CONFIG.maxClients);

    isRateLimited(state, "new-client", now);

    expect(state.requestLog.size).toBe(RATE_LIMIT_CONFIG.maxClients);
    expect(state.requestLog.has("new-client")).toBe(true);
    expect(state.requestLog.has("client-0")).toBe(false);
  });
});

describe("createRateLimitState", () => {
  it("creates empty state", () => {
    const state = createRateLimitState();
    expect(state.requestLog.size).toBe(0);
    expect(state.requestCount).toBe(0);
  });
});

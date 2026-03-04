import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const RATE_LIMIT_CONFIG = {
  windowMs: 60_000,
  maxRequests: 120,
  cleanupInterval: 100,
  maxClients: 10_000,
} as const;

export interface RateLimitState {
  requestLog: Map<string, number[]>;
  requestCount: number;
}

export function createRateLimitState(): RateLimitState {
  return {
    requestLog: new Map(),
    requestCount: 0,
  };
}

const state = createRateLimitState();

export function isValidIp(ip: string): boolean {
  const ipv4Pattern =
    /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
  const ipv6Pattern =
    /^(([0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4}|::1|::)$/;
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}

export function normalizeIp(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return isValidIp(trimmed) ? trimmed : null;
}

export function getClientKey(request: NextRequest): string | null {
  const realIp = normalizeIp(request.headers.get("x-real-ip"));
  if (realIp) return realIp;

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",") ?? [];
  for (const candidate of forwardedFor) {
    const ip = normalizeIp(candidate);
    if (ip) return ip;
  }

  const requestIp = normalizeIp((request as NextRequest & { ip?: string }).ip ?? null);
  if (requestIp) return requestIp;

  return null;
}

export function cleanupStaleEntries(
  rateLimitState: RateLimitState,
  now: number
): void {
  const cutoff = now - RATE_LIMIT_CONFIG.windowMs;
  for (const [clientKey, timestamps] of rateLimitState.requestLog.entries()) {
    const recent = timestamps.filter((ts) => ts > cutoff);
    if (recent.length === 0) {
      rateLimitState.requestLog.delete(clientKey);
      continue;
    }
    rateLimitState.requestLog.set(clientKey, recent);
  }
}

function evictOldestClient(rateLimitState: RateLimitState): void {
  let oldestKey: string | null = null;
  let oldestTime = Infinity;

  for (const [key, timestamps] of rateLimitState.requestLog.entries()) {
    const lastAccess = timestamps[timestamps.length - 1] ?? 0;
    if (lastAccess < oldestTime) {
      oldestTime = lastAccess;
      oldestKey = key;
    }
  }

  if (oldestKey) {
    rateLimitState.requestLog.delete(oldestKey);
  }
}

export function isRateLimited(
  rateLimitState: RateLimitState,
  clientKey: string,
  now: number
): boolean {
  const cutoff = now - RATE_LIMIT_CONFIG.windowMs;
  const recentRequests = (rateLimitState.requestLog.get(clientKey) ?? []).filter(
    (ts) => ts > cutoff
  );
  recentRequests.push(now);

  if (
    !rateLimitState.requestLog.has(clientKey) &&
    rateLimitState.requestLog.size >= RATE_LIMIT_CONFIG.maxClients
  ) {
    evictOldestClient(rateLimitState);
  }

  rateLimitState.requestLog.set(clientKey, recentRequests);
  return recentRequests.length > RATE_LIMIT_CONFIG.maxRequests;
}

export function middleware(request: NextRequest) {
  const now = Date.now();
  state.requestCount += 1;

  if (state.requestCount % RATE_LIMIT_CONFIG.cleanupInterval === 0) {
    cleanupStaleEntries(state, now);
  }

  const clientKey = getClientKey(request);

  if (clientKey === null) {
    return NextResponse.next();
  }

  if (isRateLimited(state, clientKey, now)) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": "60",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/search/:path*", "/repositories/:path*"],
};

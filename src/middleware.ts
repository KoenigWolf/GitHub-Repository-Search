import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 120;
const CLEANUP_INTERVAL_REQUESTS = 100;

// In-memory fallback for local/single-instance usage.
// Use Redis or another distributed store for production multi-instance deployments.
const requestLog = new Map<string, number[]>();
let requestCount = 0;

function isValidIp(ip: string): boolean {
  const ipv4Pattern =
    /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
  const ipv6Pattern =
    /^(([0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4}|::1|::)$/;
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}

function normalizeIp(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return isValidIp(trimmed) ? trimmed : null;
}

function getClientKey(request: NextRequest): string {
  const realIp = normalizeIp(request.headers.get("x-real-ip"));
  if (realIp) return realIp;

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",") ?? [];
  for (const candidate of forwardedFor) {
    const ip = normalizeIp(candidate);
    if (ip) return ip;
  }

  const requestIp = normalizeIp((request as NextRequest & { ip?: string }).ip ?? null);
  if (requestIp) return requestIp;

  return "unknown";
}

function cleanupStaleEntries(now: number): void {
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  for (const [clientKey, timestamps] of requestLog.entries()) {
    const recent = timestamps.filter((ts) => ts > cutoff);
    if (recent.length === 0) {
      requestLog.delete(clientKey);
      continue;
    }
    requestLog.set(clientKey, recent);
  }
}

function isRateLimited(clientKey: string, now: number): boolean {
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const recentRequests = (requestLog.get(clientKey) ?? []).filter((ts) => ts > cutoff);
  recentRequests.push(now);
  requestLog.set(clientKey, recentRequests);
  return recentRequests.length > RATE_LIMIT_MAX_REQUESTS;
}

export function middleware(request: NextRequest) {
  const now = Date.now();
  requestCount += 1;

  if (requestCount % CLEANUP_INTERVAL_REQUESTS === 0) {
    cleanupStaleEntries(now);
  }

  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey, now)) {
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

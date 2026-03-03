import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 120;

const requestLog = new Map<string, number[]>();

function getClientKey(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }
  return "unknown";
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

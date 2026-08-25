import {
  createPresenceServiceFromEnv,
  type PresenceSnapshot,
} from "@/lib/analytics/presence.server";
import { buildPublicStats } from "@/lib/analytics/public-stats";
import {
  normalizeTrackingStartDate,
  readTrackingStartDate,
  unavailableVercelStats,
  vercelAnalyticsAdapter,
  type VercelAggregateStats,
} from "@/lib/analytics/vercel-api.server";

const unavailablePresence: PresenceSnapshot = {
  activeNow: null,
  liveTrend: [],
};

const publicHeaders = {
  "Cache-Control": "public, s-maxage=15, stale-while-revalidate=45",
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
} as const;

const privateHeaders = {
  ...publicHeaders,
  "Cache-Control": "private, no-store",
} as const;

type PublicStatsDependencies = {
  getAnalytics: () => Promise<VercelAggregateStats>;
  getPresence: () => Promise<PresenceSnapshot>;
  checkRateLimit?: (
    address: string,
  ) => Promise<{ allowed: boolean; retryAfterSeconds: number }>;
  readTrackingStartedAt: () => string;
  now: () => Date;
};

function requestAddress(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export async function handlePublicStatsRequest(
  request: Request,
  dependencies: PublicStatsDependencies,
): Promise<Response> {
  if (request.method !== "GET") {
    return Response.json(
      { error: "Method not allowed" },
      {
        status: 405,
        headers: { ...privateHeaders, Allow: "GET" },
      },
    );
  }

  if (dependencies.checkRateLimit) {
    try {
      const limit = await dependencies.checkRateLimit(requestAddress(request));
      if (!limit.allowed) {
        return Response.json(
          { error: "Too many requests" },
          {
            status: 429,
            headers: {
              ...privateHeaders,
              "Retry-After": String(limit.retryAfterSeconds),
            },
          },
        );
      }
    } catch {
      // Public aggregate analytics remain available if only the optional limiter fails.
    }
  }

  const [analyticsResult, presenceResult] = await Promise.allSettled([
    dependencies.getAnalytics(),
    dependencies.getPresence(),
  ]);
  const analytics =
    analyticsResult.status === "fulfilled"
      ? analyticsResult.value
      : unavailableVercelStats;
  const presence =
    presenceResult.status === "fulfilled"
      ? presenceResult.value
      : unavailablePresence;
  const trackingStartedAt = normalizeTrackingStartDate(
    dependencies.readTrackingStartedAt(),
  );
  const stats = buildPublicStats({
    analytics,
    presence,
    trackingStartedAt,
    updatedAt: dependencies.now().toISOString(),
  });
  return Response.json(stats, { status: 200, headers: publicHeaders });
}

export async function GET(request: Request): Promise<Response> {
  const presence = createPresenceServiceFromEnv();
  return handlePublicStatsRequest(request, {
    getAnalytics: () => vercelAnalyticsAdapter.getStats(),
    getPresence: () =>
      presence ? presence.getSnapshot() : Promise.resolve(unavailablePresence),
    ...(presence
      ? {
          checkRateLimit: (address: string) =>
            presence.checkRateLimit("public-stats", address),
        }
      : {}),
    readTrackingStartedAt: () => readTrackingStartDate(),
    now: () => new Date(),
  });
}

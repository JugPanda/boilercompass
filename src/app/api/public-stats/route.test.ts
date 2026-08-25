import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { handlePublicStatsRequest } from "@/app/api/public-stats/route";
import {
  buildPublicStats,
  publicStatsSchema,
} from "@/lib/analytics/public-stats";

const analytics = {
  pageViewsSinceStart: 144,
  visitorsLast30Days: 73,
  pageViewsLast30Days: 120,
  dailyTrend: [{ date: "2026-08-25", visitors: 9, pageViews: 13 }],
};
const presence = {
  activeNow: 3,
  liveTrend: [{ timestamp: "2026-08-25T12:00:00.000Z", active: 3 }],
};
const updatedAt = "2026-08-25T12:00:05.000Z";

const exactKeys = [
  "activeNow",
  "activeWindowMinutes",
  "trackingStartedAt",
  "pageViewsSinceStart",
  "visitorsLast30Days",
  "pageViewsLast30Days",
  "dailyTrend",
  "liveTrend",
  "updatedAt",
  "definitions",
].sort();

describe("public stats schema", () => {
  it("builds exactly the approved public aggregate schema", () => {
    const stats = buildPublicStats({
      analytics,
      presence,
      trackingStartedAt: "2026-08-01",
      updatedAt,
    });

    expect(Object.keys(stats).sort()).toEqual(exactKeys);
    expect(Object.keys(stats.definitions).sort()).toEqual([
      "activeNow",
      "pageViews",
      "visitors",
    ]);
    expect(stats).toEqual({
      activeNow: 3,
      activeWindowMinutes: 2,
      trackingStartedAt: "2026-08-01",
      pageViewsSinceStart: 144,
      visitorsLast30Days: 73,
      pageViewsLast30Days: 120,
      dailyTrend: [{ date: "2026-08-25", visitors: 9, pageViews: 13 }],
      liveTrend: [{ timestamp: "2026-08-25T12:00:00.000Z", active: 3 }],
      updatedAt,
      definitions: {
        activeNow:
          "Anonymous browser sessions with BoilerCompass visible and a successful heartbeat within the last two minutes.",
        visitors:
          "Vercel's anonymous request-hash-based visitor metric for the preceding 30-day UTC window; it is not a permanent person identity.",
        pageViews:
          "BoilerCompass page loads and client-side navigations measured by Vercel Web Analytics.",
      },
    });
    expect(publicStatsSchema.safeParse(stats).success).toBe(true);
  });

  it("preserves honest zero, partial, and unavailable states", () => {
    const zero = buildPublicStats({
      analytics: {
        ...analytics,
        pageViewsSinceStart: 0,
        visitorsLast30Days: 0,
        pageViewsLast30Days: 0,
        dailyTrend: [],
      },
      presence: { activeNow: 0, liveTrend: [] },
      trackingStartedAt: "2026-08-01",
      updatedAt,
    });
    expect(zero.activeNow).toBe(0);
    expect(zero.pageViewsSinceStart).toBe(0);

    const unavailable = buildPublicStats({
      analytics: {
        pageViewsSinceStart: null,
        visitorsLast30Days: null,
        pageViewsLast30Days: null,
        dailyTrend: [],
      },
      presence: { activeNow: null, liveTrend: [] },
      trackingStartedAt: "",
      updatedAt,
    });
    expect(unavailable).toMatchObject({
      activeNow: null,
      trackingStartedAt: "",
      pageViewsSinceStart: null,
      visitorsLast30Days: null,
      pageViewsLast30Days: null,
    });
  });

  it("rejects extra public and nested fields", () => {
    const valid = buildPublicStats({
      analytics,
      presence,
      trackingStartedAt: "2026-08-01",
      updatedAt,
    });
    expect(
      publicStatsSchema.safeParse({ ...valid, token: "secret" }).success,
    ).toBe(false);
    expect(
      publicStatsSchema.safeParse({
        ...valid,
        dailyTrend: [{ ...valid.dailyTrend[0], country: "US" }],
      }).success,
    ).toBe(false);
  });
});

describe("GET /api/public-stats", () => {
  it("returns the exact schema with explicit short public caching", async () => {
    const response = await handlePublicStatsRequest(
      new Request("https://boilercompass.com/api/public-stats"),
      {
        getAnalytics: vi.fn(async () => analytics),
        getPresence: vi.fn(async () => presence),
        readTrackingStartedAt: () => "2026-08-01",
        now: () => new Date(updatedAt),
      },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe(
      "public, s-maxage=15, stale-while-revalidate=45",
    );
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    const body = await response.json();
    expect(Object.keys(body).sort()).toEqual(exactKeys);
    expect(publicStatsSchema.parse(body)).toEqual(body);
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain("VERCEL_ANALYTICS_TOKEN");
    expect(serialized).not.toContain("test-token-never-serialize");
    expect(serialized).not.toContain("country");
    expect(serialized).not.toContain("referrer");
  });

  it("converts provider failures to unavailable fields without upstream leakage", async () => {
    const response = await handlePublicStatsRequest(
      new Request("https://boilercompass.com/api/public-stats"),
      {
        getAnalytics: vi.fn(async () => {
          throw new Error("Bearer private-token country referrer");
        }),
        getPresence: vi.fn(async () => {
          throw new Error("redis-private-detail");
        }),
        readTrackingStartedAt: () => "not-a-date",
        now: () => new Date(updatedAt),
      },
    );
    const text = await response.text();
    const body = JSON.parse(text);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      activeNow: null,
      trackingStartedAt: "",
      pageViewsSinceStart: null,
      visitorsLast30Days: null,
      pageViewsLast30Days: null,
      dailyTrend: [],
      liveTrend: [],
    });
    expect(text).not.toContain("private-token");
    expect(text).not.toContain("redis-private-detail");
  });

  it("rejects non-GET methods", async () => {
    const response = await handlePublicStatsRequest(
      new Request("https://boilercompass.com/api/public-stats", {
        method: "POST",
      }),
      {
        getAnalytics: vi.fn(async () => analytics),
        getPresence: vi.fn(async () => presence),
        readTrackingStartedAt: () => "2026-08-01",
        now: () => new Date(updatedAt),
      },
    );

    expect(response.status).toBe(405);
  });

  it("enforces an injected pseudonymous GET limiter", async () => {
    const checkRateLimit = vi.fn(async () => ({
      allowed: false,
      retryAfterSeconds: 17,
    }));
    const response = await handlePublicStatsRequest(
      new Request("https://boilercompass.com/api/public-stats", {
        headers: { "x-forwarded-for": "203.0.113.42" },
      }),
      {
        getAnalytics: vi.fn(async () => analytics),
        getPresence: vi.fn(async () => presence),
        checkRateLimit,
        readTrackingStartedAt: () => "2026-08-01",
        now: () => new Date(updatedAt),
      },
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("17");
    expect(checkRateLimit).toHaveBeenCalledWith("203.0.113.42");
  });
});

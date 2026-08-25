import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createVercelAnalyticsAdapter } from "@/lib/analytics/vercel-api.server";

const NOW = new Date("2026-08-25T12:00:00.000Z");
const CONFIGURED_ENV = {
  VERCEL_ANALYTICS_TOKEN: "test-token-never-serialize",
  VERCEL_ANALYTICS_PROJECT_ID: "prj_test",
  VERCEL_ANALYTICS_TEAM_ID: "team_test",
  NEXT_PUBLIC_ANALYTICS_TRACKING_START_DATE: "2026-08-01",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function validFetch() {
  return vi.fn(async (...args: [RequestInfo | URL, RequestInit?]) => {
    const [input] = args;
    const url = new URL(String(input));
    if (url.pathname.endsWith("/aggregate")) {
      return jsonResponse({
        version: 1,
        query: { by: "day" },
        data: [
          { timestamp: "2026-08-24T00:00:00.000Z", pageviews: 8, visitors: 5 },
          { timestamp: "2026-08-25T00:00:00.000Z", pageviews: 13, visitors: 9 },
        ],
      });
    }

    if (url.searchParams.get("since") === "2026-08-01") {
      return jsonResponse({
        version: 1,
        query: { since: "2026-08-01" },
        data: { pageviews: 144, visitors: 88 },
      });
    }

    return jsonResponse({
      version: 1,
      query: { since: "2026-07-27" },
      data: { pageviews: 120, visitors: 73 },
    });
  });
}

describe("Vercel aggregate analytics adapter", () => {
  it("returns only valid aggregate totals and dated trend rows", async () => {
    const fetchMock = validFetch();
    const adapter = createVercelAnalyticsAdapter({
      fetch: fetchMock,
      now: () => NOW,
      readEnv: () => CONFIGURED_ENV,
    });

    await expect(adapter.getStats()).resolves.toEqual({
      pageViewsSinceStart: 144,
      visitorsLast30Days: 73,
      pageViewsLast30Days: 120,
      dailyTrend: [
        { date: "2026-08-24", visitors: 5, pageViews: 8 },
        { date: "2026-08-25", visitors: 9, pageViews: 13 },
      ],
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    for (const [input, init] of fetchMock.mock.calls) {
      const url = new URL(String(input));
      expect(url.origin).toBe("https://api.vercel.com");
      expect(url.searchParams.get("projectId")).toBe("prj_test");
      expect(url.searchParams.get("teamId")).toBe("team_test");
      expect(init?.headers).toEqual({
        Authorization: "Bearer test-token-never-serialize",
      });
    }
    const aggregateUrl = fetchMock.mock.calls
      .map(([input]) => new URL(String(input)))
      .find((url) => url.pathname.endsWith("/aggregate"));
    expect(aggregateUrl?.searchParams.get("by")).toBe("day");
    expect(aggregateUrl?.searchParams.get("since")).toBe("2026-07-27");
    expect(aggregateUrl?.searchParams.get("until")).toBe("2026-08-25");
  });

  it("returns unavailable values for missing configuration without caching the failure", async () => {
    let env: Record<string, string | undefined> = {};
    const fetchMock = validFetch();
    const adapter = createVercelAnalyticsAdapter({
      fetch: fetchMock,
      now: () => NOW,
      readEnv: () => env,
    });

    await expect(adapter.getStats()).resolves.toEqual({
      pageViewsSinceStart: null,
      visitorsLast30Days: null,
      pageViewsLast30Days: null,
      dailyTrend: [],
    });
    expect(fetchMock).not.toHaveBeenCalled();

    env = CONFIGURED_ENV;
    await adapter.getStats();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("rejects malformed, partial, and dimension-bearing upstream data narrowly", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith("/aggregate")) {
        return jsonResponse({
          data: [
            {
              timestamp: "2026-08-25T00:00:00.000Z",
              pageviews: 4,
              visitors: 3,
              country: "US",
            },
          ],
        });
      }
      if (url.searchParams.get("since") === "2026-08-01") {
        return jsonResponse({ data: { pageviews: "144", visitors: 88 } });
      }
      return jsonResponse({ data: { pageviews: 120 } });
    });
    const adapter = createVercelAnalyticsAdapter({
      fetch: fetchMock,
      now: () => NOW,
      readEnv: () => CONFIGURED_ENV,
    });

    await expect(adapter.getStats()).resolves.toEqual({
      pageViewsSinceStart: null,
      visitorsLast30Days: null,
      pageViewsLast30Days: null,
      dailyTrend: [],
    });
  });

  it("returns unavailable values on rate limiting", async () => {
    const adapter = createVercelAnalyticsAdapter({
      fetch: vi.fn(async () => jsonResponse({ error: "rate limited" }, 429)),
      now: () => NOW,
      readEnv: () => CONFIGURED_ENV,
    });

    await expect(adapter.getStats()).resolves.toEqual({
      pageViewsSinceStart: null,
      visitorsLast30Days: null,
      pageViewsLast30Days: null,
      dailyTrend: [],
    });
  });

  it("aborts upstream calls after the configured timeout", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) =>
        await new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("aborted", "AbortError")),
          );
        }),
    );
    const adapter = createVercelAnalyticsAdapter({
      fetch: fetchMock,
      now: () => NOW,
      readEnv: () => CONFIGURED_ENV,
      timeoutMs: 5,
    });

    await expect(adapter.getStats()).resolves.toEqual({
      pageViewsSinceStart: null,
      visitorsLast30Days: null,
      pageViewsLast30Days: null,
      dailyTrend: [],
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    for (const [, init] of fetchMock.mock.calls) {
      expect(init?.signal?.aborted).toBe(true);
    }
  });

  it("caches configured aggregate results for about five minutes", async () => {
    let now = NOW;
    const fetchMock = validFetch();
    const adapter = createVercelAnalyticsAdapter({
      fetch: fetchMock,
      now: () => now,
      readEnv: () => CONFIGURED_ENV,
      cacheTtlMs: 300_000,
    });

    await adapter.getStats();
    await adapter.getStats();
    expect(fetchMock).toHaveBeenCalledTimes(3);

    now = new Date(NOW.getTime() + 300_001);
    await adapter.getStats();
    expect(fetchMock).toHaveBeenCalledTimes(6);
  });
});

import "server-only";

import { z } from "zod";

export type DailyTraffic = {
  date: string;
  visitors: number;
  pageViews: number;
};

export type VercelAggregateStats = {
  pageViewsSinceStart: number | null;
  visitorsLast30Days: number | null;
  pageViewsLast30Days: number | null;
  dailyTrend: DailyTraffic[];
};

export const unavailableVercelStats: VercelAggregateStats = {
  pageViewsSinceStart: null,
  visitorsLast30Days: null,
  pageViewsLast30Days: null,
  dailyTrend: [],
};

const countResponseSchema = z
  .object({
    data: z
      .object({
        pageviews: z.number().int().nonnegative(),
        visitors: z.number().int().nonnegative(),
      })
      .strict(),
  })
  .passthrough();

const aggregateResponseSchema = z
  .object({
    data: z.array(
      z
        .object({
          timestamp: z.iso.datetime(),
          pageviews: z.number().int().nonnegative(),
          visitors: z.number().int().nonnegative(),
        })
        .strict(),
    ),
  })
  .passthrough();

export type AnalyticsEnvironment = Record<string, string | undefined>;

type VercelAnalyticsConfig = {
  token: string;
  projectId: string;
  teamId?: string;
  trackingStartedAt: string;
};

type AdapterOptions = {
  fetch?: typeof fetch;
  now?: () => Date;
  readEnv?: () => AnalyticsEnvironment;
  timeoutMs?: number;
  cacheTtlMs?: number;
};

export function normalizeTrackingStartDate(value: string | undefined): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const date = new Date(`${value}T00:00:00.000Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return "";
  }
  return value;
}

export function readTrackingStartDate(
  env: AnalyticsEnvironment = process.env,
): string {
  return normalizeTrackingStartDate(
    env.NEXT_PUBLIC_ANALYTICS_TRACKING_START_DATE,
  );
}

function readConfig(env: AnalyticsEnvironment): VercelAnalyticsConfig | null {
  const token = env.VERCEL_ANALYTICS_TOKEN?.trim();
  const projectId = env.VERCEL_ANALYTICS_PROJECT_ID?.trim();
  const teamId = env.VERCEL_ANALYTICS_TEAM_ID?.trim();
  const trackingStartedAt = readTrackingStartDate(env);
  if (!token || !projectId || !trackingStartedAt) return null;
  return {
    token,
    projectId,
    ...(teamId ? { teamId } : {}),
    trackingStartedAt,
  };
}

function utcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function precedingThirtyDayStart(now: Date): string {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  start.setUTCDate(start.getUTCDate() - 29);
  return utcDate(start);
}

function queryUrl(
  endpoint: "count" | "aggregate",
  config: VercelAnalyticsConfig,
  since: string,
  until: string,
): string {
  const url = new URL(
    `https://api.vercel.com/v1/query/web-analytics/visits/${endpoint}`,
  );
  url.searchParams.set("projectId", config.projectId);
  if (config.teamId) url.searchParams.set("teamId", config.teamId);
  url.searchParams.set("since", since);
  url.searchParams.set("until", until);
  if (endpoint === "aggregate") url.searchParams.set("by", "day");
  return url.toString();
}

async function fetchJson(
  fetchImpl: typeof fetch,
  url: string,
  token: string,
  timeoutMs: number,
): Promise<unknown | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export function createVercelAnalyticsAdapter(options: AdapterOptions = {}) {
  const fetchImpl = options.fetch ?? fetch;
  const now = options.now ?? (() => new Date());
  const readEnv = options.readEnv ?? (() => process.env);
  const timeoutMs = options.timeoutMs ?? 5_000;
  const cacheTtlMs = options.cacheTtlMs ?? 300_000;
  let cache:
    { key: string; expiresAt: number; value: VercelAggregateStats } | undefined;

  return {
    async getStats(): Promise<VercelAggregateStats> {
      const config = readConfig(readEnv());
      if (!config) return { ...unavailableVercelStats };

      const current = now();
      const cacheKey = [
        config.projectId,
        config.teamId ?? "personal",
        config.trackingStartedAt,
      ].join(":");
      if (
        cache &&
        cache.key === cacheKey &&
        current.getTime() < cache.expiresAt
      ) {
        return cache.value;
      }

      const until = utcDate(current);
      const recentSince = precedingThirtyDayStart(current);
      const [sinceStartRaw, recentRaw, trendRaw] = await Promise.all([
        fetchJson(
          fetchImpl,
          queryUrl("count", config, config.trackingStartedAt, until),
          config.token,
          timeoutMs,
        ),
        fetchJson(
          fetchImpl,
          queryUrl("count", config, recentSince, until),
          config.token,
          timeoutMs,
        ),
        fetchJson(
          fetchImpl,
          queryUrl("aggregate", config, recentSince, until),
          config.token,
          timeoutMs,
        ),
      ]);

      const sinceStart = countResponseSchema.safeParse(sinceStartRaw);
      const recent = countResponseSchema.safeParse(recentRaw);
      const trend = aggregateResponseSchema.safeParse(trendRaw);
      const value: VercelAggregateStats = {
        pageViewsSinceStart: sinceStart.success
          ? sinceStart.data.data.pageviews
          : null,
        visitorsLast30Days: recent.success ? recent.data.data.visitors : null,
        pageViewsLast30Days: recent.success ? recent.data.data.pageviews : null,
        dailyTrend: trend.success
          ? trend.data.data.map((row) => ({
              date: row.timestamp.slice(0, 10),
              visitors: row.visitors,
              pageViews: row.pageviews,
            }))
          : [],
      };
      cache = {
        key: cacheKey,
        expiresAt: current.getTime() + cacheTtlMs,
        value,
      };
      return value;
    },
  };
}

export const vercelAnalyticsAdapter = createVercelAnalyticsAdapter();

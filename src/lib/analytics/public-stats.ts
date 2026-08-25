import { z } from "zod";
import type { PresenceSnapshot } from "@/lib/analytics/presence.server";
import type { VercelAggregateStats } from "@/lib/analytics/vercel-api.server";

const dailyTrafficSchema = z
  .object({
    date: z.iso.date(),
    visitors: z.number().int().nonnegative(),
    pageViews: z.number().int().nonnegative(),
  })
  .strict();

const livePresenceSchema = z
  .object({
    timestamp: z.iso.datetime(),
    active: z.number().int().nonnegative(),
  })
  .strict();

export const publicStatsSchema = z
  .object({
    activeNow: z.number().int().nonnegative().nullable(),
    activeWindowMinutes: z.number().int().positive(),
    trackingStartedAt: z.union([z.literal(""), z.iso.date()]),
    pageViewsSinceStart: z.number().int().nonnegative().nullable(),
    visitorsLast30Days: z.number().int().nonnegative().nullable(),
    pageViewsLast30Days: z.number().int().nonnegative().nullable(),
    dailyTrend: z.array(dailyTrafficSchema),
    liveTrend: z.array(livePresenceSchema),
    updatedAt: z.iso.datetime(),
    definitions: z
      .object({
        activeNow: z.string(),
        visitors: z.string(),
        pageViews: z.string(),
      })
      .strict(),
  })
  .strict();

export type PublicStats = z.infer<typeof publicStatsSchema>;

export const publicStatsDefinitions = {
  activeNow:
    "Anonymous browser sessions with BoilerCompass visible and a successful heartbeat within the last two minutes.",
  visitors:
    "Vercel's anonymous request-hash-based visitor metric for the preceding 30-day UTC window; it is not a permanent person identity.",
  pageViews:
    "BoilerCompass page loads and client-side navigations measured by Vercel Web Analytics.",
} as const;

export function buildPublicStats({
  analytics,
  presence,
  trackingStartedAt,
  updatedAt,
}: {
  analytics: VercelAggregateStats;
  presence: PresenceSnapshot;
  trackingStartedAt: string;
  updatedAt: string;
}): PublicStats {
  return publicStatsSchema.parse({
    activeNow: presence.activeNow,
    activeWindowMinutes: 2,
    trackingStartedAt,
    pageViewsSinceStart: analytics.pageViewsSinceStart,
    visitorsLast30Days: analytics.visitorsLast30Days,
    pageViewsLast30Days: analytics.pageViewsLast30Days,
    dailyTrend: analytics.dailyTrend,
    liveTrend: presence.liveTrend,
    updatedAt,
    definitions: publicStatsDefinitions,
  });
}

import { describe, expect, it } from "vitest";
import {
  buildChartPoints,
  buildLinePath,
  formatCount,
  formatTrackingDate,
  getRecentLiveSamples,
  getCompactMetrics,
  parsePublicStats,
} from "@/lib/analytics/activity-ui";

const completeStats = {
  activeNow: 0,
  activeWindowMinutes: 2,
  trackingStartedAt: "2026-08-25",
  pageViewsSinceStart: 1234,
  visitorsLast30Days: 456,
  pageViewsLast30Days: 789,
  dailyTrend: [
    { date: "2026-08-24", visitors: 12, pageViews: 28 },
    { date: "2026-08-25", visitors: 0, pageViews: 0 },
  ],
  liveTrend: [
    { timestamp: "2026-08-25T21:59:00.000Z", active: 2 },
    { timestamp: "2026-08-25T22:00:00.000Z", active: 0 },
  ],
  updatedAt: "2026-08-25T22:00:10.000Z",
  definitions: {
    activeNow: "Visible anonymous sessions seen in the last two minutes.",
    visitors: "Anonymous visitor sessions counted by Vercel.",
    pageViews: "Initial loads and client-side navigations.",
  },
};

describe("public activity response parsing", () => {
  it("preserves legitimate zero values", () => {
    const parsed = parsePublicStats(completeStats);

    expect(parsed?.activeNow).toBe(0);
    expect(parsed?.dailyTrend[1]).toEqual({
      date: "2026-08-25",
      visitors: 0,
      pageViews: 0,
    });
  });

  it("accepts an honest partial response with unavailable totals and start date", () => {
    const parsed = parsePublicStats({
      ...completeStats,
      activeNow: null,
      trackingStartedAt: "",
      pageViewsSinceStart: null,
      visitorsLast30Days: null,
    });

    expect(parsed).not.toBeNull();
    expect(parsed?.activeNow).toBeNull();
    expect(parsed?.trackingStartedAt).toBe("");
    expect(parsed?.pageViewsSinceStart).toBeNull();
    expect(parsed?.pageViewsLast30Days).toBe(789);
  });

  it("rejects unavailable, malformed, and over-broad payloads", () => {
    expect(parsePublicStats(null)).toBeNull();
    expect(parsePublicStats({ ...completeStats, activeNow: -1 })).toBeNull();
    expect(
      parsePublicStats({ ...completeStats, rawSearches: ["tuition"] }),
    ).toBeNull();
    expect(
      parsePublicStats({
        ...completeStats,
        definitions: { ...completeStats.definitions, cookies: "none" },
      }),
    ).toBeNull();
  });
});

describe("public activity formatting", () => {
  it("distinguishes unavailable values from zero", () => {
    expect(formatCount(null)).toBe("Unavailable");
    expect(formatCount(0)).toBe("0");
    expect(formatCount(1234)).toBe("1,234");
  });

  it("formats configured tracking dates in UTC", () => {
    expect(formatTrackingDate("2026-08-25")).toBe("August 25, 2026");
    expect(formatTrackingDate("not-a-date")).toBe("the configured start date");
  });

  it("keeps the homepage proof block to three metrics", () => {
    const metrics = getCompactMetrics(completeStats);

    expect(metrics).toHaveLength(3);
    expect(metrics.map((metric) => metric.label)).toEqual([
      "Active now",
      "Visitors in last 30 days",
      "Page views since August 25, 2026",
    ]);
    expect(metrics[0].value).toBe(0);
    expect(metrics[2].value).toBe(1234);
  });

  it("does not show a since-start total without a configured start date", () => {
    const metrics = getCompactMetrics({
      ...completeStats,
      trackingStartedAt: "",
    });

    expect(metrics[2]).toEqual({
      label: "Page views since tracking began",
      value: null,
    });
  });
});

describe("activity chart geometry", () => {
  it("keeps only samples from the preceding 60 minutes", () => {
    expect(
      getRecentLiveSamples(
        [
          { timestamp: "2026-08-25T20:59:00.000Z", active: 9 },
          { timestamp: "2026-08-25T21:00:00.000Z", active: 1 },
          { timestamp: "2026-08-25T21:45:00.000Z", active: 2 },
          { timestamp: "2026-08-25T22:01:00.000Z", active: 7 },
        ],
        "2026-08-25T22:00:00.000Z",
      ),
    ).toEqual([
      { timestamp: "2026-08-25T21:00:00.000Z", active: 1 },
      { timestamp: "2026-08-25T21:45:00.000Z", active: 2 },
    ]);
  });

  it("maps values into a padded fixed viewBox", () => {
    expect(buildChartPoints([0, 5, 10], 100, 50, 10)).toEqual([
      { x: 10, y: 40 },
      { x: 50, y: 25 },
      { x: 90, y: 10 },
    ]);
  });

  it("draws an honest zero baseline and a centered single sample", () => {
    expect(buildChartPoints([0, 0], 100, 50, 10)).toEqual([
      { x: 10, y: 40 },
      { x: 90, y: 40 },
    ]);
    expect(buildChartPoints([4], 100, 50, 10)).toEqual([{ x: 50, y: 25 }]);
  });

  it("returns no fabricated geometry for missing samples", () => {
    expect(buildChartPoints([], 100, 50, 10)).toEqual([]);
    expect(buildLinePath([])).toBe("");
    expect(
      buildLinePath([
        { x: 10, y: 40 },
        { x: 50, y: 25 },
      ]),
    ).toBe("M 10 40 L 50 25");
  });
});

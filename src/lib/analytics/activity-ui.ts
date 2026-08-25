export type DailyActivityPoint = {
  date: string;
  visitors: number;
  pageViews: number;
};

export type LiveActivityPoint = {
  timestamp: string;
  active: number;
};

export type PublicStats = {
  activeNow: number | null;
  activeWindowMinutes: number;
  trackingStartedAt: string;
  pageViewsSinceStart: number | null;
  visitorsLast30Days: number | null;
  pageViewsLast30Days: number | null;
  dailyTrend: DailyActivityPoint[];
  liveTrend: LiveActivityPoint[];
  updatedAt: string;
  definitions: {
    activeNow: string;
    visitors: string;
    pageViews: string;
  };
};

export type ActivityMetric = {
  label: string;
  value: number | null;
};

export type ChartPoint = { x: number; y: number };

const publicStatsKeys = [
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
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
) {
  const actualKeys = Object.keys(value).sort();
  return (
    actualKeys.length === expectedKeys.length &&
    [...expectedKeys].sort().every((key, index) => key === actualKeys[index])
  );
}

function isCount(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

function isNullableCount(value: unknown): value is number | null {
  return value === null || isCount(value);
}

function isDateValue(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isTrackingStart(value: unknown): value is string {
  return value === "" || isDateValue(value);
}

function isDailyPoint(value: unknown): value is DailyActivityPoint {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["date", "visitors", "pageViews"]) &&
    isDateValue(value.date) &&
    isCount(value.visitors) &&
    isCount(value.pageViews)
  );
}

function isLivePoint(value: unknown): value is LiveActivityPoint {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["timestamp", "active"]) &&
    isDateValue(value.timestamp) &&
    isCount(value.active)
  );
}

export function parsePublicStats(value: unknown): PublicStats | null {
  if (!isRecord(value) || !hasExactKeys(value, publicStatsKeys)) return null;
  if (!isRecord(value.definitions)) return null;
  if (
    !hasExactKeys(value.definitions, ["activeNow", "visitors", "pageViews"])
  ) {
    return null;
  }

  const valid =
    isNullableCount(value.activeNow) &&
    isCount(value.activeWindowMinutes) &&
    value.activeWindowMinutes > 0 &&
    isTrackingStart(value.trackingStartedAt) &&
    isNullableCount(value.pageViewsSinceStart) &&
    isNullableCount(value.visitorsLast30Days) &&
    isNullableCount(value.pageViewsLast30Days) &&
    Array.isArray(value.dailyTrend) &&
    value.dailyTrend.every(isDailyPoint) &&
    Array.isArray(value.liveTrend) &&
    value.liveTrend.every(isLivePoint) &&
    isDateValue(value.updatedAt) &&
    typeof value.definitions.activeNow === "string" &&
    typeof value.definitions.visitors === "string" &&
    typeof value.definitions.pageViews === "string";

  return valid ? (value as PublicStats) : null;
}

export function formatCount(value: number | null) {
  return value === null
    ? "Unavailable"
    : new Intl.NumberFormat("en-US").format(value);
}

export function formatTrackingDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "the configured start date";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(date);
}

export function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Update time unavailable";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

export function getCompactMetrics(stats: PublicStats): ActivityMetric[] {
  const hasStartDate =
    stats.trackingStartedAt.trim() !== "" &&
    !Number.isNaN(Date.parse(stats.trackingStartedAt));
  return [
    { label: "Active now", value: stats.activeNow },
    { label: "Visitors in last 30 days", value: stats.visitorsLast30Days },
    {
      label: hasStartDate
        ? `Page views since ${formatTrackingDate(stats.trackingStartedAt)}`
        : "Page views since tracking began",
      value: hasStartDate ? stats.pageViewsSinceStart : null,
    },
  ];
}

export function getRecentLiveSamples(
  samples: LiveActivityPoint[],
  updatedAt: string,
  windowMinutes = 60,
): LiveActivityPoint[] {
  const end = Date.parse(updatedAt);
  if (!Number.isFinite(end) || windowMinutes <= 0) return [];
  const start = end - windowMinutes * 60_000;
  return samples.filter((sample) => {
    const timestamp = Date.parse(sample.timestamp);
    return Number.isFinite(timestamp) && timestamp >= start && timestamp <= end;
  });
}

function roundCoordinate(value: number) {
  return Math.round(value * 100) / 100;
}

export function buildChartPoints(
  values: number[],
  width: number,
  height: number,
  padding: number,
  domainValues: number[] = values,
): ChartPoint[] {
  if (values.length === 0 || domainValues.length === 0) return [];

  const plotWidth = Math.max(0, width - padding * 2);
  const plotHeight = Math.max(0, height - padding * 2);
  const min = Math.min(...domainValues);
  const max = Math.max(...domainValues);
  const allZero = max === 0;
  const equalNonZero = min === max && max > 0;

  return values.map((value, index) => {
    const x =
      values.length === 1
        ? padding + plotWidth / 2
        : padding + (index / (values.length - 1)) * plotWidth;
    const normalized = allZero
      ? 0
      : equalNonZero
        ? 0.5
        : (value - min) / (max - min);
    const y = padding + (1 - normalized) * plotHeight;
    return { x: roundCoordinate(x), y: roundCoordinate(y) };
  });
}

export function buildLinePath(points: ChartPoint[]) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { ActivityChart } from "@/components/activity-chart";
import {
  formatCount,
  formatTrackingDate,
  formatUpdatedAt,
  getCompactMetrics,
  getRecentLiveSamples,
  parsePublicStats,
  type ActivityMetric,
  type PublicStats,
} from "@/lib/analytics/activity-ui";

type LoadState =
  | { status: "idle" | "loading" | "unavailable"; stats: null }
  | { status: "ready"; stats: PublicStats };

const fallbackDefinitions = {
  activeNow:
    "Anonymous browser sessions with BoilerCompass visible and a successful heartbeat within the last two minutes.",
  visitors:
    "Vercel’s anonymous visitor-session estimate over the preceding 30-day UTC window; it is not a permanent person identity.",
  pageViews:
    "Initial page loads and client-side navigations recorded after analytics is configured and enabled.",
};

function usePublicStats() {
  const [state, setState] = useState<LoadState>({
    status: "idle",
    stats: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        setState({ status: "loading", stats: null });
      }
    });

    async function load() {
      try {
        const response = await fetch("/api/public-stats", {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!response.ok)
          throw new Error("Public activity response unavailable");
        const parsed = parsePublicStats(await response.json());
        if (!parsed) throw new Error("Public activity response malformed");
        setState({ status: "ready", stats: parsed });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setState({ status: "unavailable", stats: null });
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  return state;
}

function ActivityStatus({ status }: { status: LoadState["status"] }) {
  if (status === "loading") {
    return <p className="activity-status">Checking public aggregates…</p>;
  }

  return (
    <p className="activity-status">
      Activity data is unavailable until this browser receives a valid public
      aggregate response. The rest of BoilerCompass still works.
    </p>
  );
}

function MetricGrid({ metrics }: { metrics: ActivityMetric[] }) {
  return (
    <dl className="activity-metric-grid" data-testid="activity-metrics">
      {metrics.map((metric) => (
        <div key={metric.label} data-available={metric.value !== null}>
          <dt>{metric.label}</dt>
          <dd>{formatCount(metric.value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function compactMetrics(stats: PublicStats | null): ActivityMetric[] {
  if (stats) return getCompactMetrics(stats);
  return [
    { label: "Active now", value: null },
    { label: "Visitors in last 30 days", value: null },
    { label: "Page views since tracking began", value: null },
  ];
}

export function PublicActivityCompact() {
  const state = usePublicStats();

  return (
    <section
      className="section activity-proof"
      aria-labelledby="activity-proof-title"
    >
      <div className="shell activity-proof-grid">
        <div className="activity-proof-copy">
          <p className="eyebrow">Public activity</p>
          <h2 id="activity-proof-title">
            A broad view, never individual behavior.
          </h2>
          <p>
            These best-effort aggregates can be partial or unavailable. Zero is
            shown only when the public service reports zero.
          </p>
          <Link href="/about/activity">
            View BoilerCompass activity{" "}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div aria-live="polite" aria-busy={state.status === "loading"}>
          <MetricGrid metrics={compactMetrics(state.stats)} />
          {state.status !== "ready" ? (
            <ActivityStatus status={state.status} />
          ) : null}
        </div>
      </div>
    </section>
  );
}

function formatMinute(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(timestamp));
}

function formatDay(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

function liveSummary(stats: PublicStats) {
  const samples = getRecentLiveSamples(stats.liveTrend, stats.updatedAt);
  if (samples.length === 0) return "No live minute samples are available yet.";
  const values = samples.map((sample) => sample.active);
  const latest = values.at(-1) ?? 0;
  return `Across ${samples.length} minute sample${samples.length === 1 ? "" : "s"}, the range is ${Math.min(...values)} to ${Math.max(...values)} active sessions; the latest sample is ${latest}.`;
}

function dailySummary(stats: PublicStats) {
  const samples = stats.dailyTrend.slice(-30);
  if (samples.length === 0)
    return "No daily aggregate samples are available yet.";
  const visitors = samples.map((sample) => sample.visitors);
  const pageViews = samples.map((sample) => sample.pageViews);
  return `From ${formatDay(samples[0].date)} to ${formatDay(samples.at(-1)?.date ?? samples[0].date)}, the highest daily values are ${Math.max(...visitors)} visitors and ${Math.max(...pageViews)} page views.`;
}

function DetailedActivity({ stats }: { stats: PublicStats }) {
  const liveSamples = getRecentLiveSamples(stats.liveTrend, stats.updatedAt);
  const dailySamples = stats.dailyTrend.slice(-30);
  const hasStartDate =
    stats.trackingStartedAt.trim() !== "" &&
    !Number.isNaN(Date.parse(stats.trackingStartedAt));
  const sinceLabel = hasStartDate
    ? `Page views since ${formatTrackingDate(stats.trackingStartedAt)}`
    : "Page views since tracking began";
  const definitions = stats.definitions;

  return (
    <>
      <MetricGrid
        metrics={[
          {
            label: `Active in the last ${stats.activeWindowMinutes} minutes`,
            value: stats.activeNow,
          },
          { label: "Visitors, last 30 days", value: stats.visitorsLast30Days },
          {
            label: "Page views, last 30 days",
            value: stats.pageViewsLast30Days,
          },
          { label: sinceLabel, value: stats.pageViewsSinceStart },
        ]}
      />
      {!hasStartDate ? (
        <p className="activity-start-note">
          Tracking start date is unavailable.
        </p>
      ) : null}
      <p className="activity-updated">
        Last updated{" "}
        <time dateTime={stats.updatedAt}>
          {formatUpdatedAt(stats.updatedAt)}
        </time>
      </p>

      <div className="activity-charts">
        <ActivityChart
          id="live-activity"
          title="Active sessions — last 60 minutes"
          description="One best-effort aggregate sample per minute. A session can represent a browser tab, device, or bot—not a verified person."
          summary={liveSummary(stats)}
          labels={liveSamples.map((sample) => formatMinute(sample.timestamp))}
          firstColumnLabel="Minute (UTC)"
          series={[
            {
              label: "Active sessions — solid line with circles",
              values: liveSamples.map((sample) => sample.active),
              style: "solid-circle",
            },
          ]}
        />
        <ActivityChart
          id="daily-activity"
          title="Visitors and page views — last 30 days"
          description="Daily UTC aggregates. The two series use different line patterns and point shapes as well as color."
          summary={dailySummary(stats)}
          labels={dailySamples.map((sample) => formatDay(sample.date))}
          firstColumnLabel="Date (UTC)"
          series={[
            {
              label: "Visitors — solid line with circles",
              values: dailySamples.map((sample) => sample.visitors),
              style: "solid-circle",
            },
            {
              label: "Page views — dashed line with squares",
              values: dailySamples.map((sample) => sample.pageViews),
              style: "dashed-square",
            },
          ]}
        />
      </div>

      <Definitions definitions={definitions} />
    </>
  );
}

function Definitions({
  definitions,
}: {
  definitions: PublicStats["definitions"];
}) {
  return (
    <section
      className="activity-definitions"
      aria-labelledby="activity-definitions-title"
    >
      <p className="eyebrow">Definitions</p>
      <h2 id="activity-definitions-title">What these numbers mean</h2>
      <dl>
        <div>
          <dt>Active now</dt>
          <dd>{definitions.activeNow}</dd>
        </div>
        <div>
          <dt>Visitors</dt>
          <dd>{definitions.visitors}</dd>
        </div>
        <div>
          <dt>Page views</dt>
          <dd>{definitions.pageViews}</dd>
        </div>
      </dl>
    </section>
  );
}

export function PublicActivityDetail() {
  const state = usePublicStats();

  if (state.status === "ready") {
    return (
      <>
        <p className="sr-only" aria-live="polite">
          Public activity aggregates updated.
        </p>
        <DetailedActivity stats={state.stats} />
      </>
    );
  }

  return (
    <>
      <div
        className="activity-detail-unavailable"
        aria-live="polite"
        aria-busy={state.status === "loading"}
      >
        <ActivityStatus status={state.status} />
        <p>
          No zeros are substituted, and no trend line is drawn without exact
          public samples.
        </p>
      </div>
      <Definitions definitions={fallbackDefinitions} />
    </>
  );
}

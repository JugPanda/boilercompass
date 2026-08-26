# Analytics and anonymous presence

BoilerCompass uses two separate, privacy-limited layers when their providers are configured:

1. **Private owner analytics:** Vercel Web Analytics records page views and a small allowlist of coarse interaction events.
2. **Public aggregate activity:** server-only adapters expose a fixed aggregate response. Vercel supplies recent visitors/page views; Upstash Redis supplies short-lived browser-session presence.

Neither provider is required for the directory to work. Missing or failed providers produce `null`/unavailable metrics, never fabricated zeroes.

## Metric definitions

- **Active now:** browser sessions with BoilerCompass visible and a successful heartbeat within the preceding two minutes. A random per-tab UUID is created in `sessionStorage`; the server stores only an HMAC pseudonym. It is a best-effort browser-session count, not a count of people.
- **Visitors in the last 30 days:** Vercel's anonymous request-hash-based visitor estimate for the preceding 30-day UTC window. Vercel discards that visitor session after 24 hours; it is not a permanent identity or exact lifetime-human count.
- **Page views:** initial page loads and client-side Next.js navigations recorded by Vercel Web Analytics.
- **Page views since the tracking date:** recorded page views beginning at `NEXT_PUBLIC_ANALYTICS_TRACKING_START_DATE`. Set this only after intake has been verified. Do not backfill deployment logs.

The public endpoint returns only:

```ts
{
  activeNow: number | null;
  activeWindowMinutes: number;
  trackingStartedAt: string;
  pageViewsSinceStart: number | null;
  visitorsLast30Days: number | null;
  pageViewsLast30Days: number | null;
  dailyTrend: {
    date: string;
    visitors: number;
    pageViews: number;
  }
  [];
  liveTrend: {
    timestamp: string;
    active: number;
  }
  [];
  updatedAt: string;
  definitions: {
    activeNow: string;
    visitors: string;
    pageViews: string;
  }
}
```

It never proxies raw Vercel/Redis responses or exposes IP addresses, locations, referrers, user agents, search text, query strings, Purdue identifiers, paths, or presence IDs.

## Collection and retention

- Page-view URLs have query strings/fragments removed. Resource IDs and guide slugs are normalized to `/resources/[id]` and `/guides/[slug]` before transmission; unknown path shapes are suppressed.
- Custom events are runtime-validated and include only bounded source types, result-count buckets, surfaces, and non-sensitive category groups. Raw search terms, URLs, names, emails, IDs, tokens, and arbitrary properties are rejected.
- The heartbeat runs about every 30 seconds only while the document is visible. Presence expires after two minutes.
- One aggregate presence sample per minute is retained for up to two hours.
- Rate-limit keys use HMAC pseudonyms and expire with the rate-limit window. Raw IP addresses are not persisted by BoilerCompass.
- Vercel may privately process/display documented aggregate referrer, coarse region, device, browser, and operating-system dimensions. Those dimensions are not returned publicly by BoilerCompass.
- JavaScript blockers, privacy tools, network failures, background tabs, bots, and separate tabs/devices can make aggregates incomplete or inflated.

## Environment variables

All provider credentials are server-only. Never prefix them with `NEXT_PUBLIC_`, commit values, or expose them in screenshots/logs.

```dotenv
VERCEL_ANALYTICS_TOKEN=
VERCEL_ANALYTICS_PROJECT_ID=
VERCEL_ANALYTICS_TEAM_ID=
NEXT_PUBLIC_ANALYTICS_TRACKING_START_DATE=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
PUBLIC_STATS_NAMESPACE=boilercompass
BOILERCOMPASS_PRESENCE_SECRET=
```

`VERCEL_ANALYTICS_TEAM_ID` is optional for a personal project. `BOILERCOMPASS_PRESENCE_SECRET` must be a high-entropy server-only secret whenever Redis is enabled. Vercel Marketplace's `KV_REST_API_URL` and `KV_REST_API_TOKEN` names are also accepted in place of the `UPSTASH_REDIS_*` names above.

## Preview/production isolation

Use separate Upstash databases when the account permits it. At minimum, never share a namespace:

- Production automatically uses `<namespace>:production`.
- Preview automatically includes a SHA-256 digest of `VERCEL_GIT_COMMIT_REF`.
- Development uses `<namespace>:development`.

Vercel Web Analytics should be verified independently on preview and production. Do not point local or preview tests at production Redis or analytics data.

## Deployment checklist

1. Confirm the Vercel team/project and whether the plan supports custom events. Current Vercel documentation limits custom events to Pro/Enterprise; page views remain the core mode on Hobby.
2. Enable Web Analytics in Vercel and redeploy.
3. Verify the deployment makes a `/_vercel/insights/.../view` request without sensitive URLs.
4. Create/connect isolated Upstash Marketplace resources or confirm namespace isolation.
5. Set the server-only variables for the intended environment.
6. Set `NEXT_PUBLIC_ANALYTICS_TRACKING_START_DATE` to the verified UTC launch date only after successful intake.
7. Probe `/api/presence` and `/api/public-stats`; inspect the fixed response schema and degraded behavior.
8. Check `/`, `/about/activity`, charts/tables, mobile widths, reduced motion, accessibility, console, and network errors.

## Caching and failure behavior

- Vercel aggregate reads use a five-second timeout and are cached in-process for about five minutes.
- Public responses use a 15-second shared-cache TTL with stale revalidation.
- Presence writes and public reads are rate-limited with TTL-bounded Redis keys.
- Provider errors are converted to `null` and empty trend arrays. Credentials and upstream error bodies are never returned.

## Cost notes

Consult the live provider dashboards and current official pricing before launch. Vercel event allowances, reporting windows, and custom-event availability depend on plan. Upstash command usage includes heartbeats, pruning, samples, snapshots, and rate limiting; its published free-tier database-count documentation has varied, so verify the actual account limits before assuming separate free preview and production databases.

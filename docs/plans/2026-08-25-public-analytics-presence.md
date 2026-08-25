# BoilerCompass Public Analytics and Presence Implementation Plan

> **For Hermes:** Use subagent-driven-development with a fresh implementation context per task, followed by specification and code-quality review.

> **For implementer:** Add useful owner analytics and honest public activity evidence without exposing individual behavior or making the resource directory depend on analytics infrastructure. Preserve server/client boundaries, fail open for product interactions, and fail honestly for missing metrics.

**Goal:** Add Vercel Web Analytics, privacy-safe typed custom events, a server-only aggregate adapter, anonymous two-minute presence, a subtle homepage proof block, and an accessible `/about/activity` page.

**Architecture:** Vercel's official Analytics component records page views once in the root layout and removes all query strings and fragments before transmission. Typed custom events accept only coarse allowlisted fields. Server-only adapters query aggregate Vercel data and an environment-namespaced Upstash Redis presence store; `/api/public-stats` exposes only a strict aggregate schema and CDN-caches the combined response. Client presence uses a session-scoped UUID and sends a same-origin heartbeat every 30 seconds only while visible.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Zod, `@vercel/analytics`, `@upstash/redis`, Vitest, Playwright, lightweight SVG charts.

---

## Non-negotiable metric definitions

- **Active now:** anonymous browser sessions with BoilerCompass visible and a successful heartbeat within the last two minutes. Best-effort; bots and multiple browsers/devices may be included.
- **Visitors in the last 30 days:** Vercel's anonymous request-hash-based visitor metric over the preceding 30-day UTC window. It is not a permanent person identity; Vercel discards the visitor session after 24 hours.
- **Page views:** automatic Vercel page-view events, including initial loads and client-side Next.js navigations. `Page views since [date]` starts at the configured analytics launch date and is never backfilled from request logs.

## Privacy and retention contract

- Never emit raw search text, query strings, fragments, names, emails, Purdue IDs, sensitive-resource slugs/categories, full outbound URLs, authentication tokens, or arbitrary user text.
- Public responses contain only the approved aggregate schema; owner-only dimensions remain in Vercel.
- Presence ID: random UUID in `sessionStorage`; server retention in the active sorted set is bounded by TTL and a two-minute active window.
- Live samples: one aggregate count per minute, retained for two hours.
- Rate-limit pseudonyms: HMAC of the forwarded address, retained for at most the limiter TTL; raw addresses are never stored or logged.
- Core navigation, search, links, and forms continue when analytics, Redis, or Vercel APIs fail.

### Task 1: Add dependencies and typed analytics event boundary

**Files:**

- Modify: `package.json`, `package-lock.json`
- Create: `src/lib/analytics/events.ts`
- Create: `src/lib/analytics/events.test.ts`

**Steps:**

1. Add failing tests proving unknown events/properties, raw search text, URLs, identifiers, and sensitive category values are rejected.
2. Run `npm test -- src/lib/analytics/events.test.ts` and confirm the expected failure.
3. Install `@vercel/analytics`, `@upstash/redis`, and `server-only` at current stable versions.
4. Implement strict Zod schemas for coarse events such as `resource_opened`, `search_submitted`, `search_no_results`, `category_filter_selected`, and `feedback_submitted`.
5. Provide a non-throwing client helper that calls Vercel `track()` only after strict validation.
6. Re-run the focused and full unit suites.

### Task 2: Integrate standard Web Analytics and query redaction

**Files:**

- Create: `src/components/analytics-runtime.tsx`
- Modify: `src/app/layout.tsx`
- Test: `src/lib/analytics/events.test.ts`

**Steps:**

1. Add a failing sanitizer test proving page-view URLs lose query strings and fragments while preserving safe paths.
2. Implement one root `<Analytics />` using `@vercel/analytics/next` and a tested `beforeSend` sanitizer.
3. Mount the runtime once inside the root body.
4. Verify a production build contains no private credential names or values in browser chunks and renders only one Analytics script component.

### Task 3: Wire privacy-safe product events

**Files:**

- Modify: `src/components/resource-card.tsx`
- Modify: `src/components/resource-launch-button.tsx`
- Modify: `src/components/search-launcher-dialog.tsx`
- Modify: `src/components/resource-directory.tsx`
- Modify: `src/app/about/page.tsx` or a focused client correction-link component
- Test: focused unit tests plus `tests/e2e/analytics.spec.ts`

**Steps:**

1. Add failing browser/unit assertions that core actions still complete when `track()` rejects and no analytics payload contains search text or sensitive slugs.
2. Track only coarse result-count buckets, surface names, source type, and safe category groups.
3. Keep tracking calls fire-and-forget and exception-safe.
4. Confirm search, external links, filtering, and correction navigation still work with analytics blocked.

### Task 4: Define the public aggregate schema and Vercel API adapter

**Files:**

- Create: `src/lib/analytics/public-stats.ts`
- Create: `src/lib/analytics/vercel-api.server.ts`
- Create: `src/lib/analytics/vercel-api.test.ts`

**Steps:**

1. Add failing tests for valid counts/trends, missing configuration, timeout, 429, malformed JSON/schema, partial responses, and forbidden extra dimensions.
2. Define strict internal and public schemas with only totals, dated trends, definitions, and timestamps.
3. Add a `server-only` adapter for `visits/count` and `visits/aggregate`, using Bearer auth, project/team identifiers, a five-second timeout, UTC date ranges, and five-minute fetch caching.
4. Parse only `pageviews`, `visitors`, and day/timestamp values; discard all other dimensions.
5. Return `null`/unavailable metrics instead of throwing into page rendering.

### Task 5: Implement anonymous presence storage and request hardening

**Files:**

- Create: `src/lib/analytics/presence.server.ts`
- Create: `src/lib/analytics/presence.test.ts`
- Create: `src/app/api/presence/route.ts`
- Create: `src/components/presence-heartbeat.tsx`

**Steps:**

1. Add failing tests proving repeated heartbeats from one UUID do not increase active count, separate UUIDs do, stale entries expire, production/preview namespaces differ, and live samples remain bounded.
2. Add failing request tests for method/content type/origin/body size/strict UUID schema and pseudonymous rate limiting.
3. Implement Redis sorted-set presence with environment/deployment namespace, two-minute cutoff, bounded key TTLs, and one aggregate sample per minute retained for two hours.
4. Derive rate-limit keys using HMAC; never persist/log raw addresses.
5. Implement the sessionStorage UUID client, 30-second visible-only cadence, pause/resume behavior, and silent failure handling.
6. Mount heartbeat through the analytics runtime without blocking any page.

### Task 6: Add the public stats endpoint

**Files:**

- Create: `src/app/api/public-stats/route.ts`
- Create: `src/app/api/public-stats/route.test.ts` or test the extracted response builder in `src/lib/analytics/public-stats.test.ts`

**Steps:**

1. Add failing tests that the endpoint returns exactly the approved schema in full, partial, zero, and unavailable states.
2. Combine presence and Vercel aggregates through narrow adapter interfaces.
3. Set explicit public CDN caching around 15 seconds with stale-while-revalidate; retain five-minute caching for Vercel aggregate calls.
4. Add `nosniff` and conservative failure responses; never serialize upstream messages, tokens, IDs, or detailed dimensions.

### Task 7: Build accessible public activity UI

**Files:**

- Create: `src/components/public-activity.tsx`
- Create: `src/components/activity-chart.tsx`
- Create: `src/app/about/activity/page.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/site-footer.tsx`
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/globals.css`
- Test: `tests/e2e/analytics.spec.ts`, `tests/e2e/accessibility.spec.ts`, `tests/e2e/smoke.spec.ts`

**Steps:**

1. Add failing E2E tests for homepage metric limit, zeros, partial/unavailable states, activity-page headings/definitions, accessible chart tables/summaries, last-updated time, light/dark modes, reduced motion, and 320px overflow.
2. Add a compact three-metric proof section after the existing trust section and before the footer, with a link to `/about/activity`.
3. Add `/about/activity` with active count, 60-minute presence chart, 30-day visitors/page views, daily trend, since-start total, definitions, limitations, timestamp, and no individual data.
4. Use responsive fixed-viewBox SVG plus semantic summaries and expandable/visually hidden data tables; do not add a chart package.
5. Reserve stable dimensions and show honest loading/unavailable states, never fake zeros.

### Task 8: Update privacy and operations documentation

**Files:**

- Modify: `src/app/about/page.tsx`
- Modify: `.env.example`
- Modify: `README.md`
- Create: `docs/analytics-and-presence.md`

**Steps:**

1. Replace the obsolete “No analytics” statement with narrow factual disclosure.
2. Document Vercel's anonymous aggregate measurement, data-point categories, 24-hour visitor-session semantics, public/private boundary, heartbeat payload/window/retention, JavaScript/ad-blocker limitations, and launch-date behavior.
3. Document environment variables without values:
   - `VERCEL_ANALYTICS_TOKEN`
   - `VERCEL_ANALYTICS_PROJECT_ID`
   - `VERCEL_ANALYTICS_TEAM_ID`
   - `NEXT_PUBLIC_ANALYTICS_TRACKING_START_DATE`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `PRESENCE_RATE_LIMIT_SECRET`
4. Document Vercel dashboard enablement, Upstash Marketplace setup, preview/production isolation, rotation, expected command/event usage, spend limits, and rollback.

### Task 9: Full verification, security review, and visual evidence

**Steps:**

1. Run `npm ci`, formatting, lint, typecheck, unit/coverage, build, link checks, and the complete Playwright suite.
2. Run `npm audit`, added-line secret/unsafe-code scans, browser-bundle searches for server env names/tokens, and `git diff --check`.
3. Start a fresh production server; probe `/`, `/about`, `/about/activity`, `/api/public-stats`, `/robots.txt`, `/sitemap.xml`, and representative emitted JS/CSS chunks.
4. Use injected fake adapters for deterministic zero/partial/normal/unavailable screenshots and behavior without production data.
5. Capture after screenshots for homepage and activity page on desktop/mobile in light/dark modes; compare with the saved production-before captures.
6. Check console, failed requests, polling interval, hydration, focus/keyboard semantics, axe, reduced motion, and horizontal overflow.
7. Dispatch separate specification and security/code-quality reviews; fix all Critical/Important findings and repeat affected gates.

### Task 10: Preview configuration, PR, and deployment closure

**Steps:**

1. Push the focused branch and open a PR with architecture, privacy boundary, env/migration notes, verification, rollout, rollback, cost model, and blockers.
2. Enable Web Analytics on the confirmed `jugpandaco/boilercompass` Vercel project when authenticated.
3. Provision/link Upstash Redis through Vercel Marketplace and create isolated Preview and Production environment values.
4. Set the verified tracking start date only when Web Analytics becomes active; do not backfill earlier traffic.
5. Verify preview with isolated analytics/presence state before production.
6. Deploy production, then verify one Analytics intake request, client navigation page views, two isolated presence contexts, same-session deduplication, two-minute age-out, public-schema privacy, responsive themes, console/network, and usage dashboards.
7. If Vercel/Upstash authorization remains unavailable, stop after a verified preview-capable PR and report the exact minimal owner actions; do not claim live analytics or production presence.

# BoilerCompass

**Your guide to Purdue, all in one place.**

BoilerCompass is an unofficial, student-friendly directory and task guide for Purdue resources. It combines fast launching with plain-language explanations, source/provenance labels, campus scope, cautions, guided workflows, and link-freshness metadata.

> BoilerCompass is an independent student resource directory and is not affiliated with, endorsed by, or operated by Purdue University. Purdue names and third-party service names belong to their respective owners.

## Stack

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS v4 entrypoint plus a custom responsive design system
- Zod runtime schema validation for the resource registry
- Fuse.js typo-tolerant client-side search
- Vitest unit tests
- Playwright end-to-end and axe accessibility tests
- Vercel-ready metadata, sitemap, robots, icon, and Open Graph image

No database, student account, Purdue authentication, analytics, or secret key is required.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

### Environment variables

```dotenv
NEXT_PUBLIC_CORRECTIONS_URL=https://github.com/JugPanda/boilercompass/issues/new
```

- The production domain is defined centrally as `https://boilercompass.com` in [`src/lib/site.ts`](src/lib/site.ts). Canonical, Open Graph, sitemap, and robots URLs all derive from it.
- `NEXT_PUBLIC_CORRECTIONS_URL` must be a real public issue or correction-form destination. Query parameters are added to prefill the affected resource and a correction template.

### Project preview assets

The portfolio-ready project preview is generated from a real production-mode browser render:

```bash
npm run build
npm run start -- --hostname 127.0.0.1 --port 3137
BASE_URL=http://127.0.0.1:3137 npm run preview:capture
```

The command writes `1600×1000` PNG and WebP files to `public/brand/boilercompass-project-preview.*`, plus light, dark, and 400-pixel QA artifacts under `artifacts/project-preview/`. The dynamic `1200×630` Open Graph image remains the social-sharing image.

## Editing resources

Curated records live in [`src/data/resources.ts`](src/data/resources.ts). Every record must pass the Zod schema and include:

- stable `id`, name, short and long descriptions, and canonical URL
- category, tags, aliases, and search shortcuts
- `official`, `purdue_affiliated`, or `third_party` source type
- campus and audience scope
- login, featured, caution, and `lastVerified` metadata

When changing a resource:

1. Confirm the current destination and redirects.
2. Verify the operator from an official source; Purdue mentioning a service does not automatically mean Purdue operates it.
3. Use `all_or_verify` rather than guessing at campus scope.
4. Update `lastVerified` only after review.
5. Run the schema/unit suite and link checker.

Guides live in [`src/data/guides.ts`](src/data/guides.ts). Avoid freezing deadlines, eligibility, costs, prerequisites, or program capacity into guide copy.

## Verification

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run check:links
npx playwright install chromium
npm run test:e2e
```

The link checker writes a complete machine-readable report to `reports/link-check.json`. It:

- follows redirects
- falls back from `HEAD` to a small `GET` when needed
- classifies 401/403/429 responses as authentication or automation blocking for manual review
- reports network timeouts as inconclusive rather than pretending the link is dead
- exits non-zero for confirmed failed HTTP responses

## Production-like runtime check

```bash
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000
```

Then inspect `/`, `/resources`, a resource detail route, a guide, `/support`, `/robots.txt`, `/sitemap.xml`, and `/opengraph-image` at desktop and mobile widths. Check the browser console after navigation and interactions.

## Deploying to Vercel

1. Import the repository into Vercel or run `vercel` from this directory.
2. Prefer the project slug `boilercompass`; if unavailable, try `boilercompass-purdue`, then `boilercompass-app`.
3. Add a working `NEXT_PUBLIC_CORRECTIONS_URL`.
4. Deploy production and smoke-test the deployed URL—not only the successful deployment status.
5. Verify rendered canonical/OG metadata and fetch the live sitemap and robots files.

If the production domain changes, update `src/lib/site.ts`, redeploy, and re-check canonical, Open Graph, sitemap, and robots URLs together.

## Privacy and safety

- Favorites and recently opened resources are stored only in the browser’s local storage.
- BoilerCompass never asks for or stores Purdue passwords.
- Authenticated Purdue pages are opened directly and are never embedded, proxied, or scraped.
- Immediate emergencies are directed to 911. The site is not a crisis, medical, counseling, legal, or advising service.
- The supplied presentation photographs were used only as research context and are not included in this repository.

## Known limitations

- Source links and policies can change after their last-verified date.
- Some Purdue services differ between West Lafayette, Indianapolis, online, and statewide programs; uncertain records are labeled for verification.
- Automated link checks can be blocked even when a page works in a normal browser, so blocked and inconclusive responses need manual review.
- Rate My Professors and independent course tools are anecdotal or third-party context, not official course or degree-planning sources.
- The disclaimer and public correction process should receive legal/operational review before broad launch.

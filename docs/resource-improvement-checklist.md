# BoilerCompass resource-improvement implementation checklist

Research and implementation date: 2026-08-05

This checklist orders work by student impact, consequence of a wrong answer, and frequency of the task. Checked items are included in the 2026-08-05 implementation pass.

## 1. Consequential, high-frequency student questions

- [x] Add a West Lafayette parking resource with current permit categories, eligibility cautions, natural-language aliases, and a content-review date.
- [x] Add `/guides/parking-and-bringing-a-car` covering first-year restrictions, documented exceptions, current 2026–27 prices, remote lots, overnight use, and break storage.
- [x] Expand the Division of Financial Aid resource for Pell and aid-offer searches.
- [x] Add `/guides/understanding-financial-aid-offer` explaining how to check Purdue's offer, distinguish Pell from a scholarship, identify unresolved requirements, and separate offered from disbursed aid.
- [x] Add a University Residences laundry resource with campus scope, paid-versus-included context, CSCPay aliases, and current official fees.
- [x] Add `/guides/laundry-in-university-residences` with the current $2.50 wash, $2.00 dry, $0.25 added dryer time, included-laundry caveat, and refund route.

Acceptance criteria:

- Searches such as `did i get pell`, `can freshmen bring cars`, and `how much is laundry` return the correct official resource first.
- Resource pages link to the relevant step-by-step guide.
- Every consequential statement names its scope and points to the controlling Purdue page.

## 2. First-year setup and everyday logistics

- [x] Add Purdue IT — New to Purdue for Career Account, Microsoft MFA, email, Wi-Fi, ResNet, URHome, software, and printing setup.
- [x] Add Purdue Mobile ID & Card Operations for Mobile ID, Purdue ID, eAccounts, BoilerExpress, and access problems.
- [x] Add Academic & registration calendars for academic dates, add/drop and refund deadlines, short courses, finals, and time tickets.
- [x] Add Residence hall mail & packages for addressing, pickup notifications, accepted delivery types, hold periods, and outbound shipping.
- [x] Expand `/guides/new-student-essentials` from three general paragraphs into before-arrival, before-move-in, first-week, and first-month checklists.

Acceptance criteria:

- New resources include campus, audience, login, source, last-link-check, and content-review metadata.
- Natural-language searches for Wi-Fi, ID problems, packages, and calendar questions return useful official starting points.
- The new-student guide links all newly added official resources.

## 3. Make resources answer the task before sending students away

- [x] Extend the resource model with optional `useWhen`, `notFor`, `beforeOpening`, `contentReviewed`, and `guideSlugs` fields.
- [x] Render “Use this when,” “This is not for,” and “Prepare before opening” on enriched resource pages.
- [x] Display content-review dates separately from link-verification dates.
- [x] Add reciprocal step-by-step guide links to relevant resource pages.
- [x] Feature parking, financial aid, laundry, and new-student guides on the homepage.
- [x] Use each guide's review date in the sitemap.

Acceptance criteria:

- Link health and editorial review are not presented as the same claim.
- A student can move from a natural-language search to an official resource and then to the associated guide without returning to the homepage.
- Optional enrichment does not break older resource records.

## 4. Quality and regression protection

- [x] Add unit coverage for the new natural-language search phrases.
- [x] Add data-integrity tests for unique guide slugs, valid resource IDs, reciprocal resource-to-guide links, and priority-guide review dates.
- [x] Add browser task tests for Pell, first-year parking, and laundry cost.
- [x] Run formatting, lint, TypeScript checks, unit tests, production build, Playwright desktop tests, and responsive smoke tests.
- [x] Validate every newly added official destination and every generated internal route.
- [x] Commit, push, and verify the deployed production routes.

## Official sources reviewed

- Purdue Parking Operations, student permits: https://www.purdue.edu/operations/parking/home/permits/students/
- University Residences laundry: https://www.housing.purdue.edu/my-housing/info/amenities-accommodations/laundry.html
- Division of Financial Aid, myPurdue guidance: https://www.purdue.edu/dfa/accept/refund/mypurdue/
- Division of Financial Aid, accepting aid: https://www.purdue.edu/dfa/accept/
- Division of Financial Aid, grants: https://www.purdue.edu/dfa/aid/grants/
- Purdue IT, New to Purdue: https://it.purdue.edu/services/new-to-purdue.php
- Purdue ID Card Operations: https://www.purdue.edu/treasurer/finance/card/
- Office of the Registrar calendars: https://www.purdue.edu/registrar/calendars/
- University Residences postal service and shipping: https://www.housing.purdue.edu/my-housing/info/general/postal-service.html

## Deferred backlog

These are lower priority than the completed task-answering content and should be handled as separate scoped work:

- [ ] Private, local-only personalized start mode by campus, student type, and housing.
- [ ] Locally saved interactive new-student checklist state.
- [ ] Seasonal deadline cards backed by a reviewed update process.
- [ ] Separate public editorial changelog.
- [ ] Moderated “Suggest a resource” workflow.
- [ ] Opt-in, privacy-preserving collection of no-result search phrases.
- [ ] Structured observation sessions with current and incoming Purdue students.

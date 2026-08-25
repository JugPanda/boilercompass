import { expect, test } from "@playwright/test";

const publicStats = {
  activeNow: 2,
  activeWindowMinutes: 2,
  trackingStartedAt: "2026-08-25",
  pageViewsSinceStart: 1234,
  visitorsLast30Days: 456,
  pageViewsLast30Days: 789,
  dailyTrend: [
    { date: "2026-08-24", visitors: 12, pageViews: 28 },
    { date: "2026-08-25", visitors: 18, pageViews: 43 },
  ],
  liveTrend: [
    { timestamp: "2026-08-25T21:59:00.000Z", active: 1 },
    { timestamp: "2026-08-25T22:00:00.000Z", active: 2 },
  ],
  updatedAt: "2026-08-25T22:00:10.000Z",
  definitions: {
    activeNow:
      "Anonymous visible browser sessions seen in the last two minutes.",
    visitors: "Anonymous visitor-session estimate for the preceding 30 days.",
    pageViews: "Initial loads and client-side navigations.",
  },
};

async function stubPublicStats(page: import("@playwright/test").Page) {
  await page.route("**/api/public-stats", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(publicStats),
    }),
  );
}

test("homepage shows exactly three honest public activity metrics", async ({
  page,
}) => {
  await stubPublicStats(page);
  await page.goto("/");

  const metrics = page.getByTestId("activity-metrics");
  await expect(metrics.locator(":scope > div")).toHaveCount(3);
  await expect(metrics).toContainText("Active now");
  await expect(metrics).toContainText("Visitors in last 30 days");
  await expect(metrics).toContainText("Page views since August 25, 2026");
  await expect(
    page.getByRole("link", { name: "View BoilerCompass activity" }),
  ).toBeVisible();
});

test("activity page renders summaries, charts, definitions, and exact tables", async ({
  page,
}) => {
  await stubPublicStats(page);
  await page.goto("/about/activity");

  await expect(
    page.getByRole("heading", {
      name: "BoilerCompass activity, in broad strokes.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Active sessions — last 60 minutes" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Visitors and page views — last 30 days",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "What these numbers mean" }),
  ).toBeVisible();
  await expect(page.getByText("1,234")).toBeVisible();

  const details = page.locator("details");
  await expect(details).toHaveCount(2);
  await details.first().locator("summary").click();
  await expect(details.first().getByRole("table")).toBeVisible();
});

test("unavailable providers remain unavailable and do not become zero", async ({
  page,
}) => {
  await page.route("**/api/public-stats", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: "{}" }),
  );
  await page.goto("/");

  await expect(
    page.getByTestId("activity-metrics").getByText("Unavailable"),
  ).toHaveCount(3);
  await expect(page.getByText(/Activity data is unavailable/)).toBeVisible();
  await expect(page.getByTestId("activity-metrics")).not.toContainText(/^0$/);
});

test("activity routes have no horizontal overflow at 320 pixels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await stubPublicStats(page);

  for (const route of ["/", "/about/activity"]) {
    await page.goto(route);
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
  }
});

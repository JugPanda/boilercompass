import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const populatedStats = {
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

test("the mounted Vercel beforeSend hook redacts sensitive route details", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const target = window as unknown as {
      capturedAnalytics: unknown[][];
      va: (...args: unknown[]) => void;
    };
    target.capturedAnalytics = [];
    target.va = (...args: unknown[]) => target.capturedAnalytics.push(args);
  });
  await page.goto("/resources/financial-aid?q=private-search#student-fragment");
  await expect
    .poll(() =>
      page.evaluate(() =>
        (
          window as unknown as { capturedAnalytics: unknown[][] }
        ).capturedAnalytics.some(([command]) => command === "beforeSend"),
      ),
    )
    .toBe(true);

  const sanitized = await page.evaluate(() => {
    const commands = (
      window as unknown as {
        capturedAnalytics: Array<
          [string, ((event: { type: string; url: string }) => unknown)?]
        >;
      }
    ).capturedAnalytics;
    const beforeSend = commands.find(
      ([command]) => command === "beforeSend",
    )?.[1];
    if (!beforeSend) return null;
    return beforeSend({
      type: "pageview",
      url: "https://boilercompass.com/resources/financial-aid?q=private-search#student-fragment",
    });
  });

  expect(sanitized).toEqual({
    type: "pageview",
    url: "https://boilercompass.com/resources/[id]",
  });
  expect(JSON.stringify(sanitized)).not.toContain("financial-aid");
  expect(JSON.stringify(sanitized)).not.toContain("private-search");
});

test("custom analytics excludes raw search text and cannot block navigation", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    const target = window as unknown as {
      capturedAnalytics: unknown[][];
      va: (...args: unknown[]) => void;
    };
    target.capturedAnalytics = [];
    target.va = (...args: unknown[]) => target.capturedAnalytics.push(args);
  });

  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Search Purdue resources" })
    .fill("boilercourses private@example.com");
  await page.keyboard.press("Enter");

  const captured = await page.evaluate(
    () =>
      (
        window as unknown as {
          capturedAnalytics: unknown[][];
        }
      ).capturedAnalytics,
  );
  const serialized = JSON.stringify(captured);
  expect(serialized).not.toContain("private@example.com");
  expect(serialized).not.toContain("boilercourses");

  await page.goto("/");
  await page.evaluate(() => {
    (window as unknown as { va: (command: string) => void }).va = (command) => {
      if (command === "event") throw new Error("blocked analytics intake");
    };
  });
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Search Purdue resources" })
    .fill("boilercourses");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/resources\/boilerclasses$/);
});

test("populated charts and expanded exact-value tables pass axe", async ({
  page,
}) => {
  await page.route("**/api/public-stats", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(populatedStats),
    }),
  );
  await page.goto("/about/activity");
  for (const summary of await page.locator("details summary").all()) {
    await summary.click();
  }

  const results = await new AxeBuilder({ page }).analyze();
  const material = results.violations.filter((violation) =>
    ["moderate", "serious", "critical"].includes(violation.impact ?? ""),
  );
  expect(material, JSON.stringify(material, null, 2)).toEqual([]);
});

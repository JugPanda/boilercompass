import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const route of ["/", "/resources", "/guides/advisor-meeting-prep"]) {
  test(`has no serious accessibility violations on ${route}`, async ({
    page,
  }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
}

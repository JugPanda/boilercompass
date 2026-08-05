import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function expectNoMaterialViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const material = results.violations.filter((violation) =>
    ["moderate", "serious", "critical"].includes(violation.impact ?? ""),
  );
  expect(material, JSON.stringify(material, null, 2)).toEqual([]);
}

const auditRoutes = [
  "/",
  "/resources",
  "/resources/student-parking",
  "/resources/residence-laundry",
  "/resources/financial-aid",
  "/guides/parking-and-bringing-a-car",
  "/guides/understanding-financial-aid-offer",
  "/guides/new-student-essentials",
] as const;

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  for (const route of auditRoutes) {
    test(`${reducedMotion} motion has no material axe violations on ${route}`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion });
      await page.goto(route);
      await expectNoMaterialViolations(page);
    });
  }
}

test("open search launcher has no material axe violations", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: /Where do you need to go/i }),
  ).toBeVisible();
  await expectNoMaterialViolations(page);
});

test("open mobile navigation and filter sheet have no material axe violations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expectNoMaterialViolations(page);

  await page.keyboard.press("Escape");
  await page.goto("/resources");
  await page.getByRole("button", { name: "More filters" }).click();
  await expectNoMaterialViolations(page);
});

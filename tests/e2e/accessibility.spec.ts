import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function expectNoMaterialViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const material = results.violations.filter((violation) =>
    ["moderate", "serious", "critical"].includes(violation.impact ?? ""),
  );
  expect(material, JSON.stringify(material, null, 2)).toEqual([]);
}

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  for (const route of ["/", "/resources", "/guides/advisor-meeting-prep"]) {
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
  await page.keyboard.press("Control+K");
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
  await page.getByRole("button", { name: "Filter resources" }).click();
  await expectNoMaterialViolations(page);
});

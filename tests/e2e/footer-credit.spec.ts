import { expect, test } from "@playwright/test";

const requiredRoutes = [
  "/",
  "/resources",
  "/guides",
  "/about",
  "/support",
  "/resources/boilerclasses",
  "/guides/advisor-meeting-prep",
];

for (const route of requiredRoutes) {
  test(`global footer credit is correct on ${route}`, async ({ page }) => {
    await page.goto(route);

    const footer = page.locator("footer.site-footer");
    const credit = footer.locator(".footer-credit");
    const link = credit.locator("a");

    await expect(footer).toBeVisible();
    await expect(credit).toContainText("Built by JugPanda Sites");
    await expect(link).toHaveText("JugPanda Sites");
    await expect(link).toHaveAttribute("href", "https://jugpandasites.com/");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link).toHaveAccessibleName(/JugPanda Sites.*new tab/i);
    await expect(
      footer.getByText(
        /not affiliated with, endorsed by, or operated by Purdue University/i,
      ),
    ).toBeVisible();
  });
}

test("footer credit has visible keyboard focus and fits at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto("/");

  const link = page.locator(".footer-credit a");
  await link.focus();
  await expect(link).toBeFocused();
  await expect(link).toHaveCSS("outline-style", "solid");
  await expect(link).toHaveCSS("outline-width", "3px");

  const dimensions = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBe(dimensions.client);
});

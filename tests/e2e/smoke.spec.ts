import { expect, test } from "@playwright/test";

test("search, filter, open a resource, and navigate to a guide", async ({
  page,
  context,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto("/");
  await page.getByLabel("Search Purdue resources").fill("therapy");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/\/resources\?q=therapy/);
  await expect(
    page.getByRole("heading", {
      name: "Counseling and Psychological Services",
    }),
  ).toBeVisible();

  await page.getByLabel("Search resources").fill("BoilerClasses");
  await page.getByLabel("Source type").selectOption("purdue_affiliated");
  await expect(
    page.getByRole("heading", { name: "BoilerClasses" }),
  ).toBeVisible();
  const boilerClassesCard = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "BoilerClasses" }),
  });
  await boilerClassesCard.getByRole("link", { name: "Details" }).click();
  await expect(
    page.getByRole("heading", { name: "BoilerClasses", level: 1 }),
  ).toBeVisible();

  const popupPromise = context.waitForEvent("page");
  await page.getByRole("link", { name: "Open BoilerClasses" }).click();
  const externalPage = await popupPromise;
  await expect(externalPage).toHaveURL(/^https:\/\/boilerclasses\.com/);
  await externalPage.close();

  await page.getByRole("link", { name: "Guides" }).first().click();
  await page
    .getByRole("link", { name: /Prepare for an advisor meeting/i })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Prepare for an advisor meeting",
      level: 1,
    }),
  ).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("mobile directory prioritizes search and collapses advanced filters", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/resources");

  const filterToggle = page.getByRole("button", { name: "Filter resources" });
  await expect(filterToggle).toBeVisible();
  await expect(filterToggle).toHaveAttribute("aria-expanded", "false");
  const searchBox = page.getByLabel("Search resources");
  await expect(searchBox).toBeVisible();
  const searchPosition = await searchBox.boundingBox();
  expect(searchPosition?.y).toBeLessThan(812);

  await filterToggle.click();
  await expect(filterToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByLabel("Source type")).toBeVisible();
});

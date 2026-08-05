import { expect, test, type Page } from "@playwright/test";

function resultCard(page: Page, name: string) {
  return page
    .getByTestId("resource-results")
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name, exact: true }) });
}

test("novice task 1: open Brightspace for coursework", async ({ page }) => {
  await page.goto("/resources?q=view%20coursework");
  const card = resultCard(page, "Brightspace");
  await expect(card).toBeVisible();
  await expect(card.getByText("Official Purdue")).toBeVisible();
  await expect(card.getByText("Login required", { exact: true })).toBeVisible();
  await expect(
    card.getByRole("link", { name: "Open Brightspace in a new tab" }),
  ).toHaveAttribute("href", "https://purdue.brightspace.com/");
});

test("novice task 2: find tutoring without an office name", async ({
  page,
}) => {
  await page.goto("/resources?q=find%20tutoring");
  const card = resultCard(page, "Tutoring & help-center directory");
  await expect(card).toBeVisible();
  await expect(card.getByText("Official Purdue")).toBeVisible();
});

test("novice task 3: distinguish BoilerClasses and official alternatives", async ({
  page,
}) => {
  await page.goto("/resources/boilerclasses");
  await expect(page.getByText("Purdue-affiliated").first()).toBeVisible();
  await expect(page.getByText(/Not an official registration/i)).toBeVisible();
  const verify = page.getByRole("heading", {
    name: "Official sources to verify",
  });
  await expect(verify).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Purdue Catalog" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "myPurdue" })).toBeVisible();
});

test("novice task 4: explain changing a major and CODO", async ({ page }) => {
  await page.goto("/resources?q=change%20my%20major");
  const card = resultCard(page, "CODO requirements");
  await expect(card).toBeVisible();
  await card.getByRole("link", { name: "About CODO requirements" }).click();
  await expect(
    page.getByRole("heading", { name: "CODO requirements" }),
  ).toBeVisible();
  await expect(
    page.getByText(/Change of Degree Objective/i).first(),
  ).toBeVisible();
});

test("novice task 5: find tuition and billing help", async ({ page }) => {
  await page.goto("/resources?q=pay%20my%20bill");
  const card = resultCard(page, "Office of the Bursar");
  await expect(card).toBeVisible();
  await expect(card.getByText(/billing/i)).toBeVisible();
  await expect(
    card.getByText("Official Purdue", { exact: true }),
  ).toBeVisible();
});

test("novice task 6: find a student organization", async ({ page }) => {
  await page.goto("/resources?q=find%20a%20student%20organization");
  const card = resultCard(page, "BoilerLink");
  await expect(card).toBeVisible();
  await expect(card.getByText(/may differ by campus/i)).toBeVisible();
});

test("novice task 7: distinguish immediate crisis and routine support", async ({
  page,
}) => {
  await page.goto("/support");
  await expect(
    page
      .locator("#main-content")
      .getByText("Call 911 for an immediate emergency."),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Call 911" })).toHaveAttribute(
    "href",
    "tel:911",
  );
  await expect(page.getByRole("link", { name: "Call 988" })).toHaveAttribute(
    "href",
    "tel:988",
  );
  await expect(page.getByRole("link", { name: "Text 988" })).toHaveAttribute(
    "href",
    "sms:988",
  );
  await expect(
    page.getByRole("link", { name: "Open CAPS crisis guidance in a new tab" }),
  ).toHaveAttribute("href", "https://www.purdue.edu/caps/crisis.php");
});

test("novice task 8: campus filter is shareable and resettable", async ({
  page,
}) => {
  await page.goto("/resources?campus=indianapolis");
  await expect(page.getByLabel("Campus/location")).toHaveValue("indianapolis");
  await expect(
    page.getByRole("button", { name: /Indianapolis/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear all" }).click();
  await expect(page).not.toHaveURL(/campus=/);
  await expect(page.getByLabel("Campus/location")).toHaveValue("all");
});

test("novice task 9: favorite persists locally and saved view clears stale search", async ({
  page,
}) => {
  await page.goto("/resources?q=view%20coursework");
  const card = resultCard(page, "Brightspace");
  await card
    .getByRole("button", { name: "Add Brightspace to favorites" })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        JSON.parse(localStorage.getItem("boilercompass:favorites") ?? "[]"),
      ),
    )
    .toContain("brightspace");
  await page.reload();
  await expect(
    card.getByRole("button", { name: "Remove Brightspace from favorites" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /Favorites 1/ }).click();
  await expect(page).not.toHaveURL(/q=/);
  await expect(resultCard(page, "Brightspace")).toBeVisible();
});

test("novice task 10: report an outdated link without opening GitHub", async ({
  page,
}) => {
  await page.goto("/resources/boilerclasses");
  const report = page.getByRole("link", {
    name: "Report an outdated link in a new tab",
  });
  const href = await report.getAttribute("href");
  if (!href) throw new Error("Correction link is missing its href");
  const correction = new URL(href);
  expect(`${correction.origin}${correction.pathname}`).toBe(
    "https://github.com/JugPanda/boilercompass/issues/new",
  );
  expect(correction.searchParams.get("title")).toBe(
    "Correction: BoilerClasses",
  );
  expect(correction.searchParams.get("body")).toContain(
    "Resource: BoilerClasses",
  );
  await expect(report).toHaveAttribute("target", "_blank");
  await expect(report).toHaveAttribute("rel", /noopener/);
});

test("novice task 11: check whether Pell appears in Purdue's aid offer", async ({
  page,
}) => {
  await page.goto("/resources?q=did%20i%20get%20pell");
  const card = resultCard(page, "Division of Financial Aid");
  await expect(card).toBeVisible();
  await card
    .getByRole("link", { name: "About Division of Financial Aid" })
    .click();
  await expect(
    page.getByRole("link", { name: "Understanding your financial-aid offer" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Understanding your financial-aid offer" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Checking for a Federal Pell Grant" }),
  ).toBeVisible();
  await expect(
    page.getByText(/Pell is a federal grant rather than a scholarship/i),
  ).toBeVisible();
});

test("novice task 12: understand first-year residence-hall parking", async ({
  page,
}) => {
  await page.goto("/resources?q=can%20freshmen%20bring%20cars");
  const card = resultCard(page, "Student parking permits");
  await expect(card).toBeVisible();
  await card
    .getByRole("link", { name: "About Student parking permits" })
    .click();
  await expect(
    page.getByText(
      /not eligible for a normal Residence Hall permit regardless of earned credits/i,
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Parking and bringing a car" }),
  ).toBeVisible();
});

test("novice task 13: find the current residence laundry cost", async ({
  page,
}) => {
  await page.goto("/resources?q=how%20much%20is%20laundry");
  const card = resultCard(page, "University Residences laundry");
  await expect(card).toBeVisible();
  await card
    .getByRole("link", { name: "About University Residences laundry" })
    .click();
  await expect(page.getByText(/\$2.50 to wash, \$2.00 to dry/i)).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Laundry in University Residences" }),
  ).toBeVisible();
});

test("natural-language student questions rank the intended resource first", async ({
  page,
}) => {
  const cases = [
    ["did i get pell", "Division of Financial Aid"],
    ["pell grant scholarship", "Division of Financial Aid"],
    ["can freshmen bring cars", "Student parking permits"],
    ["how much is laundry", "University Residences laundry"],
    ["how do packages work", "Residence hall mail & packages"],
    ["my id won't work", "Purdue Mobile ID & Card Operations"],
    ["how do i get on wifi", "Purdue IT — New to Purdue"],
    ["when is fall break", "Academic & registration calendars"],
  ] as const;

  for (const [query, expectedName] of cases) {
    await page.goto(`/resources?q=${encodeURIComponent(query)}`);
    await expect(
      page
        .getByTestId("resource-results")
        .getByRole("article")
        .first()
        .getByRole("heading", { name: expectedName, exact: true }),
      query,
    ).toBeVisible();
  }
});

test("broad health query keeps the best match first", async ({ page }) => {
  await page.goto("/resources?q=health%20support");
  await expect(
    page
      .getByTestId("resource-results")
      .getByRole("article")
      .first()
      .getByRole("heading"),
  ).toHaveText("Counseling and Psychological Services");
});

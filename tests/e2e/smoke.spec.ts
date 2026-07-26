import { expect, test } from "@playwright/test";

function collectRuntimeErrors(page: import("@playwright/test").Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  page.on("response", (response) => {
    if (
      response.url().startsWith("http://127.0.0.1:3118") &&
      response.status() >= 400
    ) {
      errors.push(`http ${response.status()}: ${response.url()}`);
    }
  });
  return errors;
}

test("keyboard launcher opens, searches an alias, selects a result, and returns focus", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  await page.goto("/");

  const heroSearch = page.getByRole("button", {
    name: /Try “plan classes,” “find tutoring,” or “pay my bill”/,
  });
  await heroSearch.focus();
  await page.keyboard.press("Control+K");

  const dialog = page.getByRole("dialog", { name: /Where do you need to go/i });
  const launcherInput = page.getByRole("combobox", {
    name: "Search Purdue resources",
  });
  await expect(dialog).toBeVisible();
  await expect(launcherInput).toBeFocused();
  await launcherInput.fill("boilercourses");
  const boilerClassesOption = page.getByRole("option", {
    name: /BoilerClasses/i,
  });
  await expect(boilerClassesOption).toBeVisible();
  await expect(boilerClassesOption).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option").nth(1)).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.keyboard.press("ArrowUp");
  await expect(boilerClassesOption).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(heroSearch).toBeFocused();

  await page.keyboard.press("/");
  await launcherInput.fill("boilercourses");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/resources\/boilerclasses$/);
  await expect(
    page.getByRole("heading", { name: "BoilerClasses", level: 1 }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("first viewport explains the product, trust status, search path, and support path", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Find the right Purdue resource.",
      level: 1,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Unofficial student resource guide"),
  ).toBeVisible();
  await expect(page.getByText("What do you need help with?")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Emergency & support" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Most-used Purdue tools" }),
  ).toBeVisible();
});

test("resource cards name internal and external destinations and explain trust", async ({
  page,
}) => {
  await page.goto("/resources?q=boilerclasses");
  await expect(
    page.getByText("What do these source labels mean?", { exact: true }),
  ).toBeVisible();
  const card = page
    .getByTestId("resource-results")
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "BoilerClasses" }) });
  await expect(
    card.getByRole("link", { name: "About BoilerClasses" }),
  ).toBeVisible();
  await expect(
    card.getByRole("link", { name: "Open BoilerClasses in a new tab" }),
  ).toContainText("Open BoilerClasses");
  await expect(card.getByText(/Not an official registration/i)).toBeVisible();
  await expect(card.getByText(/Link verified July 2026/i)).toBeVisible();
});

test("direct filter URLs restore state and browser history", async ({
  page,
}) => {
  await page.goto(
    "/resources?q=tutoring&source=official&campus=west_lafayette",
  );
  await expect(page.getByLabel("Search within resources")).toHaveValue(
    "tutoring",
  );
  await expect(page.getByLabel("Who runs it?")).toHaveValue("official");
  await expect(page.getByLabel("Campus/location")).toHaveValue(
    "west_lafayette",
  );
  await page.getByLabel("Campus/location").selectOption("indianapolis");
  await expect(page).toHaveURL(/campus=indianapolis/);
  await page.goBack();
  await expect(page.getByLabel("Campus/location")).toHaveValue(
    "west_lafayette",
  );
});

test("favorites and recently opened explain device-only storage on first use", async ({
  page,
}) => {
  await page.goto("/resources");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: /Favorites 0/i }).click();
  const emptyState = page.locator(".empty-state");
  await expect(emptyState.getByText(/No account is needed/i)).toBeVisible();
  await expect(emptyState.getByText(/stay in this browser/i)).toBeVisible();
  await page.getByRole("button", { name: /Recently opened 0/i }).click();
  await expect(emptyState.getByText(/open will appear here/i)).toBeVisible();
});

test("BoilerClasses identifies its operator and official verification sources", async ({
  page,
}) => {
  await page.goto("/resources/boilerclasses");
  await expect(page.getByText("Purdue-affiliated").first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Official sources to verify" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Purdue Catalog/ }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /myPurdue/ })).toBeVisible();
});

test("essential homepage content is server rendered and visible without JavaScript", async ({
  browser,
  request,
}) => {
  const response = await request.get("/");
  const html = await response.text();
  expect(html).toContain("Find the right Purdue resource.");
  expect(html).toContain("What do you need help with?");
  expect(html).toContain("Browse all resources");

  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  const heading = page.getByRole("heading", {
    name: "Find the right Purdue resource.",
  });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveCSS("opacity", "1");
  await expect(page.getByText("What do you need help with?")).toBeVisible();
  const fallbackSearch = page.getByLabel("Search Purdue resources");
  await expect(fallbackSearch).toBeVisible();
  await fallbackSearch.fill("find tutoring");
  await fallbackSearch.press("Enter");
  await expect(page).toHaveURL(/\/resources\?q=find(\+|%20)tutoring/);
  await expect(
    page.getByRole("heading", { name: "Tutoring & help-center directory" }),
  ).toBeVisible();
  await context.close();
});

test("directory filters, exposes active state, resets, and persists favorites", async ({
  page,
}) => {
  await page.goto("/resources");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByLabel("Search within resources").fill("BoilerClasses");
  await page.getByLabel("Who runs it?").selectOption("purdue_affiliated");
  const boilerClassesCard = page
    .getByTestId("resource-results")
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "BoilerClasses" }) });
  await expect(boilerClassesCard).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Search: BoilerClasses/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Purdue-affiliated/i }),
  ).toBeVisible();

  const favorite = boilerClassesCard.getByRole("button", {
    name: "Add BoilerClasses to favorites",
  });
  await favorite.click();
  await expect(
    boilerClassesCard.getByRole("button", {
      name: "Remove BoilerClasses from favorites",
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: /Favorites 1/i }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(
    page.getByRole("heading", { name: "49 resources" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Favorites 1/i }).click();
  await expect(boilerClassesCard).toBeVisible();
});

test("mobile navigation is modal, closes with Escape, and returns focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const menuButton = page.getByRole("button", { name: "Open navigation" });
  await menuButton.click();
  const menu = page.getByRole("dialog", { name: "BoilerCompass" });
  await expect(menu).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close navigation" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(menuButton).toBeFocused();

  await menuButton.click();
  await menu.getByRole("link", { name: /Guides/ }).click();
  await expect(page).toHaveURL(/\/guides$/);
  await expect(
    page.getByRole("heading", { name: "Know the next question to ask." }),
  ).toBeVisible();
});

test("mobile filter sheet traps focus, applies filters, and closes cleanly", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/resources");

  const filterToggle = page.getByRole("button", { name: "More filters" });
  await expect(filterToggle).toHaveAttribute("aria-expanded", "false");
  await filterToggle.click();

  const sheet = page.getByRole("dialog", { name: "More filters" });
  const close = page
    .getByRole("button", { name: "Close resource filters" })
    .last();
  await expect(sheet).toBeVisible();
  await expect(close).toBeFocused();
  await sheet.getByLabel("Who runs it?").selectOption("purdue_affiliated");
  await sheet.getByRole("button", { name: /Show \d+ resources/ }).click();
  await expect(sheet).toBeHidden();
  await expect(filterToggle).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByRole("button", { name: /Purdue-affiliated/i }),
  ).toBeVisible();

  await filterToggle.click();
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(filterToggle).toBeFocused();
});

test("opens an external resource and navigates to a guide", async ({
  page,
  context,
}) => {
  await page.goto("/resources/boilerclasses");
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
});

test("reduced-motion mode removes large movement and decorative loops", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const heroAnimation = await page
    .getByRole("heading", { name: "Find the right Purdue resource." })
    .evaluate((element) => getComputedStyle(element).animationName);
  expect(heroAnimation).toBe("none");

  await page.keyboard.press("Control+K");
  const dialog = page.getByRole("dialog", { name: /Where do you need to go/i });
  await expect(dialog).toBeVisible();
  await expect
    .poll(() =>
      dialog.evaluate((element) => getComputedStyle(element).transform),
    )
    .toBe("none");
  const infiniteAnimations = await page.evaluate(
    () =>
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.effect?.getTiming().iterations ===
            Number.POSITIVE_INFINITY,
        ).length,
  );
  expect(infiniteAnimations).toBe(0);
});

test("primary routes have no horizontal overflow at required widths", async ({
  page,
}) => {
  const routes = [
    "/",
    "/resources",
    "/resources/boilerclasses",
    "/guides/advisor-meeting-prep",
    "/support",
    "/about",
  ];
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(
        dimensions.scrollWidth,
        `${route} overflows at ${width}px`,
      ).toBeLessThanOrEqual(dimensions.clientWidth);
    }
  }
});

test("primary routes stay free of console and same-origin HTTP errors", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  for (const route of [
    "/",
    "/resources",
    "/resources/boilerclasses",
    "/guides",
    "/guides/advisor-meeting-prep",
    "/support",
    "/about",
  ]) {
    await page.goto(route, { waitUntil: "networkidle" });
  }
  expect(errors).toEqual([]);
});

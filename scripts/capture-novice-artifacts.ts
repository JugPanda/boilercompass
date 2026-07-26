import { chromium, type BrowserContext, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:3124";
const output = "artifacts/novice-usability/after";

async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(450);
}

async function shot(page: Page, name: string, route: string) {
  await page.goto(`${baseURL}${route}`);
  await settle(page);
  await page.screenshot({ path: `${output}/${name}.png` });
}

async function capture() {
  await mkdir(output, { recursive: true });
  const browser = await chromium.launch();
  const contexts: BrowserContext[] = [];

  try {
    const desktop = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      colorScheme: "light",
      reducedMotion: "no-preference",
    });
    contexts.push(desktop);
    const desktopPage = await desktop.newPage();
    await shot(desktopPage, "home-desktop", "/");
    await shot(
      desktopPage,
      "resources-desktop",
      "/resources?q=pay%20my%20bill",
    );
    await shot(desktopPage, "source-help-desktop", "/resources");
    await shot(
      desktopPage,
      "boilerclasses-detail-desktop",
      "/resources/boilerclasses",
    );

    const mobile = await browser.newContext({
      viewport: { width: 375, height: 812 },
      colorScheme: "light",
      reducedMotion: "no-preference",
    });
    contexts.push(mobile);
    const mobilePage = await mobile.newPage();
    await shot(mobilePage, "home-mobile", "/");
    await shot(mobilePage, "resources-mobile", "/resources");
    await shot(
      mobilePage,
      "favorites-empty-mobile",
      "/resources?view=favorites",
    );
    await shot(mobilePage, "support-mobile", "/support");

    const reduced = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      colorScheme: "light",
      reducedMotion: "reduce",
    });
    contexts.push(reduced);
    const reducedPage = await reduced.newPage();
    await shot(reducedPage, "home-reduced-motion", "/");

    const noJavaScript = await browser.newContext({
      viewport: { width: 375, height: 812 },
      javaScriptEnabled: false,
    });
    contexts.push(noJavaScript);
    const noJsPage = await noJavaScript.newPage();
    await shot(noJsPage, "home-no-javascript-mobile", "/");
  } finally {
    await Promise.all(contexts.map((context) => context.close()));
    await browser.close();
  }

  console.log(`Captured 10 novice-usability screenshots in ${output}`);
}

capture().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

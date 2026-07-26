import { chromium, type Page } from "@playwright/test";
import { mkdir, rename } from "node:fs/promises";

const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:3124";
const output = "artifacts/ux-upgrade/after";
const recordings = "artifacts/ux-upgrade/recordings";

async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(450);
}

async function captureUpgradeArtifacts() {
  await Promise.all([
    mkdir(output, { recursive: true }),
    mkdir(recordings, { recursive: true }),
  ]);
  const browser = await chromium.launch();

  try {
    const desktop = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      colorScheme: "light",
      reducedMotion: "no-preference",
    });
    const desktopPage = await desktop.newPage();

    for (const [name, route] of [
      ["home-desktop", "/"],
      ["resources-desktop", "/resources"],
      ["resource-detail-desktop", "/resources/boilerclasses"],
      ["guide-desktop", "/guides/advisor-meeting-prep"],
    ] as const) {
      await desktopPage.goto(`${baseURL}${route}`);
      await settle(desktopPage);
      await desktopPage.screenshot({ path: `${output}/${name}.png` });
    }

    await desktopPage.goto(baseURL);
    await settle(desktopPage);
    await desktopPage.keyboard.press("Control+k");
    const launcherInput = desktopPage.getByRole("combobox", {
      name: "Search Purdue resources",
    });
    await launcherInput.fill("boilercourses");
    await desktopPage.waitForTimeout(350);
    await desktopPage.screenshot({ path: `${output}/search-desktop.png` });
    await desktop.close();

    const mobile = await browser.newContext({
      viewport: { width: 375, height: 812 },
      colorScheme: "light",
      reducedMotion: "no-preference",
    });
    const mobilePage = await mobile.newPage();

    for (const [name, route] of [
      ["home-mobile", "/"],
      ["resources-mobile", "/resources"],
      ["resource-detail-mobile", "/resources/boilerclasses"],
      ["guide-mobile", "/guides/advisor-meeting-prep"],
    ] as const) {
      await mobilePage.goto(`${baseURL}${route}`);
      await settle(mobilePage);
      await mobilePage.screenshot({ path: `${output}/${name}.png` });
    }

    await mobilePage.goto(baseURL);
    await settle(mobilePage);
    await mobilePage.getByRole("button", { name: "Open navigation" }).click();
    await mobilePage.waitForTimeout(280);
    await mobilePage.screenshot({ path: `${output}/mobile-menu.png` });

    await mobilePage.goto(`${baseURL}/resources`);
    await settle(mobilePage);
    await mobilePage.getByRole("button", { name: "More filters" }).click();
    await mobilePage.waitForTimeout(280);
    await mobilePage.screenshot({ path: `${output}/mobile-filters.png` });
    await mobile.close();

    const dark = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      colorScheme: "dark",
    });
    const darkPage = await dark.newPage();
    await darkPage.goto(baseURL);
    await settle(darkPage);
    await darkPage.screenshot({ path: `${output}/home-desktop-dark.png` });
    await dark.close();

    const reduced = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      colorScheme: "light",
      reducedMotion: "reduce",
    });
    const reducedPage = await reduced.newPage();
    await reducedPage.goto(baseURL);
    await settle(reducedPage);
    await reducedPage.keyboard.press("Control+k");
    await reducedPage.waitForTimeout(200);
    await reducedPage.screenshot({
      path: `${output}/search-reduced-motion.png`,
    });
    await reduced.close();

    for (const mode of ["normal", "reduced"] as const) {
      const videoContext = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        reducedMotion: mode === "reduced" ? "reduce" : "no-preference",
        recordVideo: { dir: recordings, size: { width: 1280, height: 720 } },
      });
      const page = await videoContext.newPage();
      await page.goto(baseURL);
      await settle(page);
      await page.keyboard.press("Control+k");
      await page
        .getByRole("combobox", { name: "Search Purdue resources" })
        .fill("academic help");
      await page.waitForTimeout(900);
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(650);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(700);
      const video = page.video();
      await videoContext.close();
      if (video) {
        await rename(await video.path(), `${recordings}/launcher-${mode}.webm`);
      }
    }
  } finally {
    await browser.close();
  }

  console.log(
    "Captured 12 after screenshots and 2 launcher recordings in artifacts/ux-upgrade",
  );
}

captureUpgradeArtifacts().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

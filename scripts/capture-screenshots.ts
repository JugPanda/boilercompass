import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:3119";
const pages = [
  ["home", "/"],
  ["resources", "/resources"],
  ["guide", "/guides/advisor-meeting-prep"],
] as const;

async function captureScreenshots() {
  await mkdir("artifacts/screenshots", { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const [device, viewport] of [
      ["desktop", { width: 1440, height: 1000 }],
      ["mobile", { width: 375, height: 812 }],
    ] as const) {
      const context = await browser.newContext({
        viewport,
        colorScheme: "light",
      });
      const page = await context.newPage();
      for (const [name, route] of pages) {
        await page.goto(`${baseURL}${route}`, { waitUntil: "networkidle" });
        await page.screenshot({
          path: `artifacts/screenshots/${name}-${device}.png`,
          fullPage: false,
        });
      }
      await context.close();
    }

    const darkContext = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      colorScheme: "dark",
    });
    const darkPage = await darkContext.newPage();
    await darkPage.goto(baseURL, { waitUntil: "networkidle" });
    await darkPage.screenshot({
      path: "artifacts/screenshots/home-desktop-dark.png",
      fullPage: false,
    });
    await darkContext.close();
  } finally {
    await browser.close();
  }
  console.log("Captured 7 screenshots in artifacts/screenshots");
}

captureScreenshots().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

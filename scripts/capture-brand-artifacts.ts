import { mkdir, writeFile } from "node:fs/promises";
import { chromium, type ConsoleMessage } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:3137";
const outputDir = "artifacts/branding/after";

const cases = [
  {
    name: "home-desktop-light",
    width: 1440,
    height: 1000,
    theme: "light" as const,
  },
  {
    name: "home-desktop-dark",
    width: 1440,
    height: 1000,
    theme: "dark" as const,
  },
  {
    name: "home-mobile-light",
    width: 375,
    height: 812,
    theme: "light" as const,
  },
  { name: "home-mobile-dark", width: 375, height: 812, theme: "dark" as const },
];

async function main() {
  await mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report: Array<Record<string, unknown>> = [];

  try {
    for (const testCase of cases) {
      const context = await browser.newContext({
        viewport: { width: testCase.width, height: testCase.height },
        colorScheme: testCase.theme,
        deviceScaleFactor: 1,
      });
      await context.addInitScript(
        (theme) => localStorage.setItem("theme", theme),
        testCase.theme,
      );
      const page = await context.newPage();
      const consoleErrors: string[] = [];
      const failedRequests: string[] = [];

      page.on("console", (message: ConsoleMessage) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => consoleErrors.push(error.message));
      page.on("requestfailed", (request) => {
        if (
          ["image", "font", "stylesheet", "script"].includes(
            request.resourceType(),
          )
        ) {
          failedRequests.push(
            `${request.url()} — ${request.failure()?.errorText ?? "failed"}`,
          );
        }
      });
      page.on("response", (response) => {
        if (response.status() >= 400)
          failedRequests.push(`${response.status()} ${response.url()}`);
      });

      await page.goto(baseURL, { waitUntil: "networkidle" });
      await page.addStyleTag({
        content:
          "*, *::before, *::after { animation: none !important; transition: none !important; }",
      });
      await page.waitForTimeout(100);
      await page.screenshot({
        path: `${outputDir}/${testCase.name}.png`,
        fullPage: true,
      });

      const metrics = await page.evaluate(() => {
        const brand = document.querySelector<HTMLElement>(".brand-link");
        const symbol = document.querySelector<SVGElement>(".brand-icon svg");
        const search = document.querySelector<HTMLElement>(
          ".global-search-wrap",
        );
        const brandRect = brand?.getBoundingClientRect();
        const symbolRect = symbol?.getBoundingClientRect();
        const searchRect = search?.getBoundingClientRect();
        const routeCard = document.querySelector<HTMLElement>(".route-card");
        const routeCardRect = routeCard?.getBoundingClientRect();
        const routeCardStyle = routeCard ? getComputedStyle(routeCard) : null;
        return {
          brandVisible: Boolean(
            brandRect && brandRect.width > 0 && brandRect.height > 0,
          ),
          symbolSize: symbolRect
            ? {
                width: Math.round(symbolRect.width),
                height: Math.round(symbolRect.height),
              }
            : null,
          searchBottom: searchRect ? Math.round(searchRect.bottom) : null,
          searchAboveFold: Boolean(
            searchRect && searchRect.top < window.innerHeight,
          ),
          routeCardReady: Boolean(
            routeCardRect &&
            routeCardRect.width > 0 &&
            routeCardRect.height > 0 &&
            Number(routeCardStyle?.opacity ?? 0) > 0.99,
          ),
          routeCardState: routeCardRect
            ? {
                width: Math.round(routeCardRect.width),
                height: Math.round(routeCardRect.height),
                opacity: routeCardStyle?.opacity,
                display: routeCardStyle?.display,
                transform: routeCardStyle?.transform,
              }
            : null,
          horizontalOverflow:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
          theme: document.documentElement.classList.contains("dark")
            ? "dark"
            : "light",
        };
      });

      report.push({
        case: testCase.name,
        viewport: `${testCase.width}x${testCase.height}`,
        ...metrics,
        consoleErrors,
        failedRequests,
      });

      if (
        !metrics.brandVisible ||
        (testCase.width > 980 && !metrics.routeCardReady) ||
        metrics.horizontalOverflow ||
        consoleErrors.length ||
        failedRequests.length
      ) {
        throw new Error(
          `${testCase.name} failed runtime visual checks: ${JSON.stringify(report.at(-1))}`,
        );
      }
      if (testCase.width <= 375 && !metrics.searchAboveFold) {
        throw new Error(`${testCase.name} pushed search below the mobile fold`);
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  await writeFile(
    `${outputDir}/runtime-report.json`,
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(JSON.stringify(report, null, 2));
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

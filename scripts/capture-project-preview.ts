import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, type Browser, type ConsoleMessage } from "@playwright/test";
import { format } from "prettier";
import sharp from "sharp";

const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:3137";
const viewport = { width: 1600, height: 1000 };
const scrollY = 115;
const publicDir = "public/brand";
const artifactDir = "artifacts/project-preview";
const previewPngPath = `${publicDir}/boilercompass-project-preview.png`;
const previewWebpPath = `${publicDir}/boilercompass-project-preview.webp`;

type Theme = "light" | "dark";

type Capture = {
  png: Buffer;
  metrics: Record<string, unknown>;
  consoleErrors: string[];
  failedRequests: string[];
};

async function capture(browser: Browser, theme: Theme): Promise<Capture> {
  const context = await browser.newContext({
    viewport,
    colorScheme: theme,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  await context.addInitScript(
    (selectedTheme) => localStorage.setItem("theme", selectedTheme),
    theme,
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
      ["document", "stylesheet", "script", "font", "image"].includes(
        request.resourceType(),
      )
    ) {
      failedRequests.push(
        `${request.resourceType()} ${request.url()} — ${request.failure()?.errorText ?? "failed"}`,
      );
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: `
      html { scroll-behavior: auto !important; scrollbar-width: none !important; }
      html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; }
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
    `,
  });
  await page.evaluate((targetY) => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    window.scrollTo(0, targetY);
  }, scrollY);
  await page.waitForTimeout(150);

  const metrics = (await page.evaluate(`(() => {
    const rect = (selector) => {
      const element = document.querySelector(selector);
      const bounds = element?.getBoundingClientRect();
      return bounds
        ? {
            top: Math.round(bounds.top),
            right: Math.round(bounds.right),
            bottom: Math.round(bounds.bottom),
            left: Math.round(bounds.left),
            width: Math.round(bounds.width),
            height: Math.round(bounds.height),
          }
        : null;
    };
    const visiblePixels = (element) => {
      const bounds = element.getBoundingClientRect();
      return Math.max(
        0,
        Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0),
      );
    };
    const cards = [...document.querySelectorAll(".featured-grid .resource-card")];

    return {
      title: document.title,
      heading: document.querySelector("h1")?.textContent?.trim() ?? null,
      scrollY: Math.round(window.scrollY),
      logo: rect(".brand-link"),
      headingRect: rect("h1"),
      search: rect(".global-search-wrap"),
      routeCard: rect(".route-card"),
      resourceCards: cards.map((card) => Math.round(visiblePixels(card))),
      horizontalOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth,
      theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
    };
  })()`)) as Record<string, unknown>;

  const png = await page.screenshot({
    type: "png",
    fullPage: false,
    animations: "disabled",
  });
  await context.close();

  return { png, metrics, consoleErrors, failedRequests };
}

function validateCapture(name: Theme, captureResult: Capture) {
  const metrics = captureResult.metrics as {
    heading?: string;
    logo?: unknown;
    search?: unknown;
    routeCard?: unknown;
    resourceCards?: number[];
    horizontalOverflow?: boolean;
    theme?: string;
  };
  const visibleResourceCards =
    metrics.resourceCards?.filter((pixels) => pixels >= 70).length ?? 0;

  if (
    metrics.heading !== "Find the right Purdue resource." ||
    !metrics.logo ||
    !metrics.search ||
    !metrics.routeCard ||
    visibleResourceCards < 3 ||
    metrics.horizontalOverflow ||
    metrics.theme !== name ||
    captureResult.consoleErrors.length ||
    captureResult.failedRequests.length
  ) {
    throw new Error(
      `${name} preview capture failed: ${JSON.stringify({
        ...captureResult,
        png: undefined,
        visibleResourceCards,
      })}`,
    );
  }
}

async function describeImage(buffer: Buffer) {
  const metadata = await sharp(buffer).metadata();
  return {
    format: metadata.format,
    width: metadata.width,
    height: metadata.height,
    hasAlpha: metadata.hasAlpha,
    bytes: buffer.byteLength,
    sha256: createHash("sha256").update(buffer).digest("hex"),
  };
}

async function main() {
  await mkdir(publicDir, { recursive: true });
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  let light: Capture;
  let dark: Capture;
  try {
    light = await capture(browser, "light");
    dark = await capture(browser, "dark");
  } finally {
    await browser.close();
  }

  validateCapture("light", light);
  validateCapture("dark", dark);

  const lightPng = await sharp(light.png)
    .flatten({ background: "#f7f3e9" })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
  const darkPng = await sharp(dark.png)
    .flatten({ background: "#11100e" })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
  const previewWebp = await sharp(lightPng)
    .webp({ quality: 86, effort: 6, smartSubsample: true })
    .toBuffer();
  const thumbnail = await sharp(lightPng)
    .resize({ width: 400, height: 250, fit: "fill" })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();

  await Promise.all([
    writeFile(previewPngPath, lightPng),
    writeFile(previewWebpPath, previewWebp),
    writeFile(`${artifactDir}/source-home-light.png`, lightPng),
    writeFile(`${artifactDir}/source-home-dark.png`, darkPng),
    writeFile(
      `${artifactDir}/boilercompass-project-preview-400.png`,
      thumbnail,
    ),
  ]);

  const report = {
    source: baseURL,
    viewport,
    scrollY,
    selectedTheme: "light",
    light: {
      metrics: light.metrics,
      consoleErrors: light.consoleErrors,
      failedRequests: light.failedRequests,
    },
    dark: {
      metrics: dark.metrics,
      consoleErrors: dark.consoleErrors,
      failedRequests: dark.failedRequests,
    },
    outputs: {
      png: await describeImage(lightPng),
      webp: await describeImage(previewWebp),
      thumbnail: await describeImage(thumbnail),
    },
  };
  await writeFile(
    `${artifactDir}/capture-report.json`,
    await format(JSON.stringify(report), { parser: "json" }),
  );
  console.log(JSON.stringify(report, null, 2));
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

import { defineConfig, devices } from "@playwright/test";

const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = externalBaseURL ?? "http://127.0.0.1:3118";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  retries: 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: externalBaseURL
    ? undefined
    : {
        command: "npm run dev -- --hostname 127.0.0.1 --port 3118",
        url: "http://127.0.0.1:3118",
        reuseExistingServer: false,
        timeout: 120_000,
      },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});

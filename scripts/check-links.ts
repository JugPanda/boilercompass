import { mkdir, writeFile } from "node:fs/promises";
import { resourceRegistry } from "../src/data/resources";

type Result = {
  id: string;
  name: string;
  url: string;
  status?: number;
  finalUrl?: string;
  redirected?: boolean;
  classification: "ok" | "auth_or_blocked" | "failed" | "inconclusive";
  note?: string;
};

async function check(
  resource: (typeof resourceRegistry)[number],
): Promise<Result> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    let response = await fetch(resource.url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent":
          "BoilerCompass-LinkChecker/1.0 (+https://purdueboilercompass.vercel.app)",
      },
    });
    if (response.status === 405 || response.status === 501)
      response = await fetch(resource.url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "user-agent":
            "BoilerCompass-LinkChecker/1.0 (+https://purdueboilercompass.vercel.app)",
          range: "bytes=0-1024",
        },
      });
    const status = response.status;
    const final = new URL(response.url);
    final.search = "";
    final.hash = "";
    const finalUrl = final.toString();
    const redirected = finalUrl !== resource.url;
    if (status >= 200 && status < 400)
      return {
        id: resource.id,
        name: resource.name,
        url: resource.url,
        status,
        finalUrl,
        redirected,
        classification: "ok",
      };
    if ([401, 403, 429].includes(status))
      return {
        id: resource.id,
        name: resource.name,
        url: resource.url,
        status,
        finalUrl,
        redirected,
        classification: "auth_or_blocked",
        note: "Authentication or automated-request blocking requires manual review.",
      };
    return {
      id: resource.id,
      name: resource.name,
      url: resource.url,
      status,
      finalUrl,
      redirected,
      classification: "failed",
    };
  } catch (error) {
    return {
      id: resource.id,
      name: resource.name,
      url: resource.url,
      classification: "inconclusive",
      note: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const results: Result[] = [];
  const queue = [...resourceRegistry];
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (queue.length) {
        const resource = queue.shift();
        if (resource) results.push(await check(resource));
      }
    }),
  );
  results.sort((a, b) => a.name.localeCompare(b.name));
  const summary = results.reduce<Record<string, number>>(
    (acc, item) => ({
      ...acc,
      [item.classification]: (acc[item.classification] ?? 0) + 1,
    }),
    {},
  );
  await mkdir("reports", { recursive: true });
  await writeFile(
    "reports/link-check.json",
    JSON.stringify(
      { checkedAt: new Date().toISOString(), summary, results },
      null,
      2,
    ),
  );
  console.log(
    `Checked ${results.length} resources: ${JSON.stringify(summary)}`,
  );
  for (const item of results.filter(
    (result) => result.classification !== "ok" || result.redirected,
  ))
    console.log(
      `${item.classification.toUpperCase()} ${item.name}: ${item.status ?? "ERR"} ${item.url}${item.finalUrl && item.finalUrl !== item.url ? ` -> ${item.finalUrl}` : ""}${item.note ? ` (${item.note})` : ""}`,
    );
  if (results.some((result) => result.classification === "failed"))
    process.exitCode = 1;
}

void main();

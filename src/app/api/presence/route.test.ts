import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { handlePresenceRequest } from "@/app/api/presence/route";

const SESSION_ID = "00a72822-57d5-4ce6-bdc0-62640bbf6687";

function request(
  body: string = JSON.stringify({ presenceId: SESSION_ID }),
  headers: Record<string, string> = {},
  method = "POST",
) {
  return new Request("https://boilercompass.com/api/presence", {
    method,
    headers: {
      "content-type": "application/json",
      origin: "https://boilercompass.com",
      "sec-fetch-site": "same-origin",
      "x-forwarded-for": "203.0.113.42",
      ...headers,
    },
    body: method === "GET" ? undefined : body,
  });
}

function service(options: { allowed?: boolean; activeNow?: number } = {}) {
  return {
    checkRateLimit: vi.fn(async () => ({
      allowed: options.allowed ?? true,
      retryAfterSeconds: 60,
    })),
    heartbeat: vi.fn(async () => ({
      activeNow: options.activeNow ?? 3,
      liveTrend: [],
    })),
    getSnapshot: vi.fn(async () => ({
      activeNow: options.activeNow ?? 3,
      liveTrend: [],
    })),
  };
}

describe("POST /api/presence", () => {
  it("accepts one strict same-origin UUID heartbeat and returns no identifiers", async () => {
    const presence = service();
    const response = await handlePresenceRequest(request(), presence);

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(await response.json()).toEqual({ activeNow: 3 });
    expect(presence.heartbeat).toHaveBeenCalledWith(SESSION_ID);
    expect(
      JSON.stringify(
        await handlePresenceRequest(request(), presence).then((value) =>
          value.json(),
        ),
      ),
    ).not.toContain(SESSION_ID);
  });

  it.each([
    ["method", request(undefined, {}, "GET"), 405],
    ["content type", request(undefined, { "content-type": "text/plain" }), 415],
    ["missing origin", request(undefined, { origin: "" }), 403],
    [
      "cross origin",
      request(undefined, { origin: "https://evil.example" }),
      403,
    ],
    [
      "cross-site fetch",
      request(undefined, { "sec-fetch-site": "cross-site" }),
      403,
    ],
    [
      "missing fetch metadata",
      request(undefined, { "sec-fetch-site": "" }),
      403,
    ],
  ])("rejects invalid %s", async (_label, incoming, status) => {
    const presence = service();
    const response = await handlePresenceRequest(incoming, presence);
    expect(response.status).toBe(status);
    expect(presence.heartbeat).not.toHaveBeenCalled();
  });

  it.each([
    ["invalid JSON", "{"],
    ["non-UUID", JSON.stringify({ presenceId: "browser-1" })],
    [
      "extra field",
      JSON.stringify({ presenceId: SESSION_ID, url: "/private" }),
    ],
    ["batch", JSON.stringify({ presenceId: [SESSION_ID] })],
  ])("rejects %s bodies", async (_label, body) => {
    const presence = service();
    const response = await handlePresenceRequest(request(body), presence);
    expect(response.status).toBe(400);
    expect(presence.heartbeat).not.toHaveBeenCalled();
  });

  it("rejects bodies larger than one kilobyte", async () => {
    const presence = service();
    const response = await handlePresenceRequest(
      request(
        JSON.stringify({ presenceId: SESSION_ID, padding: "x".repeat(1_100) }),
      ),
      presence,
    );
    expect(response.status).toBe(413);
    expect(presence.checkRateLimit).not.toHaveBeenCalled();
  });

  it("enforces the pseudonymous server rate limit", async () => {
    const presence = service({ allowed: false });
    const response = await handlePresenceRequest(request(), presence);

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(presence.heartbeat).not.toHaveBeenCalled();
  });

  it("fails safely when presence storage is unavailable", async () => {
    const presence = service();
    presence.heartbeat.mockRejectedValueOnce(
      new Error("contains private upstream detail"),
    );
    const response = await handlePresenceRequest(request(), presence);

    expect(response.status).toBe(503);
    const text = await response.text();
    expect(JSON.parse(text)).toEqual({ activeNow: null });
    expect(text).not.toContain("private upstream detail");
  });
});

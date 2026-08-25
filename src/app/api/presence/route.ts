import { z } from "zod";
import {
  createPresenceServiceFromEnv,
  type PresenceService,
} from "@/lib/analytics/presence.server";

const MAX_BODY_BYTES = 1_024;
const heartbeatSchema = z.object({ presenceId: z.uuid() }).strict();

const baseHeaders = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
} as const;

function response(body: unknown, status: number, extraHeaders?: HeadersInit) {
  return Response.json(body, {
    status,
    headers: { ...baseHeaders, ...extraHeaders },
  });
}

function requestAddress(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export async function handlePresenceRequest(
  request: Request,
  presence: PresenceService,
): Promise<Response> {
  if (request.method !== "POST") {
    return response({ activeNow: null }, 405, { Allow: "POST" });
  }

  const contentType = request.headers.get("content-type")?.split(";", 1)[0];
  if (contentType?.trim().toLowerCase() !== "application/json") {
    return response({ activeNow: null }, 415);
  }

  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (origin !== new URL(request.url).origin || fetchSite !== "same-origin") {
    return response({ activeNow: null }, 403);
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return response({ activeNow: null }, 413);
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return response({ activeNow: null }, 400);
  }
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    return response({ activeNow: null }, 413);
  }

  let parsed: z.infer<typeof heartbeatSchema>;
  try {
    const result = heartbeatSchema.safeParse(JSON.parse(text));
    if (!result.success) return response({ activeNow: null }, 400);
    parsed = result.data;
  } catch {
    return response({ activeNow: null }, 400);
  }

  try {
    const [ipLimit, sessionLimit] = await Promise.all([
      presence.checkRateLimit("heartbeat-ip", requestAddress(request)),
      presence.checkRateLimit("heartbeat-session", parsed.presenceId),
    ]);
    if (!ipLimit.allowed || !sessionLimit.allowed) {
      return response({ activeNow: null }, 429, {
        "Retry-After": String(
          Math.max(ipLimit.retryAfterSeconds, sessionLimit.retryAfterSeconds),
        ),
      });
    }
    const snapshot = await presence.heartbeat(parsed.presenceId);
    return response({ activeNow: snapshot.activeNow }, 200);
  } catch {
    return response({ activeNow: null }, 200);
  }
}

export async function POST(request: Request): Promise<Response> {
  const presence = createPresenceServiceFromEnv();
  if (!presence) {
    return response({ activeNow: null }, 200);
  }
  return handlePresenceRequest(request, presence);
}

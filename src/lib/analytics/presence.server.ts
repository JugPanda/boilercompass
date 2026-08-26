import "server-only";

import { createHash, createHmac } from "node:crypto";
import { Redis } from "@upstash/redis";
import { z } from "zod";

export const ACTIVE_WINDOW_MINUTES = 2;
const ACTIVE_WINDOW_MS = ACTIVE_WINDOW_MINUTES * 60_000;
const ACTIVE_KEY_TTL_SECONDS = 180;
const SAMPLE_RETENTION_MINUTES = 120;
const SAMPLE_KEY_TTL_SECONDS = 7_500;

export type LivePresencePoint = { timestamp: string; active: number };
export type PresenceSnapshot = {
  activeNow: number | null;
  liveTrend: LivePresencePoint[];
};

export type PresenceRedis = {
  recordHeartbeat(input: {
    activeKey: string;
    samplesKey: string;
    member: string;
    currentMs: number;
    activeCutoffMs: number;
    minuteMs: number;
    sampleCutoffMs: number;
    sampleTimestamp: string;
    activeTtlSeconds: number;
    sampleTtlSeconds: number;
  }): Promise<number>;
  incrementWithExpiry(key: string, ttlSeconds: number): Promise<number>;
  zremrangebyscore(
    key: string,
    min: number | string,
    max: number | string,
  ): Promise<number>;
  zcount(
    key: string,
    min: number | string,
    max: number | string,
  ): Promise<number>;
  zrange(
    key: string,
    min: number,
    max: number | string,
    options: { byScore: true },
  ): Promise<unknown[]>;
  expire(key: string, seconds: number): Promise<0 | 1>;
};

export type RateLimitScope =
  "heartbeat-ip" | "heartbeat-session" | "public-stats";
export type PresenceService = {
  heartbeat(presenceId: string): Promise<PresenceSnapshot>;
  getSnapshot(): Promise<PresenceSnapshot>;
  checkRateLimit(
    scope: RateLimitScope,
    address: string,
  ): Promise<{ allowed: boolean; retryAfterSeconds: number }>;
};

const sampleSchema = z
  .object({
    timestamp: z.iso.datetime(),
    active: z.number().int().nonnegative(),
  })
  .strict();

function safeSegment(value: string | undefined, fallback: string): string {
  const normalized = (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return normalized || fallback;
}

export function buildPresenceNamespace(
  env: Record<string, string | undefined> = process.env,
): string {
  const base = safeSegment(env.PUBLIC_STATS_NAMESPACE, "boilercompass");
  const deployment = safeSegment(env.VERCEL_ENV, "development");
  if (deployment !== "preview") return `${base}:${deployment}`;
  const refDigest = createHash("sha256")
    .update(env.VERCEL_GIT_COMMIT_REF || "unknown-preview")
    .digest("hex")
    .slice(0, 12);
  return `${base}:preview:${refDigest}`;
}

function hmac(secret: string, value: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function minuteStartMs(date: Date): number {
  return Math.floor(date.getTime() / 60_000) * 60_000;
}

export function createPresenceService({
  redis,
  namespace,
  secret,
  now = () => new Date(),
  rateLimits = {
    "heartbeat-ip": { limit: 600, windowSeconds: 60 },
    "heartbeat-session": { limit: 6, windowSeconds: 60 },
    "public-stats": { limit: 120, windowSeconds: 60 },
  },
}: {
  redis: PresenceRedis;
  namespace: string;
  secret: string;
  now?: () => Date;
  rateLimits?: Partial<
    Record<RateLimitScope, { limit: number; windowSeconds: number }>
  >;
}): PresenceService {
  if (!secret) throw new Error("Presence secret is required");
  const activeKey = `${namespace}:active`;
  const samplesKey = `${namespace}:samples`;

  async function pruneAndCount(currentMs: number): Promise<number> {
    const cutoff = currentMs - ACTIVE_WINDOW_MS;
    await redis.zremrangebyscore(activeKey, "-inf", cutoff - 1);
    const count = await redis.zcount(activeKey, cutoff, "+inf");
    await redis.expire(activeKey, ACTIVE_KEY_TTL_SECONDS);
    return count;
  }

  async function readSamples(currentMs: number): Promise<LivePresencePoint[]> {
    const currentMinute = minuteStartMs(new Date(currentMs));
    const cutoff = currentMinute - SAMPLE_RETENTION_MINUTES * 60_000;
    await redis.zremrangebyscore(samplesKey, "-inf", cutoff - 1);
    await redis.expire(samplesKey, SAMPLE_KEY_TTL_SECONDS);
    const members = await redis.zrange(samplesKey, cutoff, "+inf", {
      byScore: true,
    });
    return members.flatMap((member) => {
      try {
        const value = typeof member === "string" ? JSON.parse(member) : member;
        const parsed = sampleSchema.safeParse(value);
        return parsed.success ? [parsed.data] : [];
      } catch {
        return [];
      }
    });
  }

  return {
    async heartbeat(presenceId) {
      const current = now();
      const currentMs = current.getTime();
      const minuteMs = minuteStartMs(current);
      const activeNow = await redis.recordHeartbeat({
        activeKey,
        samplesKey,
        member: hmac(secret, `presence:${presenceId}`),
        currentMs,
        activeCutoffMs: currentMs - ACTIVE_WINDOW_MS,
        minuteMs,
        sampleCutoffMs: minuteMs - SAMPLE_RETENTION_MINUTES * 60_000,
        sampleTimestamp: new Date(minuteMs).toISOString(),
        activeTtlSeconds: ACTIVE_KEY_TTL_SECONDS,
        sampleTtlSeconds: SAMPLE_KEY_TTL_SECONDS,
      });
      const liveTrend = await readSamples(currentMs);
      return { activeNow, liveTrend };
    },

    async getSnapshot() {
      const currentMs = now().getTime();
      const [activeNow, liveTrend] = await Promise.all([
        pruneAndCount(currentMs),
        readSamples(currentMs),
      ]);
      return { activeNow, liveTrend };
    },

    async checkRateLimit(scope, address) {
      const config = rateLimits[scope];
      if (!config) return { allowed: true, retryAfterSeconds: 0 };
      const currentSeconds = Math.floor(now().getTime() / 1_000);
      const windowStart =
        Math.floor(currentSeconds / config.windowSeconds) *
        config.windowSeconds;
      const key = `${namespace}:rate:${scope}:${windowStart}:${hmac(
        secret,
        `rate:${address}`,
      )}`;
      const count = await redis.incrementWithExpiry(
        key,
        config.windowSeconds + 5,
      );
      return {
        allowed: count <= config.limit,
        retryAfterSeconds: Math.max(
          1,
          windowStart + config.windowSeconds - currentSeconds,
        ),
      };
    },
  };
}

const RECORD_HEARTBEAT_SCRIPT = `
redis.call("ZADD", KEYS[1], ARGV[1], ARGV[2])
redis.call("ZREMRANGEBYSCORE", KEYS[1], "-inf", tonumber(ARGV[3]) - 1)
local active = redis.call("ZCOUNT", KEYS[1], ARGV[3], "+inf")
redis.call("EXPIRE", KEYS[1], ARGV[4])
redis.call("ZREMRANGEBYSCORE", KEYS[2], ARGV[5], ARGV[5])
local sample = cjson.encode({ timestamp = ARGV[6], active = active })
redis.call("ZADD", KEYS[2], ARGV[5], sample)
redis.call("ZREMRANGEBYSCORE", KEYS[2], "-inf", tonumber(ARGV[7]) - 1)
redis.call("EXPIRE", KEYS[2], ARGV[8])
return active
`;

const INCREMENT_WITH_EXPIRY_SCRIPT = `
local count = redis.call("INCR", KEYS[1])
redis.call("EXPIRE", KEYS[1], ARGV[1])
return count
`;

function upstashAdapter(redis: Redis): PresenceRedis {
  type UpstashScore = number | "-inf" | "+inf" | `(${number}`;
  return {
    recordHeartbeat: (input) =>
      redis.eval<
        [number, string, number, number, number, string, number, number],
        number
      >(
        RECORD_HEARTBEAT_SCRIPT,
        [input.activeKey, input.samplesKey],
        [
          input.currentMs,
          input.member,
          input.activeCutoffMs,
          input.activeTtlSeconds,
          input.minuteMs,
          input.sampleTimestamp,
          input.sampleCutoffMs,
          input.sampleTtlSeconds,
        ],
      ),
    incrementWithExpiry: (key, ttlSeconds) =>
      redis.eval<[number], number>(
        INCREMENT_WITH_EXPIRY_SCRIPT,
        [key],
        [ttlSeconds],
      ),
    zremrangebyscore: (key, min, max) =>
      redis.zremrangebyscore(key, min as UpstashScore, max as UpstashScore),
    zcount: (key, min, max) =>
      redis.zcount(key, min as UpstashScore, max as UpstashScore),
    zrange: (key, min, max, options) =>
      redis.zrange<unknown[]>(key, min, max as number | "+inf", options),
    expire: (key, seconds) => redis.expire(key, seconds),
  };
}

export function createPresenceServiceFromEnv(
  env: Record<string, string | undefined> = process.env,
): PresenceService | null {
  const url = (env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL)?.trim();
  const token = (env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN)?.trim();
  const secret = env.BOILERCOMPASS_PRESENCE_SECRET?.trim();
  if (!url || !token || !secret) return null;
  const redis = new Redis({ url, token });
  return createPresenceService({
    redis: upstashAdapter(redis),
    namespace: buildPresenceNamespace(env),
    secret,
  });
}

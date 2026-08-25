import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildPresenceNamespace,
  createPresenceService,
  type PresenceRedis,
} from "@/lib/analytics/presence.server";

class FakePresenceRedis implements PresenceRedis {
  readonly sortedSets = new Map<string, Map<string, number>>();
  readonly counters = new Map<string, number>();
  readonly expirations = new Map<string, number>();

  async recordHeartbeat(
    input: Parameters<PresenceRedis["recordHeartbeat"]>[0],
  ) {
    const active =
      this.sortedSets.get(input.activeKey) ?? new Map<string, number>();
    active.set(input.member, input.currentMs);
    for (const [member, score] of active) {
      if (score < input.activeCutoffMs) active.delete(member);
    }
    this.sortedSets.set(input.activeKey, active);
    this.expirations.set(input.activeKey, input.activeTtlSeconds);

    const activeNow = [...active.values()].filter(
      (score) => score >= input.activeCutoffMs,
    ).length;
    const samples =
      this.sortedSets.get(input.samplesKey) ?? new Map<string, number>();
    for (const [member, score] of samples) {
      if (score === input.minuteMs || score < input.sampleCutoffMs) {
        samples.delete(member);
      }
    }
    samples.set(
      JSON.stringify({ timestamp: input.sampleTimestamp, active: activeNow }),
      input.minuteMs,
    );
    this.sortedSets.set(input.samplesKey, samples);
    this.expirations.set(input.samplesKey, input.sampleTtlSeconds);
    return activeNow;
  }

  async zremrangebyscore(
    key: string,
    min: number | string,
    max: number | string,
  ) {
    const set = this.sortedSets.get(key);
    if (!set) return 0;
    const lower = min === "-inf" ? -Infinity : Number(min);
    const upper = max === "+inf" ? Infinity : Number(max);
    let removed = 0;
    for (const [member, score] of set) {
      if (score >= lower && score <= upper) {
        set.delete(member);
        removed += 1;
      }
    }
    return removed;
  }

  async zcount(key: string, min: number | string, max: number | string) {
    const set = this.sortedSets.get(key);
    if (!set) return 0;
    const lower = min === "-inf" ? -Infinity : Number(min);
    const upper = max === "+inf" ? Infinity : Number(max);
    return [...set.values()].filter((score) => score >= lower && score <= upper)
      .length;
  }

  async zrange(
    key: string,
    min: number,
    max: number | string,
    options: { byScore: true },
  ) {
    expect(options).toEqual({ byScore: true });
    const upper = max === "+inf" ? Infinity : Number(max);
    return [...(this.sortedSets.get(key) ?? new Map()).entries()]
      .filter(([, score]) => score >= min && score <= upper)
      .sort((a, b) => a[1] - b[1])
      .map(([member]) => member);
  }

  async expire(key: string, seconds: number) {
    this.expirations.set(key, seconds);
    return 1 as const;
  }

  async incrementWithExpiry(key: string, ttlSeconds: number) {
    const next = (this.counters.get(key) ?? 0) + 1;
    this.counters.set(key, next);
    this.expirations.set(key, ttlSeconds);
    return next;
  }
}

const SESSION_A = "00a72822-57d5-4ce6-bdc0-62640bbf6687";
const SESSION_B = "b7f12380-702d-4337-b635-b4be62085289";

describe("anonymous presence storage", () => {
  it("deduplicates repeated heartbeats while counting distinct sessions", async () => {
    const redis = new FakePresenceRedis();
    let now = new Date("2026-08-25T12:00:00.000Z");
    const presence = createPresenceService({
      redis,
      namespace: "bc:production",
      secret: "test-presence-secret",
      now: () => now,
    });

    await expect(presence.heartbeat(SESSION_A)).resolves.toMatchObject({
      activeNow: 1,
    });
    now = new Date(now.getTime() + 30_000);
    await expect(presence.heartbeat(SESSION_A)).resolves.toMatchObject({
      activeNow: 1,
    });
    await expect(presence.heartbeat(SESSION_B)).resolves.toMatchObject({
      activeNow: 2,
    });

    const stored = JSON.stringify(
      [...redis.sortedSets.entries()].map(([key, set]) => [key, [...set]]),
    );
    expect(stored).not.toContain(SESSION_A);
    expect(stored).not.toContain(SESSION_B);
    expect(
      redis.expirations.get("bc:production:active"),
    ).toBeGreaterThanOrEqual(180);
  });

  it("expires sessions outside the two-minute active window", async () => {
    const redis = new FakePresenceRedis();
    let now = new Date("2026-08-25T12:00:00.000Z");
    const presence = createPresenceService({
      redis,
      namespace: "bc:production",
      secret: "test-presence-secret",
      now: () => now,
    });

    await presence.heartbeat(SESSION_A);
    now = new Date(now.getTime() + 120_001);

    await expect(presence.getSnapshot()).resolves.toMatchObject({
      activeNow: 0,
    });
  });

  it("keeps one minute sample and prunes samples older than two hours", async () => {
    const redis = new FakePresenceRedis();
    let now = new Date("2026-08-25T10:00:10.000Z");
    const presence = createPresenceService({
      redis,
      namespace: "bc:production",
      secret: "test-presence-secret",
      now: () => now,
    });

    await presence.heartbeat(SESSION_A);
    now = new Date("2026-08-25T10:00:40.000Z");
    await presence.heartbeat(SESSION_B);
    now = new Date("2026-08-25T12:00:11.000Z");
    await presence.heartbeat(SESSION_A);

    const snapshot = await presence.getSnapshot();
    expect(snapshot.liveTrend).toEqual([
      { timestamp: "2026-08-25T10:00:00.000Z", active: 2 },
      { timestamp: "2026-08-25T12:00:00.000Z", active: 1 },
    ]);
    expect(
      redis.expirations.get("bc:production:samples"),
    ).toBeGreaterThanOrEqual(7_200);
  });

  it("atomically keeps one sample under concurrent same-minute heartbeats", async () => {
    const redis = new FakePresenceRedis();
    const presence = createPresenceService({
      redis,
      namespace: "bc:production",
      secret: "test-presence-secret",
      now: () => new Date("2026-08-25T12:00:30.000Z"),
    });

    await Promise.all(
      Array.from({ length: 20 }, (_, index) =>
        presence.heartbeat(
          `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
        ),
      ),
    );

    expect(redis.sortedSets.get("bc:production:samples")).toHaveLength(1);
    await expect(presence.getSnapshot()).resolves.toMatchObject({
      activeNow: 20,
    });
  });

  it("does not perform partial writes when the atomic heartbeat fails", async () => {
    class FailingRedis extends FakePresenceRedis {
      override async recordHeartbeat(): Promise<number> {
        throw new Error("simulated atomic provider failure");
      }
    }
    const redis = new FailingRedis();
    const presence = createPresenceService({
      redis,
      namespace: "bc:production",
      secret: "test-presence-secret",
    });

    await expect(presence.heartbeat(SESSION_A)).rejects.toThrow(
      "simulated atomic provider failure",
    );
    expect(redis.sortedSets.size).toBe(0);
    expect(redis.expirations.size).toBe(0);
  });

  it("isolates production, preview branches, and custom base namespaces", () => {
    const production = buildPresenceNamespace({
      PUBLIC_STATS_NAMESPACE: "boilercompass",
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_REF: "main",
    });
    const previewA = buildPresenceNamespace({
      PUBLIC_STATS_NAMESPACE: "boilercompass",
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_REF: "feature/a",
    });
    const previewB = buildPresenceNamespace({
      PUBLIC_STATS_NAMESPACE: "boilercompass",
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_REF: "feature/b",
    });

    expect(new Set([production, previewA, previewB])).toHaveLength(3);
    expect(production).toContain("production");
    expect(previewA).toContain("preview");
    expect(previewA).not.toContain("feature/a");
  });

  it("HMAC-pseudonymizes and TTL-bounds rate-limit keys", async () => {
    const redis = new FakePresenceRedis();
    const presence = createPresenceService({
      redis,
      namespace: "bc:production",
      secret: "test-presence-secret",
      now: () => new Date("2026-08-25T12:00:00.000Z"),
      rateLimits: {
        "heartbeat-session": { limit: 2, windowSeconds: 60 },
      },
    });

    await expect(
      presence.checkRateLimit("heartbeat-session", SESSION_A),
    ).resolves.toMatchObject({ allowed: true });
    await expect(
      presence.checkRateLimit("heartbeat-session", SESSION_A),
    ).resolves.toMatchObject({ allowed: true });
    await expect(
      presence.checkRateLimit("heartbeat-session", SESSION_A),
    ).resolves.toMatchObject({ allowed: false });

    const keys = [...redis.counters.keys()];
    expect(keys).toHaveLength(1);
    expect(keys[0]).not.toContain(SESSION_A);
    expect(redis.expirations.get(keys[0])).toBeGreaterThanOrEqual(60);
  });

  it("allows many sessions behind one shared address while limiting one tab", async () => {
    const redis = new FakePresenceRedis();
    const presence = createPresenceService({
      redis,
      namespace: "bc:production",
      secret: "test-presence-secret",
      now: () => new Date("2026-08-25T12:00:00.000Z"),
    });

    for (let index = 0; index < 100; index += 1) {
      await expect(
        presence.checkRateLimit("heartbeat-ip", "203.0.113.42"),
      ).resolves.toMatchObject({ allowed: true });
    }
    for (let index = 0; index < 6; index += 1) {
      await expect(
        presence.checkRateLimit("heartbeat-session", SESSION_A),
      ).resolves.toMatchObject({ allowed: true });
    }
    await expect(
      presence.checkRateLimit("heartbeat-session", SESSION_A),
    ).resolves.toMatchObject({ allowed: false });
  });
});

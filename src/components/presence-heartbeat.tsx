"use client";

import { useEffect } from "react";

const SESSION_KEY = "boilercompass:presence-id";
const HEARTBEAT_INTERVAL_MS = 30_000;

function getPresenceId(): string {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, created);
  return created;
}

async function sendHeartbeat(presenceId: string): Promise<void> {
  try {
    await fetch("/api/presence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presenceId }),
      cache: "no-store",
      credentials: "same-origin",
      keepalive: true,
    });
  } catch {
    // Presence is best-effort and must never affect site behavior.
  }
}

export function PresenceHeartbeat() {
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    let presenceId: string;
    try {
      presenceId = getPresenceId();
    } catch {
      return;
    }

    const stop = () => {
      if (interval) clearInterval(interval);
      interval = undefined;
    };
    const start = () => {
      stop();
      if (document.visibilityState !== "visible") return;
      void sendHeartbeat(presenceId);
      interval = setInterval(() => {
        if (document.visibilityState === "visible") {
          void sendHeartbeat(presenceId);
        }
      }, HEARTBEAT_INTERVAL_MS);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    start();
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}

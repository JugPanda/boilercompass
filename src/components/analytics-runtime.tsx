"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { PresenceHeartbeat } from "@/components/presence-heartbeat";
import { sanitizeAnalyticsEvent } from "@/lib/analytics/events";

function sanitizePageview(event: BeforeSendEvent): BeforeSendEvent | null {
  return sanitizeAnalyticsEvent(event);
}

export function AnalyticsRuntime() {
  return (
    <>
      <PresenceHeartbeat />
      <Analytics beforeSend={sanitizePageview} />
    </>
  );
}

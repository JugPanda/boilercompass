"use client";

import type { ReactNode } from "react";
import type { AnalyticsEventProperties } from "@/lib/analytics/events";
import { trackAnalyticsEvent } from "@/lib/analytics/events";

export function FeedbackLink({
  ariaLabel,
  children,
  className,
  href,
  surface,
}: {
  ariaLabel: string;
  children: ReactNode;
  className: string;
  href: string;
  surface: AnalyticsEventProperties["feedback_submitted"]["surface"];
}) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      onClick={() => trackAnalyticsEvent("feedback_submitted", { surface })}
    >
      {children}
    </a>
  );
}

"use client";

import { ArrowUpRight } from "lucide-react";
import { saveRecent } from "@/components/resource-card";
import type { ResourceSourceType } from "@/data/resources";
import { trackAnalyticsEvent } from "@/lib/analytics/events";

export function ResourceLaunchButton({
  id,
  name,
  sourceType,
  url,
}: {
  id: string;
  name: string;
  sourceType: ResourceSourceType;
  url: string;
}) {
  function openResource() {
    saveRecent(id);
    trackAnalyticsEvent("resource_opened", { source_type: sourceType });
  }

  return (
    <a
      className="button button-primary"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={openResource}
      aria-label={`Open ${name} in a new tab`}
    >
      Open {name}
      <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  );
}

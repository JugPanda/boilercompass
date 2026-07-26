"use client";

import { ArrowUpRight } from "lucide-react";
import { saveRecent } from "@/components/resource-card";

export function ResourceLaunchButton({
  id,
  name,
  url,
}: {
  id: string;
  name: string;
  url: string;
}) {
  return (
    <a
      className="button button-primary"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => saveRecent(id)}
      aria-label={`Open ${name} in a new tab`}
    >
      Open {name}
      <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  );
}

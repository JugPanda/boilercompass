"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarCheck,
  Heart,
  LogIn,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SourceBadge } from "@/components/resource-badges";
import type { Resource } from "@/data/resources";
import { campusLabel } from "@/lib/resource-search";

const FAVORITES_KEY = "boilercompass:favorites";
const RECENTS_KEY = "boilercompass:recents";

function readIds(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function verifiedLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function saveRecent(id: string) {
  const next = [
    id,
    ...readIds(RECENTS_KEY).filter((item) => item !== id),
  ].slice(0, 8);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("boilercompass:storage"));
}

export function ResourceCard({
  resource,
  favorite: controlledFavorite,
}: {
  resource: Resource;
  favorite?: boolean;
}) {
  const [localFavorite, setLocalFavorite] = useState(false);
  const favorite = controlledFavorite ?? localFavorite;

  useEffect(() => {
    if (controlledFavorite !== undefined) return;
    const sync = () =>
      setLocalFavorite(readIds(FAVORITES_KEY).includes(resource.id));
    sync();
    window.addEventListener("boilercompass:storage", sync);
    return () => window.removeEventListener("boilercompass:storage", sync);
  }, [controlledFavorite, resource.id]);

  function toggleFavorite() {
    const ids = readIds(FAVORITES_KEY);
    const nextFavorite = !ids.includes(resource.id);
    const next = nextFavorite
      ? [...ids, resource.id]
      : ids.filter((id) => id !== resource.id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    if (controlledFavorite === undefined) setLocalFavorite(nextFavorite);
    window.dispatchEvent(new CustomEvent("boilercompass:storage"));
  }

  return (
    <article className="resource-card" data-resource-id={resource.id}>
      <div className="resource-card-top">
        <SourceBadge source={resource.sourceType} />
        <button
          className={`favorite-button ${favorite ? "is-favorite" : ""}`}
          type="button"
          onClick={toggleFavorite}
          aria-label={`${favorite ? "Remove" : "Add"} ${resource.name} ${favorite ? "from" : "to"} favorites`}
          aria-pressed={favorite}
        >
          <span aria-hidden="true">
            <Heart size={18} fill={favorite ? "currentColor" : "none"} />
          </span>
        </button>
      </div>
      <div>
        <p className="resource-category">{resource.category}</p>
        <h3>
          <Link href={`/resources/${resource.id}`} prefetch={false}>
            {resource.name}
          </Link>
        </h3>
        <p>{resource.shortDescription}</p>
      </div>
      <div className="resource-meta">
        <span>{resource.campuses.map(campusLabel).join(" · ")}</span>
        <span title={`Last checked ${resource.lastVerified}`}>
          <CalendarCheck size={14} /> Checked{" "}
          {verifiedLabel(resource.lastVerified)}
        </span>
        {resource.requiresLogin && (
          <span>
            <LogIn size={14} /> Login required
          </span>
        )}
        {resource.caution && (
          <span className="resource-caution">
            <AlertTriangle size={14} /> Check details
          </span>
        )}
      </div>
      <div className="resource-actions">
        <Link href={`/resources/${resource.id}`} prefetch={false}>
          Details
        </Link>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => saveRecent(resource.id)}
          aria-label={`Open ${resource.name} in a new tab`}
        >
          Open <ArrowUpRight size={16} />
        </a>
      </div>
    </article>
  );
}

export { FAVORITES_KEY, RECENTS_KEY, readIds };

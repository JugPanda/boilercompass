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
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function writeIds(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent("boilercompass:storage"));
    return true;
  } catch {
    return false;
  }
}

export function saveRecent(id: string) {
  try {
    const next = [
      id,
      ...readIds(RECENTS_KEY).filter((item) => item !== id),
    ].slice(0, 8);
    return writeIds(RECENTS_KEY, next);
  } catch {
    return false;
  }
}

export function ResourceCard({
  resource,
  favorite: controlledFavorite,
}: {
  resource: Resource;
  favorite?: boolean;
}) {
  const [localFavorite, setLocalFavorite] = useState(false);
  const [storageMessage, setStorageMessage] = useState("");
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
    if (!writeIds(FAVORITES_KEY, next)) {
      setStorageMessage(
        "Favorites are unavailable because this browser blocked local storage.",
      );
      return;
    }
    if (controlledFavorite === undefined) setLocalFavorite(nextFavorite);
    setStorageMessage(
      nextFavorite
        ? `${resource.name} saved in this browser.`
        : `${resource.name} removed from favorites.`,
    );
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
          aria-describedby={`favorite-help-${resource.id}`}
        >
          <span aria-hidden="true">
            <Heart size={18} fill={favorite ? "currentColor" : "none"} />
          </span>
        </button>
        <span id={`favorite-help-${resource.id}`} className="sr-only">
          Favorites stay in this browser. No account is needed.
        </span>
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
          <CalendarCheck size={14} /> Link verified{" "}
          {verifiedLabel(resource.lastVerified)}
        </span>
        {resource.requiresLogin && (
          <span>
            <LogIn size={14} /> Login required
          </span>
        )}
        {resource.caution && (
          <span className="resource-caution">
            <AlertTriangle size={14} aria-hidden="true" /> {resource.caution}
          </span>
        )}
      </div>
      <div className="resource-actions">
        <Link href={`/resources/${resource.id}`} prefetch={false}>
          About {resource.name}
        </Link>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => saveRecent(resource.id)}
          aria-label={`Open ${resource.name} in a new tab`}
        >
          Open {resource.name} <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
      <span className="sr-only" aria-live="polite">
        {storageMessage}
      </span>
    </article>
  );
}

export { FAVORITES_KEY, RECENTS_KEY, readIds };

"use client";

import Link from "next/link";
import { ArrowUpRight, Heart, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import type { Resource } from "@/data/resources";
import { SourceBadge } from "@/components/resource-badges";
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

export function saveRecent(id: string) {
  const next = [
    id,
    ...readIds(RECENTS_KEY).filter((item) => item !== id),
  ].slice(0, 8);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("boilercompass:storage"));
}

export function ResourceCard({ resource }: { resource: Resource }) {
  const [favorite, setFavorite] = useState(false);
  useEffect(() => {
    const sync = () =>
      setFavorite(readIds(FAVORITES_KEY).includes(resource.id));
    sync();
    window.addEventListener("boilercompass:storage", sync);
    return () => window.removeEventListener("boilercompass:storage", sync);
  }, [resource.id]);

  function toggleFavorite() {
    const ids = readIds(FAVORITES_KEY);
    const next = ids.includes(resource.id)
      ? ids.filter((id) => id !== resource.id)
      : [...ids, resource.id];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("boilercompass:storage"));
  }

  return (
    <article className="resource-card">
      <div className="resource-card-top">
        <SourceBadge source={resource.sourceType} />
        <button
          className={`favorite-button ${favorite ? "is-favorite" : ""}`}
          type="button"
          onClick={toggleFavorite}
          aria-label={`${favorite ? "Remove" : "Add"} ${resource.name} ${favorite ? "from" : "to"} favorites`}
          aria-pressed={favorite}
        >
          <Heart size={18} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div>
        <p className="resource-category">{resource.category}</p>
        <h3>
          <Link href={`/resources/${resource.id}`}>{resource.name}</Link>
        </h3>
        <p>{resource.shortDescription}</p>
      </div>
      <div className="resource-meta">
        <span>{campusLabel(resource.campuses[0])}</span>
        {resource.requiresLogin && (
          <span>
            <LogIn size={14} /> Login required
          </span>
        )}
      </div>
      <div className="resource-actions">
        <Link href={`/resources/${resource.id}`}>Details</Link>
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

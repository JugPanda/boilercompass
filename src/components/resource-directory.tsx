"use client";

import {
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  ResourceCard,
  FAVORITES_KEY,
  RECENTS_KEY,
  readIds,
} from "@/components/resource-card";
import {
  audiences,
  campuses,
  categories,
  resourceRegistry,
  sourceTypes,
} from "@/data/resources";
import type { Audience, Campus, ResourceSourceType } from "@/data/resources";
import {
  audienceLabel,
  campusLabel,
  filterResources,
  searchResources,
  sortResources,
  sourceLabel,
} from "@/lib/resource-search";

type View = "all" | "favorites" | "recent";

export function ResourceDirectory({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");
  const [source, setSource] = useState<ResourceSourceType | "all">("all");
  const [campus, setCampus] = useState<Campus | "all">("all");
  const [audience, setAudience] = useState<Audience | "all">("all");
  const [login, setLogin] = useState<"all" | "yes" | "no">("all");
  const [sort, setSort] = useState<"featured" | "alphabetical" | "verified">(
    "featured",
  );
  const [view, setView] = useState<View>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [stored, setStored] = useState({
    favorites: [] as string[],
    recent: [] as string[],
  });

  useEffect(() => {
    const sync = () =>
      setStored({
        favorites: readIds(FAVORITES_KEY),
        recent: readIds(RECENTS_KEY),
      });
    sync();
    window.addEventListener("boilercompass:storage", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("boilercompass:storage", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const results = useMemo(() => {
    let items = searchResources(resourceRegistry, query);
    if (view === "favorites")
      items = items.filter((item) => stored.favorites.includes(item.id));
    if (view === "recent")
      items = items
        .filter((item) => stored.recent.includes(item.id))
        .sort(
          (a, b) => stored.recent.indexOf(a.id) - stored.recent.indexOf(b.id),
        );
    items = filterResources(items, {
      category,
      sourceType: source,
      campus,
      audience,
      requiresLogin: login,
    });
    return view === "recent" ? items : sortResources(items, sort);
  }, [query, category, source, campus, audience, login, sort, view, stored]);

  const hasFilters = Boolean(
    query ||
    category !== "all" ||
    source !== "all" ||
    campus !== "all" ||
    audience !== "all" ||
    login !== "all",
  );
  function reset() {
    setQuery("");
    setCategory("all");
    setSource("all");
    setCampus("all");
    setAudience("all");
    setLogin("all");
    setSort("featured");
  }

  return (
    <div className="directory-layout">
      <aside className="filters" aria-label="Resource filters">
        <button
          className="filters-toggle"
          type="button"
          aria-expanded={filtersOpen}
          aria-controls="resource-filter-controls"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <span>
            <SlidersHorizontal size={17} aria-hidden="true" />
            Filter resources
          </span>
          <ChevronDown size={18} aria-hidden="true" />
        </button>
        <div
          className="filters-body"
          id="resource-filter-controls"
          data-open={filtersOpen}
        >
          <div className="filter-heading">
            <strong>Filter resources</strong>
            {hasFilters && (
              <button type="button" onClick={reset}>
                <RotateCcw size={14} /> Reset
              </button>
            )}
          </div>
          <label>
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Source type
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as typeof source)}
            >
              <option value="all">All sources</option>
              {sourceTypes.map((item) => (
                <option key={item} value={item}>
                  {sourceLabel(item)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Campus scope
            <select
              value={campus}
              onChange={(e) => setCampus(e.target.value as typeof campus)}
            >
              <option value="all">All campus scopes</option>
              {campuses.map((item) => (
                <option key={item} value={item}>
                  {campusLabel(item)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Audience
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as typeof audience)}
            >
              <option value="all">All audiences</option>
              {audiences.map((item) => (
                <option key={item} value={item}>
                  {audienceLabel(item)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Login requirement
            <select
              value={login}
              onChange={(e) => setLogin(e.target.value as typeof login)}
            >
              <option value="all">Any</option>
              <option value="yes">Login required</option>
              <option value="no">No login required</option>
            </select>
          </label>
        </div>
      </aside>
      <section className="directory-results" aria-labelledby="results-title">
        <div className="directory-toolbar">
          <div className="directory-search">
            <Search size={18} aria-hidden="true" />
            <label className="sr-only" htmlFor="resource-search">
              Search resources
            </label>
            <input
              id="resource-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search names, tags, aliases, or needs"
            />
          </div>
          <label className="sort-control">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              disabled={view === "recent"}
            >
              <option value="featured">Featured first</option>
              <option value="alphabetical">A–Z</option>
              <option value="verified">Recently verified</option>
            </select>
          </label>
        </div>
        <div className="view-tabs" role="group" aria-label="Resource views">
          <button
            type="button"
            className={view === "all" ? "active" : ""}
            onClick={() => setView("all")}
          >
            All
          </button>
          <button
            type="button"
            className={view === "favorites" ? "active" : ""}
            onClick={() => setView("favorites")}
          >
            Favorites <span>{stored.favorites.length}</span>
          </button>
          <button
            type="button"
            className={view === "recent" ? "active" : ""}
            onClick={() => setView("recent")}
          >
            Recently opened <span>{stored.recent.length}</span>
          </button>
        </div>
        <div className="results-heading">
          <div>
            <p className="eyebrow">Curated registry</p>
            <h2 id="results-title">
              {results.length} {results.length === 1 ? "resource" : "resources"}
            </h2>
          </div>
          <p aria-live="polite">
            {query
              ? `Results for “${query}”`
              : "Search understands shortcuts like bs, mp, bc, and clubs."}
          </p>
        </div>
        {results.length ? (
          <div className="resource-grid">
            {results.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span>0</span>
            <h3>No resources match</h3>
            <p>Try a broader search or remove one of the filters.</p>
            <button
              className="button button-secondary"
              type="button"
              onClick={reset}
            >
              Reset filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

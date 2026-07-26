"use client";

import {
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FAVORITES_KEY,
  RECENTS_KEY,
  readIds,
  ResourceCard,
} from "@/components/resource-card";
import { SourceLabelHelp } from "@/components/source-label-help";
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

type ActiveFilter = {
  key: string;
  label: string;
};

function allowedValue<T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T,
) {
  return value && allowed.includes(value as T) ? (value as T) : fallback;
}

export function ResourceDirectory({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") ?? initialQuery;
  const query = queryParam;
  const category = allowedValue(
    searchParams.get("category"),
    categories,
    "all",
  );
  const source = allowedValue(
    searchParams.get("source"),
    sourceTypes,
    "all",
  ) as ResourceSourceType | "all";
  const campus = allowedValue(searchParams.get("campus"), campuses, "all") as
    Campus | "all";
  const audience = allowedValue(
    searchParams.get("audience"),
    audiences,
    "all",
  ) as Audience | "all";
  const login = allowedValue(
    searchParams.get("login"),
    ["yes", "no"] as const,
    "all",
  ) as "all" | "yes" | "no";
  const sort = allowedValue(
    searchParams.get("sort"),
    ["featured", "alphabetical", "verified"] as const,
    "relevance",
  ) as "relevance" | "featured" | "alphabetical" | "verified";
  const view = allowedValue(
    searchParams.get("view"),
    ["favorites", "recent"] as const,
    "all",
  ) as View;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(18);
  const [announcement, setAnnouncement] = useState("");
  const [stored, setStored] = useState({
    favorites: [] as string[],
    recent: [] as string[],
  });
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterBodyRef = useRef<HTMLDivElement>(null);
  const pendingParamsRef = useRef(new URLSearchParams(searchParams.toString()));

  useEffect(() => {
    pendingParamsRef.current = new URLSearchParams(searchParams.toString());
  }, [searchParams]);

  function setUrlValue(key: string, value: string, replace = false) {
    const next = new URLSearchParams(pendingParamsRef.current.toString());
    if (!value || value === "all" || value === "relevance") next.delete(key);
    else next.set(key, value);
    pendingParamsRef.current = next;
    const href = next.size ? `${pathname}?${next.toString()}` : pathname;
    if (replace) router.replace(href, { scroll: false });
    else router.push(href, { scroll: false });
  }

  function updateQuery(value: string) {
    setUrlValue("q", value, true);
  }

  function openSavedView(nextView: Exclude<View, "all">) {
    const next = new URLSearchParams();
    next.set("view", nextView);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

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
    if (view === "favorites") {
      items = items.filter((item) => stored.favorites.includes(item.id));
    }
    if (view === "recent") {
      items = items
        .filter((item) => stored.recent.includes(item.id))
        .sort(
          (a, b) => stored.recent.indexOf(a.id) - stored.recent.indexOf(b.id),
        );
    }
    items = filterResources(items, {
      category,
      sourceType: source,
      campus,
      audience,
      requiresLogin: login,
    });
    if (view === "recent") return items;
    if (query && sort === "relevance") return items;
    return sortResources(items, sort === "relevance" ? "featured" : sort);
  }, [query, category, source, campus, audience, login, sort, view, stored]);

  const hasFilters = Boolean(
    query ||
    category !== "all" ||
    source !== "all" ||
    campus !== "all" ||
    audience !== "all" ||
    login !== "all",
  );
  const visibleResults =
    hasFilters || view !== "all" ? results : results.slice(0, visibleCount);

  const activeFilters: ActiveFilter[] = [];
  if (query) {
    activeFilters.push({
      key: "query",
      label: `Search: ${query}`,
    });
  }
  if (category !== "all") {
    activeFilters.push({
      key: "category",
      label: category,
    });
  }
  if (source !== "all") {
    activeFilters.push({
      key: "source",
      label: sourceLabel(source),
    });
  }
  if (campus !== "all") {
    activeFilters.push({
      key: "campus",
      label: campusLabel(campus),
    });
  }
  if (audience !== "all") {
    activeFilters.push({
      key: "audience",
      label: audienceLabel(audience),
    });
  }
  if (login !== "all") {
    activeFilters.push({
      key: "login",
      label: login === "yes" ? "Login required" : "No login required",
    });
  }

  function reset() {
    router.push(pathname, { scroll: false });
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnnouncement(
        `${results.length} ${results.length === 1 ? "resource" : "resources"} shown`,
      );
    }, 350);
    return () => window.clearTimeout(timer);
  }, [results.length, query, category, source, campus, audience, login, view]);

  useEffect(() => {
    if (!filtersOpen) return;
    const filterButton = filterButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      filterBodyRef.current
        ?.querySelector<HTMLButtonElement>(".filter-sheet-close")
        ?.focus();
    }, 80);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setFiltersOpen(false);
        return;
      }
      if (event.key !== "Tab" || !filterBodyRef.current) return;
      const focusable = Array.from(
        filterBodyRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])",
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      filterButton?.focus();
    };
  }, [filtersOpen]);

  return (
    <div className="directory-layout">
      <aside
        className="filters"
        aria-label="Resource filters"
        data-open={filtersOpen}
      >
        <button
          ref={filterButtonRef}
          className="filters-toggle"
          type="button"
          aria-expanded={filtersOpen}
          aria-controls="resource-filter-controls"
          onClick={() => setFiltersOpen(true)}
        >
          <span>
            <SlidersHorizontal size={17} aria-hidden="true" />
            More filters
            {activeFilters.length > 0 && (
              <small aria-label={`${activeFilters.length} active filters`}>
                {activeFilters.length}
              </small>
            )}
          </span>
          <ChevronDown size={18} aria-hidden="true" />
        </button>
        {filtersOpen && (
          <button
            className="filter-backdrop"
            type="button"
            aria-label="Close resource filters"
            tabIndex={-1}
            onClick={() => setFiltersOpen(false)}
          />
        )}
        <div
          ref={filterBodyRef}
          className="filters-body"
          id="resource-filter-controls"
          data-open={filtersOpen}
          role={filtersOpen ? "dialog" : undefined}
          aria-modal={filtersOpen ? "true" : undefined}
          aria-labelledby="filter-panel-title"
        >
          <div className="filter-heading">
            <div>
              <span className="filter-sheet-kicker">Optional controls</span>
              <strong id="filter-panel-title">More filters</strong>
            </div>
            <div>
              {hasFilters && (
                <button type="button" onClick={reset}>
                  <RotateCcw size={14} /> Reset
                </button>
              )}
              <button
                className="filter-sheet-close icon-button"
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close resource filters"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <label>
            Category
            <select
              value={category}
              onChange={(event) => setUrlValue("category", event.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Who runs it?
            <select
              value={source}
              onChange={(event) => setUrlValue("source", event.target.value)}
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
            Campus/location
            <select
              value={campus}
              onChange={(event) => setUrlValue("campus", event.target.value)}
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
              onChange={(event) => setUrlValue("audience", event.target.value)}
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
              onChange={(event) => setUrlValue("login", event.target.value)}
            >
              <option value="all">Any</option>
              <option value="yes">Login required</option>
              <option value="no">No login required</option>
            </select>
          </label>
          <button
            className="filter-apply button button-primary"
            type="button"
            onClick={() => setFiltersOpen(false)}
          >
            Show {results.length}{" "}
            {results.length === 1 ? "resource" : "resources"}
          </button>
        </div>
      </aside>

      <section className="directory-results" aria-labelledby="results-title">
        <div className="directory-toolbar">
          <div className="directory-search">
            <Search size={18} aria-hidden="true" />
            <label className="sr-only" htmlFor="resource-search">
              Search within resources
            </label>
            <input
              id="resource-search"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Try “tutoring,” “pay my bill,” or “CODO”"
            />
          </div>
          <label className="sort-control">
            Sort
            <select
              value={sort}
              onChange={(event) => setUrlValue("sort", event.target.value)}
              disabled={view === "recent"}
            >
              <option value="relevance">Best match</option>
              <option value="featured">Featured first</option>
              <option value="alphabetical">A–Z</option>
              <option value="verified">Recently verified</option>
            </select>
          </label>
        </div>

        {view === "all" && (
          <>
            <div className="common-category-chips" aria-label="Common tasks">
              <span>Common tasks:</span>
              {[
                "Classes & academics",
                "Health, support & safety",
                "Money & administration",
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={category === item}
                  onClick={() =>
                    setUrlValue("category", category === item ? "all" : item)
                  }
                >
                  {item}
                </button>
              ))}
            </div>
            <SourceLabelHelp />
          </>
        )}

        <div className="view-tabs" role="group" aria-label="Resource views">
          <button
            type="button"
            className={view === "all" ? "active" : ""}
            aria-pressed={view === "all"}
            onClick={() => setUrlValue("view", "all")}
          >
            All
          </button>
          <button
            type="button"
            className={view === "favorites" ? "active" : ""}
            aria-pressed={view === "favorites"}
            onClick={() => openSavedView("favorites")}
          >
            Favorites <span>{stored.favorites.length}</span>
          </button>
          <button
            type="button"
            className={view === "recent" ? "active" : ""}
            aria-pressed={view === "recent"}
            onClick={() => openSavedView("recent")}
          >
            Recently opened <span>{stored.recent.length}</span>
          </button>
        </div>

        {activeFilters.length > 0 && (
          <div
            className="active-filters"
            aria-label="Active search and filters"
          >
            <span>Active:</span>
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() =>
                  filter.key === "query"
                    ? updateQuery("")
                    : setUrlValue(filter.key, "all")
                }
              >
                {filter.label} <X size={13} aria-hidden="true" />
                <span className="sr-only">Remove filter</span>
              </button>
            ))}
            <button className="clear-all-filters" type="button" onClick={reset}>
              Clear all
            </button>
          </div>
        )}

        <div className="results-heading">
          <div>
            <p className="eyebrow">Purdue resource directory</p>
            <h2 id="results-title">
              {results.length}{" "}
              {view === "favorites"
                ? results.length === 1
                  ? "favorite"
                  : "favorites"
                : view === "recent"
                  ? results.length === 1
                    ? "recently opened resource"
                    : "recently opened resources"
                  : results.length === 1
                    ? "resource"
                    : "resources"}
            </h2>
          </div>
          <p>
            {view === "favorites"
              ? "Saved only in this browser—no account or cloud sync."
              : view === "recent"
                ? "Opened on this device and stored only in this browser."
                : query
                  ? `Results for “${query}”`
                  : "Search by a task or office name—you do not need to know an acronym."}
          </p>
          <span className="sr-only" aria-live="polite" aria-atomic="true">
            {announcement}
          </span>
        </div>

        {results.length ? (
          <>
            <div className="resource-grid" data-testid="resource-results">
              {visibleResults.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  favorite={stored.favorites.includes(resource.id)}
                />
              ))}
            </div>
            {visibleResults.length < results.length && (
              <div className="show-more-resources">
                <p>
                  Showing {visibleResults.length} of {results.length} resources.
                </p>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => setVisibleCount(results.length)}
                >
                  Show all {results.length} resources
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <span aria-hidden="true">0</span>
            <h3>
              {view === "favorites"
                ? "No favorites yet"
                : view === "recent"
                  ? "Nothing opened yet"
                  : `No resources match${query ? ` “${query}”` : ""}`}
            </h3>
            <p>
              {view === "favorites"
                ? "Save resources for quicker access on this device. No account is needed, and favorites stay in this browser."
                : view === "recent"
                  ? "Resources you open will appear here for quicker access on this device. This history stays in your browser."
                  : "Try a plain-language task, remove a filter, or browse every resource."}
            </p>
            <button
              className="button button-secondary"
              type="button"
              onClick={reset}
            >
              Browse all resources
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

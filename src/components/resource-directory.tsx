"use client";

import {
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FAVORITES_KEY,
  RECENTS_KEY,
  readIds,
  ResourceCard,
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

type ActiveFilter = {
  key: string;
  label: string;
  clear: () => void;
};

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
  const [visibleCount, setVisibleCount] = useState(18);
  const [announcement, setAnnouncement] = useState("");
  const [stored, setStored] = useState({
    favorites: [] as string[],
    recent: [] as string[],
  });
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterBodyRef = useRef<HTMLDivElement>(null);

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
  const visibleResults =
    hasFilters || view !== "all" ? results : results.slice(0, visibleCount);

  const activeFilters: ActiveFilter[] = [];
  if (query) {
    activeFilters.push({
      key: "query",
      label: `Search: ${query}`,
      clear: () => setQuery(""),
    });
  }
  if (category !== "all") {
    activeFilters.push({
      key: "category",
      label: category,
      clear: () => setCategory("all"),
    });
  }
  if (source !== "all") {
    activeFilters.push({
      key: "source",
      label: sourceLabel(source),
      clear: () => setSource("all"),
    });
  }
  if (campus !== "all") {
    activeFilters.push({
      key: "campus",
      label: campusLabel(campus),
      clear: () => setCampus("all"),
    });
  }
  if (audience !== "all") {
    activeFilters.push({
      key: "audience",
      label: audienceLabel(audience),
      clear: () => setAudience("all"),
    });
  }
  if (login !== "all") {
    activeFilters.push({
      key: "login",
      label: login === "yes" ? "Login required" : "No login required",
      clear: () => setLogin("all"),
    });
  }

  function reset() {
    setQuery("");
    setCategory("all");
    setSource("all");
    setCampus("all");
    setAudience("all");
    setLogin("all");
    setSort("featured");
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
            Filter resources
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
              <span className="filter-sheet-kicker">Refine your route</span>
              <strong id="filter-panel-title">Filter resources</strong>
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
              onChange={(event) => setCategory(event.target.value)}
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
              onChange={(event) =>
                setSource(event.target.value as typeof source)
              }
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
              onChange={(event) =>
                setCampus(event.target.value as typeof campus)
              }
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
              onChange={(event) =>
                setAudience(event.target.value as typeof audience)
              }
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
              onChange={(event) => setLogin(event.target.value as typeof login)}
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
              Search resources
            </label>
            <input
              id="resource-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search names, tags, aliases, or needs"
            />
          </div>
          <label className="sort-control">
            Sort
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as typeof sort)}
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
            aria-pressed={view === "all"}
            onClick={() => setView("all")}
          >
            All
          </button>
          <button
            type="button"
            className={view === "favorites" ? "active" : ""}
            aria-pressed={view === "favorites"}
            onClick={() => setView("favorites")}
          >
            Favorites <span>{stored.favorites.length}</span>
          </button>
          <button
            type="button"
            className={view === "recent" ? "active" : ""}
            aria-pressed={view === "recent"}
            onClick={() => setView("recent")}
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
              <button key={filter.key} type="button" onClick={filter.clear}>
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
            <p className="eyebrow">Curated registry</p>
            <h2 id="results-title">
              {results.length} {results.length === 1 ? "resource" : "resources"}
            </h2>
          </div>
          <p>
            {query
              ? `Results for “${query}”`
              : "Search understands shortcuts like bs, mp, bc, and clubs."}
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
            <span>0</span>
            <h3>No resources match</h3>
            <p>
              Try a broader task, search an alias, or remove one of the active
              filters.
            </p>
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

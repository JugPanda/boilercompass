"use client";

import {
  SearchLauncherTrigger,
  useSearchLauncher,
} from "@/components/search-launcher";

const suggestedSearches = [
  ["Plan classes", "course planning"],
  ["Find tutoring", "find tutoring"],
  ["Pay my bill", "pay my bill"],
] as const;

export function GlobalSearch({ compact = false }: { compact?: boolean }) {
  const { openSearch } = useSearchLauncher();

  return (
    <div
      className={
        compact ? "global-search-wrap is-compact" : "global-search-wrap"
      }
    >
      {!compact && (
        <p className="global-search-label">What do you need help with?</p>
      )}
      <SearchLauncherTrigger
        className="global-search js-only"
        label={
          compact
            ? "Search resources"
            : "Try “plan classes,” “find tutoring,” or “pay my bill”"
        }
        showShortcut
      />
      <noscript>
        <style>{`.js-only { display: none !important; }`}</style>
        <form className="noscript-search" action="/resources" method="get">
          <label
            htmlFor={
              compact ? "noscript-search-compact" : "noscript-search-home"
            }
          >
            Search Purdue resources
          </label>
          <div>
            <input
              id={compact ? "noscript-search-compact" : "noscript-search-home"}
              name="q"
              placeholder="Try tutoring or pay my bill"
            />
            <button className="button button-primary" type="submit">
              Search
            </button>
          </div>
        </form>
      </noscript>
      {!compact && (
        <div
          className="suggested-searches js-only"
          aria-label="Suggested searches"
        >
          <span>Try:</span>
          {suggestedSearches.map(([label, query]) => (
            <button key={query} type="button" onClick={() => openSearch(query)}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

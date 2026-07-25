"use client";

import {
  SearchLauncherTrigger,
  useSearchLauncher,
} from "@/components/search-launcher";

const suggestedSearches = [
  ["Plan classes", "course planning"],
  ["Academic help", "academic help"],
  ["Health & support", "health support"],
] as const;

export function GlobalSearch({ compact = false }: { compact?: boolean }) {
  const { openSearch } = useSearchLauncher();

  return (
    <div
      className={
        compact ? "global-search-wrap is-compact" : "global-search-wrap"
      }
    >
      <SearchLauncherTrigger
        className="global-search"
        label="Search by task, tool, or shortcut"
        showShortcut
      />
      {!compact && (
        <div className="suggested-searches" aria-label="Suggested searches">
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

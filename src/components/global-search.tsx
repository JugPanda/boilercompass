"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

export function GlobalSearch({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.matches(
        "input, textarea, select, [contenteditable='true']",
      );
      if (
        (event.key === "/" && !typing) ||
        ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    router.push(
      `/resources${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`,
    );
  }

  return (
    <form
      className={`global-search ${compact ? "global-search-compact" : ""}`}
      onSubmit={submit}
      role="search"
    >
      <Search aria-hidden="true" />
      <label
        className="sr-only"
        htmlFor={compact ? "compact-global-search" : "global-search"}
      >
        Search Purdue resources
      </label>
      <input
        id={compact ? "compact-global-search" : "global-search"}
        ref={inputRef}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by task, tool, or shortcut"
        autoComplete="off"
      />
      <kbd aria-hidden="true">/</kbd>
      <button type="submit">Search</button>
    </form>
  );
}

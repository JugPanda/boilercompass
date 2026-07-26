"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Command, CornerDownLeft, Search, X } from "lucide-react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent as ReactKeyboardEvent,
  type SetStateAction,
} from "react";
import { resourceRegistry } from "@/data/resources";
import {
  campusLabel,
  searchResources,
  sourceLabel,
} from "@/lib/resource-search";
import { motionDistances, motionDurations, motionEasings } from "@/lib/motion";

const suggestions = [
  "course planning",
  "academic help",
  "mental health",
  "career jobs",
];

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function SearchLauncherDialog({
  open,
  query,
  setQuery,
  close,
}: {
  open: boolean;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  close: () => void;
}) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const results = useMemo(
    () =>
      query.trim() ? searchResources(resourceRegistry, query).slice(0, 8) : [],
    [query],
  );

  const choose = useCallback(
    (id: string) => {
      close();
      router.push(`/resources/${id}`);
    },
    [close, router],
  );

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 40);

    const handleDialogKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
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

    window.addEventListener("keydown", handleDialogKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleDialogKey);
    };
  }, [close, open]);

  function updateQuery(value: string) {
    setQuery(value);
    setActiveIndex(0);
  }

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(results[activeIndex].id);
    }
  }

  const movement = reducedMotion ? 0 : motionDistances.medium;
  const panelTransition = {
    duration: reducedMotion ? motionDurations.fast : motionDurations.deliberate,
    ease: motionEasings.emphasized,
  };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && (
          <motion.div
            className="search-overlay"
            data-testid="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionDurations.fast }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <motion.div
              ref={dialogRef}
              className="search-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="search-dialog-title"
              initial={{
                opacity: 0,
                y: -movement,
                scale: reducedMotion ? 1 : 0.985,
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: -movement,
                scale: reducedMotion ? 1 : 0.99,
              }}
              transition={panelTransition}
            >
              <div className="search-dialog-head">
                <div>
                  <p className="eyebrow">Quick launcher</p>
                  <h2 id="search-dialog-title">Where do you need to go?</h2>
                </div>
                <button
                  className="icon-button search-close"
                  type="button"
                  onClick={close}
                  aria-label="Close resource search"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="launcher-input-wrap">
                <Search size={21} aria-hidden="true" />
                <label className="sr-only" htmlFor="launcher-search-input">
                  Search Purdue resources
                </label>
                <input
                  id="launcher-search-input"
                  ref={inputRef}
                  value={query}
                  onChange={(event) => updateQuery(event.target.value)}
                  onKeyDown={onInputKeyDown}
                  placeholder="Try BoilerCourses, tutoring, parking…"
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={results.length > 0}
                  aria-controls="launcher-results"
                  aria-activedescendant={
                    results.length
                      ? `launcher-option-${results[activeIndex].id}`
                      : undefined
                  }
                />
                <span className="launcher-enter" aria-hidden="true">
                  <CornerDownLeft size={14} /> Enter
                </span>
              </div>

              <div className="search-dialog-body">
                {!query.trim() ? (
                  <div className="launcher-suggestions">
                    <p>Popular starting points</p>
                    <div>
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            updateQuery(suggestion);
                            inputRef.current?.focus();
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                    <p className="launcher-tip">
                      Search aliases and abbreviations such as{" "}
                      <strong>bs</strong>, <strong>mp</strong>, or{" "}
                      <strong>boilercourses</strong>.
                    </p>
                  </div>
                ) : results.length ? (
                  <div>
                    <div className="launcher-results-head">
                      <strong>Best matches</strong>
                      <span aria-live="polite">
                        {results.length}{" "}
                        {results.length === 1 ? "result" : "results"}
                      </span>
                    </div>
                    <ul
                      id="launcher-results"
                      className="launcher-results"
                      role="listbox"
                    >
                      {results.map((resource, index) => (
                        <li key={resource.id} role="none">
                          <button
                            id={`launcher-option-${resource.id}`}
                            type="button"
                            role="option"
                            aria-selected={activeIndex === index}
                            className={activeIndex === index ? "is-active" : ""}
                            onPointerMove={() => setActiveIndex(index)}
                            onClick={() => choose(resource.id)}
                          >
                            <span
                              className="launcher-result-index"
                              aria-hidden="true"
                            >
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="launcher-result-copy">
                              <strong>{resource.name}</strong>
                              <small>{resource.shortDescription}</small>
                              <span>
                                {sourceLabel(resource.sourceType)} ·{" "}
                                {resource.category} ·{" "}
                                {campusLabel(resource.campuses[0])}
                              </span>
                            </span>
                            <ArrowRight size={18} aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="launcher-empty">
                    <strong>No clear match yet</strong>
                    <p>
                      Try a shorter task, an office name, or browse the complete
                      verified directory.
                    </p>
                    <div>
                      {suggestions.slice(0, 3).map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => updateQuery(suggestion)}
                        >
                          Try “{suggestion}”
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="search-dialog-footer">
                <span>
                  <Command size={14} /> ↑↓ to move · Enter to open · Esc to
                  close
                </span>
                <Link
                  href={`/resources${query.trim() && results.length ? `?q=${encodeURIComponent(query)}` : ""}`}
                  onClick={close}
                >
                  Browse all results <ArrowRight size={15} />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

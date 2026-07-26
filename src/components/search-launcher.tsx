"use client";

import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const SearchLauncherDialog = dynamic(
  () =>
    import("@/components/search-launcher-dialog").then(
      (module) => module.SearchLauncherDialog,
    ),
  { ssr: false },
);

type SearchLauncherContextValue = {
  openSearch: (initialQuery?: string) => void;
};

const SearchLauncherContext = createContext<SearchLauncherContextValue | null>(
  null,
);

export function useSearchLauncher() {
  const context = useContext(SearchLauncherContext);
  if (!context) {
    throw new Error(
      "useSearchLauncher must be used inside SearchLauncherProvider",
    );
  }
  return context;
}

export function SearchLauncherProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [renderDialog, setRenderDialog] = useState(false);
  const [query, setQuery] = useState("");
  const [instance, setInstance] = useState(0);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setRenderDialog(false);
      previousFocusRef.current?.focus();
      closeTimerRef.current = null;
    }, 380);
  }, []);

  const openSearch = useCallback((initialQuery = "") => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setQuery(initialQuery);
    setInstance((value) => value + 1);
    setRenderDialog(true);
    setOpen(true);
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const target = event.target as HTMLElement | null;
      const typing = target?.matches(
        "input, textarea, select, [contenteditable='true']",
      );
      const launcherShortcut =
        (event.key === "/" && !typing) ||
        ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k");
      if (!launcherShortcut) return;
      event.preventDefault();
      openSearch();
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [openSearch]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    },
    [],
  );

  return (
    <SearchLauncherContext.Provider value={{ openSearch }}>
      {children}
      {renderDialog && (
        <SearchLauncherDialog
          key={instance}
          open={open}
          query={query}
          setQuery={setQuery}
          close={close}
        />
      )}
    </SearchLauncherContext.Provider>
  );
}

export function SearchLauncherTrigger({
  className = "",
  label = "Search",
  initialQuery = "",
  showShortcut = false,
}: {
  className?: string;
  label?: string;
  initialQuery?: string;
  showShortcut?: boolean;
}) {
  const { openSearch } = useSearchLauncher();
  return (
    <button
      type="button"
      className={className}
      onClick={() => openSearch(initialQuery)}
      aria-haspopup="dialog"
    >
      <Search size={18} aria-hidden="true" />
      <span>{label}</span>
      {showShortcut && <kbd aria-hidden="true">Ctrl / ⌘ K</kbd>}
    </button>
  );
}

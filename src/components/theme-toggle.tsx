"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => undefined;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const dark = mounted && resolvedTheme === "dark";
  return (
    <button
      type="button"
      className="icon-button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Use light theme" : "Use dark theme"}
      title={dark ? "Use light theme" : "Use dark theme"}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

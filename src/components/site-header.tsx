"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShieldPlus, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import {
  SearchLauncherTrigger,
  useSearchLauncher,
} from "@/components/search-launcher";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  ["Resources", "/resources"],
  ["Guides", "/guides"],
  ["About", "/about"],
] as const;

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const { openSearch } = useSearchLauncher();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const menuButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => closeButtonRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab" || !menuPanelRef.current) return;
      const focusable = Array.from(
        menuPanelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
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
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      menuButton?.focus();
    };
  }, [closeMenu, menuOpen]);

  return (
    <>
      <header className="site-header">
        <div className="shell header-inner">
          <Link href="/" className="brand-link" aria-label="BoilerCompass home">
            <BrandMark />
          </Link>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                aria-current={isCurrent(pathname, href) ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <SearchLauncherTrigger
              className="header-search"
              label="Search"
              showShortcut
            />
            <Link
              className="support-link"
              href="/support"
              aria-current={
                isCurrent(pathname, "/support") ? "page" : undefined
              }
            >
              <ShieldPlus size={17} /> <span>Support now</span>
            </Link>
            <ThemeToggle />
            <button
              ref={menuButtonRef}
              type="button"
              className="mobile-menu-button"
              aria-label="Open navigation"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          className="mobile-menu-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeMenu();
          }}
        >
          <div
            ref={menuPanelRef}
            className="mobile-menu-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
          >
            <div className="mobile-menu-head">
              <div>
                <p className="eyebrow">Navigate</p>
                <strong id="mobile-menu-title">BoilerCompass</strong>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                className="icon-button"
                onClick={closeMenu}
                aria-label="Close navigation"
              >
                <X size={20} />
              </button>
            </div>
            <button
              type="button"
              className="mobile-menu-search"
              onClick={() => {
                closeMenu();
                requestAnimationFrame(() => openSearch());
              }}
            >
              <Search size={18} /> Search resources
              <kbd aria-hidden="true">⌘K</kbd>
            </button>
            <nav aria-label="Mobile navigation">
              {nav.map(([label, href], index) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={isCurrent(pathname, href) ? "page" : undefined}
                  onClick={closeMenu}
                >
                  <span>0{index + 1}</span> {label}
                </Link>
              ))}
            </nav>
            <Link
              className="mobile-support-link"
              href="/support"
              aria-current={
                isCurrent(pathname, "/support") ? "page" : undefined
              }
              onClick={closeMenu}
            >
              <ShieldPlus size={18} /> Emergency & support
            </Link>
            <p className="mobile-menu-note">
              Independent guide · No Purdue login or student data collected.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

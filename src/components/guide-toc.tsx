"use client";

import { useEffect, useState, type MouseEvent } from "react";

export function GuideToc({ headings }: { headings: string[] }) {
  const [activeId, setActiveId] = useState("step-1");

  useEffect(() => {
    const sections = headings
      .map((_, index) => document.getElementById(`step-${index + 1}`))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -68%", threshold: [0, 0.25, 0.75] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [headings]);

  function navigate(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    const section = document.getElementById(id);
    if (!section) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.history.pushState(null, "", `#${id}`);
    section.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
    setActiveId(id);
  }

  return (
    <nav className="guide-toc" aria-label="On this page">
      <strong>On this page</strong>
      {headings.map((heading, index) => {
        const id = `step-${index + 1}`;
        return (
          <a
            key={heading}
            href={`#${id}`}
            aria-current={activeId === id ? "location" : undefined}
            onClick={(event) => navigate(event, id)}
          >
            <span>0{index + 1}</span> {heading}
          </a>
        );
      })}
    </nav>
  );
}

import type { CSSProperties } from "react";

type BoilerCompassSymbolProps = {
  className?: string;
  color?: string;
  size?: number;
  title?: string;
};

export function BoilerCompassSymbol({
  className,
  color = "currentColor",
  size = 32,
  title,
}: BoilerCompassSymbolProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
      aria-label={title}
      focusable="false"
      style={{ color }}
    >
      <path
        d="M6 28V4h8.5c5 0 8 2.3 8 6 0 3.1-2.2 5.2-6.2 5.8H6m9.5 0c6 0 9.5 2.2 9.5 6.1 0 4-3.4 6.1-9.6 6.1H6"
        stroke="currentColor"
        strokeWidth="2.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 22 27 4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <circle cx="6" cy="28" r="2" fill="currentColor" />
      <circle cx="27" cy="4" r="2" fill="currentColor" />
    </svg>
  );
}

export function BoilerCompassLogo({
  markSize = 56,
  markColor = "#cfb991",
  wordmarkColor = "#f8f4ea",
}: {
  markSize?: number;
  markColor?: string;
  wordmarkColor?: string;
}) {
  const wordmarkStyle: CSSProperties = {
    color: wordmarkColor,
    fontSize: Math.round(markSize * 0.58),
    fontWeight: 760,
    letterSpacing: "-0.04em",
    lineHeight: 1,
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div
        style={{
          width: markSize,
          height: markSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `2px solid ${markColor}`,
          borderRadius: Math.round(markSize * 0.24),
          background: "#11100e",
        }}
      >
        <BoilerCompassSymbol
          color={markColor}
          size={Math.round(markSize * 0.72)}
        />
      </div>
      <span style={wordmarkStyle}>BoilerCompass</span>
    </div>
  );
}

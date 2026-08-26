import type { CSSProperties } from "react";

const MARK_PATH = "/brand/boilercompass-mark.png";

type BoilerCompassSymbolProps = {
  className?: string;
  size?: number;
  title?: string;
};

export function BoilerCompassSymbol({
  className,
  size = 40,
  title,
}: BoilerCompassSymbolProps) {
  return (
    // The supplied raster artwork is the canonical brand mark.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={MARK_PATH}
      width={size}
      height={size}
      alt={title ?? ""}
      aria-hidden={title ? undefined : "true"}
      draggable={false}
    />
  );
}

export function BoilerCompassLogo({
  markSize = 64,
  wordmarkColor = "#f8f4ea",
}: {
  markSize?: number;
  wordmarkColor?: string;
}) {
  const wordmarkStyle: CSSProperties = {
    color: wordmarkColor,
    fontSize: Math.round(markSize * 0.5),
    fontWeight: 760,
    letterSpacing: "-0.04em",
    lineHeight: 1,
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <BoilerCompassSymbol size={markSize} />
      <span style={wordmarkStyle}>BoilerCompass</span>
    </div>
  );
}

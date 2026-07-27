import { ImageResponse } from "next/og";
import { BoilerCompassLogo } from "@/components/boilercompass-logo";

export const alt =
  "BoilerCompass — your guide to Purdue, all in one place. Unofficial student resource guide.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        padding: "68px 72px 62px",
        background: "#11100e",
        color: "#f8f4ea",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <svg
        width="570"
        height="570"
        viewBox="0 0 570 570"
        style={{
          position: "absolute",
          right: -42,
          top: 24,
          opacity: 0.72,
        }}
        aria-hidden="true"
      >
        <circle
          cx="330"
          cy="285"
          r="226"
          fill="none"
          stroke="#5b5144"
          strokeWidth="2"
        />
        <circle
          cx="330"
          cy="285"
          r="146"
          fill="none"
          stroke="#cfb991"
          strokeWidth="2"
        />
        <path
          d="M36 430c92-80 157-18 228-82 58-53 57-132 146-150"
          fill="none"
          stroke="#cfb991"
          strokeWidth="3"
          strokeDasharray="10 12"
          strokeLinecap="round"
        />
        <path
          d="m382 224 40-48"
          fill="none"
          stroke="#cfb991"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle
          cx="264"
          cy="348"
          r="8"
          fill="#11100e"
          stroke="#cfb991"
          strokeWidth="4"
        />
        <circle cx="422" cy="176" r="10" fill="#cfb991" />
      </svg>

      <BoilerCompassLogo markSize={58} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          maxWidth: 790,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            alignSelf: "flex-start",
            minHeight: 38,
            padding: "0 16px",
            border: "1px solid #5b5144",
            borderRadius: 999,
            color: "#cfb991",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 3.4,
            textTransform: "uppercase",
          }}
        >
          Unofficial student resource guide
        </div>
        <div
          style={{
            display: "flex",
            maxWidth: 790,
            fontSize: 68,
            fontWeight: 760,
            letterSpacing: -3.4,
            lineHeight: 1.03,
          }}
        >
          Your guide to Purdue, all in one place.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          color: "#bdb5a8",
          fontSize: 20,
        }}
      >
        <span>Find the right door</span>
        <span style={{ width: 30, height: 1, background: "#5b5144" }} />
        <span>Check the source</span>
        <span style={{ width: 30, height: 1, background: "#5b5144" }} />
        <span>Prepare before you go</span>
      </div>
    </div>,
    size,
  );
}

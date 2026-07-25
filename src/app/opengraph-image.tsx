import { ImageResponse } from "next/og";

export const alt = "BoilerCompass — your guide to Purdue, all in one place";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#11100e",
        color: "#f8f4ea",
        position: "relative",
        padding: "74px",
        fontFamily: "sans-serif",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          border: "1px solid #5b5144",
          borderRadius: 999,
          right: -110,
          top: 50,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 340,
          height: 340,
          border: "1px solid #cfb991",
          borderRadius: 999,
          right: -20,
          top: 140,
          display: "flex",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontSize: 34,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 14,
            border: "2px solid #cfb991",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#cfb991",
          }}
        >
          C
        </div>
        BoilerCompass
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          maxWidth: 790,
        }}
      >
        <div
          style={{
            color: "#cfb991",
            fontSize: 23,
            textTransform: "uppercase",
            letterSpacing: 5,
          }}
        >
          Unofficial student resource guide
        </div>
        <div
          style={{
            fontSize: 72,
            lineHeight: 1.02,
            fontWeight: 760,
            letterSpacing: -3,
          }}
        >
          Your guide to Purdue, all in one place.
        </div>
      </div>
      <div style={{ display: "flex", gap: 18, color: "#bdb5a8", fontSize: 22 }}>
        <span>Trusted source labels</span>
        <span>•</span>
        <span>Guided tasks</span>
        <span>•</span>
        <span>Campus scope</span>
      </div>
    </div>,
    size,
  );
}

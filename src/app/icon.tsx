import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        background: "#11100e",
        color: "#cfb991",
        fontSize: 38,
        fontWeight: 800,
        border: "3px solid #cfb991",
      }}
    >
      C
    </div>,
    size,
  );
}

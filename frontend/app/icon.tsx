import { ImageResponse } from "next/og";

// Dynamic app icon (256×256). Next.js automatically serves this at /icon.png
// for the manifest and any meta references. Brand-locked: gold "CG" on dark
// navy with a teal underline — readable from the home screen at small sizes.

export const size = { width: 256, height: 256 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#161b2e",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            color: "#f59e0b",
            fontSize: 168,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            fontFamily: "Impact, system-ui, sans-serif",
            display: "flex",
          }}
        >
          CG
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 36,
            width: 64,
            height: 4,
            background: "#00c4b4",
          }}
        />
      </div>
    ),
    { ...size }
  );
}

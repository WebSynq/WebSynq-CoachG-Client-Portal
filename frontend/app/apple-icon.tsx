import { ImageResponse } from "next/og";

// iOS home-screen icon (180×180). iOS won't crop the corners like Android,
// so we leave breathing room and let it look like a clean tile.

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
            fontSize: 120,
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
            bottom: 24,
            width: 48,
            height: 3,
            background: "#00c4b4",
          }}
        />
      </div>
    ),
    { ...size }
  );
}

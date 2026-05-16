import type { MetadataRoute } from "next";

// PWA manifest for "Add to Home Screen". The icon paths reference Next.js's
// dynamic-icon convention from /app/icon.tsx and /app/apple-icon.tsx — those
// routes return image/png at runtime (no static .png file in /public).

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "COACHG · The Coach's Office",
    short_name: "Coach's Office",
    description:
      "The COACHG Revenue OS client portal — every playbook, every play, every operator tool.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#161b2e",
    theme_color: "#161b2e",
    categories: ["business", "education", "productivity"],
    icons: [
      {
        src: "/icon",
        sizes: "256x256",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}

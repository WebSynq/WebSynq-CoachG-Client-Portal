"use client";

import { useMemo } from "react";

type Source = {
  type: "loom" | "youtube" | "vimeo" | "cloudinary" | "wistia" | "html5";
  embedUrl: string;
  isFile?: boolean;
};

function parseUrl(url: string): Source | null {
  if (!url) return null;
  try {
    const u = new URL(url);

    // Loom
    if (u.hostname.endsWith("loom.com")) {
      const m = u.pathname.match(/\/(?:share|embed)\/([a-zA-Z0-9]+)/);
      if (!m || !m[1] || m[1].toLowerCase() === "placeholder") return null;
      return { type: "loom", embedUrl: `https://www.loom.com/embed/${m[1]}` };
    }

    // YouTube
    if (u.hostname.includes("youtube.com") || u.hostname === "youtu.be") {
      let id = "";
      if (u.hostname === "youtu.be") id = u.pathname.slice(1);
      else if (u.searchParams.get("v")) id = u.searchParams.get("v") ?? "";
      else {
        const m = u.pathname.match(/\/(?:embed|shorts)\/([a-zA-Z0-9_-]+)/);
        if (m) id = m[1];
      }
      if (!id) return null;
      return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` };
    }

    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (!id) return null;
      return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${id}` };
    }

    // Wistia
    if (u.hostname.includes("wistia.com") || u.hostname.includes("wistia.net")) {
      const m = u.pathname.match(/\/medias\/([a-zA-Z0-9]+)/);
      if (!m) return null;
      return { type: "wistia", embedUrl: `https://fast.wistia.net/embed/iframe/${m[1]}` };
    }

    // Cloudinary video (or any mp4/webm direct link)
    if (u.hostname.includes("res.cloudinary.com") || /\.(mp4|webm|mov|ogg)$/i.test(u.pathname)) {
      return { type: "cloudinary", embedUrl: url, isFile: true };
    }

    return null;
  } catch {
    return null;
  }
}

function Placeholder() {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-sm border border-white/5 bg-card relative">
      <svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold/70" aria-hidden>
        <circle cx="32" cy="32" r="22" />
        <path d="M27 23 L43 32 L27 41 Z" fill="currentColor" />
      </svg>
      <p className="font-display text-sm uppercase tracking-[0.22em] text-muted">Video Coming Soon</p>
      <p className="max-w-xs text-center text-xs text-muted/70">
        The embed will appear here once the video URL is set in the admin portal.
      </p>
    </div>
  );
}

type Props = {
  url: string;
  title?: string;
};

export default function VideoEmbed({ url, title }: Props) {
  const source = useMemo(() => parseUrl(url), [url]);

  if (!source) return <Placeholder />;

  if (source.isFile) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-sm bg-black shadow-elevated relative">
        <video
          src={source.embedUrl}
          controls
          playsInline
          className="h-full w-full"
          data-testid="lesson-video-html5"
        />
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-sm bg-black shadow-elevated relative" data-testid="lesson-video-player">
      <iframe
        src={source.embedUrl}
        title={title ?? "Lesson video"}
        allow="autoplay; fullscreen; clipboard-write; encrypted-media; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
      <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-teal/10" />
    </div>
  );
}

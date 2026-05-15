type Props = {
  shareUrl: string;
  title?: string;
};

function toEmbedUrl(shareUrl: string): string | null {
  try {
    const u = new URL(shareUrl);
    if (!u.hostname.endsWith("loom.com")) return null;
    const idMatch = u.pathname.match(/\/(?:share|embed)\/([a-zA-Z0-9]+)/);
    if (!idMatch) return null;
    const id = idMatch[1];
    if (!id || id.toLowerCase() === "placeholder") return null;
    return `https://www.loom.com/embed/${id}`;
  } catch {
    return null;
  }
}

function PlaceholderArt() {
  return (
    <svg
      viewBox="0 0 64 64"
      width="56"
      height="56"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gold/70"
      aria-hidden
    >
      <circle cx="32" cy="32" r="22" />
      <path d="M27 23 L43 32 L27 41 Z" fill="currentColor" />
    </svg>
  );
}

export default function LoomEmbed({ shareUrl, title }: Props) {
  const embedUrl = toEmbedUrl(shareUrl);

  if (!embedUrl) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-white/5 bg-card">
        <PlaceholderArt />
        <p className="font-display text-sm uppercase tracking-[0.22em] text-muted">
          Video Coming Soon
        </p>
        <p className="max-w-xs text-center text-xs text-muted/70">
          Tim is recording this play. The embed will appear here once the Loom
          link is in place.
        </p>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl shadow-black/40">
      <iframe
        src={embedUrl}
        title={title ?? "Lesson video"}
        allow="fullscreen; clipboard-write"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}

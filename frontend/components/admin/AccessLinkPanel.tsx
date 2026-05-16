"use client";

import { useState } from "react";
import { Copy, RefreshCw, Loader2, Check, Link as LinkIcon } from "lucide-react";

type Props = {
  clientId: string;
  initialToken: string | null;
  siteUrl: string;
};

function buildUrl(siteUrl: string, token: string) {
  const base = siteUrl.replace(/\/$/, "") || "";
  return `${base}/enter?token=${token}`;
}

export default function AccessLinkPanel({ clientId, initialToken, siteUrl }: Props) {
  const [token, setToken] = useState<string | null>(initialToken);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const url = token ? buildUrl(siteUrl, token) : null;

  async function regenerate() {
    if (!confirm("Generate a new access link? The old one will stop working immediately.")) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/regenerate-token`, { method: "POST" });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !data.token) throw new Error(data.error || "rotation_failed");
      setToken(data.token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "rotation_failed");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("clipboard_denied");
    }
  }

  return (
    <div className="rounded-sm border border-white/5 bg-surface p-5" data-testid="access-link-panel">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4 text-teal" strokeWidth={1.75} />
          <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-dim">
            Auto-Login Access Link
          </h3>
        </div>
        <button
          type="button"
          onClick={regenerate}
          disabled={busy}
          data-testid="regenerate-token-button"
          className="inline-flex items-center gap-1.5 rounded-sm border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/60 hover:border-warn/60 hover:text-warn transition-colors disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" strokeWidth={2} />}
          {token ? "Regenerate" : "Generate"}
        </button>
      </div>

      {url ? (
        <div className="flex items-stretch gap-2">
          <code
            className="flex-1 rounded-sm bg-bg px-3 py-2.5 font-mono text-xs text-teal truncate"
            title={url}
            data-testid="access-link-url"
          >
            {url}
          </code>
          <button
            type="button"
            onClick={copy}
            data-testid="copy-access-link-button"
            className="inline-flex items-center gap-1.5 rounded-sm bg-teal px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-black hover:bg-teal/80 transition-colors"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" strokeWidth={2} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      ) : (
        <p className="text-xs text-muted py-3">
          No access link yet. Click <strong>Generate</strong> to create one — they&apos;ll click it from your GHL email/portal and land on the dashboard already signed in.
        </p>
      )}

      <p className="mt-3 font-mono text-[10px] text-muted leading-relaxed">
        Paste this URL into any GHL email/SMS/portal menu. Anyone with this link gets full access — share carefully. Regenerate to revoke.
      </p>

      {error && <p className="mt-2 font-mono text-[10px] text-danger">{error}</p>}
    </div>
  );
}

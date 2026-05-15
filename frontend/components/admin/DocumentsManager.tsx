"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Loader2, Link2, FileText, ExternalLink, Layers } from "lucide-react";
import CloudinaryUploadButton, { type CloudinaryUploadInfo } from "./CloudinaryUploadButton";
import type { DocumentRow, DocumentType, Tier } from "@/lib/database.types";

type DraftDoc = Partial<DocumentRow> & { _isNew?: boolean; _localId?: string };

const TIERS: Tier[] = ["foundation", "growth", "domination"];
const TYPES: DocumentType[] = ["link", "pdf", "template", "video"];

export default function DocumentsManager({ initialDocuments }: { initialDocuments: DocumentRow[] }) {
  const [docs, setDocs] = useState<DraftDoc[]>(initialDocuments);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  function addNew() {
    setDocs([
      ...docs,
      {
        _isNew: true,
        _localId: `new-${Date.now()}`,
        title: "",
        description: "",
        type: "link",
        url: "",
        tier: "foundation",
        sort_order: docs.length,
      },
    ]);
  }

  function update(idx: number, patch: Partial<DraftDoc>) {
    setDocs((d) => d.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  }

  async function save(idx: number) {
    const d = docs[idx];
    const key = d.id || d._localId || "";
    setSavingIds((s) => new Set(s).add(key));
    setError(null);
    try {
      const res = await fetch("/api/admin/documents", {
        method: d.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = (await res.json()) as DocumentRow;
      setDocs((cur) => cur.map((x, i) => (i === idx ? saved : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "save_failed");
    } finally {
      setSavingIds((s) => { const n = new Set(s); n.delete(key); return n; });
    }
  }

  async function remove(idx: number) {
    const d = docs[idx];
    if (d._isNew) {
      setDocs((cur) => cur.filter((_, i) => i !== idx));
      return;
    }
    if (!confirm(`Delete "${d.title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/documents?id=${d.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setDocs((cur) => cur.filter((_, i) => i !== idx));
    } catch (e) {
      setError(e instanceof Error ? e.message : "delete_failed");
    }
  }

  function onUploaded(idx: number, url: string, info: CloudinaryUploadInfo) {
    update(idx, {
      url,
      cloudinary_public_id: info.public_id,
      cloudinary_resource_type: info.resource_type,
      type: info.resource_type === "video" ? "video" : "pdf",
      title: docs[idx].title || info.original_filename || "Untitled",
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-sm border border-danger/40 bg-danger/5 px-4 py-3 text-xs font-mono text-danger">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={addNew}
        data-testid="add-document-button"
        className="inline-flex items-center gap-2 self-start rounded-sm border border-teal/60 bg-teal/5 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-teal hover:bg-teal/10 transition-colors"
      >
        <Plus className="h-3 w-3" strokeWidth={2.5} /> Add Document
      </button>

      <ul className="flex flex-col gap-3">
        {docs.length === 0 && (
          <li className="rounded-sm border border-white/5 bg-surface p-8 text-center">
            <FileText className="h-10 w-10 text-muted mx-auto mb-3" strokeWidth={1.25} />
            <p className="font-display text-lg tracking-wide text-white">No documents yet.</p>
            <p className="mt-1 text-xs text-muted">Add your first PDF, link, or template.</p>
          </li>
        )}

        {docs.map((d, idx) => {
          const key = d.id || d._localId || idx;
          const saving = savingIds.has(d.id || d._localId || "");
          return (
            <li key={key} className="rounded-sm border border-white/5 bg-surface p-5" data-testid={`document-row-${key}`}>
              <div className="grid gap-3 lg:grid-cols-12 lg:gap-4 items-end">
                <FieldGroup label="Title" className="lg:col-span-3">
                  <input
                    type="text"
                    value={d.title ?? ""}
                    onChange={(e) => update(idx, { title: e.target.value })}
                    placeholder="Pipeline Tracker"
                    data-testid={`doc-title-${key}`}
                    className="w-full rounded-sm border border-white/10 bg-bg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-teal/60 focus:outline-none"
                  />
                </FieldGroup>

                <FieldGroup label="Description" className="lg:col-span-3">
                  <input
                    type="text"
                    value={d.description ?? ""}
                    onChange={(e) => update(idx, { description: e.target.value })}
                    placeholder="Short summary…"
                    data-testid={`doc-desc-${key}`}
                    className="w-full rounded-sm border border-white/10 bg-bg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-teal/60 focus:outline-none"
                  />
                </FieldGroup>

                <FieldGroup label="Type" className="lg:col-span-1">
                  <select
                    value={d.type ?? "link"}
                    onChange={(e) => update(idx, { type: e.target.value as DocumentType })}
                    data-testid={`doc-type-${key}`}
                    className="w-full rounded-sm border border-white/10 bg-bg px-2 py-2 text-sm font-mono uppercase text-white focus:border-teal/60 focus:outline-none"
                  >
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FieldGroup>

                <FieldGroup label="Tier" className="lg:col-span-1">
                  <select
                    value={d.tier ?? "foundation"}
                    onChange={(e) => update(idx, { tier: e.target.value as Tier })}
                    data-testid={`doc-tier-${key}`}
                    className="w-full rounded-sm border border-white/10 bg-bg px-2 py-2 text-sm font-mono uppercase text-white focus:border-teal/60 focus:outline-none"
                  >
                    {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FieldGroup>

                <FieldGroup label="URL" className="lg:col-span-3">
                  <div className="relative">
                    <Link2 className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                    <input
                      type="url"
                      value={d.url ?? ""}
                      onChange={(e) => update(idx, { url: e.target.value })}
                      placeholder="Paste link or upload →"
                      data-testid={`doc-url-${key}`}
                      className="w-full rounded-sm border border-white/10 bg-bg pl-8 pr-2 py-2 text-xs font-mono text-white placeholder:text-white/30 focus:border-teal/60 focus:outline-none"
                    />
                  </div>
                </FieldGroup>

                <div className="flex items-center gap-1.5 lg:col-span-1 lg:justify-end">
                  <CloudinaryUploadButton
                    resourceType="auto"
                    folder="coachg/documents"
                    onUploaded={(url, info) => onUploaded(idx, url, info)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  {d.url && (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      data-testid={`doc-open-${key}`}
                      className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-teal hover:text-white"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {d.cloudinary_public_id && (
                    <span className="pill pill-info"><Layers className="h-3 w-3 mr-1" />cloudinary</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    data-testid={`doc-delete-${key}`}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50 hover:border-danger/60 hover:text-danger transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => save(idx)}
                    disabled={saving}
                    data-testid={`doc-save-${key}`}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-teal px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-black hover:bg-teal/80 disabled:opacity-50 transition-colors"
                  >
                    {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    {d.id ? "Save" : "Create"}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FieldGroup({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted mb-1">{label}</p>
      {children}
    </div>
  );
}

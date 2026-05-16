"use client";

import { useState } from "react";
import { RefreshCw, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

interface GhlCustomFieldRow {
  field_key: string; ghl_field_id: string; field_name: string;
  field_type: string | null; updated_at: string;
}
interface GhlSyncLogRow {
  id: string; kind: string; status: string; message: string | null;
  created_at: string;
}

export default function GhlSyncPanel({
  configured,
  initialFields,
  initialLogs,
}: {
  configured: boolean;
  initialFields: GhlCustomFieldRow[];
  initialLogs: GhlSyncLogRow[];
}) {
  const [fields, setFields] = useState(initialFields);
  const [logs, setLogs] = useState(initialLogs);
  const [busyContacts, setBusyContacts] = useState(false);
  const [busyFields, setBusyFields] = useState(false);
  const [contactResult, setContactResult] = useState<string | null>(null);
  const [fieldResult, setFieldResult] = useState<string | null>(null);

  async function syncContacts() {
    setBusyContacts(true); setContactResult(null);
    try {
      const res = await fetch("/api/ghl/sync-from-contacts", { method: "POST" });
      const data = (await res.json()) as { error?: string; imported?: number };
      if (!res.ok) throw new Error(data.error || "sync_failed");
      setContactResult(`Imported ${data.imported ?? 0} contact(s) into profiles.`);
      await refreshLogs();
    } catch (e) {
      setContactResult(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setBusyContacts(false);
    }
  }

  async function syncCustomFields() {
    setBusyFields(true); setFieldResult(null);
    try {
      const res = await fetch("/api/ghl/sync-custom-fields", { method: "POST" });
      const data = (await res.json()) as { error?: string; mapped?: number; fields?: GhlCustomFieldRow[] };
      if (!res.ok) throw new Error(data.error || "sync_failed");
      setFieldResult(`Mapped ${data.mapped ?? 0} custom field(s).`);
      if (data.fields) setFields(data.fields);
      await refreshLogs();
    } catch (e) {
      setFieldResult(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setBusyFields(false);
    }
  }

  async function refreshLogs() {
    const res = await fetch("/api/ghl/logs");
    if (res.ok) {
      const data = (await res.json()) as { logs: GhlSyncLogRow[] };
      setLogs(data.logs);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {!configured && (
        <div className="rounded-sm border border-warn/40 bg-warn/5 p-4 flex items-start gap-3" data-testid="ghl-not-configured">
          <AlertTriangle className="h-5 w-5 text-warn shrink-0" strokeWidth={1.75} />
          <div className="text-sm text-white/70">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-warn mb-1">GHL Not Configured</p>
            Add <code className="font-mono text-teal">GHL_PIT_TOKEN</code> and <code className="font-mono text-teal">GHL_LOCATION_ID</code> to your environment, then restart the server.
          </div>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        <ActionCard
          title="Bulk Onboard Tagged Contacts"
          description="Pull every GHL contact tagged `coachg-client`, create their portal account, generate their personal auto-login link, and write the link back to GHL's portal_access_link field. Idempotent — run as often as you like."
          buttonLabel="Onboard All Now"
          onClick={syncContacts}
          busy={busyContacts}
          result={contactResult}
          configured={configured}
          testid="sync-contacts-card"
        />
        <ActionCard
          title="Discover Custom Fields"
          description="Fetch the location's contact custom fields. Maps portal_* fields to GHL field IDs."
          buttonLabel="Sync Field Map"
          onClick={syncCustomFields}
          busy={busyFields}
          result={fieldResult}
          configured={configured}
          testid="sync-fields-card"
        />
      </div>

      {/* Field mapping */}
      <section>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-dim mb-3">Custom Field Mapping</h2>
        <div className="overflow-x-auto rounded-sm border border-white/5 bg-surface">
          <table className="w-full">
            <thead className="bg-card">
              <tr>
                <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dim border-b border-white/5">Key</th>
                <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dim border-b border-white/5">GHL Name</th>
                <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dim border-b border-white/5">GHL Field ID</th>
                <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dim border-b border-white/5">Type</th>
              </tr>
            </thead>
            <tbody>
              {fields.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-xs text-muted">No fields mapped. Click <strong>Sync Field Map</strong>.</td></tr>
              ) : (
                fields.map((f) => (
                  <tr key={f.field_key} className="border-b border-white/5 hover:bg-card/50">
                    <td className="px-4 py-2.5 font-mono text-xs text-teal">{f.field_key}</td>
                    <td className="px-4 py-2.5 text-xs text-white">{f.field_name}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted">{f.ghl_field_id}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted">{f.field_type ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sync log */}
      <section>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-dim mb-3">Sync Log (last 20)</h2>
        <ul className="rounded-sm border border-white/5 bg-surface divide-y divide-white/5 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <li className="px-4 py-6 text-center text-xs text-muted">No log entries yet.</li>
          ) : (
            logs.map((l) => (
              <li key={l.id} className="flex items-center gap-3 px-4 py-2.5" data-testid={`log-${l.id}`}>
                {l.status === "ok"
                  ? <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" strokeWidth={2} />
                  : <AlertTriangle className="h-3.5 w-3.5 text-danger shrink-0" strokeWidth={2} />}
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted w-32 shrink-0">{l.kind}</span>
                <span className="text-xs text-white truncate flex-1">{l.message ?? l.status}</span>
                <span className="font-mono text-[10px] text-muted shrink-0">{new Date(l.created_at).toLocaleString()}</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

function ActionCard({ title, description, buttonLabel, onClick, busy, result, configured, testid }: {
  title: string; description: string; buttonLabel: string; onClick: () => void;
  busy: boolean; result: string | null; configured: boolean; testid: string;
}) {
  return (
    <div className="rounded-sm border border-white/5 bg-surface p-5" data-testid={testid}>
      <h3 className="font-display text-xl tracking-wide text-white">{title}</h3>
      <p className="mt-2 text-xs text-white/60 leading-relaxed">{description}</p>
      <button
        type="button"
        onClick={onClick}
        disabled={busy || !configured}
        data-testid={`${testid}-button`}
        className="mt-4 inline-flex items-center gap-2 rounded-sm bg-teal px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-black hover:bg-teal/80 disabled:opacity-50 transition-colors"
      >
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" strokeWidth={2} />}
        {buttonLabel}
      </button>
      {result && <p className="mt-3 font-mono text-xs text-teal">{result}</p>}
    </div>
  );
}

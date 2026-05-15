import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isGhlConfigured } from "@/lib/ghl/client";
import GhlSyncPanel from "@/components/admin/GhlSyncPanel";

export const dynamic = "force-dynamic";

interface GhlCustomFieldRow {
  field_key: string; ghl_field_id: string; field_name: string;
  field_type: string | null; updated_at: string;
}
interface GhlSyncLogRow {
  id: string; kind: string; status: string; message: string | null;
  created_at: string;
}

export default async function AdminGhlPage() {
  const configured = isGhlConfigured();
  const supabase = createClient() || createAdminClient();

  let customFields: GhlCustomFieldRow[] = [];
  let recentLogs: GhlSyncLogRow[] = [];
  if (supabase) {
    const [{ data: cfs }, { data: logs }] = await Promise.all([
      supabase.from("ghl_custom_fields").select("*"),
      supabase.from("ghl_sync_log").select("*").order("created_at", { ascending: false }).limit(20),
    ]);
    customFields = (cfs ?? []) as GhlCustomFieldRow[];
    recentLogs = (logs ?? []) as GhlSyncLogRow[];
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-danger">Control Room · GHL</p>
        <h1 className="mt-2 font-display text-4xl tracking-wide text-white">GoHighLevel Sync</h1>
        <p className="mt-2 text-sm text-white/60">
          Pull contacts tagged <code className="font-mono text-teal">coachg-client</code> into profiles. Map custom fields. Watch the sync log.
        </p>
      </header>

      <div className="grid gap-px bg-white/5 lg:grid-cols-3">
        <StatusCard label="Connection" value={configured ? "Live" : "Not Configured"} tone={configured ? "success" : "danger"} />
        <StatusCard label="Mapped Custom Fields" value={String(customFields.length)} tone="info" />
        <StatusCard label="Recent Events (20)" value={String(recentLogs.length)} tone="neutral" />
      </div>

      <GhlSyncPanel configured={configured} initialFields={customFields} initialLogs={recentLogs} />
    </div>
  );
}

function StatusCard({ label, value, tone }: { label: string; value: string; tone: "success" | "danger" | "info" | "neutral" }) {
  const colorMap = { success: "text-success", danger: "text-danger", info: "text-info", neutral: "text-ink-dim" };
  return (
    <div className="bg-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className={`font-display text-3xl leading-none mt-2 ${colorMap[tone]}`}>{value}</p>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { allLessons, MODULES } from "@/content/modules";
import { ArrowLeft, Mail, ExternalLink } from "lucide-react";
import AccessLinkPanel from "@/components/admin/AccessLinkPanel";

export const dynamic = "force-dynamic";

interface ProfileRow {
  id: string; email: string; full_name: string | null; tier: string;
  is_admin: boolean; ghl_contact_id: string | null;
  ghl_sub_account_id: string | null; last_seen: string | null;
  created_at: string;
  portal_access_token: string | null;
}
interface ProgressRow { lesson_id: string; module_id: string; completed_at: string; }

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient() || createAdminClient();
  if (!supabase) return notFound();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", params.id).maybeSingle();
  if (!profile) return notFound();
  const p = profile as ProfileRow;

  const { data: prog } = await supabase
    .from("progress").select("lesson_id, module_id, completed_at")
    .eq("user_id", params.id).order("completed_at", { ascending: false });
  const progress = (prog ?? []) as ProgressRow[];

  const lessonMap = Object.fromEntries(allLessons().map((l) => [l.id, l]));
  const moduleMap = Object.fromEntries(MODULES.map((m) => [m.id, m]));
  const totalLessons = allLessons().length;
  const completedCount = progress.length;
  const pct = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/admin/clients"
        data-testid="back-to-clients"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted hover:text-teal transition-colors w-fit"
      >
        <ArrowLeft className="h-3 w-3" strokeWidth={2} /> Back to All Clients
      </Link>

      {/* Header */}
      <header className="grid gap-px bg-white/5 lg:grid-cols-12">
        <div className="bg-surface p-8 lg:col-span-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-danger mb-3">Client Profile</p>
          <h1 className="font-display text-5xl tracking-wide text-white">
            {p.full_name ?? p.email.split("@")[0]}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="pill pill-info"><Mail className="h-3 w-3 mr-1" />{p.email}</span>
            <span className="pill pill-warn">{p.tier}</span>
            {p.is_admin && <span className="pill pill-danger">admin</span>}
          </div>
        </div>
        <div className="bg-surface p-8 lg:col-span-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold mb-3">Completion</p>
          <p className="font-display text-7xl leading-none text-gold tabular-nums">
            {pct}<span className="text-3xl text-gold/60 ml-1">%</span>
          </p>
          <p className="mt-3 font-mono text-xs text-muted">{completedCount} / {totalLessons} plays</p>
          <div className="mt-3 h-1 w-full overflow-hidden bg-white/10">
            <div className="h-full bg-teal transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </header>

      {/* Meta */}
      <div className="grid gap-px bg-white/5 sm:grid-cols-3">
        <Meta label="User ID" value={p.id} mono />
        <Meta label="GHL Contact" value={p.ghl_contact_id ?? "—"} mono />
        <Meta label="Last Seen" value={p.last_seen ? new Date(p.last_seen).toLocaleString() : "—"} />
      </div>

      {/* Auto-login access link (Option B) */}
      <AccessLinkPanel
        clientId={p.id}
        initialToken={p.portal_access_token}
        siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? ""}
      />

      {/* Timeline */}
      <section>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-dim mb-4">Lesson Timeline</h2>
        {progress.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center bg-surface rounded-sm">No lessons completed yet.</p>
        ) : (
          <ol className="border-l border-white/10 ml-3 space-y-4 pl-6">
            {progress.map((r) => {
              const lesson = lessonMap[r.lesson_id];
              const mod = moduleMap[r.module_id];
              return (
                <li key={r.lesson_id} className="relative" data-testid={`timeline-${r.lesson_id}`}>
                  <span className="absolute -left-[31px] top-1.5 h-2 w-2 rounded-full bg-success ring-4 ring-bg" />
                  <p className="font-display text-lg tracking-wide text-white">
                    {lesson?.title ?? r.lesson_id}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted mt-0.5">
                    {mod?.title ?? r.module_id} · {new Date(r.completed_at).toLocaleString()}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* External links */}
      {p.ghl_contact_id && (
        <a
          href={`https://app.gohighlevel.com/v2/location/${p.ghl_sub_account_id || ""}/contacts/detail/${p.ghl_contact_id}`}
          target="_blank"
          rel="noreferrer"
          data-testid="open-in-ghl-link"
          className="inline-flex items-center gap-2 self-start rounded-sm border border-info/40 bg-info/5 px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-info hover:bg-info/10 transition-colors"
        >
          Open in GHL <ExternalLink className="h-3 w-3" strokeWidth={2} />
        </a>
      )}
    </div>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className={`mt-2 text-sm break-all ${mono ? "font-mono text-teal" : "text-white"}`}>{value}</p>
    </div>
  );
}

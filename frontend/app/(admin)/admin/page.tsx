import Link from "next/link";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isGhlConfigured } from "@/lib/ghl/client";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { MODULES, allLessons } from "@/content/modules";
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  Database,
  Image as ImageIcon,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ProfileRow {
  id: string; email: string; full_name: string | null; tier: string;
  is_admin: boolean; last_seen: string | null; created_at: string;
}
interface ProgressRow { user_id: string; lesson_id: string; completed_at: string; }

async function loadData() {
  const supabase = createClient() || createAdminClient();
  if (!supabase) return { profiles: [], progress: [] as ProgressRow[], stub: true };
  const [{ data: profiles }, { data: progress }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("progress").select("user_id, lesson_id, completed_at"),
  ]);
  return {
    profiles: (profiles ?? []) as ProfileRow[],
    progress: (progress ?? []) as ProgressRow[],
    stub: false,
  };
}

export default async function AdminOverviewPage() {
  const { profiles, progress, stub } = await loadData();
  const totalLessons = allLessons().length;
  const totalClients = profiles.length;
  const activeClients = profiles.filter((p) => {
    if (!p.last_seen) return false;
    const days = (Date.now() - new Date(p.last_seen).getTime()) / 86400000;
    return days <= 7;
  }).length;
  const churnRisk = profiles.filter((p) => {
    if (!p.last_seen) return p.created_at && (Date.now() - new Date(p.created_at).getTime()) / 86400000 > 14;
    const days = (Date.now() - new Date(p.last_seen).getTime()) / 86400000;
    return days > 21;
  }).length;
  const completedTotal = progress.length;
  const recent = [...progress].sort((a, b) => +new Date(b.completed_at) - +new Date(a.completed_at)).slice(0, 8);
  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));

  return (
    <div className="flex flex-col gap-8">
      {/* Status banner */}
      {stub && (
        <div className="rounded-sm border border-warn/40 bg-warn/5 p-4 flex items-start gap-3" data-testid="stub-warning">
          <AlertTriangle className="h-5 w-5 text-warn shrink-0 mt-0.5" strokeWidth={1.75} />
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-warn">Preview Mode</p>
            <p className="mt-1 text-sm text-white/70">
              Supabase is not connected. Add <code className="font-mono text-teal">NEXT_PUBLIC_SUPABASE_URL</code>, <code className="font-mono text-teal">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and <code className="font-mono text-teal">SUPABASE_SERVICE_ROLE_KEY</code> to your <code className="font-mono">.env</code> to see real client data.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-danger">Control Room · Overview</p>
        <h1 className="font-display text-4xl tracking-wide text-white" data-testid="admin-overview-heading">
          Operations Console
        </h1>
        <p className="text-sm text-white/60">
          Monitor 79 clients · push progress to GHL · swap content live.
        </p>
      </header>

      {/* Stat grid — dense, mono */}
      <div className="grid gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={Users} label="Clients" value={totalClients} accent="text-teal" testid="stat-clients" />
        <StatTile icon={Activity} label="Active 7d" value={activeClients} accent="text-success" testid="stat-active" />
        <StatTile icon={CheckCircle2} label="Plays Completed" value={completedTotal} accent="text-gold" testid="stat-plays" />
        <StatTile icon={AlertTriangle} label="Churn Risk" value={churnRisk} accent="text-danger" testid="stat-churn" />
      </div>

      {/* Two-column control grid */}
      <div className="grid gap-px bg-white/5 lg:grid-cols-12">
        {/* Recent activity */}
        <section className="bg-surface p-6 lg:col-span-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-dim">Recent Activity</h2>
            <Link href="/admin/clients" className="font-mono text-[10px] uppercase tracking-[0.22em] text-teal hover:text-white inline-flex items-center gap-1">
              View All <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="font-mono text-xs text-muted py-4">No lesson activity yet.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {recent.map((r) => {
                const p = profileMap[r.user_id];
                return (
                  <li key={`${r.user_id}-${r.lesson_id}`} className="flex items-center gap-4 py-3">
                    <div className="h-2 w-2 rounded-full bg-success shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate">
                        {p?.full_name ?? p?.email ?? "Unknown user"}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                        completed {r.lesson_id}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-muted shrink-0">
                      {new Date(r.completed_at).toLocaleString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* System status */}
        <section className="bg-surface p-6 lg:col-span-4">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-dim mb-5">Integrations</h2>
          <ul className="space-y-3">
            <IntegrationRow icon={Database} label="Supabase" connected={!stub} />
            <IntegrationRow icon={RefreshCw} label="GHL Sync" connected={isGhlConfigured()} />
            <IntegrationRow icon={ImageIcon} label="Cloudinary" connected={isCloudinaryConfigured()} />
          </ul>
          <div className="mt-6 pt-5 border-t border-white/5">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dim mb-3">Catalog</p>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between"><dt className="text-white/60">Modules</dt><dd className="font-mono text-white">{MODULES.length}</dd></div>
              <div className="flex justify-between"><dt className="text-white/60">Lessons</dt><dd className="font-mono text-white">{totalLessons}</dd></div>
            </dl>
          </div>
        </section>
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <QuickLink href="/admin/clients" label="Manage Clients" icon={Users} />
        <QuickLink href="/admin/content" label="Swap Videos & Lessons" icon={TrendingUp} />
        <QuickLink href="/admin/ghl" label="GHL Sync Panel" icon={RefreshCw} />
      </div>
    </div>
  );
}

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement> & { strokeWidth?: number | string }>;

function StatTile({ icon: Icon, label, value, accent, testid }: { icon: IconType; label: string; value: number; accent: string; testid: string }) {
  return (
    <div className="bg-surface p-5 flex items-start gap-4" data-testid={testid}>
      <div className={`flex h-9 w-9 items-center justify-center rounded-sm bg-card ${accent}`}>
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">{label}</p>
        <p className={`font-display text-4xl leading-none mt-1 ${accent}`}>{value}</p>
      </div>
    </div>
  );
}

function IntegrationRow({ icon: Icon, label, connected }: { icon: IconType; label: string; connected: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <Icon className={`h-4 w-4 ${connected ? "text-teal" : "text-muted"}`} strokeWidth={1.75} />
      <span className="text-sm text-white flex-1">{label}</span>
      <span className={`pill ${connected ? "pill-success" : "pill-neutral"}`}>
        {connected ? "Live" : "Off"}
      </span>
    </li>
  );
}

function QuickLink({ href, label, icon: Icon }: { href: string; label: string; icon: IconType }) {
  return (
    <Link
      href={href}
      data-testid={`quick-${label.toLowerCase().replace(/\s+/g, "-")}`}
      className="group flex items-center justify-between gap-3 rounded-sm border border-white/5 bg-surface p-5 transition-all hover:border-teal/40 hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-teal" strokeWidth={1.75} />
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-white">{label}</span>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted group-hover:text-teal transition-colors" strokeWidth={2} />
    </Link>
  );
}

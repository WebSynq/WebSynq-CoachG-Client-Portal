import Link from "next/link";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { allLessons } from "@/content/modules";
import { Search, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface ProfileRow {
  id: string; email: string; full_name: string | null; tier: string;
  is_admin: boolean; ghl_contact_id: string | null;
  last_seen: string | null; created_at: string;
}

export default async function AdminClientsPage({
  searchParams,
}: { searchParams: { q?: string; tier?: string } }) {
  const supabase = createClient() || createAdminClient();
  const totalLessons = allLessons().length;
  let profiles: ProfileRow[] = [];
  const progressCounts: Record<string, number> = {};

  if (supabase) {
    const [{ data }, { data: prog }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("progress").select("user_id"),
    ]);
    profiles = (data ?? []) as ProfileRow[];
    for (const p of (prog ?? []) as { user_id: string }[]) {
      progressCounts[p.user_id] = (progressCounts[p.user_id] ?? 0) + 1;
    }
  }

  const q = (searchParams.q ?? "").toLowerCase();
  const tier = searchParams.tier ?? "";
  const filtered = profiles.filter((p) => {
    if (q && !`${p.email} ${p.full_name ?? ""}`.toLowerCase().includes(q)) return false;
    if (tier && p.tier !== tier) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-danger">Control Room · Clients</p>
        <h1 className="font-display text-4xl tracking-wide text-white">
          All Clients <span className="text-muted text-2xl">({profiles.length})</span>
        </h1>
      </header>

      {/* Filters */}
      <form className="flex flex-col gap-3 sm:flex-row sm:items-center" data-testid="clients-filter-form">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" strokeWidth={1.75} />
          <input
            type="text"
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search by name or email…"
            data-testid="clients-search-input"
            className="w-full rounded-sm border border-white/10 bg-surface pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-teal/60 focus:outline-none focus:ring-2 focus:ring-teal/20"
          />
        </div>
        <select
          name="tier"
          defaultValue={searchParams.tier ?? ""}
          data-testid="clients-tier-filter"
          className="rounded-sm border border-white/10 bg-surface px-3 py-2.5 text-sm font-mono uppercase tracking-wider text-white focus:border-teal/60 focus:outline-none"
        >
          <option value="">All Tiers</option>
          <option value="foundation">Foundation</option>
          <option value="growth">Growth</option>
          <option value="domination">Domination</option>
        </select>
        <button
          type="submit"
          data-testid="clients-filter-apply"
          className="rounded-sm bg-card border border-white/10 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-white hover:border-teal/60 hover:text-teal transition-colors"
        >
          Apply
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-white/5 bg-surface">
        <table className="w-full border-collapse" data-testid="clients-table">
          <thead>
            <tr className="bg-card">
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dim border-b border-white/5">Name / Email</th>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dim border-b border-white/5">Tier</th>
              <th className="text-right px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dim border-b border-white/5">Progress</th>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dim border-b border-white/5">GHL</th>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dim border-b border-white/5">Last Seen</th>
              <th className="text-right px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dim border-b border-white/5"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted">
                  No clients found. {profiles.length === 0 && "(Supabase may not be connected yet.)"}
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const completed = progressCounts[p.id] ?? 0;
                const pct = totalLessons === 0 ? 0 : Math.round((completed / totalLessons) * 100);
                return (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-card/50 transition-colors" data-testid={`client-row-${p.id}`}>
                    <td className="px-4 py-3">
                      <p className="text-sm text-white">{p.full_name ?? "—"}</p>
                      <p className="font-mono text-[10px] text-muted">{p.email}</p>
                    </td>
                    <td className="px-4 py-3"><TierPill tier={p.tier} /></td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-mono text-sm text-white tabular-nums">{completed}/{totalLessons}</p>
                      <div className="mt-1 h-0.5 w-20 ml-auto overflow-hidden bg-white/10">
                        <div className="h-full bg-teal" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.ghl_contact_id ? (
                        <span className="pill pill-info">{p.ghl_contact_id.slice(0, 8)}…</span>
                      ) : (
                        <span className="pill pill-neutral">none</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {p.last_seen ? new Date(p.last_seen).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/clients/${p.id}`}
                        data-testid={`client-view-${p.id}`}
                        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-teal hover:text-white transition-colors"
                      >
                        View <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TierPill({ tier }: { tier: string }) {
  const map: Record<string, string> = {
    foundation: "pill-neutral",
    growth: "pill-info",
    domination: "pill-warn",
  };
  return <span className={`pill ${map[tier] ?? "pill-neutral"}`}>{tier}</span>;
}

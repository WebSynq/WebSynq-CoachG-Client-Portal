import { getCurrentProfile, hasTierAccess, type Tier } from "@/lib/auth";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { DocumentRow } from "@/lib/database.types";
import { Download, ExternalLink, FileText, Lock, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

const STATIC_FALLBACK: Partial<DocumentRow>[] = [
  { id: "r-pipeline-tracker", title: "Pipeline Tracker (Google Sheet)",
    description: "Copy-and-customize sheet for weekly pipeline math.",
    url: "#", type: "template", tier: "foundation" },
  { id: "r-discovery-script", title: "12-Minute Discovery Script (PDF)",
    description: "Print-ready script for the discovery call framework.",
    url: "#", type: "pdf", tier: "foundation" },
  { id: "r-email-swipe", title: "Email Swipe File",
    description: "Eight emails we use across nurture, renewal, and reactivation.",
    url: "#", type: "template", tier: "growth" },
  { id: "r-comp-calculator", title: "Producer Comp Calculator",
    description: "Model base + commission scenarios before you hire.",
    url: "#", type: "template", tier: "growth" },
  { id: "r-scorecard-template", title: "Weekly Operator Scorecard",
    description: "The 9-metric scorecard reviewed every Monday.",
    url: "#", type: "template", tier: "domination" },
  { id: "r-ai-prompts", title: "AI Prompt Library for Agencies",
    description: "Vetted prompts for intake summaries, renewal calls, and audits.",
    url: "#", type: "pdf", tier: "domination" },
];

export default async function ResourcesPage() {
  const user = await getCurrentProfile();

  const supabase = createClient() || createAdminClient();
  let docs: Partial<DocumentRow>[] = STATIC_FALLBACK;
  if (supabase) {
    const { data } = await supabase
      .from("documents").select("*")
      .order("sort_order", { ascending: true });
    if (data && data.length > 0) docs = data as DocumentRow[];
  }

  return (
    <div className="flex flex-col gap-10 animate-fade-up">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">The Field Guide</p>
        <h1 className="mt-2 font-display text-5xl tracking-wide text-white">Swipe Files & Tools</h1>
        <p className="mt-2 text-sm text-muted">
          Templates, scripts, and playbooks. Tier-gated to your plan.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {docs.map((r) => {
          const unlocked = hasTierAccess(user.tier, (r.tier ?? "foundation") as Tier);
          return (
            <li
              key={r.id}
              data-testid={`resource-${r.id}`}
              className={`group flex flex-col gap-4 rounded-sm border border-white/5 bg-surface p-5 transition-all duration-200 sm:flex-row sm:items-center sm:gap-5 ${
                unlocked ? "hover:-translate-y-0.5 hover:border-teal/40" : "opacity-50"
              }`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-card text-gold">
                <TypeIcon type={r.type ?? "link"} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg tracking-wide text-white">{r.title}</h3>
                  <span className={`pill ${r.tier === "domination" ? "pill-warn" : r.tier === "growth" ? "pill-info" : "pill-neutral"}`}>
                    {r.tier}
                  </span>
                  {r.cloudinary_public_id && <span className="pill pill-info"><Layers className="h-3 w-3" /> cloudinary</span>}
                </div>
                <p className="mt-1 text-sm text-white/60">{r.description}</p>
              </div>

              <div className="shrink-0">
                {unlocked ? (
                  <a
                    href={r.url || "#"}
                    target={r.url?.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    data-testid={`resource-link-${r.id}`}
                    className="inline-flex items-center gap-2 rounded-sm border border-gold/60 px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-gold hover:bg-gold/10 hover:text-amber-300 transition-colors"
                  >
                    Open <ExternalLink className="h-3 w-3" strokeWidth={2} />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-sm border border-gold/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
                    <Lock className="h-3 w-3" strokeWidth={2} /> Upgrade to Unlock
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TypeIcon({ type }: { type: string }) {
  const cls = "h-5 w-5";
  if (type === "pdf") return <FileText className={cls} strokeWidth={1.5} />;
  if (type === "link") return <ExternalLink className={cls} strokeWidth={1.5} />;
  return <Download className={cls} strokeWidth={1.5} />;
}

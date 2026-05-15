import { getCurrentUser, hasTierAccess, type Tier } from "@/lib/mock-user";

type ResourceType = "download" | "link" | "template";

type Resource = {
  id: string;
  title: string;
  description: string;
  href: string;
  type: ResourceType;
  tier: Tier;
};

// TODO: replace with real resources. Static for now — no CMS.
const RESOURCES: Resource[] = [
  {
    id: "r-pipeline-tracker",
    title: "Pipeline Tracker (Google Sheet)",
    description: "Copy-and-customize sheet for weekly pipeline math.",
    href: "#",
    type: "template",
    tier: "foundation",
  },
  {
    id: "r-discovery-script",
    title: "12-Minute Discovery Script (PDF)",
    description: "Print-ready script for the discovery call framework.",
    href: "#",
    type: "download",
    tier: "foundation",
  },
  {
    id: "r-email-swipe",
    title: "Email Swipe File",
    description:
      "Eight emails we use across nurture, renewal, and reactivation.",
    href: "#",
    type: "template",
    tier: "growth",
  },
  {
    id: "r-comp-calculator",
    title: "Producer Comp Calculator",
    description: "Model base + commission scenarios before you hire.",
    href: "#",
    type: "template",
    tier: "growth",
  },
  {
    id: "r-scorecard-template",
    title: "Weekly Operator Scorecard",
    description: "The 9-metric scorecard reviewed every Monday.",
    href: "#",
    type: "template",
    tier: "domination",
  },
  {
    id: "r-ai-prompts",
    title: "AI Prompt Library for Agencies",
    description:
      "Vetted prompts for intake summaries, renewal calls, and audits.",
    href: "#",
    type: "download",
    tier: "domination",
  },
];

const TIER_LABEL: Record<Tier, string> = {
  foundation: "Foundation",
  growth: "Growth",
  domination: "Domination",
};

const TYPE_LABEL: Record<ResourceType, string> = {
  download: "Download",
  link: "Open Link",
  template: "Open Template",
};

function TypeIcon({ type }: { type: ResourceType }) {
  const stroke = {
    width: "1.75",
    color: "currentColor",
  };
  const common =
    "h-6 w-6 text-gold transition-colors";
  if (type === "download") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke.color}
        strokeWidth={stroke.width}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={common}
        aria-hidden
      >
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
    );
  }
  if (type === "link") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke.color}
        strokeWidth={stroke.width}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={common}
        aria-hidden
      >
        <path d="M14 3h7v7" />
        <path d="M10 14 21 3" />
        <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
      </svg>
    );
  }
  // template
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke.color}
      strokeWidth={stroke.width}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={common}
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function ResourcesPage() {
  const user = getCurrentUser();

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="font-display text-5xl tracking-wide text-white">
          The Field Guide
        </h1>
        <p className="mt-2 text-sm text-muted">
          Swipe files, templates, and tools. Tier-gated to your plan.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {RESOURCES.map((r) => {
          const unlocked = hasTierAccess(user.tier, r.tier);
          return (
            <li
              key={r.id}
              className={`flex flex-col gap-4 rounded-xl bg-card p-5 transition-all duration-200 sm:flex-row sm:items-center sm:gap-5 ${
                unlocked
                  ? "hover:-translate-y-0.5 hover:ring-1 hover:ring-gold/30"
                  : "opacity-50"
              }`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/5">
                <TypeIcon type={r.type} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg tracking-wide text-white">
                    {r.title}
                  </h3>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                    {TIER_LABEL[r.tier]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/70">{r.description}</p>
              </div>

              <div className="shrink-0">
                {unlocked ? (
                  <a
                    href={r.href}
                    className="inline-flex items-center gap-2 rounded-md border border-gold/60 px-4 py-2 font-display text-sm tracking-[0.12em] text-gold transition-colors hover:bg-gold/10 hover:text-amber-300"
                  >
                    {TYPE_LABEL[r.type]}
                    <span aria-hidden>→</span>
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-md border border-gold/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                    <LockIcon />
                    Upgrade to Unlock
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

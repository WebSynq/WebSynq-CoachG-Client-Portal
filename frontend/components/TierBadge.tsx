import type { Tier } from "@/lib/mock-user";

const STYLES: Record<Tier, { label: string; className: string }> = {
  foundation: {
    label: "Foundation",
    className: "bg-card text-white/80 border-white/15",
  },
  growth: {
    label: "Growth",
    className: "bg-teal/10 text-teal border-teal/40",
  },
  domination: {
    label: "Domination",
    className: "bg-gold/10 text-gold border-gold/40",
  },
};

export default function TierBadge({ tier }: { tier: Tier }) {
  const s = STYLES[tier];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${s.className}`}
    >
      {s.label}
    </span>
  );
}

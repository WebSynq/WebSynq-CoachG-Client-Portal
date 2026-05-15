import type { Tier } from "@/lib/mock-user";

const TIER_RANK: Record<Tier, number> = {
  foundation: 1,
  growth: 2,
  domination: 3,
};

const STEPS: { tier: Tier; label: string }[] = [
  { tier: "foundation", label: "Foundation" },
  { tier: "growth", label: "Growth" },
  { tier: "domination", label: "Domination" },
];

export default function TierLadder({ currentTier }: { currentTier: Tier }) {
  const currentRank = TIER_RANK[currentTier];

  return (
    <div>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
        Your Tier
      </p>
      <ol className="flex flex-col gap-2.5">
        {STEPS.map((step) => {
          const stepRank = TIER_RANK[step.tier];
          const isCurrent = stepRank === currentRank;
          const isUnlocked = stepRank <= currentRank;

          return (
            <li
              key={step.tier}
              className="flex items-center gap-3 text-sm"
            >
              <span
                aria-hidden
                className={`relative flex h-3 w-3 items-center justify-center rounded-full border ${
                  isUnlocked
                    ? "border-teal bg-teal"
                    : "border-white/15 bg-transparent"
                }`}
              >
                {isCurrent && (
                  <span className="absolute inset-0 -m-[3px] animate-ping rounded-full border border-teal/40" />
                )}
              </span>
              <span
                className={
                  isCurrent
                    ? "font-semibold text-teal"
                    : isUnlocked
                    ? "text-white/80"
                    : "text-white/30"
                }
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

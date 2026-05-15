import { getCurrentUser, hasTierAccess } from "@/lib/mock-user";
import { MODULES } from "@/content/modules";
import ModuleCard from "@/components/ModuleCard";

const TIER_LABEL: Record<string, string> = {
  foundation: "Foundation",
  growth: "Growth",
  domination: "Domination",
};

export default function TrainingIndexPage() {
  const user = getCurrentUser();

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="font-display text-5xl tracking-wide text-white">
          The Playbook
        </h1>
        <p className="mt-2 text-sm text-muted">
          Every module across every tier. Run the plays in order, or jump to
          what you need.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m, i) => {
          const unlocked = hasTierAccess(user.tier, m.tier);
          return (
            <ModuleCard
              key={m.id}
              index={i}
              slug={m.slug}
              title={m.title}
              description={m.description}
              lessonIds={m.lessons.map((l) => l.id)}
              tierLabel={TIER_LABEL[m.tier] ?? m.tier}
              unlocked={unlocked}
            />
          );
        })}
      </div>
    </div>
  );
}

import { getCurrentUser } from "@/lib/mock-user";
import { modulesForTier } from "@/content/modules";
import DashboardStats from "@/components/DashboardStats";
import ProgressRing from "@/components/ProgressRing";
import TierBadge from "@/components/TierBadge";

export default function DashboardPage() {
  const user = getCurrentUser();
  const modules = modulesForTier(user.tier);
  const firstName = user.full_name.split(" ")[0] ?? user.full_name;
  const allLessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));

  const modulesForClient = modules.map((m) => ({
    id: m.id,
    slug: m.slug,
    title: m.title,
    lessons: m.lessons.map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
    })),
  }));

  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-5xl leading-[0.95] tracking-wide text-gold sm:text-6xl">
          Welcome Back, {firstName.toUpperCase()}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <TierBadge tier={user.tier} />
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
            Your Season Is Underway
          </p>
        </div>
      </header>

      <DashboardStats modules={modulesForClient} />

      {/* Progress ring */}
      <section className="flex justify-center pt-2">
        <ProgressRing lessonIds={allLessonIds} label="Overall Completion" />
      </section>
    </div>
  );
}

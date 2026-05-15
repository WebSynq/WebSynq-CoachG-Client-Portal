import Image from "next/image";
import { getCurrentProfile } from "@/lib/auth";
import { modulesForTier } from "@/content/modules";
import DashboardStats from "@/components/DashboardStats";
import ProgressRing from "@/components/ProgressRing";
import TierBadge from "@/components/TierBadge";

export default async function DashboardPage() {
  const user = await getCurrentProfile();
  const modules = modulesForTier(user.tier);
  const firstName = (user.full_name ?? user.email.split("@")[0]).split(" ")[0];
  const allLessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));
  const modulesForClient = modules.map((m) => ({
    id: m.id, slug: m.slug, title: m.title,
    lessons: m.lessons.map((l) => ({ id: l.id, slug: l.slug, title: l.title })),
  }));

  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-sm border border-white/5 bg-surface p-8 lg:p-10">
        <div className="absolute inset-0 z-0 opacity-20">
          <Image
            src="https://static.prod-images.emergentagent.com/jobs/64343d5b-a819-4d36-936a-ffed7b48232b/images/e2becee92f9381969bc12138605bfa019aac5d97811cbc5dac63a6b27743a5a5.png"
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent" />
        </div>
        <div className="relative z-10 flex flex-col gap-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-gold animate-fade-up">
            Welcome Back, Coach
          </p>
          <h1
            className="font-display text-5xl leading-[0.95] tracking-wide text-white sm:text-6xl animate-fade-up"
            style={{ animationDelay: "100ms" }}
            data-testid="dashboard-welcome-heading"
          >
            {firstName.toUpperCase()},
            <br />
            <span className="text-gold">RUN THE PLAY.</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <TierBadge tier={user.tier} />
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">
              Your Season Is Underway
            </p>
          </div>
        </div>
      </header>

      <DashboardStats modules={modulesForClient} />

      {/* Progress ring */}
      <section className="flex flex-col items-center gap-4 py-4 lg:flex-row lg:justify-around lg:gap-8">
        <ProgressRing lessonIds={allLessonIds} label="Overall Completion" />
        <div className="max-w-md text-center lg:text-left">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-teal">
            The Framework
          </p>
          <h3 className="mt-2 font-display text-3xl tracking-wide text-white">
            OPTIMIZE. AMPLIFY. SCALE.
          </h3>
          <p className="mt-3 text-sm text-white/60 leading-relaxed">
            Stop watching content. Start installing systems. Every play in this
            portal is built to compound into a self-sustaining agency machine.
          </p>
        </div>
      </section>
    </div>
  );
}

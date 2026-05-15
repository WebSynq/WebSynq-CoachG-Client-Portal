import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { findModule, MODULES } from "@/content/modules";
import { getCurrentUser, hasTierAccess } from "@/lib/mock-user";
import TierBadge from "@/components/TierBadge";
import LessonStatus from "@/components/LessonStatus";
import ModuleProgress from "@/components/ModuleProgress";

export function generateStaticParams() {
  return MODULES.map((m) => ({ moduleSlug: m.slug }));
}

type Params = { moduleSlug: string };

export default function ModulePage({ params }: { params: Params }) {
  const mod = findModule(params.moduleSlug);
  if (!mod) return notFound();

  const user = getCurrentUser();
  if (!hasTierAccess(user.tier, mod.tier)) {
    redirect("/training");
  }

  const index = MODULES.findIndex((m) => m.id === mod.id);
  const numberLabel = String(index + 1).padStart(2, "0");
  const numberTone = index % 2 === 0 ? "text-gold/30" : "text-teal/30";

  return (
    <div className="flex flex-col gap-10">
      <nav className="text-xs uppercase tracking-[0.18em] text-muted">
        <Link href="/training" className="hover:text-white">
          The Playbook
        </Link>
        <span className="mx-2 text-white/30">/</span>
        <span className="text-white/80">{mod.title}</span>
      </nav>

      <header className="flex flex-col gap-4">
        <div className="flex items-start gap-5">
          <span
            className={`font-display text-6xl leading-none tracking-wide ${numberTone}`}
            aria-hidden
          >
            {numberLabel}
          </span>
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-4xl leading-tight tracking-wide text-white sm:text-5xl">
              {mod.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <TierBadge tier={mod.tier} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                {mod.lessons.length} lesson
                {mod.lessons.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>
        <p className="max-w-3xl text-base text-white/70">{mod.description}</p>
      </header>

      <section className="rounded-xl bg-card p-5">
        <ModuleProgress
          lessonIds={mod.lessons.map((l) => l.id)}
          label="Module Progress"
        />
      </section>

      <section>
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
          Plays in this Module
        </h2>
        <ol className="flex flex-col gap-2">
          {mod.lessons.map((lesson, i) => (
            <li key={lesson.id}>
              <Link
                href={`/training/${mod.slug}/${lesson.slug}`}
                className="flex items-center gap-4 rounded-xl bg-card px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:ring-1 hover:ring-gold/30"
              >
                <LessonStatus lessonId={lesson.id} />
                <span className="font-display w-8 text-sm tracking-wide text-white/40 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base tracking-wide text-white">
                    {lesson.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {lesson.description}
                  </p>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                  {lesson.durationMin} min
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

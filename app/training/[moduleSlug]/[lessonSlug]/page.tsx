import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { findLesson, MODULES } from "@/content/modules";
import { getCurrentUser, hasTierAccess } from "@/lib/mock-user";
import LoomEmbed from "@/components/LoomEmbed";
import MarkCompleteButton from "@/components/MarkCompleteButton";

export function generateStaticParams() {
  return MODULES.flatMap((m) =>
    m.lessons.map((l) => ({ moduleSlug: m.slug, lessonSlug: l.slug }))
  );
}

type Params = { moduleSlug: string; lessonSlug: string };

export default function LessonPage({ params }: { params: Params }) {
  const found = findLesson(params.moduleSlug, params.lessonSlug);
  if (!found) return notFound();
  const { mod, lesson } = found;

  const user = getCurrentUser();
  if (!hasTierAccess(user.tier, mod.tier)) {
    redirect("/training");
  }

  const index = mod.lessons.findIndex((l) => l.id === lesson.id);
  const prev = index > 0 ? mod.lessons[index - 1] : null;
  const next =
    index < mod.lessons.length - 1 ? mod.lessons[index + 1] : null;

  return (
    <div className="flex flex-col gap-8">
      <nav className="text-xs uppercase tracking-[0.18em] text-muted">
        <Link href="/training" className="hover:text-white">
          The Playbook
        </Link>
        <span className="mx-2 text-white/30">/</span>
        <Link href={`/training/${mod.slug}`} className="hover:text-white">
          {mod.title}
        </Link>
        <span className="mx-2 text-white/30">/</span>
        <span className="text-white/80">{lesson.title}</span>
      </nav>

      <LoomEmbed shareUrl={lesson.loomUrl} title={lesson.title} />

      <header className="flex flex-col gap-3">
        <h1 className="mt-2 font-display text-4xl leading-tight tracking-wide text-white sm:text-5xl">
          {lesson.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            {lesson.durationMin} min
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Module · {mod.title}
          </span>
        </div>
        <p className="mt-2 max-w-3xl text-base text-white/80">
          {lesson.description}
        </p>
      </header>

      <hr className="border-white/10" />

      <MarkCompleteButton lessonId={lesson.id} moduleId={mod.id} />

      <div className="flex items-stretch justify-between gap-3 pt-2">
        {prev ? (
          <Link
            href={`/training/${mod.slug}/${prev.slug}`}
            className="group flex flex-1 flex-col rounded-xl bg-card px-5 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:ring-1 hover:ring-gold/30 sm:flex-initial sm:min-w-[14rem]"
          >
            <span className="font-display text-sm tracking-[0.18em] text-gold">
              ← Prev Play
            </span>
            <span className="mt-1 truncate text-sm text-white/70 group-hover:text-white">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span aria-hidden />
        )}
        {next ? (
          <Link
            href={`/training/${mod.slug}/${next.slug}`}
            className="group flex flex-1 flex-col rounded-xl bg-card px-5 py-4 text-right transition-all duration-200 hover:-translate-y-0.5 hover:ring-1 hover:ring-gold/30 sm:flex-initial sm:min-w-[14rem]"
          >
            <span className="font-display text-sm tracking-[0.18em] text-gold">
              Next Play →
            </span>
            <span className="mt-1 truncate text-sm text-white/70 group-hover:text-white">
              {next.title}
            </span>
          </Link>
        ) : (
          <span aria-hidden />
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MODULES } from "@/content/modules";
import { getCurrentProfile, hasTierAccess } from "@/lib/auth";
import { resolveLesson } from "@/lib/content";
import VideoEmbed from "@/components/VideoEmbed";
import MarkCompleteButton from "@/components/MarkCompleteButton";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";

export function generateStaticParams() {
  return MODULES.flatMap((m) =>
    m.lessons.map((l) => ({ moduleSlug: m.slug, lessonSlug: l.slug }))
  );
}

type Params = { moduleSlug: string; lessonSlug: string };

export default async function LessonPage({ params }: { params: Params }) {
  const resolved = await resolveLesson(params.moduleSlug, params.lessonSlug);
  if (!resolved) return notFound();

  const user = await getCurrentProfile();
  const mod = MODULES.find((m) => m.slug === params.moduleSlug)!;
  if (!hasTierAccess(user.tier, mod.tier)) redirect("/training");

  const index = mod.lessons.findIndex((l) => l.id === resolved.id);
  const prev = index > 0 ? mod.lessons[index - 1] : null;
  const next = index < mod.lessons.length - 1 ? mod.lessons[index + 1] : null;

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <nav className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
        <Link href="/training" className="hover:text-teal transition-colors">
          The Playbook
        </Link>
        <span className="mx-2 text-white/30">/</span>
        <Link href={`/training/${mod.slug}`} className="hover:text-teal transition-colors">
          {mod.title}
        </Link>
        <span className="mx-2 text-white/30">/</span>
        <span className="text-white/80">{resolved.title}</span>
      </nav>

      <VideoEmbed url={resolved.videoUrl} title={resolved.title} />

      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="pill pill-warn">
            <Clock className="h-3 w-3" strokeWidth={2} />
            {resolved.durationMin} min
          </span>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Module · {mod.title}
          </span>
          {resolved.hasOverride && (
            <span className="pill pill-info">Override</span>
          )}
        </div>
        <h1 className="font-display text-4xl leading-tight tracking-wide text-white sm:text-5xl">
          {resolved.title}
        </h1>
        <p className="max-w-3xl text-base text-white/70 leading-relaxed">
          {resolved.description}
        </p>
      </header>

      <hr className="border-white/5" />

      <MarkCompleteButton lessonId={resolved.id} moduleId={mod.id} />

      <div className="grid gap-3 sm:grid-cols-2 pt-2">
        {prev ? (
          <Link
            href={`/training/${mod.slug}/${prev.slug}`}
            data-testid="lesson-nav-prev"
            className="group flex items-center gap-3 rounded-sm border border-white/5 bg-card px-5 py-4 transition-all hover:-translate-y-0.5 hover:border-teal/40"
          >
            <ChevronLeft className="h-5 w-5 text-gold" strokeWidth={1.75} />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">Prev Play</p>
              <p className="mt-0.5 truncate text-sm text-white/80 group-hover:text-white">{prev.title}</p>
            </div>
          </Link>
        ) : <span aria-hidden />}
        {next ? (
          <Link
            href={`/training/${mod.slug}/${next.slug}`}
            data-testid="lesson-nav-next"
            className="group flex items-center justify-end gap-3 rounded-sm border border-white/5 bg-card px-5 py-4 transition-all hover:-translate-y-0.5 hover:border-teal/40"
          >
            <div className="min-w-0 flex-1 text-right">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">Next Play</p>
              <p className="mt-0.5 truncate text-sm text-white/80 group-hover:text-white">{next.title}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gold" strokeWidth={1.75} />
          </Link>
        ) : <span aria-hidden />}
      </div>
    </div>
  );
}

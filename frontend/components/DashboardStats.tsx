"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCompletedLessons } from "@/lib/progress";
import { ArrowRight } from "lucide-react";

type LessonRef = { id: string; slug: string; title: string };
type ModuleRef = { id: string; slug: string; title: string; lessons: LessonRef[] };
type Props = { modules: ModuleRef[] };

function computeState(modules: ModuleRef[], doneSet: Set<string>) {
  const allLessons = modules.flatMap((m) =>
    m.lessons.map((l) => ({ mod: m, lesson: l }))
  );
  const completedCount = allLessons.filter(({ lesson }) => doneSet.has(lesson.id)).length;
  const total = allLessons.length;
  const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  const nextEntry = allLessons.find(({ lesson }) => !doneSet.has(lesson.id));
  const currentMod = nextEntry?.mod ?? modules[modules.length - 1] ?? null;
  return { completedCount, total, pct, nextEntry, currentMod };
}

export default function DashboardStats({ modules }: Props) {
  const [doneSet, setDoneSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sync = () => setDoneSet(new Set(getCompletedLessons()));
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const { completedCount, total, pct, nextEntry, currentMod } = useMemo(
    () => computeState(modules, doneSet),
    [modules, doneSet]
  );

  return (
    <div className="grid gap-px bg-white/5 sm:grid-cols-12">
      {/* Big stat — Lessons complete (jersey number style) */}
      <div className="sm:col-span-4 relative overflow-hidden bg-surface p-8 animate-fade-up" data-testid="stat-lessons-complete">
        <span className="jersey-number">{completedCount.toString().padStart(2, "0")}</span>
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold mb-3">Plays Run</p>
        <p className="font-display text-7xl leading-none tracking-wide text-gold">{completedCount}</p>
        <p className="mt-3 text-xs text-white/50">of {total} in your tier</p>
      </div>

      {/* Current module */}
      <div className="sm:col-span-5 bg-surface p-8 animate-fade-up" style={{ animationDelay: "80ms" }} data-testid="stat-current-module">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-teal mb-3">Current Module</p>
        <h3 className="font-display text-3xl leading-tight tracking-wide text-white">
          {currentMod?.title ?? "—"}
        </h3>
        <p className="mt-3 text-xs text-white/50">
          {nextEntry ? `Next: ${nextEntry.lesson.title}` : "All caught up."}
        </p>
      </div>

      {/* Progress % */}
      <div className="sm:col-span-3 relative overflow-hidden bg-surface p-8 animate-fade-up" style={{ animationDelay: "160ms" }} data-testid="stat-overall-progress">
        <span className="jersey-number">{pct}</span>
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold mb-3">Progress</p>
        <p className="font-display text-7xl leading-none tracking-wide text-gold tabular-nums">{pct}<span className="text-3xl ml-1 text-gold/60">%</span></p>
        <div className="mt-4 h-1 w-full overflow-hidden bg-white/10">
          <div className="h-full bg-teal transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Next play CTA (full width) */}
      <div className="sm:col-span-12 bg-card p-8 relative overflow-hidden animate-fade-up" style={{ animationDelay: "240ms" }} data-testid="next-play-card">
        <span className="jersey-number">→</span>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold mb-2">Next Play</p>
            {nextEntry ? (
              <>
                <h3 className="font-display text-3xl leading-tight tracking-wide text-white">
                  {nextEntry.lesson.title}
                </h3>
                <p className="mt-1.5 text-sm text-white/60">{nextEntry.mod.title}</p>
              </>
            ) : (
              <>
                <h3 className="font-display text-3xl tracking-wide text-white">You&apos;re all caught up.</h3>
                <p className="mt-1.5 text-sm text-white/60">Every lesson in your tier is complete.</p>
              </>
            )}
          </div>
          {nextEntry && (
            <Link
              href={`/training/${nextEntry.mod.slug}/${nextEntry.lesson.slug}`}
              data-testid="run-the-play-button"
              className="group inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-6 py-3.5 font-display text-base tracking-wide text-black transition-all hover:bg-amber-400 hover:shadow-glow-gold"
            >
              Run the Play
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
            </Link>
          )}
        </div>
      </div>

      <p className="sr-only">{completedCount} of {total} lessons complete.</p>
    </div>
  );
}

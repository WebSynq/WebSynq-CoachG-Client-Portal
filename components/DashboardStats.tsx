"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCompletedLessons } from "@/lib/progress";

type LessonRef = {
  id: string;
  slug: string;
  title: string;
};

type ModuleRef = {
  id: string;
  slug: string;
  title: string;
  lessons: LessonRef[];
};

type Props = {
  modules: ModuleRef[];
};

function computeState(modules: ModuleRef[], doneSet: Set<string>) {
  const allLessons = modules.flatMap((m) =>
    m.lessons.map((l) => ({ mod: m, lesson: l }))
  );
  const completedCount = allLessons.filter(({ lesson }) =>
    doneSet.has(lesson.id)
  ).length;
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

  const stats: { value: string; label: string; tone: "gold" | "teal" }[] = [
    {
      value: String(completedCount),
      label: "Lessons Complete",
      tone: "gold",
    },
    {
      value: currentMod ? currentMod.title : "—",
      label: "Current Module",
      tone: "teal",
    },
    {
      value: `${pct}%`,
      label: "Overall Progress",
      tone: "gold",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="animate-fade-up rounded-lg border-l-[3px] border-gold bg-card p-6 opacity-0"
            style={{ animationDelay: `${(i + 1) * 100}ms` }}
          >
            <p
              className={`font-display tracking-wide ${
                s.tone === "gold" ? "text-gold" : "text-teal"
              } ${s.label === "Current Module" ? "text-2xl leading-tight" : "text-4xl"}`}
            >
              {s.value}
            </p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* NEXT PLAY card */}
      <div
        className="animate-fade-up flex flex-col gap-4 rounded-lg border-l-[3px] border-gold bg-card p-6 opacity-0 sm:flex-row sm:items-center sm:justify-between"
        style={{ animationDelay: "400ms" }}
      >
        <div className="min-w-0">
          <p className="font-display text-xs tracking-[0.22em] text-gold">
            Next Play
          </p>
          {nextEntry ? (
            <>
              <h3 className="mt-1 font-display text-2xl tracking-wide text-white">
                {nextEntry.lesson.title}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {nextEntry.mod.title}
              </p>
            </>
          ) : (
            <>
              <h3 className="mt-1 font-display text-2xl tracking-wide text-white">
                You&apos;re all caught up.
              </h3>
              <p className="mt-1 text-sm text-muted">
                Every lesson in your tier is complete.
              </p>
            </>
          )}
        </div>
        {nextEntry && (
          <Link
            href={`/training/${nextEntry.mod.slug}/${nextEntry.lesson.slug}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-5 py-3 font-display text-sm tracking-wide text-black transition hover:bg-amber-400"
          >
            Run the Play
            <span aria-hidden>→</span>
          </Link>
        )}
      </div>

      {/* Stats footer line for screen readers / data parity */}
      <p className="sr-only">
        {completedCount} of {total} lessons complete.
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCompletedLessons } from "@/lib/progress";

type Props = {
  index: number;
  slug: string;
  title: string;
  description: string;
  lessonIds: string[];
  tierLabel: string;
  unlocked: boolean;
};

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function ModuleCard({
  index,
  slug,
  title,
  description,
  lessonIds,
  tierLabel,
  unlocked,
}: Props) {
  const [doneSet, setDoneSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sync = () => setDoneSet(new Set(getCompletedLessons()));
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const { completed, pct } = useMemo(() => {
    const c = lessonIds.filter((id) => doneSet.has(id)).length;
    return {
      completed: c,
      pct: lessonIds.length === 0 ? 0 : Math.round((c / lessonIds.length) * 100),
    };
  }, [lessonIds, doneSet]);

  const numberLabel = String(index + 1).padStart(2, "0");
  const numberTone = index % 2 === 0 ? "text-gold/20" : "text-teal/20";

  const cardClasses = `relative flex flex-col gap-5 rounded-xl bg-card p-6 transition-all duration-200 ${
    unlocked
      ? "hover:-translate-y-0.5 hover:ring-1 hover:ring-gold/30"
      : "opacity-50"
  }`;

  const body = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span
          className={`font-display text-5xl leading-none tracking-wide ${numberTone}`}
          aria-hidden
        >
          {numberLabel}
        </span>
        {unlocked ? (
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            {tierLabel}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
            <LockIcon />
            {tierLabel}
          </span>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-display text-xl tracking-wide text-white">
          {title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{description}</p>
      </div>

      {unlocked ? (
        <div>
          <div className="mb-2 flex items-baseline justify-between text-[11px] uppercase tracking-[0.18em] text-muted">
            <span>
              {lessonIds.length} Lesson{lessonIds.length === 1 ? "" : "s"}
            </span>
            <span className="tabular-nums">
              {completed} / {lessonIds.length} · {pct}%
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-teal transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="inline-flex w-fit items-center gap-2 rounded-md border border-gold/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
          <LockIcon />
          Upgrade to Unlock
        </div>
      )}
    </>
  );

  if (!unlocked) {
    return (
      <div className={cardClasses} aria-disabled>
        {body}
      </div>
    );
  }

  return (
    <Link href={`/training/${slug}`} className={cardClasses}>
      {body}
    </Link>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getCompletedLessons } from "@/lib/progress";

type Props = {
  lessonIds: string[];
  label?: string;
};

const CIRCUMFERENCE = 251.2;
const RADIUS = 40;
const STROKE = 6;

export default function ProgressRing({ lessonIds, label }: Props) {
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    const recalc = () => {
      const done = new Set(getCompletedLessons());
      setCompleted(lessonIds.filter((id) => done.has(id)).length);
    };
    recalc();
    window.addEventListener("storage", recalc);
    return () => window.removeEventListener("storage", recalc);
  }, [lessonIds]);

  const pct = lessonIds.length === 0
    ? 0
    : Math.round((completed / lessonIds.length) * 100);
  const offset = CIRCUMFERENCE * (1 - pct / 100);

  const size = (RADIUS + STROKE) * 2;
  const center = size / 2;

  return (
    <div
      className="flex flex-col items-center gap-3"
      role="img"
      aria-label={
        label
          ? `${label}: ${pct} percent complete`
          : `${pct} percent complete`
      }
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle
            cx={center}
            cy={center}
            r={RADIUS}
            stroke="currentColor"
            strokeWidth={STROKE}
            fill="none"
            className="text-white/10"
          />
          <circle
            cx={center}
            cy={center}
            r={RADIUS}
            stroke="currentColor"
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="text-teal transition-[stroke-dashoffset] duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl tracking-wide text-white">
            {pct}%
          </span>
        </div>
      </div>
      {label && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
          {label}
        </p>
      )}
    </div>
  );
}

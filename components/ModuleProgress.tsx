"use client";

import { useEffect, useState } from "react";
import { getCompletedLessons } from "@/lib/progress";
import ProgressBar from "./ProgressBar";

export default function ModuleProgress({
  lessonIds,
  label,
}: {
  lessonIds: string[];
  label?: string;
}) {
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    const done = new Set(getCompletedLessons());
    setCompleted(lessonIds.filter((id) => done.has(id)).length);
    const onStorage = () => {
      const next = new Set(getCompletedLessons());
      setCompleted(lessonIds.filter((id) => next.has(id)).length);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [lessonIds]);

  return (
    <ProgressBar
      completed={completed}
      total={lessonIds.length}
      label={label}
    />
  );
}

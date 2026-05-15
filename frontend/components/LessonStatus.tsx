"use client";

import { useEffect, useState } from "react";
import { isLessonComplete } from "@/lib/progress";

export default function LessonStatus({ lessonId }: { lessonId: string }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(isLessonComplete(lessonId));
    const onStorage = () => setDone(isLessonComplete(lessonId));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [lessonId]);

  if (!done) {
    return (
      <span className="inline-block h-4 w-4 rounded-full border border-white/25" />
    );
  }
  return (
    <span
      className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-success text-[10px] font-bold text-black"
      aria-label="Completed"
    >
      ✓
    </span>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  isLessonComplete,
  markLessonComplete,
  unmarkLessonComplete,
} from "@/lib/progress";

type Props = {
  lessonId: string;
  moduleId: string;
};

export default function MarkCompleteButton({ lessonId, moduleId }: Props) {
  const [done, setDone] = useState(false);
  const [posting, setPosting] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    setDone(isLessonComplete(lessonId));
  }, [lessonId]);

  async function toggle() {
    setPosting(true);
    try {
      if (done) {
        unmarkLessonComplete(lessonId);
        setDone(false);
      } else {
        markLessonComplete(lessonId);
        setDone(true);
        setPulseKey((k) => k + 1);
        try {
          await fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lessonId, moduleId }),
          });
        } catch {
          // Local state is the source of truth in stub mode.
        }
      }
      try {
        window.dispatchEvent(new StorageEvent("storage"));
      } catch {
        // Some browsers reject synthetic StorageEvents — non-fatal.
      }
    } finally {
      setPosting(false);
    }
  }

  const baseClasses =
    "w-full rounded-xl py-4 font-display text-xl tracking-wide transition-colors disabled:opacity-60";
  const stateClasses = done
    ? "bg-success text-black hover:bg-lime-400"
    : "bg-gold text-black hover:bg-amber-400";

  return (
    <button
      key={pulseKey}
      type="button"
      onClick={toggle}
      disabled={posting}
      className={`${baseClasses} ${stateClasses} ${
        done && pulseKey > 0 ? "animate-complete-pulse" : ""
      }`}
    >
      {done
        ? "✓ Play Complete"
        : posting
        ? "Saving…"
        : "Mark as Complete"}
    </button>
  );
}

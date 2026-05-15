"use client";

import { useEffect, useState } from "react";
import { getCompletedLessons } from "@/lib/progress";
import ProgressBar from "./ProgressBar";

export default function OverallProgress({
  totalLessons,
  label,
}: {
  totalLessons: number;
  label?: string;
}) {
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    setCompleted(getCompletedLessons().length);
    const onStorage = () => setCompleted(getCompletedLessons().length);
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <ProgressBar completed={completed} total={totalLessons} label={label} />
  );
}

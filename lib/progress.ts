// TODO: replace with Supabase-backed progress + GHL sync once connected.
// Client-only localStorage helpers. Calling these on the server is a no-op.

const STORAGE_KEY = "coachg-progress";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readSet(): Set<string> {
  if (!isBrowser()) return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((v): v is string => typeof v === "string"));
  } catch {
    return new Set();
  }
}

function writeSet(set: Set<string>) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export function getCompletedLessons(): string[] {
  return [...readSet()];
}

export function isLessonComplete(lessonId: string): boolean {
  return readSet().has(lessonId);
}

export function markLessonComplete(lessonId: string): void {
  const set = readSet();
  set.add(lessonId);
  writeSet(set);
}

export function unmarkLessonComplete(lessonId: string): void {
  const set = readSet();
  set.delete(lessonId);
  writeSet(set);
}

export function clearProgress(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

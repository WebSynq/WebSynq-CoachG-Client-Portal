// Aggregates the per-tier curriculum files into the single MODULES array
// the rest of the app imports from. Edit lessons in foundation.ts / growth.ts
// / domination.ts — they pull through here automatically.

import type { Tier } from "@/lib/mock-user";
import { FOUNDATION_MODULES } from "./foundation";
import { GROWTH_MODULES } from "./growth";
import { DOMINATION_MODULES } from "./domination";
import type { Lesson, Module } from "./types";

export type { Lesson, Module };

export const MODULES: Module[] = [
  ...FOUNDATION_MODULES,
  ...GROWTH_MODULES,
  ...DOMINATION_MODULES,
];

const TIER_RANK: Record<Tier, number> = {
  foundation: 1,
  growth: 2,
  domination: 3,
};

export function modulesForTier(tier: Tier): Module[] {
  return MODULES.filter((m) => TIER_RANK[m.tier] <= TIER_RANK[tier]);
}

export function findModule(moduleSlug: string): Module | undefined {
  return MODULES.find((m) => m.slug === moduleSlug);
}

export function findLesson(
  moduleSlug: string,
  lessonSlug: string
): { mod: Module; lesson: Lesson } | undefined {
  const mod = findModule(moduleSlug);
  if (!mod) return undefined;
  const lesson = mod.lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) return undefined;
  return { mod, lesson };
}

export function allLessons(): Lesson[] {
  return MODULES.flatMap((m) => m.lessons);
}

export function totalLessonCount(): number {
  return allLessons().length;
}

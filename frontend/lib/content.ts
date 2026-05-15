// Resolves the effective lesson data — static content overlaid with any
// admin overrides stored in the lesson_overrides table.

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { findLesson } from "@/content/modules";

export interface ResolvedLesson {
  id: string;
  slug: string;
  title: string;
  description: string;
  videoUrl: string;
  durationMin: number;
  module: { id: string; slug: string; title: string };
  hasOverride: boolean;
}

interface LessonOverride {
  lesson_id: string;
  title: string | null;
  description: string | null;
  video_url: string | null;
}

export async function resolveLesson(
  moduleSlug: string,
  lessonSlug: string
): Promise<ResolvedLesson | null> {
  const found = findLesson(moduleSlug, lessonSlug);
  if (!found) return null;
  const { mod, lesson } = found;

  let override: LessonOverride | null = null;
  const supabase = createClient() || createAdminClient();
  if (supabase) {
    const { data } = await supabase
      .from("lesson_overrides")
      .select("*")
      .eq("lesson_id", lesson.id)
      .maybeSingle();
    override = (data ?? null) as LessonOverride | null;
  }

  return {
    id: lesson.id,
    slug: lesson.slug,
    title: override?.title || lesson.title,
    description: override?.description || lesson.description,
    videoUrl: override?.video_url || lesson.loomUrl,
    durationMin: lesson.durationMin,
    module: { id: mod.id, slug: mod.slug, title: mod.title },
    hasOverride: !!override,
  };
}

export async function getAllOverrides(): Promise<Record<string, LessonOverride>> {
  const supabase = createClient() || createAdminClient();
  if (!supabase) return {};
  const { data } = await supabase.from("lesson_overrides").select("*");
  if (!data) return {};
  return Object.fromEntries((data as LessonOverride[]).map((o) => [o.lesson_id, o]));
}

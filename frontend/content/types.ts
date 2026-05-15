import type { Tier } from "@/lib/mock-user";

export type Lesson = {
  id: string;
  slug: string;
  title: string;
  description: string;
  loomUrl: string;
  durationMin: number;
};

export type Module = {
  id: string;
  slug: string;
  title: string;
  description: string;
  tier: Tier;
  lessons: Lesson[];
};

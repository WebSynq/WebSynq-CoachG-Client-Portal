// Mock user shim kept for backwards-compat with existing components.
// New code should import from "@/lib/auth" instead.

import type { Tier } from "@/lib/database.types";

export type { Tier };

export type MockUser = {
  id: string;
  email: string;
  tier: Tier;
  full_name: string;
};

export const MOCK_USER: MockUser = {
  id: "mock-user",
  email: "preview@coachg.com",
  tier: "domination",
  full_name: "Preview Agent",
};

export function getCurrentUser(): MockUser {
  return MOCK_USER;
}

const TIER_RANK: Record<Tier, number> = {
  foundation: 1,
  growth: 2,
  domination: 3,
};

export function hasTierAccess(userTier: Tier, requiredTier: Tier): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[requiredTier];
}

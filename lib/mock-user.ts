// TODO: replace with Supabase-backed profile fetch once the project is created.
// This mock stands in for the authenticated user + their profile row.

export type Tier = "foundation" | "growth" | "domination";

export type MockUser = {
  id: string;
  email: string;
  tier: Tier;
  full_name: string;
};

export const MOCK_USER: MockUser = {
  id: "mock-user",
  email: "agent@test.com",
  tier: "domination",
  full_name: "Test Agent",
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

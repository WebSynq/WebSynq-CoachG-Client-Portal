// Real Supabase-backed user/profile fetch with a preview-mode fallback.
// When Supabase env vars are unset, we return a mock "Domination" user so
// the UI is still navigable in Emergent preview before credentials are wired.

import { createClient } from "@/lib/supabase/server";
import type { Profile, Tier } from "@/lib/database.types";

const MOCK_USER: Profile = {
  id: "mock-user",
  email: "preview@coachg.com",
  full_name: "Preview Mode",
  tier: "domination",
  is_admin: true, // mock admin so preview can browse /admin
  ghl_contact_id: null,
  ghl_sub_account_id: null,
  last_seen: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export async function getCurrentProfile(): Promise<Profile> {
  const supabase = createClient();
  if (!supabase) return MOCK_USER;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return MOCK_USER;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    // First login — auto-create a foundation profile.
    const newProfile = {
      id: user.id,
      email: user.email ?? "",
      full_name: user.user_metadata?.full_name ?? null,
      tier: "foundation" as Tier,
      is_admin: false,
    };
    await supabase.from("profiles").insert(newProfile);
    return { ...MOCK_USER, ...newProfile } as Profile;
  }

  return profile as Profile;
}

const TIER_RANK: Record<Tier, number> = {
  foundation: 1,
  growth: 2,
  domination: 3,
};

export function hasTierAccess(userTier: Tier, requiredTier: Tier): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[requiredTier];
}

export type { Profile, Tier };

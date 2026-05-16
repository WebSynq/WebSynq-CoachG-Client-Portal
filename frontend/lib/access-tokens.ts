import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";

/** Generate a high-entropy URL-safe token (~256 bits). */
export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Look up a profile by its portal_access_token. Returns null on miss. */
export async function findProfileByToken(token: string) {
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from("profiles")
    .select("id, email, full_name, tier, is_admin, portal_access_token")
    .eq("portal_access_token", token)
    .maybeSingle();
  return data;
}

/** Rotate (or create) the portal_access_token for a given profile id. */
export async function rotateToken(profileId: string): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) return null;
  const token = newToken();
  const { error } = await admin
    .from("profiles")
    .update({ portal_access_token: token })
    .eq("id", profileId);
  if (error) return null;
  return token;
}

/** Build the portal access URL clients will click from GHL. */
export function buildAccessUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
               "http://localhost:3000";
  return `${base}/enter?token=${token}`;
}

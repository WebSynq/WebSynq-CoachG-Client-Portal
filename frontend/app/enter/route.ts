// /enter?token=xxx — one-shot auto-login from a GHL deep link.
//
// 1. Validate the portal_access_token against profiles.
// 2. Use Supabase admin.generateLink to mint a fresh magic-link.
// 3. Redirect the browser to that link — Supabase verifies it and bounces
//    back to our /auth/callback which sets the session cookies.
//
// Net effect: client clicks "Enter the Coach's Office" from a GHL email
// and lands on /dashboard already authenticated, no email entry required.

import { NextResponse, type NextRequest } from "next/server";
import { findProfileByToken } from "@/lib/access-tokens";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");
  const redirect = searchParams.get("redirect") || "/dashboard";

  if (!token) {
    return NextResponse.redirect(`${origin}/login?error=missing_token`);
  }

  const profile = await findProfileByToken(token);
  if (!profile) {
    return NextResponse.redirect(`${origin}/login?error=invalid_token`);
  }

  const admin = createAdminClient();
  if (!admin) {
    // No Supabase configured. Bail to login with a helpful flag.
    return NextResponse.redirect(`${origin}/login?error=not_configured`);
  }

  // Mint a one-shot magic link for this user. emailRedirectTo lands them at
  // our /auth/callback which exchanges the code for a session.
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: profile.email,
    options: { redirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirect)}` },
  });

  if (error || !data?.properties?.action_link) {
    return NextResponse.redirect(`${origin}/login?error=link_generation_failed`);
  }

  // Update last_seen
  await admin.from("profiles").update({ last_seen: new Date().toISOString() }).eq("id", profile.id);

  // Bounce the browser through Supabase's verify endpoint → /auth/callback → /dashboard
  return NextResponse.redirect(data.properties.action_link);
}

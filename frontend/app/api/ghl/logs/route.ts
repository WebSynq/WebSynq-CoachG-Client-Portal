import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ logs: [] });
  const { data } = await admin
    .from("ghl_sync_log").select("*")
    .order("created_at", { ascending: false }).limit(20);
  return NextResponse.json({ logs: data ?? [] });
}

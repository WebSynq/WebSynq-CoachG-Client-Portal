import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/training", "/resources"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // TODO: re-enable when Supabase is connected.
  // While Supabase env vars are placeholders we skip session lookup
  // (calling auth.getUser() against a fake URL would throw at request time)
  // and let every request through. PROTECTED_PREFIXES is retained for when
  // we re-enable: it documents the routes that will require auth.
  void PROTECTED_PREFIXES;
  void supabase;

  return response;
}

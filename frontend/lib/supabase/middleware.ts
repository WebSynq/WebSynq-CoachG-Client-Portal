import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require any authenticated user
const PROTECTED_PREFIXES = ["/dashboard", "/training", "/resources", "/account"];
// Routes that require admin role
const ADMIN_PREFIXES = ["/admin"];

function isMatch(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Preview / stub mode: Supabase not configured yet. Let every request through.
  // This lets us preview UI in Emergent before the project's credentials are
  // populated. In production on Vercel these env vars MUST be set, otherwise
  // there is no auth and the portal is open.
  if (!supabaseUrl || !supabaseAnon) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnon, {
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
  });

  // Refresh the session and read the user.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const needsAuth = isMatch(pathname, PROTECTED_PREFIXES);
  const needsAdmin = isMatch(pathname, ADMIN_PREFIXES);

  if ((needsAuth || needsAdmin) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (needsAdmin && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.is_admin) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("forbidden", "1");
      return NextResponse.redirect(url);
    }
  }

  return response;
}

import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentProfile();

  // Block non-admins. In preview mode the mock user is admin so this passes.
  if (!user.is_admin) {
    redirect("/dashboard?forbidden=1");
  }

  return (
    <>
      <AdminSidebar user={user} />
      <div className="relative z-10 min-h-screen lg:pl-60">
        {/* War-room header strip */}
        <div className="sticky top-0 z-20 border-b border-white/5 bg-bg/80 backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-3 lg:px-10">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-2 w-2 animate-subtle-pulse rounded-full bg-danger" />
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-danger">
                Admin Mode · Live
              </p>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted hidden sm:block">
              Authenticated as <span className="text-white">{user.email}</span>
            </p>
          </div>
        </div>
        <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </>
  );
}

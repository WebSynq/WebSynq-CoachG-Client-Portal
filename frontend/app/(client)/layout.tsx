import { getCurrentProfile } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentProfile();

  return (
    <>
      <Sidebar user={user} />
      <div className="relative z-10 min-h-screen lg:pl-64">
        <main className="mx-auto max-w-6xl px-5 py-8 lg:px-10 lg:py-12">
          {children}
        </main>
      </div>
    </>
  );
}

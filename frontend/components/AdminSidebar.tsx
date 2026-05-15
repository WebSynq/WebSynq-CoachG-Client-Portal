"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Users,
  BookOpen,
  Folder,
  RefreshCw,
  LogOut,
  Crosshair,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/database.types";

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview", icon: Activity, exact: true },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/content", label: "Content", icon: BookOpen },
  { href: "/admin/documents", label: "Documents", icon: Folder },
  { href: "/admin/ghl", label: "GHL Sync", icon: RefreshCw },
];

async function signOut() {
  const supabase = createClient();
  if (supabase) await supabase.auth.signOut();
  if (typeof window !== "undefined") window.location.href = "/login";
}

export default function AdminSidebar({ user }: { user: Profile }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-white/5 lg:bg-surface">
      <div className="flex items-center gap-2 px-5 pt-6 pb-5 border-b border-white/5">
        <Crosshair className="h-5 w-5 text-danger" strokeWidth={1.75} />
        <div className="leading-none">
          <p className="font-display text-lg tracking-wide text-white">WAR ROOM</p>
          <p className="text-[9px] font-mono uppercase tracking-[0.28em] text-muted mt-0.5">
            Admin Console
          </p>
        </div>
      </div>

      <nav className="flex-1 px-2 pt-4">
        <ul className="flex flex-col gap-px">
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href, link.exact);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  data-testid={`admin-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`flex items-center gap-3 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] transition-colors ${
                    active
                      ? "bg-card text-danger border-l-2 border-danger pl-[14px]"
                      : "text-white/50 hover:text-white hover:bg-card border-l-2 border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/5 px-4 py-4">
        <Link
          href="/dashboard"
          data-testid="admin-exit-link"
          className="flex items-center gap-2 px-3 py-2 mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-teal hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={2} />
          Back to Portal
        </Link>
        <p className="px-3 text-[10px] font-mono text-muted truncate" title={user.email}>
          {user.email}
        </p>
        <button
          type="button"
          onClick={signOut}
          data-testid="admin-logout-button"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-sm border border-white/10 py-2 text-[10px] font-mono uppercase tracking-[0.18em] text-white/50 hover:border-danger/60 hover:text-danger transition-colors"
        >
          <LogOut className="h-3 w-3" strokeWidth={2} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

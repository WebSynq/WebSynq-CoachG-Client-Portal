"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Folder,
  Settings,
  LogOut,
  Menu,
  X,
  Trophy,
} from "lucide-react";
import TierLadder from "./TierLadder";
import type { Profile, Tier } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/training", label: "The Playbook", icon: BookOpen },
  { href: "/resources", label: "Field Guide", icon: Folder },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

async function signOut() {
  const supabase = createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  if (typeof window !== "undefined") window.location.href = "/login";
}

function SidebarBody({
  onNavigate,
  user,
}: {
  onNavigate?: () => void;
  user: Profile;
}) {
  const pathname = usePathname();
  const tier = user.tier as Tier;

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="px-6 pt-7 pb-6 border-b border-white/5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="block leading-none group"
          data-testid="sidebar-logo"
        >
          <span className="block font-display text-3xl tracking-wide text-gold group-hover:text-amber-400 transition-colors">
            COACHG
          </span>
          <span className="mt-1 block text-[10px] font-mono font-semibold uppercase tracking-[0.28em] text-ink-dim">
            The Coach&apos;s Office
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 pt-5">
        <p className="px-4 pb-2 text-[10px] font-mono font-semibold uppercase tracking-[0.28em] text-muted">
          Field
        </p>
        <ul className="flex flex-col gap-0.5">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onNavigate}
                  data-testid={`sidebar-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`flex items-center gap-3 border-l-2 px-4 py-3 text-sm transition-all duration-200 ${
                    active
                      ? "border-teal bg-card font-semibold text-teal"
                      : "border-transparent text-white/60 hover:bg-card hover:text-white hover:translate-x-0.5"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {user.is_admin && (
          <>
            <p className="px-4 pt-6 pb-2 text-[10px] font-mono font-semibold uppercase tracking-[0.28em] text-muted">
              Coach Tools
            </p>
            <ul className="flex flex-col gap-0.5">
              <li>
                <Link
                  href="/admin"
                  onClick={onNavigate}
                  data-testid="sidebar-link-admin"
                  className={`flex items-center gap-3 border-l-2 px-4 py-3 text-sm transition-all duration-200 ${
                    pathname.startsWith("/admin")
                      ? "border-gold bg-card font-semibold text-gold"
                      : "border-transparent text-white/60 hover:bg-card hover:text-white"
                  }`}
                >
                  <Settings className="h-4 w-4" strokeWidth={1.75} />
                  War Room
                </Link>
              </li>
            </ul>
          </>
        )}
      </nav>

      <div className="px-6 py-5 border-t border-white/5">
        <TierLadder currentTier={tier} />
      </div>

      <div className="border-t border-white/5 px-6 py-4">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card text-gold">
            <Trophy className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white" title={user.full_name ?? user.email}>
              {user.full_name ?? user.email.split("@")[0]}
            </p>
            <p className="truncate text-[10px] font-mono text-muted" title={user.email}>
              {user.email}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          data-testid="sidebar-logout-button"
          className="flex w-full items-center justify-center gap-2 rounded-sm border border-white/10 py-2 text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-white/60 transition-colors hover:border-gold/50 hover:text-gold"
        >
          <LogOut className="h-3 w-3" strokeWidth={2} />
          Log Out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ user }: { user: Profile }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-surface px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="block leading-none" data-testid="mobile-logo">
          <span className="block font-display text-xl tracking-wide text-gold">
            COACHG
          </span>
          <span className="mt-0.5 block text-[9px] font-mono font-semibold uppercase tracking-[0.28em] text-ink-dim">
            The Coach&apos;s Office
          </span>
        </Link>
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="rounded-sm border border-white/10 p-2 text-white/80 hover:bg-card"
          data-testid="mobile-menu-button"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-72 shadow-xl">
            <div className="flex items-center justify-end px-3 py-3 bg-surface">
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="rounded-sm border border-white/10 p-2 text-white/80 hover:bg-card"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <SidebarBody onNavigate={() => setOpen(false)} user={user} />
          </aside>
        </div>
      )}

      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-white/5">
        <SidebarBody user={user} />
      </aside>
    </>
  );
}

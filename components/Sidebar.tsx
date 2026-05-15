"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { getCurrentUser } from "@/lib/mock-user";
import TierLadder from "./TierLadder";

const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/training", label: "The Playbook" },
  { href: "/resources", label: "Field Guide" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = getCurrentUser();

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="px-6 pt-7 pb-8">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="block leading-none"
        >
          <span className="block font-display text-3xl tracking-wide text-gold">
            COACHG
          </span>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">
            Revenue OS
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3">
        <ul className="flex flex-col gap-0.5">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onNavigate}
                  className={`flex items-center border-l-2 px-4 py-3 text-sm transition-colors ${
                    active
                      ? "border-teal bg-card font-semibold text-teal"
                      : "border-transparent text-white/70 hover:bg-card hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-6 py-6">
        <TierLadder currentTier={user.tier} />
      </div>

      <div className="border-t border-white/5 px-6 py-5">
        <p className="truncate text-xs text-muted" title={user.email}>
          {user.email}
        </p>
        <button
          type="button"
          className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold transition-colors hover:text-amber-400"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-surface px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="block leading-none">
          <span className="block font-display text-xl tracking-wide text-gold">
            COACHG
          </span>
          <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.28em] text-muted">
            Revenue OS
          </span>
        </Link>
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="rounded-md border border-white/10 p-2 text-white/80 hover:bg-card"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 w-72 shadow-xl">
            <div className="flex items-center justify-end px-3 py-3 bg-surface">
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="rounded-md border border-white/10 p-2 text-white/80 hover:bg-card"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <SidebarBody onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-white/5">
        <SidebarBody />
      </aside>
    </>
  );
}

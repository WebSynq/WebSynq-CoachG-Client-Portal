"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";

// Lightweight install prompt that appears the first time a user visits on
// mobile. Respects dismissal (stored in localStorage). On iOS, browsers
// don't fire beforeinstallprompt, so we show instructions instead.

const DISMISS_KEY = "coachg-pwa-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    // Already installed?
    if (window.matchMedia?.("(display-mode: standalone)").matches) return;

    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setIsIos(ios);

    if (ios) {
      // iOS doesn't fire beforeinstallprompt — show our own card
      setShow(true);
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    setShow(false);
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
  }

  async function install() {
    if (!event) return;
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === "accepted") dismiss();
  }

  if (!show) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-sm border border-gold/40 bg-card/95 backdrop-blur-md p-4 shadow-elevated lg:hidden animate-fade-up"
      data-testid="pwa-install-prompt"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-2 top-2 rounded-sm p-1 text-white/40 hover:text-white"
        data-testid="pwa-dismiss-button"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} />
      </button>

      <div className="flex items-start gap-3 pr-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-gold/10 text-gold">
          <Smartphone className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold mb-1">
            Install the App
          </p>
          <p className="text-sm text-white leading-snug">
            Save The Coach&apos;s Office to your home screen for one-tap access.
          </p>

          {isIos ? (
            <p className="mt-2 text-xs text-white/60 leading-relaxed">
              Tap the <strong className="text-white">Share</strong> button in Safari, then choose
              <strong className="text-white"> Add to Home Screen</strong>.
            </p>
          ) : (
            <button
              type="button"
              onClick={install}
              data-testid="pwa-install-button"
              className="mt-3 inline-flex items-center gap-1.5 rounded-sm bg-gold px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-black hover:bg-amber-400 transition-colors"
            >
              <Download className="h-3 w-3" strokeWidth={2.5} /> Install
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

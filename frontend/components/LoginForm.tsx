"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const supabaseReady = !!supabase;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (!supabase) {
      setError("Supabase not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setError(null);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
    });

    if (error) {
      setError(error.message);
      setStatus("error");
      return;
    }
    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <div className="rounded-sm border border-teal/30 bg-teal/5 p-6 text-center" data-testid="login-sent-message">
        <CheckCircle2 className="h-8 w-8 text-teal mx-auto mb-3" strokeWidth={1.75} />
        <p className="font-display text-xl tracking-wide text-white">Check your inbox</p>
        <p className="mt-2 text-xs text-white/60">
          We sent a magic link to <span className="text-white font-mono">{email}</span>.
          Click it to enter the portal.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-ink-dim">
          Email
        </span>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" strokeWidth={1.75} />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@agency.com"
            data-testid="login-email-input"
            className="w-full rounded-sm border border-white/10 bg-surface pl-10 pr-3 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-teal/60 focus:ring-2 focus:ring-teal/20 transition-all"
          />
        </div>
      </label>

      {error && (
        <p className="text-xs text-danger font-mono" data-testid="login-error">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending" || !supabaseReady}
        data-testid="login-submit-button"
        className="flex items-center justify-center gap-2 rounded-sm bg-gold py-3.5 font-display text-base tracking-wide text-black transition-all hover:bg-amber-400 hover:shadow-glow-gold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>Send Magic Link →</>
        )}
      </button>

      {!supabaseReady && (
        <p className="text-[10px] font-mono text-warn">
          ⚠ Preview mode: Supabase not connected. Browse the portal without logging in.
        </p>
      )}
    </form>
  );
}

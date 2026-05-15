// Placeholder login page. Real magic-link flow wires in when Supabase is connected.
// Until then, this page is informational only — the form does not submit.

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 py-16 sm:py-24">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
          Client Sign-In
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-wide text-white">
          Step Inside
        </h1>
        <p className="mt-3 text-sm text-white/70">
          Magic-link sign-in goes live once your Supabase project is
          provisioned. Until then the portal runs in preview mode — no login
          required.
        </p>
      </header>

      <form className="flex flex-col gap-4 rounded-xl bg-card p-6">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
            Email
          </span>
          <input
            type="email"
            placeholder="you@agency.com"
            disabled
            className="rounded-lg border border-white/10 bg-bg px-3 py-2.5 text-sm text-white placeholder:text-white/30 disabled:opacity-60"
          />
        </label>
        <button
          type="submit"
          disabled
          className="rounded-xl bg-gold py-3 font-display text-base tracking-wide text-black transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send Magic Link
        </button>
      </form>

      <p className="text-xs text-muted">
        Invite-only. Missing yours?{" "}
        <span className="text-white/80">support@coachg.com</span>
      </p>
    </div>
  );
}

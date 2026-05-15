import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center pt-12 pb-20 text-center sm:pt-20">
      <span className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
        CoachG Revenue OS · Client Portal
      </span>

      <h1 className="mt-8 max-w-3xl font-display text-5xl leading-[0.95] tracking-wide text-white text-balance sm:text-7xl">
        Build the Agency,
        <br />
        <span className="text-gold">Not the Job.</span>
      </h1>

      <p className="mt-6 max-w-2xl text-balance text-base text-white/70">
        The training, playbooks, and operator tools used by COACHG clients to
        scale insurance agencies past $1M.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3 font-display text-base tracking-wide text-black transition-colors hover:bg-amber-400"
        >
          Enter the Portal
          <span aria-hidden>→</span>
        </Link>
        <Link
          href="/training"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-3 font-display text-base tracking-wide text-white transition-colors hover:border-teal/60 hover:text-teal"
        >
          Browse the Playbook
        </Link>
      </div>
    </div>
  );
}

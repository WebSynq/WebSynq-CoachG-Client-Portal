import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

export default function Home({
  searchParams,
}: {
  searchParams: { code?: string; redirect?: string };
}) {
  // Auth fallback: if a magic-link callback lands here (because Supabase
  // Site URL points at root), forward the code to /auth/callback which
  // exchanges it for a session and finishes the sign-in.
  if (searchParams.code) {
    const next = searchParams.redirect ?? "/dashboard";
    redirect(`/auth/callback?code=${encodeURIComponent(searchParams.code)}&redirect=${encodeURIComponent(next)}`);
  }

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Hero background image with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://static.prod-images.emergentagent.com/jobs/64343d5b-a819-4d36-936a-ffed7b48232b/images/a65b13f69bf2dc20c7bf965f91c18b12c80333dd8811278fc05fbffb563b9be3.png"
          alt="Locker room"
          fill
          priority
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/85 to-bg" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-6 lg:px-12">
          <div className="leading-none">
            <p className="font-display text-2xl tracking-wide text-gold">COACHG</p>
            <p className="mt-0.5 text-[10px] font-mono font-semibold uppercase tracking-[0.28em] text-ink-dim">
              The Coach&apos;s Office
            </p>
          </div>
          <Link
            href="/login"
            data-testid="header-login-link"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/70 hover:text-teal transition-colors"
          >
            Sign In →
          </Link>
        </header>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center px-6 lg:px-12 pb-20">
          <div className="max-w-5xl">
            <span className="inline-flex items-center rounded-sm border border-gold/40 bg-gold/5 px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-[0.28em] text-gold">
              Revenue OS · Client Portal
            </span>

            <h1 className="mt-6 font-display text-6xl leading-[0.9] tracking-wide text-white sm:text-8xl">
              BUILD A MEDICARE AGENCY
              <br />
              <span className="text-gold">THAT WORKS WITHOUT YOU.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg text-white/70 leading-relaxed">
              The playbooks, plays, and operator tools used by COACHG clients to
              install the framework that turns personal production into a
              predictable 7 or 8-figure machine.
            </p>

            <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/dashboard"
                data-testid="hero-enter-portal-button"
                className="group inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-8 py-4 font-display text-base tracking-wide text-black transition-all hover:bg-amber-400 hover:shadow-glow-gold"
              >
                Enter the Portal
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
              <Link
                href="/training"
                data-testid="hero-browse-playbook-button"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/15 px-8 py-4 font-display text-base tracking-wide text-white transition-all hover:border-teal/60 hover:text-teal"
              >
                Browse the Playbook
              </Link>
            </div>

            {/* Pillars */}
            <div className="mt-20 grid gap-px bg-white/5 sm:grid-cols-3">
              {[
                { num: "01", title: "Optimize", text: "Sharpen the appointment flow. Install $1,500+ revenue-per-client plays." },
                { num: "02", title: "Amplify", text: "Generate 1,000+ high-intent leads weekly. Stop hunting. Start attracting." },
                { num: "03", title: "Scale", text: "Move from Top Producer to Agency Owner. Build a team that wins without you." },
              ].map((p) => (
                <div key={p.num} className="bg-bg/80 backdrop-blur-sm p-6 relative overflow-hidden">
                  <span className="absolute -right-2 -bottom-6 font-display text-[6rem] leading-none text-white/[0.04] pointer-events-none">
                    {p.num}
                  </span>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold mb-3">
                    Pillar {p.num}
                  </p>
                  <h3 className="font-display text-3xl tracking-wide text-white">{p.title}</h3>
                  <p className="mt-2 text-sm text-white/60 leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left: Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="https://static.prod-images.emergentagent.com/jobs/64343d5b-a819-4d36-936a-ffed7b48232b/images/a65b13f69bf2dc20c7bf965f91c18b12c80333dd8811278fc05fbffb563b9be3.png"
          alt="Locker room"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/40 via-bg/30 to-bg" />
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <h2 className="font-display text-5xl leading-[0.95] tracking-wide text-white">
            STEP INSIDE.
            <br />
            <span className="text-gold">RUN THE PLAY.</span>
          </h2>
          <p className="mt-4 text-sm text-white/70 max-w-md">
            Invite-only access to the COACHG Revenue OS — the operator playbook
            for 7 and 8-figure Medicare agencies.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12 bg-bg">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <p className="font-display text-2xl tracking-wide text-gold">COACHG</p>
            <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.28em] text-ink-dim mt-1">
              The Coach&apos;s Office
            </p>
          </div>

          <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.28em] text-gold mb-3">
            Client Sign-In
          </p>
          <h1 className="font-display text-4xl tracking-wide text-white mb-3">
            Magic-Link Access
          </h1>
          <p className="text-sm text-white/60 mb-8 leading-relaxed">
            Enter your invited email. We&apos;ll send a one-tap sign-in link.
            No passwords.
          </p>

          <LoginForm />

          <p className="mt-8 text-xs text-muted leading-relaxed">
            Invite-only. Missing yours?{" "}
            <a
              href="mailto:tim@grueninghealthwealth.com"
              className="text-white/80 hover:text-teal transition-colors"
            >
              tim@grueninghealthwealth.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

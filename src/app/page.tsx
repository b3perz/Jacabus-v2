import Link from "next/link";

const STATS = [
  { value: "7+", label: "Calculators" },
  { value: "NBC 2020", label: "Code Compliant" },
  { value: "CSA", label: "Standards Based" },
  { value: "100%", label: "Free & Open" },
];

const FEATURES = [
  {
    title: "Code Compliant",
    description:
      "Built around NBC 2020 and CSA standards for Canadian structural engineering practice.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Instant Results",
    description:
      "Real-time calculations as you type. No waiting, no page reloads, no spreadsheet frustrations.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    title: "Transparent Math",
    description:
      "Every calculation shows its full formula breakdown. Verify every step with confidence.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    title: "Modern & Beautiful",
    description:
      "A premium engineering experience. Dark mode, responsive design, crafted with care.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="grid-bg relative overflow-hidden">
      {/* Background decoration */}
      <div className="glow-orb w-[600px] h-[600px] bg-indigo-600 -top-60 left-1/2 -translate-x-1/2 fixed" />
      <div className="glow-orb w-[400px] h-[400px] bg-cyan-500 top-1/2 -right-40 fixed" />
      <div className="glow-orb w-[300px] h-[300px] bg-rose-500 bottom-20 -left-20 fixed" />

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-32 pb-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-medium text-[var(--color-text-muted)] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
            Built for Canadian Structural Engineers
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            <span className="text-white">Engineering math,</span>
            <br />
            <span className="gradient-text">beautifully solved.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--color-text-muted)] leading-relaxed mb-10 max-w-2xl mx-auto">
            Replace your spreadsheets with fast, beautiful, code-compliant
            structural calculators. Snow loads, wind, seismic, beam analysis
            — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/calculators" className="btn-primary text-base px-8 py-4">
              Open Calculators
            </Link>
            <a href="#features" className="btn-secondary text-base px-8 py-4">
              Learn More
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="glass-card text-center py-5 px-4"
            >
              <p className="text-2xl font-bold gradient-text">{stat.value}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Why Jacabus?
          </h2>
          <p className="text-[var(--color-text-muted)] max-w-lg mx-auto">
            Purpose-built for structural engineers who value accuracy, speed,
            and clarity in their calculations.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="glass-card p-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="glass-card p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-transparent to-cyan-500/10" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to streamline your workflow?
            </h2>
            <p className="text-[var(--color-text-muted)] mb-8 max-w-md mx-auto">
              Start calculating now. No sign-up required, no software to install.
            </p>
            <Link href="/calculators" className="btn-primary text-base px-8 py-4">
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

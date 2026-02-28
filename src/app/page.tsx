import Link from "next/link";

const STATS = [
  { value: "152", label: "Locations", sub: "NBC 2020 database" },
  { value: "10+", label: "Calculators", sub: "Snow, wind, seismic & more" },
  { value: "13", label: "Provinces", sub: "Full coverage" },
  { value: "100%", label: "Free & Open", sub: "No sign-up needed" },
];

const FEATURES = [
  {
    title: "NBC 2020 Compliant",
    description: "Every calculator built around the National Building Code of Canada 2020. Seismic, wind, snow — all current code.",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    iconColor: "text-emerald-400",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Live Visualizations",
    description: "Interactive beam diagrams, response spectra, building pressure profiles — all updating in real time as you change inputs.",
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    iconColor: "text-cyan-400",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    title: "152-City Database",
    description: "Complete NBC 2020 climatic data for 152 Canadian locations across all 13 provinces and territories. One-click data lookup.",
    iconBg: "bg-violet-500/10 border-violet-500/20",
    iconColor: "text-violet-400",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  {
    title: "Transparent Math",
    description: "Every calculation shows its full formula breakdown. Verify every step, export results, document your work.",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    iconColor: "text-amber-400",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
];

const CALC_PREVIEW = [
  { name: "Snow Load", desc: "NBC 2020 Cl. 4.1.6", color: "text-cyan-400", href: "/calculators/snow-load" },
  { name: "Wind Load", desc: "NBC 2020 Cl. 4.1.7", color: "text-sky-400", href: "/calculators/wind-load" },
  { name: "Seismic", desc: "NBC 2020 Cl. 4.1.8", color: "text-rose-400", href: "/calculators/seismic-load" },
  { name: "Beam Analysis", desc: "Interactive diagrams", color: "text-amber-400", href: "/calculators/beam-analysis" },
  { name: "Dead Load", desc: "Assembly builder", color: "text-emerald-400", href: "/calculators/dead-load" },
  { name: "Concrete Dev.", desc: "CSA A23.3-19", color: "text-violet-400", href: "/calculators/concrete-development" },
];

export default function Home() {
  return (
    <div className="grid-bg relative overflow-hidden">
      <div className="glow-orb w-[700px] h-[700px] bg-indigo-600 -top-80 left-1/2 -translate-x-1/2 fixed" />
      <div className="glow-orb w-[500px] h-[500px] bg-cyan-500 top-1/2 -right-60 fixed" />
      <div className="glow-orb w-[400px] h-[400px] bg-violet-600 bottom-40 -left-40 fixed" />

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-32 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/80 text-xs font-medium text-[var(--color-text-muted)] mb-8 backdrop-blur-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Built for Canadian Structural Engineers
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            <span className="text-white">Structural engineering,</span>
            <br />
            <span className="gradient-text">reimagined.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--color-text-muted)] leading-relaxed mb-10 max-w-2xl mx-auto">
            The most beautiful structural engineering platform in Canada.
            152-city climatic database, interactive live diagrams, and
            every NBC 2020 calculator you need — all free, all instant.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/calculators" className="btn-primary text-base px-8 py-4 flex items-center gap-2">
              Open Calculators
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/regional-data" className="btn-secondary text-base px-8 py-4 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
              Browse Regional Data
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {STATS.map((stat) => (
            <div key={stat.label} className="glass-card text-center py-6 px-4 group hover:border-indigo-500/20 transition-all duration-500">
              <p className="text-3xl font-bold gradient-text mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-white">{stat.label}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Calculator Preview Grid */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="glass-card p-8 sm:p-10 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-cyan-500/5" />
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Quick Access</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Jump into any calculator</p>
              </div>
              <Link href="/calculators" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                View all
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6" /></svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {CALC_PREVIEW.map((calc) => (
                <Link
                  key={calc.name}
                  href={calc.href}
                  className="group p-4 rounded-xl bg-[var(--color-surface-2)]/60 border border-transparent hover:border-[var(--color-border-hover)]
                           transition-all duration-300 hover:bg-[var(--color-surface-3)]/60"
                >
                  <p className={`text-sm font-semibold ${calc.color} mb-1 group-hover:brightness-110 transition-all`}>
                    {calc.name}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-mono">{calc.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why Jacabus?</h2>
          <p className="text-[var(--color-text-muted)] max-w-lg mx-auto">
            Purpose-built for structural engineers who demand accuracy, speed, and the best tools available.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="glass-card p-6 group hover:border-[var(--color-border-hover)] transition-all duration-500">
              <div className={`w-11 h-11 rounded-xl ${feature.iconBg} border flex items-center justify-center ${feature.iconColor} mb-4
                            group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="glass-card p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-transparent to-cyan-500/10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to streamline your workflow?</h2>
            <p className="text-[var(--color-text-muted)] mb-8 max-w-md mx-auto">
              Start calculating now. No sign-up, no installs. From Vancouver to St. John&apos;s — every Canadian location covered.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/calculators" className="btn-primary text-base px-8 py-4">Get Started</Link>
              <Link href="/regional-data" className="btn-secondary text-base px-8 py-4">Explore Data</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

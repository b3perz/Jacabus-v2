import Link from "next/link";
import CalculatorCard from "@/components/CalculatorCard";

const CALCULATORS = [
  {
    title: "Snow Load",
    description: "Roof snow loads per NBC 2020 Cl. 4.1.6. Auto-populate Ss and Sr from 152-city database. Interactive roof diagram with real-time load visualization.",
    href: "/calculators/snow-load",
    category: "Loads",
    accentColor: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: "Wind Load",
    description: "External and internal wind pressures per NBC 2020 Cl. 4.1.7. Interactive building pressure diagram, exposure factor curve, and wind pressure profile.",
    href: "/calculators/wind-load",
    category: "Loads",
    accentColor: "bg-sky-500/15 text-sky-400 border border-sky-500/20",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
      </svg>
    ),
  },
  {
    title: "Seismic Load",
    description: "Equivalent static base shear per NBC 2020 Cl. 4.1.8. Design response spectrum visualization, lateral force distribution, and SFRS comparison.",
    href: "/calculators/seismic-load",
    category: "Loads",
    accentColor: "bg-rose-500/15 text-rose-400 border border-rose-500/20",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    title: "Beam Analysis",
    description: "Interactive moment, shear, and deflection diagrams. Simply supported, cantilever, and fixed beams. Drag-and-play live visualization.",
    href: "/calculators/beam-analysis",
    category: "Analysis",
    accentColor: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="10" width="20" height="4" rx="1" />
        <path d="M6 14l-3 6h4l-1-6" />
        <path d="M18 14l3 6h-4l1-6" />
      </svg>
    ),
  },
  {
    title: "Dead Load Assembly",
    description: "Build up assembly dead loads from 30+ standard components. Material library with floors, roofs, walls, finishes, and services.",
    href: "/calculators/dead-load",
    category: "Loads",
    accentColor: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="6" width="22" height="4" rx="1" />
        <rect x="3" y="10" width="18" height="4" rx="1" />
        <rect x="5" y="14" width="14" height="4" rx="1" />
      </svg>
    ),
  },
  {
    title: "Concrete Development",
    description: "Rebar tension development and hook lengths per CSA A23.3-19 Cl. 12. All standard CSA bar sizes from 10M to 55M.",
    href: "/calculators/concrete-development",
    category: "Concrete",
    accentColor: "bg-violet-500/15 text-violet-400 border border-violet-500/20",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="7" x2="22" y2="7" />
        <line x1="2" y1="17" x2="22" y2="17" />
      </svg>
    ),
  },
  {
    title: "Unit Converter",
    description: "Convert between metric and imperial across 9 categories. Length, force, pressure, moment, area, volume, mass, density, temperature.",
    href: "/calculators/unit-converter",
    category: "Utility",
    accentColor: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },
];

export default function CalculatorsPage() {
  return (
    <div className="min-h-screen grid-bg relative">
      <div className="glow-orb w-[500px] h-[500px] bg-indigo-600 -top-40 left-1/4 fixed" />
      <div className="glow-orb w-[400px] h-[400px] bg-cyan-500 bottom-0 right-0 fixed" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="6" x2="16" y2="6" />
                <line x1="8" y1="10" x2="12" y2="10" />
                <circle cx="10" cy="16" r="1" fill="white" />
                <circle cx="14" cy="16" r="1" fill="white" />
                <circle cx="10" cy="13" r="1" fill="white" />
                <circle cx="14" cy="13" r="1" fill="white" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Calculators</h1>
              <p className="text-[var(--color-text-muted)] text-sm mt-1">
                NBC 2020 & CSA compliant tools with interactive visualizations
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {["All", "Loads", "Analysis", "Concrete", "Utility"].map((cat) => (
              <span key={cat} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-border-hover)] transition-all duration-200 cursor-default">
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CALCULATORS.map((calc) => (
            <CalculatorCard key={calc.href} {...calc} />
          ))}

          {/* Regional Data card */}
          <Link href="/regional-data" className="group block">
            <div className="glass-card-hover p-6 h-full flex flex-col border-dashed">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/20 transition-transform duration-300 group-hover:scale-110">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                  </svg>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                  Database
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">Regional Climatic Data</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed flex-1">
                Browse NBC 2020 climatic data for 152 Canadian locations. Snow, wind, and seismic values by province.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors">
                <span>Browse data</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

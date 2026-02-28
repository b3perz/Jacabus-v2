import CalculatorCard from "@/components/CalculatorCard";

const CALCULATORS = [
  {
    title: "Snow Load",
    description:
      "Calculate roof snow loads per NBC 2020 Cl. 4.1.6. Accounts for ground snow, rain, exposure, slope, and shape factors.",
    href: "/calculators/snow-load",
    category: "Loads",
    accentColor: "bg-cyan-500/20 text-cyan-400",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
        <line x1="8" y1="16" x2="8.01" y2="16" />
        <line x1="8" y1="20" x2="8.01" y2="20" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
        <line x1="12" y1="22" x2="12.01" y2="22" />
        <line x1="16" y1="16" x2="16.01" y2="16" />
        <line x1="16" y1="20" x2="16.01" y2="20" />
      </svg>
    ),
  },
  {
    title: "Wind Load",
    description:
      "External and internal wind pressures per NBC 2020 Cl. 4.1.7. Includes exposure factor calculation by terrain type.",
    href: "/calculators/wind-load",
    category: "Loads",
    accentColor: "bg-sky-500/20 text-sky-400",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
      </svg>
    ),
  },
  {
    title: "Seismic Load",
    description:
      "Equivalent static base shear per NBC 2020 Cl. 4.1.8. Select from common SFRS types with pre-set Rd and Ro values.",
    href: "/calculators/seismic-load",
    category: "Loads",
    accentColor: "bg-rose-500/20 text-rose-400",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    title: "Beam Analysis",
    description:
      "Moment, shear, and deflection for simply supported, cantilever, and fixed beams under common load patterns.",
    href: "/calculators/beam-analysis",
    category: "Analysis",
    accentColor: "bg-amber-500/20 text-amber-400",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="4" rx="1" />
        <path d="M6 14l-4 6h6l-2-6" />
        <path d="M18 14l4 6h-6l2-6" />
      </svg>
    ),
  },
  {
    title: "Dead Load Assembly",
    description:
      "Build up assembly dead loads from standard components. Includes material library with hundreds of pre-loaded weights.",
    href: "/calculators/dead-load",
    category: "Loads",
    accentColor: "bg-emerald-500/20 text-emerald-400",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="6" width="22" height="4" rx="1" />
        <rect x="3" y="10" width="18" height="4" rx="1" />
        <rect x="5" y="14" width="14" height="4" rx="1" />
      </svg>
    ),
  },
  {
    title: "Concrete Development Length",
    description:
      "Rebar tension development and hook lengths per CSA A23.3-19 Cl. 12. All standard CSA bar sizes included.",
    href: "/calculators/concrete-development",
    category: "Concrete",
    accentColor: "bg-violet-500/20 text-violet-400",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="4" x2="20" y2="20" />
        <line x1="4" y1="20" x2="20" y2="4" />
        <rect x="2" y="2" width="20" height="20" rx="2" />
      </svg>
    ),
  },
  {
    title: "Unit Converter",
    description:
      "Convert between metric and imperial units for length, force, pressure, moment, area, volume, mass, and temperature.",
    href: "/calculators/unit-converter",
    category: "Utility",
    accentColor: "bg-indigo-500/20 text-indigo-400",
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
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Calculators
          </h1>
          <p className="text-[var(--color-text-muted)] max-w-xl">
            Structural engineering tools built around NBC 2020 and CSA standards.
            Select a calculator to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CALCULATORS.map((calc) => (
            <CalculatorCard key={calc.href} {...calc} />
          ))}
        </div>
      </div>
    </div>
  );
}

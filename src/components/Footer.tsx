import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)]/50 bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-sm font-bold text-white">Jacabus</span>
              <span className="text-[9px] text-indigo-400/50 font-medium">v2</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed max-w-xs">
              Structural engineering tools built around Canadian codes.
              Always verify calculations with a licensed professional engineer.
            </p>
          </div>

          {/* Calculators */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Calculators</h4>
            <div className="space-y-2">
              {[
                { href: "/calculators/snow-load", label: "Snow Load" },
                { href: "/calculators/wind-load", label: "Wind Load" },
                { href: "/calculators/seismic-load", label: "Seismic Load" },
                { href: "/calculators/beam-analysis", label: "Beam Analysis" },
                { href: "/calculators/dead-load", label: "Dead Load" },
              ].map((link) => (
                <Link key={link.href} href={link.href}
                  className="block text-xs text-[var(--color-text-muted)] hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Resources</h4>
            <div className="space-y-2">
              <Link href="/regional-data" className="block text-xs text-[var(--color-text-muted)] hover:text-white transition-colors">
                Regional Data
              </Link>
              <Link href="/calculators/unit-converter" className="block text-xs text-[var(--color-text-muted)] hover:text-white transition-colors">
                Unit Converter
              </Link>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              NBC 2020 Compliant
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--color-border)]/30 text-center">
          <p className="text-[10px] text-[var(--color-text-muted)]/60">
            Jacabus v2 — Open source structural engineering tools for Canadian engineers.
            Not affiliated with the National Research Council of Canada.
          </p>
        </div>
      </div>
    </footer>
  );
}

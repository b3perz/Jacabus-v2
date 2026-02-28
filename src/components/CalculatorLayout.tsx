import Link from "next/link";

interface CalculatorLayoutProps {
  title: string;
  description: string;
  codeRef: string;
  children: React.ReactNode;
}

export default function CalculatorLayout({
  title,
  description,
  codeRef,
  children,
}: CalculatorLayoutProps) {
  return (
    <div className="min-h-screen grid-bg">
      {/* Background orbs */}
      <div className="glow-orb w-[500px] h-[500px] bg-indigo-600 top-0 -right-40 fixed" />
      <div className="glow-orb w-[400px] h-[400px] bg-cyan-500 bottom-20 -left-40 fixed" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-6">
          <Link href="/calculators" className="hover:text-white transition-colors duration-200">
            Calculators
          </Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-40">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="text-white">{title}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-[var(--color-text-muted)] text-sm leading-relaxed max-w-2xl">{description}</p>
          <div className="flex items-center gap-3 mt-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[10px] font-mono text-[var(--color-text-muted)]">
              {codeRef}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="glass-card p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}

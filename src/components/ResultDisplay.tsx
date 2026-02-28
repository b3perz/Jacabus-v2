interface ResultItemProps {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}

function ResultItem({ label, value, unit, highlight }: ResultItemProps) {
  return (
    <div className={`p-4 rounded-xl transition-all duration-300 ${
      highlight
        ? "bg-indigo-500/8 border border-indigo-500/20 hover:border-indigo-500/30"
        : "bg-[var(--color-surface-2)] border border-transparent hover:border-[var(--color-border)]"
    }`}>
      <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <p className={`font-mono font-bold text-lg ${highlight ? "result-value" : "text-white"}`}>
        {typeof value === "number" ? value.toFixed(3) : value}
        {unit && (
          <span className="ml-1.5 text-xs font-normal text-[var(--color-text-muted)]">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}

interface ResultDisplayProps {
  results: ResultItemProps[];
  formula?: string;
}

export default function ResultDisplay({ results, formula }: ResultDisplayProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Results
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {results.map((r, i) => (
          <ResultItem key={i} {...r} />
        ))}
      </div>
      {formula && (
        <div className="mt-4">
          <h4 className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Calculation Breakdown
          </h4>
          <pre className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4 text-xs font-mono text-[var(--color-text-muted)] leading-relaxed overflow-x-auto whitespace-pre-wrap">
            {formula}
          </pre>
        </div>
      )}
    </div>
  );
}

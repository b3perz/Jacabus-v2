import Link from "next/link";

interface CalculatorCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  category: string;
  accentColor: string;
}

export default function CalculatorCard({
  title,
  description,
  href,
  icon,
  category,
  accentColor,
}: CalculatorCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="glass-card-hover p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${accentColor} transition-transform duration-300 group-hover:scale-110`}
          >
            {icon}
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] bg-[var(--color-surface-2)] px-2.5 py-1 rounded-full">
            {category}
          </span>
        </div>
        <h3 className="text-base font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed flex-1">
          {description}
        </p>
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors">
          <span>Open calculator</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:translate-x-1"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

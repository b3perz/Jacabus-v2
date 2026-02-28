"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { CLIMATIC_DATA, PROVINCES, type ClimaticLocation } from "@/lib/climatic-data";

interface LocationSelectorProps {
  onSelect: (location: ClimaticLocation) => void;
  selected?: ClimaticLocation | null;
  compact?: boolean;
}

export default function LocationSelector({ onSelect, selected, compact }: LocationSelectorProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [provinceFilter, setProvinceFilter] = useState<string | "">("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    let results = CLIMATIC_DATA;
    if (provinceFilter) {
      results = results.filter((l) => l.province === provinceFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.provinceFull.toLowerCase().includes(q) ||
          l.province.toLowerCase() === q
      );
    }
    return results.slice(0, 30);
  }, [query, provinceFilter]);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left ${compact ? "p-2" : "p-3"} bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl
                   hover:border-[var(--color-border-hover)] transition-all duration-300 group`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${compact ? "w-7 h-7" : "w-9 h-9"} rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center`}>
              <svg width={compact ? "14" : "16"} height={compact ? "14" : "16"} viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              {selected ? (
                <>
                  <p className={`font-semibold text-white ${compact ? "text-xs" : "text-sm"}`}>{selected.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{selected.provinceFull}</p>
                </>
              ) : (
                <p className={`text-[var(--color-text-muted)] ${compact ? "text-xs" : "text-sm"}`}>
                  Select a location for climatic data...
                </p>
              )}
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`text-[var(--color-text-muted)] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full min-w-[360px] max-h-[420px] bg-[var(--color-surface)] border border-[var(--color-border)]
                       rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
          style={{ animation: "fadeInScale 0.2s ease-out" }}>
          {/* Search */}
          <div className="p-3 border-b border-[var(--color-border)]">
            <div className="relative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search cities..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg
                          pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500
                          focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20
                          transition-all duration-200"
                autoFocus
              />
            </div>

            {/* Province filter chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                onClick={() => setProvinceFilter("")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200
                  ${!provinceFilter ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "text-[var(--color-text-muted)] hover:text-white hover:bg-white/5"}`}
              >
                All
              </button>
              {PROVINCES.map((p) => (
                <button
                  key={p.code}
                  onClick={() => setProvinceFilter(provinceFilter === p.code ? "" : p.code)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200
                    ${provinceFilter === p.code ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "text-[var(--color-text-muted)] hover:text-white hover:bg-white/5"}`}
                >
                  {p.code}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="overflow-y-auto max-h-[280px]">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-[var(--color-text-muted)]">
                No locations found
              </div>
            ) : (
              filtered.map((loc) => (
                <button
                  key={`${loc.province}-${loc.name}`}
                  onClick={() => {
                    onSelect(loc);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-[var(--color-surface-2)]
                    transition-colors duration-150 border-b border-[var(--color-border)]/50 last:border-0
                    ${selected?.name === loc.name && selected?.province === loc.province ? "bg-indigo-500/5" : ""}`}
                >
                  <div>
                    <p className="text-sm font-medium text-white">{loc.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{loc.provinceFull}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-[var(--color-text-muted)]">
                    <span title="Snow">
                      <span className="text-cyan-400">{loc.Ss}</span> kPa
                    </span>
                    <span title="Wind">
                      <span className="text-sky-400">{loc.q50}</span> kPa
                    </span>
                    <span title="Seismic">
                      <span className="text-rose-400">{loc.Sa02}</span>g
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

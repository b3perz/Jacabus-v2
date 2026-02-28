"use client";

import { useState, useMemo, useCallback } from "react";
import {
  CLIMATIC_DATA,
  PROVINCES,
  getLocationsByProvince,
  getProvinceStats,
  type ClimaticLocation,
} from "@/lib/climatic-data";
import {
  SnowflakeIcon,
  WindIcon,
  SeismicIcon,
  SearchIcon,
  MapPinIcon,
  DatabaseIcon,
  ProvinceIcon,
  CanadaIcon,
} from "@/components/Icons";

// ---------------------------------------------------------------------------
// Province color mapping by region
// ---------------------------------------------------------------------------

type ColorTheme = {
  accent: string;
  bg: string;
  border: string;
  text: string;
  glow: string;
  ring: string;
};

const PROVINCE_COLORS: Record<string, ColorTheme> = {
  BC: {
    accent: "cyan",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/25",
    text: "text-cyan-400",
    glow: "shadow-cyan-500/20",
    ring: "ring-cyan-500/30",
  },
  AB: {
    accent: "amber",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    text: "text-amber-400",
    glow: "shadow-amber-500/20",
    ring: "ring-amber-500/30",
  },
  SK: {
    accent: "amber",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    text: "text-amber-400",
    glow: "shadow-amber-500/20",
    ring: "ring-amber-500/30",
  },
  MB: {
    accent: "amber",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    text: "text-amber-400",
    glow: "shadow-amber-500/20",
    ring: "ring-amber-500/30",
  },
  ON: {
    accent: "emerald",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/20",
    ring: "ring-emerald-500/30",
  },
  QC: {
    accent: "violet",
    bg: "bg-violet-500/10",
    border: "border-violet-500/25",
    text: "text-violet-400",
    glow: "shadow-violet-500/20",
    ring: "ring-violet-500/30",
  },
  NB: {
    accent: "rose",
    bg: "bg-rose-500/10",
    border: "border-rose-500/25",
    text: "text-rose-400",
    glow: "shadow-rose-500/20",
    ring: "ring-rose-500/30",
  },
  NS: {
    accent: "rose",
    bg: "bg-rose-500/10",
    border: "border-rose-500/25",
    text: "text-rose-400",
    glow: "shadow-rose-500/20",
    ring: "ring-rose-500/30",
  },
  PE: {
    accent: "rose",
    bg: "bg-rose-500/10",
    border: "border-rose-500/25",
    text: "text-rose-400",
    glow: "shadow-rose-500/20",
    ring: "ring-rose-500/30",
  },
  NL: {
    accent: "rose",
    bg: "bg-rose-500/10",
    border: "border-rose-500/25",
    text: "text-rose-400",
    glow: "shadow-rose-500/20",
    ring: "ring-rose-500/30",
  },
  NT: {
    accent: "sky",
    bg: "bg-sky-500/10",
    border: "border-sky-500/25",
    text: "text-sky-400",
    glow: "shadow-sky-500/20",
    ring: "ring-sky-500/30",
  },
  NU: {
    accent: "sky",
    bg: "bg-sky-500/10",
    border: "border-sky-500/25",
    text: "text-sky-400",
    glow: "shadow-sky-500/20",
    ring: "ring-sky-500/30",
  },
  YT: {
    accent: "sky",
    bg: "bg-sky-500/10",
    border: "border-sky-500/25",
    text: "text-sky-400",
    glow: "shadow-sky-500/20",
    ring: "ring-sky-500/30",
  },
};

function getColor(code: string): ColorTheme {
  return (
    PROVINCE_COLORS[code] ?? {
      accent: "indigo",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/25",
      text: "text-indigo-400",
      glow: "shadow-indigo-500/20",
      ring: "ring-indigo-500/30",
    }
  );
}

// ---------------------------------------------------------------------------
// Value-to-intensity mapping helpers
// ---------------------------------------------------------------------------

/** Returns an rgba background with opacity proportional to `t` (0..1). */
function intensityBg(r: number, g: number, b: number, t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  return `rgba(${r}, ${g}, ${b}, ${(clamped * 0.35).toFixed(3)})`;
}

function snowIntensity(val: number): string {
  // Ss range approx 0.8 - 4.4
  const t = (val - 0.5) / 4.0;
  return intensityBg(96, 165, 250, t); // blue-400
}

function windIntensity(val: number): string {
  // q50 range approx 0.33 - 0.79
  const t = (val - 0.3) / 0.5;
  return intensityBg(52, 211, 153, t); // emerald-400
}

function seismicIntensity(val: number): string {
  // Sa02 range approx 0.03 - 0.95
  const t = val / 1.0;
  return intensityBg(251, 113, 133, t); // rose-400
}

function seismicLowIntensity(val: number): string {
  const t = val / 0.5;
  return intensityBg(251, 146, 60, t); // orange-400
}

// ---------------------------------------------------------------------------
// Sort type
// ---------------------------------------------------------------------------

type SortKey =
  | "name"
  | "province"
  | "Ss"
  | "Sr"
  | "q50"
  | "Sa02"
  | "Sa05"
  | "Sa10"
  | "Sa20"
  | "PGA"
  | "PGV";

type SortDir = "asc" | "desc";

// ---------------------------------------------------------------------------
// Summary stats computed once
// ---------------------------------------------------------------------------

function computeSummary(data: ClimaticLocation[]) {
  const provinces = new Set(data.map((d) => d.province));
  let highSnow = data[0];
  let highSeismic = data[0];
  let highWind = data[0];
  for (const loc of data) {
    if (loc.Ss > highSnow.Ss) highSnow = loc;
    if (loc.Sa02 > highSeismic.Sa02) highSeismic = loc;
    if (loc.q50 > highWind.q50) highWind = loc;
  }
  return {
    totalLocations: data.length,
    provinceCount: provinces.size,
    highSnow,
    highSeismic,
    highWind,
  };
}

// ---------------------------------------------------------------------------
// Component: SortArrow
// ---------------------------------------------------------------------------

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span
      className={`inline-flex ml-1 transition-all duration-200 ${
        active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
      }`}
    >
      {dir === "asc" ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 2L10 8H2L6 2Z" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 10L2 4H10L6 10Z" />
        </svg>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component: StatCard
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
  sublabel,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
  colorClass: string;
}) {
  return (
    <div className="glass-card p-4 sm:p-5 flex items-start gap-3">
      <div
        className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${colorClass}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
          {label}
        </p>
        <p className="text-lg font-bold text-white font-mono truncate">
          {value}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] truncate">
          {sublabel}
        </p>
      </div>
    </div>
  );
}

// ===========================================================================
// MAIN PAGE COMPONENT
// ===========================================================================

export default function RegionalDataPage() {
  // ---- State ----
  const [search, setSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedLocation, setSelectedLocation] =
    useState<ClimaticLocation | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // ---- Summary stats (computed once) ----
  const summary = useMemo(() => computeSummary(CLIMATIC_DATA), []);

  // ---- Province stats ----
  const provinceStats = useMemo(() => {
    const map: Record<string, ReturnType<typeof getProvinceStats> & { count: number }> = {};
    for (const p of PROVINCES) {
      const locs = getLocationsByProvince(p.code);
      const stats = getProvinceStats(p.code);
      map[p.code] = { ...stats, count: locs.length };
    }
    return map;
  }, []);

  // ---- Filtered + sorted data ----
  const filteredData = useMemo(() => {
    let data = CLIMATIC_DATA;

    // Province filter
    if (selectedProvince) {
      data = data.filter((l) => l.province === selectedProvince);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      data = data.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.province.toLowerCase().includes(q) ||
          l.provinceFull.toLowerCase().includes(q)
      );
    }

    // Sort
    const sorted = [...data].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === "province") {
        cmp = a.province.localeCompare(b.province);
      } else {
        cmp = (a[sortKey] as number) - (b[sortKey] as number);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [search, selectedProvince, sortKey, sortDir]);

  // ---- Toggle sort ----
  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir(key === "name" || key === "province" ? "asc" : "desc");
      }
    },
    [sortKey]
  );

  // ---- Copy handler ----
  const handleCopy = useCallback((loc: ClimaticLocation) => {
    const text = [
      `Location: ${loc.name}, ${loc.provinceFull}`,
      `Ss = ${loc.Ss} kPa`,
      `Sr = ${loc.Sr} kPa`,
      `q10 = ${loc.q10} kPa`,
      `q50 = ${loc.q50} kPa`,
      `Sa(0.2) = ${loc.Sa02} g`,
      `Sa(0.5) = ${loc.Sa05} g`,
      `Sa(1.0) = ${loc.Sa10} g`,
      `Sa(2.0) = ${loc.Sa20} g`,
      `PGA = ${loc.PGA} g`,
      `PGV = ${loc.PGV} m/s`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopiedField(loc.name);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  // ---- Column definitions ----
  const columns: {
    key: SortKey;
    label: string;
    sub?: string;
    bgFn?: (v: number) => string;
  }[] = [
    { key: "name", label: "Location" },
    { key: "province", label: "Province" },
    { key: "Ss", label: "Ss", sub: "kPa", bgFn: snowIntensity },
    { key: "Sr", label: "Sr", sub: "kPa" },
    { key: "q50", label: "q\u2085\u2080", sub: "kPa", bgFn: windIntensity },
    { key: "Sa02", label: "Sa(0.2)", sub: "g", bgFn: seismicIntensity },
    { key: "Sa05", label: "Sa(0.5)", sub: "g", bgFn: seismicLowIntensity },
    { key: "Sa10", label: "Sa(1.0)", sub: "g", bgFn: seismicLowIntensity },
    { key: "Sa20", label: "Sa(2.0)", sub: "g", bgFn: seismicLowIntensity },
    { key: "PGA", label: "PGA", sub: "g", bgFn: seismicIntensity },
    { key: "PGV", label: "PGV", sub: "m/s" },
  ];

  // ---- Render ----
  return (
    <div className="grid-bg relative min-h-screen overflow-hidden">
      {/* Background orbs */}
      <div className="glow-orb w-[600px] h-[600px] bg-indigo-600 -top-60 left-1/2 -translate-x-1/2 fixed" />
      <div className="glow-orb w-[400px] h-[400px] bg-cyan-500 top-1/3 -right-40 fixed" />
      <div className="glow-orb w-[300px] h-[300px] bg-violet-500 bottom-40 -left-20 fixed" />

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-24">
        {/* ================================================================= */}
        {/* HEADER                                                           */}
        {/* ================================================================= */}
        <header className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-medium text-[var(--color-text-muted)] mb-6">
            <CanadaIcon className="w-3.5 h-3.5 text-rose-400" />
            NBC 2020 Appendix C
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
            <span className="text-white">Regional </span>
            <span className="gradient-text">Climatic Data</span>
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
            NBC 2020 Appendix C — Climatic Design Data for Selected Locations in
            Canada
          </p>
        </header>

        {/* ================================================================= */}
        {/* SUMMARY STATISTICS                                                */}
        {/* ================================================================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-10 sm:mb-14">
          <StatCard
            icon={<DatabaseIcon className="w-5 h-5 text-indigo-400" />}
            label="Total Locations"
            value={summary.totalLocations.toString()}
            sublabel="Across Canada"
            colorClass="bg-indigo-500/10 border border-indigo-500/20"
          />
          <StatCard
            icon={<ProvinceIcon className="w-5 h-5 text-violet-400" />}
            label="Provinces & Territories"
            value={summary.provinceCount.toString()}
            sublabel="All regions covered"
            colorClass="bg-violet-500/10 border border-violet-500/20"
          />
          <StatCard
            icon={<SnowflakeIcon className="w-5 h-5 text-blue-400" />}
            label="Highest Snow"
            value={`${summary.highSnow.Ss} kPa`}
            sublabel={`${summary.highSnow.name}, ${summary.highSnow.province}`}
            colorClass="bg-blue-500/10 border border-blue-500/20"
          />
          <StatCard
            icon={<SeismicIcon className="w-5 h-5 text-rose-400" />}
            label="Highest Seismic"
            value={`${summary.highSeismic.Sa02} g`}
            sublabel={`${summary.highSeismic.name}, ${summary.highSeismic.province}`}
            colorClass="bg-rose-500/10 border border-rose-500/20"
          />
          <StatCard
            icon={<WindIcon className="w-5 h-5 text-emerald-400" />}
            label="Highest Wind"
            value={`${summary.highWind.q50} kPa`}
            sublabel={`${summary.highWind.name}, ${summary.highWind.province}`}
            colorClass="bg-emerald-500/10 border border-emerald-500/20"
          />
        </section>

        {/* ================================================================= */}
        {/* PROVINCE SELECTOR                                                 */}
        {/* ================================================================= */}
        <section className="mb-10 sm:mb-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Filter by Province
            </h2>
            {selectedProvince && (
              <button
                onClick={() => {
                  setSelectedProvince(null);
                  setSelectedLocation(null);
                }}
                className="text-xs text-[var(--color-text-muted)] hover:text-white transition-colors duration-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-surface-2)]"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <line x1="2" y1="2" x2="10" y2="10" />
                  <line x1="10" y1="2" x2="2" y2="10" />
                </svg>
                Clear Filter
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2.5 sm:gap-3">
            {PROVINCES.map((p) => {
              const c = getColor(p.code);
              const stats = provinceStats[p.code];
              const isActive = selectedProvince === p.code;
              return (
                <button
                  key={p.code}
                  onClick={() => {
                    setSelectedProvince(isActive ? null : p.code);
                    setSelectedLocation(null);
                  }}
                  className={`relative group text-left rounded-xl border p-3 sm:p-3.5 transition-all duration-300 overflow-hidden ${
                    isActive
                      ? `${c.bg} ${c.border} ring-1 ${c.ring} shadow-lg ${c.glow}`
                      : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-2)]"
                  }`}
                >
                  {/* Subtle corner glow on active */}
                  {isActive && (
                    <div
                      className="absolute -top-8 -right-8 w-20 h-20 rounded-full opacity-20 blur-2xl pointer-events-none"
                      style={{
                        background:
                          c.accent === "cyan"
                            ? "#22d3ee"
                            : c.accent === "amber"
                            ? "#fbbf24"
                            : c.accent === "emerald"
                            ? "#34d399"
                            : c.accent === "violet"
                            ? "#a78bfa"
                            : c.accent === "rose"
                            ? "#fb7185"
                            : c.accent === "sky"
                            ? "#38bdf8"
                            : "#818cf8",
                      }}
                    />
                  )}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[11px] font-bold tracking-wider ${
                          isActive ? c.text : "text-[var(--color-text-muted)]"
                        }`}
                      >
                        {p.code}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                        {stats?.count ?? 0}
                      </span>
                    </div>
                    <p
                      className={`text-xs font-medium truncate mb-2 ${
                        isActive ? "text-white" : "text-[var(--color-text)]"
                      }`}
                    >
                      {p.name}
                    </p>
                    {stats && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
                          <SnowflakeIcon className="w-2.5 h-2.5 shrink-0 text-blue-400/60" />
                          <span className="font-mono">
                            {stats.minSnow}–{stats.maxSnow}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
                          <WindIcon className="w-2.5 h-2.5 shrink-0 text-emerald-400/60" />
                          <span className="font-mono">
                            {stats.minWind}–{stats.maxWind}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
                          <SeismicIcon className="w-2.5 h-2.5 shrink-0 text-rose-400/60" />
                          <span className="font-mono">{stats.maxSa}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ================================================================= */}
        {/* SEARCH BAR                                                        */}
        {/* ================================================================= */}
        <section className="mb-6 sm:mb-8">
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="w-4.5 h-4.5 text-[var(--color-text-muted)]" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city name or province..."
              className="input-field pl-11 pr-4"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--color-text-muted)] hover:text-white transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <line x1="3" y1="3" x2="11" y2="11" />
                  <line x1="11" y1="3" x2="3" y2="11" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-2">
            Showing{" "}
            <span className="font-mono text-[var(--color-text)]">
              {filteredData.length}
            </span>{" "}
            of{" "}
            <span className="font-mono text-[var(--color-text)]">
              {CLIMATIC_DATA.length}
            </span>{" "}
            locations
            {selectedProvince && (
              <>
                {" "}
                in{" "}
                <span className={getColor(selectedProvince).text}>
                  {PROVINCES.find((p) => p.code === selectedProvince)?.name}
                </span>
              </>
            )}
          </p>
        </section>

        {/* ================================================================= */}
        {/* DATA TABLE                                                        */}
        {/* ================================================================= */}
        <section className="glass-card overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className={`group cursor-pointer px-3 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider transition-colors duration-200 select-none whitespace-nowrap ${
                        sortKey === col.key
                          ? "text-white bg-[var(--color-surface-2)]"
                          : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/50"
                      } ${col.key === "name" ? "pl-5 sticky left-0 z-10 bg-[var(--color-surface)]" : ""}`}
                      style={
                        col.key === "name"
                          ? {
                              background:
                                sortKey === col.key
                                  ? "var(--color-surface-2)"
                                  : "var(--color-surface)",
                            }
                          : undefined
                      }
                    >
                      <span className="flex items-center gap-0.5">
                        {col.label}
                        {col.sub && (
                          <span className="text-[9px] font-normal text-[var(--color-text-muted)] ml-0.5">
                            ({col.sub})
                          </span>
                        )}
                        <SortArrow
                          active={sortKey === col.key}
                          dir={sortKey === col.key ? sortDir : "asc"}
                        />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]/50">
                {filteredData.map((loc, i) => {
                  const isSelected = selectedLocation?.name === loc.name && selectedLocation?.province === loc.province;
                  const rowColor = getColor(loc.province);
                  return (
                    <tr
                      key={`${loc.province}-${loc.name}`}
                      onClick={() =>
                        setSelectedLocation(isSelected ? null : loc)
                      }
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? `${rowColor.bg} ${rowColor.border}`
                          : i % 2 === 0
                          ? "bg-transparent hover:bg-[var(--color-surface-2)]/60"
                          : "bg-[var(--color-surface-2)]/20 hover:bg-[var(--color-surface-2)]/60"
                      }`}
                    >
                      {/* Location name - sticky */}
                      <td
                        className={`px-3 py-2.5 pl-5 font-medium text-sm sticky left-0 z-10 ${
                          isSelected ? "text-white" : "text-[var(--color-text)]"
                        }`}
                        style={{
                          background: isSelected
                            ? "transparent"
                            : i % 2 === 0
                            ? "var(--color-surface)"
                            : "rgba(21, 22, 39, 0.35)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <MapPinIcon
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isSelected
                                ? rowColor.text
                                : "text-[var(--color-text-muted)]"
                            }`}
                          />
                          {loc.name}
                        </div>
                      </td>
                      {/* Province */}
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${rowColor.bg} ${rowColor.text} ${rowColor.border} border`}
                        >
                          {loc.province}
                        </span>
                      </td>
                      {/* Numeric cells */}
                      {(
                        [
                          { key: "Ss" as const, val: loc.Ss, fn: snowIntensity },
                          { key: "Sr" as const, val: loc.Sr, fn: undefined },
                          { key: "q50" as const, val: loc.q50, fn: windIntensity },
                          { key: "Sa02" as const, val: loc.Sa02, fn: seismicIntensity },
                          { key: "Sa05" as const, val: loc.Sa05, fn: seismicLowIntensity },
                          { key: "Sa10" as const, val: loc.Sa10, fn: seismicLowIntensity },
                          { key: "Sa20" as const, val: loc.Sa20, fn: seismicLowIntensity },
                          { key: "PGA" as const, val: loc.PGA, fn: seismicIntensity },
                          { key: "PGV" as const, val: loc.PGV, fn: undefined },
                        ] as const
                      ).map(({ key, val, fn }) => (
                        <td
                          key={key}
                          className="px-3 py-2.5 text-sm font-mono text-[var(--color-text)] tabular-nums"
                          style={fn ? { backgroundColor: fn(val) } : undefined}
                        >
                          {val.toFixed(3)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {filteredData.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-16 text-[var(--color-text-muted)]"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <SearchIcon className="w-8 h-8 opacity-30" />
                        <p className="text-sm">
                          No locations found matching your criteria.
                        </p>
                        <button
                          onClick={() => {
                            setSearch("");
                            setSelectedProvince(null);
                          }}
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Reset all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ================================================================= */}
        {/* LOCATION DETAIL PANEL                                             */}
        {/* ================================================================= */}
        {selectedLocation && (
          <section
            className="glass-card p-5 sm:p-7 mb-8 relative overflow-hidden"
            style={{
              animation: "fadeInScale 0.3s ease-out",
            }}
          >
            {/* Decorative accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: `linear-gradient(90deg, ${
                  getColor(selectedLocation.province).accent === "cyan"
                    ? "#22d3ee"
                    : getColor(selectedLocation.province).accent === "amber"
                    ? "#fbbf24"
                    : getColor(selectedLocation.province).accent === "emerald"
                    ? "#34d399"
                    : getColor(selectedLocation.province).accent === "violet"
                    ? "#a78bfa"
                    : getColor(selectedLocation.province).accent === "rose"
                    ? "#fb7185"
                    : getColor(selectedLocation.province).accent === "sky"
                    ? "#38bdf8"
                    : "#818cf8"
                }, transparent)`,
              }}
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <MapPinIcon
                    className={`w-5 h-5 ${
                      getColor(selectedLocation.province).text
                    }`}
                  />
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {selectedLocation.name}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold tracking-wide ${
                      getColor(selectedLocation.province).bg
                    } ${getColor(selectedLocation.province).text} ${
                      getColor(selectedLocation.province).border
                    } border`}
                  >
                    {selectedLocation.provinceFull}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] font-mono ml-8">
                  {selectedLocation.lat.toFixed(4)}&deg;N,{" "}
                  {Math.abs(selectedLocation.lng).toFixed(4)}&deg;W
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(selectedLocation)}
                  className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2"
                >
                  {copiedField === selectedLocation.name ? (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <polyline points="2 7 5.5 10.5 12 4" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="4" y="4" width="8" height="8" rx="1" />
                        <path d="M10 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1" />
                      </svg>
                      Copy All Data
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="btn-secondary text-sm px-3 py-2.5"
                  title="Close detail panel"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <line x1="3" y1="3" x2="11" y2="11" />
                    <line x1="11" y1="3" x2="3" y2="11" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Data sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Snow Data */}
              <div className="bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] p-4">
                <div className="flex items-center gap-2 mb-4">
                  <SnowflakeIcon className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                    Snow Loads
                  </h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-[var(--color-text-muted)]">
                        Ground Snow Ss
                      </span>
                      <span className="text-sm font-bold font-mono text-blue-400">
                        {selectedLocation.Ss} kPa
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.min(
                            100,
                            (selectedLocation.Ss / 4.5) * 100
                          )}%`,
                          background:
                            "linear-gradient(90deg, #3b82f6, #22d3ee)",
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-[9px] text-[var(--color-text-muted)] font-mono">
                        0
                      </span>
                      <span className="text-[9px] text-[var(--color-text-muted)] font-mono">
                        4.5 kPa
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[var(--color-text-muted)]">
                        Associated Rain Sr
                      </span>
                      <span className="text-sm font-bold font-mono text-blue-300">
                        {selectedLocation.Sr} kPa
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.min(
                            100,
                            (selectedLocation.Sr / 0.5) * 100
                          )}%`,
                          background:
                            "linear-gradient(90deg, #60a5fa, #93c5fd)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Wind Data */}
              <div className="bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] p-4">
                <div className="flex items-center gap-2 mb-4">
                  <WindIcon className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                    Wind Pressures
                  </h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-[var(--color-text-muted)]">
                        1-in-10 year q{"\u2081\u2080"}
                      </span>
                      <span className="text-sm font-bold font-mono text-emerald-300">
                        {selectedLocation.q10} kPa
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.min(
                            100,
                            (selectedLocation.q10 / 0.7) * 100
                          )}%`,
                          background:
                            "linear-gradient(90deg, #34d399, #6ee7b7)",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-[var(--color-text-muted)]">
                        1-in-50 year q{"\u2085\u2080"}
                      </span>
                      <span className="text-sm font-bold font-mono text-emerald-400">
                        {selectedLocation.q50} kPa
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.min(
                            100,
                            (selectedLocation.q50 / 0.85) * 100
                          )}%`,
                          background:
                            "linear-gradient(90deg, #10b981, #22d3ee)",
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-[9px] text-[var(--color-text-muted)] font-mono">
                        0
                      </span>
                      <span className="text-[9px] text-[var(--color-text-muted)] font-mono">
                        0.85 kPa
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seismic Data */}
              <div className="bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] p-4">
                <div className="flex items-center gap-2 mb-4">
                  <SeismicIcon className="w-4 h-4 text-rose-400" />
                  <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                    Seismic Data
                  </h4>
                </div>
                <div className="space-y-2">
                  {/* Spectral Accelerations */}
                  {[
                    {
                      label: "Sa(0.2)",
                      val: selectedLocation.Sa02,
                      max: 1.0,
                      color: "#fb7185",
                    },
                    {
                      label: "Sa(0.5)",
                      val: selectedLocation.Sa05,
                      max: 0.85,
                      color: "#f97316",
                    },
                    {
                      label: "Sa(1.0)",
                      val: selectedLocation.Sa10,
                      max: 0.5,
                      color: "#fbbf24",
                    },
                    {
                      label: "Sa(2.0)",
                      val: selectedLocation.Sa20,
                      max: 0.25,
                      color: "#a78bfa",
                    },
                  ].map(({ label, val, max, color }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] text-[var(--color-text-muted)]">
                          {label}
                        </span>
                        <span
                          className="text-xs font-bold font-mono"
                          style={{ color }}
                        >
                          {val} g
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${Math.min(100, (val / max) * 100)}%`,
                            background: color,
                            opacity: 0.8,
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  {/* PGA / PGV */}
                  <div className="border-t border-[var(--color-border)] pt-2 mt-2 grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider block mb-0.5">
                        PGA
                      </span>
                      <span className="text-sm font-bold font-mono text-rose-300">
                        {selectedLocation.PGA} g
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider block mb-0.5">
                        PGV
                      </span>
                      <span className="text-sm font-bold font-mono text-orange-300">
                        {selectedLocation.PGV} m/s
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* FOOTER DISCLAIMER                                                 */}
        {/* ================================================================= */}
        <footer className="text-center">
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed max-w-2xl mx-auto">
            Data sourced from NBC 2020 Appendix C. These values are for
            reference and preliminary design only. Always verify against the
            official NBC 2020 for final design. Spectral accelerations are for
            5% damped response. Wind pressures are hourly values for the
            specified return period.
          </p>
        </footer>
      </div>
    </div>
  );
}

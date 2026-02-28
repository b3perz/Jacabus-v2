"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import InputField from "@/components/InputField";
import SelectField from "@/components/SelectField";
import ResultDisplay from "@/components/ResultDisplay";
import {
  calculateLiveLoad,
  OCCUPANCY_TYPES,
  LIVE_LOAD_DEFAULTS,
} from "@/lib/calculators/live-load";

// ---------------------------------------------------------------------------
// Occupancy Category Selector — visual card-based selector
// ---------------------------------------------------------------------------
const CATEGORY_ICONS: Record<string, string> = {
  Assembly: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4",
  Office: "M4 4h16v16H4zM4 8h16M8 4v16",
  Institutional: "M12 2L2 7h20L12 2zM4 7v14h16V7M8 11h2v2H8zM14 11h2v2h-2z",
  Mercantile: "M3 21h18M5 21V10l7-7 7 7v11M9 21v-4h6v4M9 11h6",
  Residential: "M3 21h18M5 21V10l7-7 7 7v11M9 21v-6h6v6",
  Industrial: "M2 20h20M4 20V8l4-4v6l4-4v6l4-4v8",
  Parking: "M5 21V7h14v14M5 14h14M8 10h2M14 10h2M8 17h2M14 17h2",
  Roof: "M3 12l9-7 9 7M5 10v10h14V10",
  Stairs: "M4 20h4v-4h4v-4h4v-4h4V4",
};

function OccupancyCategoryCard({
  category,
  isActive,
  onClick,
  count,
}: {
  category: string;
  isActive: boolean;
  onClick: () => void;
  count: number;
}) {
  const pathData = CATEGORY_ICONS[category] ?? "M12 2L2 7h20L12 2z";

  return (
    <button
      onClick={onClick}
      className={`group p-3 rounded-xl border text-left transition-all duration-300
        ${isActive
          ? "bg-indigo-500/10 border-indigo-500/30 shadow-lg shadow-indigo-500/5"
          : "bg-[var(--color-surface-2)] border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-white/[0.02]"
        }`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300
          ${isActive ? "bg-indigo-500/20" : "bg-white/[0.03]"}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={isActive ? "#818cf8" : "#6b7280"}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d={pathData} />
          </svg>
        </div>
        <div>
          <p className={`text-xs font-semibold transition-colors ${isActive ? "text-indigo-400" : "text-white"}`}>
            {category}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)]">{count} types</p>
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Load Combination Bar Chart
// ---------------------------------------------------------------------------
function LoadComboChart({
  combos,
}: {
  combos: { label: string; value: number; color: string }[];
}) {
  const maxVal = Math.max(...combos.map((c) => c.value), 0.01);
  const svgW = 400;
  const svgH = 160;
  const barH = 22;
  const gap = 8;
  const labelW = 160;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto" style={{ maxHeight: 160 }}>
      {combos.map((c, i) => {
        const y = 10 + i * (barH + gap);
        const barW = Math.max((c.value / maxVal) * (svgW - labelW - 60), 4);
        return (
          <g key={c.label}>
            <text x={labelW - 6} y={y + barH / 2 + 4} textAnchor="end" fill="#9ca3af" fontSize="9" fontFamily="monospace">
              {c.label}
            </text>
            <rect x={labelW} y={y} width={barW} height={barH} rx="4" fill={c.color} opacity="0.8"
              style={{ transition: "width 0.5s ease" }} />
            <text x={labelW + barW + 6} y={y + barH / 2 + 4} fill="white" fontSize="10" fontFamily="monospace" fontWeight="600">
              {c.value.toFixed(2)} kPa
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Reduction Factor Chart
// ---------------------------------------------------------------------------
function ReductionFactorChart({
  currentArea,
  currentFactor,
}: {
  currentArea: number;
  currentFactor: number;
}) {
  const svgW = 360;
  const svgH = 180;
  const pad = { top: 24, bottom: 30, left: 46, right: 20 };
  const plotW = svgW - pad.left - pad.right;
  const plotH = svgH - pad.top - pad.bottom;

  const maxArea = Math.max(currentArea * 2, 200);
  const points: { a: number; f: number }[] = [];
  for (let a = 1; a <= maxArea; a += Math.max(1, maxArea / 100)) {
    const f = a <= 20 ? 1.0 : Math.max(0.5, 0.3 + Math.sqrt(9.8 / a));
    points.push({ a, f });
  }

  const toX = (a: number) => pad.left + (a / maxArea) * plotW;
  const toY = (f: number) => pad.top + plotH - ((f - 0.4) / 0.7) * plotH;

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.a).toFixed(1)},${toY(p.f).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto" style={{ maxHeight: 180 }}>
      <text x={svgW / 2} y={14} textAnchor="middle" fill="#8889a8" fontSize="10" fontWeight="500">
        Live Load Reduction Factor vs Tributary Area
      </text>

      {/* Grid */}
      {[0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((f) => (
        <g key={f}>
          <line x1={pad.left} y1={toY(f)} x2={pad.left + plotW} y2={toY(f)} stroke="#252640" strokeWidth="0.5" />
          <text x={pad.left - 6} y={toY(f) + 3} textAnchor="end" fill="#6b7280" fontSize="8" fontFamily="monospace">{f.toFixed(1)}</text>
        </g>
      ))}

      {/* Curve */}
      <path d={pathD} fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />

      {/* Current point */}
      <circle cx={toX(currentArea)} cy={toY(currentFactor)} r="5" fill="#818cf8" stroke="white" strokeWidth="2"
        style={{ transition: "all 0.4s ease" }} />
      <line x1={toX(currentArea)} y1={toY(currentFactor)} x2={toX(currentArea)} y2={pad.top + plotH}
        stroke="#818cf8" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" style={{ transition: "all 0.4s ease" }} />

      <text x={toX(currentArea) + 8} y={toY(currentFactor) - 6} fill="white" fontSize="9" fontFamily="monospace" fontWeight="600"
        style={{ transition: "all 0.4s ease" }}>
        ({currentArea.toFixed(0)}m², {currentFactor.toFixed(3)})
      </text>

      {/* Axis labels */}
      <text x={svgW / 2} y={svgH - 4} textAnchor="middle" fill="#6b7280" fontSize="8">Tributary Area (m²)</text>
    </svg>
  );
}

// ===========================================================================
// Main Page
// ===========================================================================
export default function LiveLoadPage() {
  const [occupancyId, setOccupancyId] = useState(LIVE_LOAD_DEFAULTS.occupancyId);
  const [tributaryArea, setTributaryArea] = useState(LIVE_LOAD_DEFAULTS.tributaryArea);
  const [deadLoad, setDeadLoad] = useState(LIVE_LOAD_DEFAULTS.deadLoad);
  const [snowLoad, setSnowLoad] = useState(LIVE_LOAD_DEFAULTS.snowLoad);
  const [activeCategory, setActiveCategory] = useState("Office");

  const result = useMemo(
    () => calculateLiveLoad({ occupancyId, tributaryArea, deadLoad, snowLoad }),
    [occupancyId, tributaryArea, deadLoad, snowLoad]
  );

  // Group occupancies by category
  const categories = useMemo(() => {
    const map = new Map<string, typeof OCCUPANCY_TYPES>();
    OCCUPANCY_TYPES.forEach((o) => {
      if (!map.has(o.category)) map.set(o.category, []);
      map.get(o.category)!.push(o);
    });
    return map;
  }, []);

  const filteredOccupancies = useMemo(() => {
    return OCCUPANCY_TYPES.filter((o) => o.category === activeCategory);
  }, [activeCategory]);

  return (
    <CalculatorLayout
      title="Live Load Calculator"
      description="Look up specified live loads per NBC 2020 Table 4.1.5.3, apply tributary area reduction, and compute factored load combinations. Covers all standard occupancy types."
      codeRef="NBC 2020 -- Cl. 4.1.5"
    >
      <div className="space-y-8">
        {/* Category selector */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Occupancy Category
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {Array.from(categories.entries()).map(([cat, items]) => (
              <OccupancyCategoryCard
                key={cat}
                category={cat}
                isActive={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                count={items.length}
              />
            ))}
          </div>
        </div>

        {/* Occupancy type selector */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Occupancy Type
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredOccupancies.map((o) => (
              <button
                key={o.id}
                onClick={() => setOccupancyId(o.id)}
                className={`p-3 rounded-xl border text-left transition-all duration-300 flex items-center justify-between
                  ${occupancyId === o.id
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-[var(--color-surface-2)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                  }`}
              >
                <span className={`text-sm ${occupancyId === o.id ? "text-amber-400 font-semibold" : "text-gray-300"}`}>
                  {o.description}
                </span>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className={occupancyId === o.id ? "text-amber-400" : "text-gray-500"}>
                    {o.uniformLoad} kPa
                  </span>
                  <span className={occupancyId === o.id ? "text-amber-300" : "text-gray-600"}>
                    {o.concentratedLoad} kN
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        {/* Additional inputs */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField label="Tributary Area" value={tributaryArea} onChange={(v) => setTributaryArea(parseFloat(v) || 1)} unit="m²" step="5" />
            <InputField label="Dead Load (D)" value={deadLoad} onChange={(v) => setDeadLoad(parseFloat(v) || 0)} unit="kPa" step="0.5" />
            <InputField label="Snow Load (S)" value={snowLoad} onChange={(v) => setSnowLoad(parseFloat(v) || 0)} unit="kPa" step="0.5" />
          </div>

          {/* Tributary area slider */}
          <div className="mt-4 p-4 bg-[var(--color-surface-2)] rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium">Tributary Area</span>
              <span className="text-sm font-mono font-semibold text-white">{tributaryArea} m²</span>
            </div>
            <input type="range" min="5" max="500" step="5" value={tributaryArea}
              onChange={(e) => setTributaryArea(parseFloat(e.target.value))} className="w-full" />
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        {/* Visualizations */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            Visualizations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">Load Combinations</h4>
              <LoadComboChart
                combos={[
                  { label: "1.25D + 1.5L", value: result.combo_DL, color: "#818cf8" },
                  { label: "1.25D + 1.5L + 0.5S", value: result.combo_DLS, color: "#a78bfa" },
                  { label: "1.25D + 0.5L + 1.5S", value: result.combo_DSL, color: "#c084fc" },
                  { label: "1.0D + 1.0L (SLS)", value: result.combo_SLS, color: "#6366f1" },
                ]}
              />
            </div>
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4">
              <ReductionFactorChart currentArea={tributaryArea} currentFactor={result.reductionFactor} />
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        {/* Results */}
        <ResultDisplay
          results={[
            { label: "Specified Live Load", value: result.uniformLoad, unit: "kPa", highlight: true },
            { label: "Reduced Live Load", value: result.reducedLoad, unit: "kPa", highlight: true },
            { label: "Reduction Factor (LLRF)", value: result.reductionFactor },
            { label: "Concentrated Load", value: result.concentratedLoad, unit: "kN" },
            { label: "Governing ULS", value: Math.max(result.combo_DL, result.combo_DLS, result.combo_DSL), unit: "kPa", highlight: true },
            { label: "SLS (1.0D + 1.0L)", value: result.combo_SLS, unit: "kPa" },
          ]}
          formula={result.formula}
        />
      </div>
    </CalculatorLayout>
  );
}

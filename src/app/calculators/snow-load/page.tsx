"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import InputField from "@/components/InputField";
import SelectField from "@/components/SelectField";
import ResultDisplay from "@/components/ResultDisplay";
import LocationSelector from "@/components/LocationSelector";
import { calculateSnowLoad, SNOW_LOAD_DEFAULTS } from "@/lib/calculators/snow-load";
import { IMPORTANCE_CATEGORIES, type ImportanceCategory } from "@/lib/constants";
import type { ClimaticLocation } from "@/lib/climatic-data";

// ---------------------------------------------------------------------------
// Factor range config for visual indicators
// ---------------------------------------------------------------------------
interface FactorRange {
  label: string;
  symbol: string;
  min: number;
  max: number;
  favorable: number; // lower bound of green zone
  unfavorable: number; // upper bound that triggers red
  description: string;
}

const FACTOR_RANGES: Record<string, FactorRange> = {
  Cb: { label: "Basic Roof Factor", symbol: "Cb", min: 0.0, max: 2.0, favorable: 0.8, unfavorable: 1.5, description: "Relates roof snow to ground snow" },
  Cw: { label: "Wind Exposure", symbol: "Cw", min: 0.5, max: 1.0, favorable: 0.5, unfavorable: 1.0, description: "Reduced for exposed sites" },
  Cs: { label: "Slope Factor", symbol: "Cs", min: 0.0, max: 1.0, favorable: 0.0, unfavorable: 1.0, description: "Reduced for steep roofs" },
  Ca: { label: "Shape Factor", symbol: "Ca", min: 0.5, max: 3.0, favorable: 0.5, unfavorable: 2.0, description: "Accumulation / geometry" },
};

function getFactorColor(value: number, range: FactorRange): { bar: string; text: string; bg: string } {
  const normalized = (value - range.min) / (range.max - range.min);
  if (normalized <= 0.33) {
    return { bar: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-500/10" };
  }
  if (normalized <= 0.66) {
    return { bar: "bg-amber-400", text: "text-amber-400", bg: "bg-amber-500/10" };
  }
  return { bar: "bg-rose-400", text: "text-rose-400", bg: "bg-rose-500/10" };
}

// ---------------------------------------------------------------------------
// Factor Visual Indicator
// ---------------------------------------------------------------------------
function FactorIndicator({ symbol, value }: { symbol: string; value: number }) {
  const range = FACTOR_RANGES[symbol];
  if (!range) return null;

  const clampedValue = Math.max(range.min, Math.min(range.max, value));
  const pct = ((clampedValue - range.min) / (range.max - range.min)) * 100;
  const colors = getFactorColor(value, range);

  return (
    <div className={`p-3 rounded-xl border border-[var(--color-border)] ${colors.bg} transition-all duration-500`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-[var(--color-text-muted)]">{range.description}</span>
        <span className={`text-xs font-mono font-bold ${colors.text} transition-colors duration-500`}>{value.toFixed(2)}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${colors.bar} transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
        {/* tick marks */}
        <div className="absolute inset-y-0 left-1/3 w-px bg-white/10" />
        <div className="absolute inset-y-0 left-2/3 w-px bg-white/10" />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] font-mono text-[var(--color-text-muted)]/50">{range.min}</span>
        <span className="text-[10px] font-mono text-[var(--color-text-muted)]/50">{range.max}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Interactive Snow Load Diagram (SVG)
// ---------------------------------------------------------------------------
function SnowLoadDiagram({
  S,
  Cb,
  Cw,
  Cs,
  Ca,
  Is,
}: {
  S: number;
  Cb: number;
  Cw: number;
  Cs: number;
  Ca: number;
  Is: number;
}) {
  // Snow depth proportional to load, capped visually
  const maxSnowDepth = 60;
  const snowDepth = Math.min(maxSnowDepth, Math.max(4, S * 15));

  // Building dimensions in SVG coords
  const buildingLeft = 80;
  const buildingRight = 420;
  const buildingWidth = buildingRight - buildingLeft;
  const roofPeak = 70;
  const eaveHeight = 130;
  const groundY = 230;
  const buildingMid = buildingLeft + buildingWidth / 2;

  // Roof ridge points
  const roofLeftX = buildingLeft;
  const roofRightX = buildingRight;
  const roofLeftY = eaveHeight;
  const roofRightY = eaveHeight;
  const ridgeX = buildingMid;
  const ridgeY = roofPeak;

  // Snow polygon follows roof shape, offset upward by snowDepth
  const snowPath = `
    M ${roofLeftX - 4},${roofLeftY}
    Q ${roofLeftX + 10},${roofLeftY - snowDepth * 0.6} ${roofLeftX + buildingWidth * 0.15},${roofLeftY - snowDepth * 0.85}
    Q ${roofLeftX + buildingWidth * 0.3},${ridgeY - snowDepth} ${ridgeX},${ridgeY - snowDepth}
    Q ${roofRightX - buildingWidth * 0.3},${ridgeY - snowDepth} ${roofRightX - buildingWidth * 0.15},${roofRightY - snowDepth * 0.85}
    Q ${roofRightX - 10},${roofRightY - snowDepth * 0.6} ${roofRightX + 4},${roofRightY}
    L ${ridgeX},${ridgeY}
    Z
  `;

  // Arrow helper
  const Arrow = ({ x, y1, y2, label }: { x: number; y1: number; y2: number; label: string }) => (
    <g className="transition-all duration-500">
      <line x1={x} y1={y1} x2={x} y2={y2} stroke="#818cf8" strokeWidth="1.5" markerEnd="url(#arrowhead)" opacity="0.7" />
      <text x={x} y={y1 - 6} textAnchor="middle" className="text-[9px] fill-indigo-300 font-mono" opacity="0.9">
        {label}
      </text>
    </g>
  );

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 500 260" className="w-full h-auto" style={{ maxHeight: "280px" }}>
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#818cf8" opacity="0.8" />
          </marker>
          <linearGradient id="snowGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="buildingGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0f0e24" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="roofGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Ground line */}
        <line x1="30" y1={groundY} x2="470" y2={groundY} stroke="#252640" strokeWidth="1.5" strokeDasharray="6 4" />
        <text x="250" y={groundY + 16} textAnchor="middle" className="text-[9px] fill-[#8889a8] font-mono" opacity="0.5">
          ground level
        </text>

        {/* Building walls */}
        <rect
          x={buildingLeft}
          y={eaveHeight}
          width={buildingWidth}
          height={groundY - eaveHeight}
          fill="url(#buildingGradient)"
          stroke="#252640"
          strokeWidth="1"
          rx="2"
        />
        {/* Wall lines for detail */}
        <line x1={buildingLeft} y1={eaveHeight} x2={buildingLeft} y2={groundY} stroke="#818cf8" strokeWidth="1" opacity="0.25" />
        <line x1={buildingRight} y1={eaveHeight} x2={buildingRight} y2={groundY} stroke="#818cf8" strokeWidth="1" opacity="0.25" />

        {/* Windows */}
        {[0.25, 0.5, 0.75].map((pct) => (
          <rect
            key={pct}
            x={buildingLeft + buildingWidth * pct - 10}
            y={eaveHeight + 35}
            width="20"
            height="25"
            rx="2"
            fill="none"
            stroke="#818cf8"
            strokeWidth="0.7"
            opacity="0.2"
          />
        ))}
        {/* Door */}
        <rect
          x={buildingMid - 12}
          y={groundY - 40}
          width="24"
          height="40"
          rx="2"
          fill="none"
          stroke="#818cf8"
          strokeWidth="0.7"
          opacity="0.2"
        />

        {/* Roof structure */}
        <polygon
          points={`${roofLeftX},${roofLeftY} ${ridgeX},${ridgeY} ${roofRightX},${roofRightY}`}
          fill="url(#roofGradient)"
          stroke="#818cf8"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Snow accumulation */}
        <path
          d={snowPath}
          fill="url(#snowGradient)"
          stroke="#bae6fd"
          strokeWidth="1"
          opacity="0.9"
          className="transition-all duration-700 ease-out"
        />

        {/* Load arrows from snow to roof */}
        <Arrow x={buildingLeft + buildingWidth * 0.2} y1={roofLeftY - snowDepth - 20} y2={roofLeftY - snowDepth + 2} label="" />
        <Arrow x={buildingLeft + buildingWidth * 0.35} y1={ridgeY - snowDepth - 24} y2={(ridgeY + roofLeftY) / 2 - snowDepth + 2} label="" />
        <Arrow x={buildingMid} y1={ridgeY - snowDepth - 20} y2={ridgeY - snowDepth + 2} label="S" />
        <Arrow x={buildingLeft + buildingWidth * 0.65} y1={ridgeY - snowDepth - 24} y2={(ridgeY + roofRightY) / 2 - snowDepth + 2} label="" />
        <Arrow x={buildingLeft + buildingWidth * 0.8} y1={roofRightY - snowDepth - 20} y2={roofRightY - snowDepth + 2} label="" />

        {/* Factor labels on the diagram */}
        {/* Cb label near ridge */}
        <g>
          <rect x={ridgeX - 30} y={ridgeY - 2} width="60" height="18" rx="4" fill="#6366f1" fillOpacity="0.15" stroke="#6366f1" strokeWidth="0.5" strokeOpacity="0.3" />
          <text x={ridgeX} y={ridgeY + 12} textAnchor="middle" className="text-[9px] fill-indigo-300 font-mono font-medium">
            Cb={Cb}
          </text>
        </g>

        {/* Cw label with wind indicator */}
        <g>
          <rect x="14" y={eaveHeight - 12} width="52" height="18" rx="4" fill="#22d3ee" fillOpacity="0.1" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.3" />
          <text x="40" y={eaveHeight + 2} textAnchor="middle" className="text-[9px] fill-cyan-300 font-mono font-medium">
            Cw={Cw}
          </text>
          {/* Wind lines */}
          <line x1="20" y1={eaveHeight + 22} x2="55" y2={eaveHeight + 22} stroke="#22d3ee" strokeWidth="0.8" opacity="0.4" />
          <line x1="25" y1={eaveHeight + 28} x2="50" y2={eaveHeight + 28} stroke="#22d3ee" strokeWidth="0.6" opacity="0.3" />
          <line x1="30" y1={eaveHeight + 34} x2="48" y2={eaveHeight + 34} stroke="#22d3ee" strokeWidth="0.4" opacity="0.2" />
        </g>

        {/* Cs label on roof slope */}
        <g>
          <rect x={buildingLeft + 14} y={((roofLeftY + ridgeY) / 2) - 8} width="50" height="18" rx="4" fill="#a78bfa" fillOpacity="0.1" stroke="#a78bfa" strokeWidth="0.5" strokeOpacity="0.3" />
          <text x={buildingLeft + 39} y={((roofLeftY + ridgeY) / 2) + 6} textAnchor="middle" className="text-[9px] fill-violet-300 font-mono font-medium">
            Cs={Cs}
          </text>
        </g>

        {/* Ca label on right side */}
        <g>
          <rect x={buildingRight - 62} y={((roofRightY + ridgeY) / 2) - 8} width="50" height="18" rx="4" fill="#fbbf24" fillOpacity="0.1" stroke="#fbbf24" strokeWidth="0.5" strokeOpacity="0.3" />
          <text x={buildingRight - 37} y={((roofRightY + ridgeY) / 2) + 6} textAnchor="middle" className="text-[9px] fill-amber-300 font-mono font-medium">
            Ca={Ca}
          </text>
        </g>

        {/* Is label bottom right */}
        <g>
          <rect x={buildingRight + 14} y={eaveHeight + 20} width="48" height="18" rx="4" fill="#34d399" fillOpacity="0.1" stroke="#34d399" strokeWidth="0.5" strokeOpacity="0.3" />
          <text x={buildingRight + 38} y={eaveHeight + 34} textAnchor="middle" className="text-[9px] fill-emerald-300 font-mono font-medium">
            Is={Is}
          </text>
        </g>

        {/* Result label */}
        <g>
          <text x="250" y={groundY + 40} textAnchor="middle" className="text-[11px] fill-indigo-300 font-mono font-bold">
            S = {S.toFixed(3)} kPa
          </text>
        </g>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Load Combination Bar Chart
// ---------------------------------------------------------------------------
function LoadCombinationDisplay({
  S,
  deadLoad,
  liveLoad,
}: {
  S: number;
  deadLoad: number;
  liveLoad: number;
}) {
  const combos = [
    {
      label: "1.25D + 1.5S",
      ref: "NBC 2020 — Table 4.1.3.2",
      value: 1.25 * deadLoad + 1.5 * S,
      parts: [
        { label: "1.25D", value: 1.25 * deadLoad, color: "bg-indigo-500" },
        { label: "1.5S", value: 1.5 * S, color: "bg-cyan-400" },
      ],
    },
    {
      label: "1.25D + 1.5S + 0.5L",
      ref: "NBC 2020 — Table 4.1.3.2",
      value: 1.25 * deadLoad + 1.5 * S + 0.5 * liveLoad,
      parts: [
        { label: "1.25D", value: 1.25 * deadLoad, color: "bg-indigo-500" },
        { label: "1.5S", value: 1.5 * S, color: "bg-cyan-400" },
        { label: "0.5L", value: 0.5 * liveLoad, color: "bg-amber-400" },
      ],
    },
    {
      label: "1.0D + 1.0S (SLS)",
      ref: "Serviceability",
      value: 1.0 * deadLoad + 1.0 * S,
      parts: [
        { label: "1.0D", value: 1.0 * deadLoad, color: "bg-indigo-500/60" },
        { label: "1.0S", value: 1.0 * S, color: "bg-cyan-400/60" },
      ],
    },
  ];

  const maxValue = Math.max(...combos.map((c) => c.value), 0.01);

  return (
    <div className="space-y-3">
      {combos.map((combo) => {
        const totalPct = (combo.value / maxValue) * 100;
        return (
          <div key={combo.label} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span className="text-xs font-mono font-semibold text-white">{combo.label}</span>
                <span className="ml-2 text-[10px] text-[var(--color-text-muted)]">{combo.ref}</span>
              </div>
              <span className="text-sm font-mono font-bold text-white transition-all duration-500">
                {combo.value.toFixed(3)} <span className="text-xs font-normal text-[var(--color-text-muted)]">kPa</span>
              </span>
            </div>
            {/* Stacked bar */}
            <div className="relative h-6 rounded-lg bg-[var(--color-surface-2)] overflow-hidden border border-[var(--color-border)]">
              <div className="absolute inset-y-0 left-0 flex transition-all duration-700 ease-out" style={{ width: `${totalPct}%` }}>
                {combo.parts.map((part) => {
                  const partPct = combo.value > 0 ? (part.value / combo.value) * 100 : 0;
                  return (
                    <div
                      key={part.label}
                      className={`h-full ${part.color} transition-all duration-700 ease-out relative group/part`}
                      style={{ width: `${partPct}%` }}
                      title={`${part.label} = ${part.value.toFixed(3)} kPa`}
                    >
                      {partPct > 18 && (
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-medium text-white/80">
                          {part.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Part breakdown */}
            <div className="flex gap-3 mt-1">
              {combo.parts.map((part) => (
                <span key={part.label} className="text-[10px] font-mono text-[var(--color-text-muted)]">
                  {part.label} = {part.value.toFixed(3)}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===========================================================================
// Main Page Component
// ===========================================================================
export default function SnowLoadPage() {
  const [Ss, setSs] = useState(SNOW_LOAD_DEFAULTS.Ss);
  const [Sr, setSr] = useState(SNOW_LOAD_DEFAULTS.Sr);
  const [importance, setImportance] = useState<ImportanceCategory>("normal");
  const [Cb, setCb] = useState(SNOW_LOAD_DEFAULTS.Cb);
  const [Cw, setCw] = useState(SNOW_LOAD_DEFAULTS.Cw);
  const [Cs, setCs] = useState(SNOW_LOAD_DEFAULTS.Cs);
  const [Ca, setCa] = useState(SNOW_LOAD_DEFAULTS.Ca);

  // Location selector state
  const [selectedLocation, setSelectedLocation] = useState<ClimaticLocation | null>(null);
  const [useManualInput, setUseManualInput] = useState(false);

  // Dead / live loads for load combinations
  const [deadLoad, setDeadLoad] = useState(1.5);
  const [liveLoad, setLiveLoad] = useState(1.0);

  const Is = IMPORTANCE_CATEGORIES[importance].Is;

  const result = useMemo(
    () => calculateSnowLoad({ Ss, Sr, Is, Cb, Cw, Cs, Ca }),
    [Ss, Sr, Is, Cb, Cw, Cs, Ca]
  );

  // Handle location selection
  const handleLocationSelect = (location: ClimaticLocation) => {
    setSelectedLocation(location);
    setSs(location.Ss);
    setSr(location.Sr);
  };

  return (
    <CalculatorLayout
      title="Snow Load Calculator"
      description="Calculate specified snow loads on roofs per NBC 2020, Section 4.1.6. The snow load equation accounts for ground snow, associated rain, and roof geometry factors."
      codeRef="NBC 2020 — Cl. 4.1.6"
    >
      <div className="space-y-8">
        {/* ----------------------------------------------------------------- */}
        {/* Location Selector */}
        {/* ----------------------------------------------------------------- */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Location
          </h3>

          {!useManualInput && (
            <LocationSelector
              onSelect={handleLocationSelect}
              selected={selectedLocation}
            />
          )}

          {/* Selected location data summary */}
          {selectedLocation && !useManualInput && (
            <div className="mt-3 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15 transition-all duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Ground Snow</span>
                    <p className="text-sm font-mono font-bold text-cyan-400">{selectedLocation.Ss} <span className="text-xs font-normal text-[var(--color-text-muted)]">kPa</span></p>
                  </div>
                  <div className="w-px h-8 bg-[var(--color-border)]" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Assoc. Rain</span>
                    <p className="text-sm font-mono font-bold text-cyan-400">{selectedLocation.Sr} <span className="text-xs font-normal text-[var(--color-text-muted)]">kPa</span></p>
                  </div>
                </div>
                <span className="tag-cyan text-[10px]">
                  Auto-populated
                </span>
              </div>
            </div>
          )}

          {/* Toggle for manual input */}
          <button
            onClick={() => setUseManualInput(!useManualInput)}
            className="mt-3 text-xs text-[var(--color-text-muted)] hover:text-indigo-400 transition-colors duration-300 flex items-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {useManualInput ? (
                <>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </>
              ) : (
                <>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </>
              )}
            </svg>
            {useManualInput ? "Use location selector instead" : "Or enter values manually"}
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--color-border)]" />

        {/* ----------------------------------------------------------------- */}
        {/* Interactive Snow Load Diagram */}
        {/* ----------------------------------------------------------------- */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            Snow Load Diagram
          </h3>
          <div className="p-4 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] transition-all duration-500">
            <SnowLoadDiagram S={result.S} Cb={Cb} Cw={Cw} Cs={Cs} Ca={Ca} Is={Is} />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--color-border)]" />

        {/* ----------------------------------------------------------------- */}
        {/* Input Parameters */}
        {/* ----------------------------------------------------------------- */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Input Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Ss and Sr: always shown, but disabled when populated from location */}
            <div>
              <InputField
                label="Ground Snow Load (Ss)"
                value={Ss}
                onChange={(v) => {
                  setSs(parseFloat(v) || 0);
                  if (!useManualInput && selectedLocation) {
                    // User is overriding the location value
                  }
                }}
                unit="kPa"
                hint="1-in-50 year"
                step="0.1"
              />
              {!useManualInput && selectedLocation && (
                <p className="text-[10px] text-cyan-400/60 mt-1 font-mono ml-1">from {selectedLocation.name}</p>
              )}
            </div>
            <div>
              <InputField
                label="Associated Rain (Sr)"
                value={Sr}
                onChange={(v) => {
                  setSr(parseFloat(v) || 0);
                }}
                unit="kPa"
                step="0.1"
              />
              {!useManualInput && selectedLocation && (
                <p className="text-[10px] text-cyan-400/60 mt-1 font-mono ml-1">from {selectedLocation.name}</p>
              )}
            </div>
            <SelectField
              label="Importance Category"
              value={importance}
              onChange={(v) => setImportance(v as ImportanceCategory)}
              options={Object.entries(IMPORTANCE_CATEGORIES).map(([k, v]) => ({
                value: k,
                label: `${v.label} (Is = ${v.Is})`,
              }))}
            />
            <InputField
              label="Basic Roof Factor (Cb)"
              value={Cb}
              onChange={(v) => setCb(parseFloat(v) || 0)}
              hint="typ. 0.8"
              step="0.1"
            />
            <InputField
              label="Wind Exposure (Cw)"
              value={Cw}
              onChange={(v) => setCw(parseFloat(v) || 0)}
              hint="0.5–1.0"
              step="0.1"
            />
            <InputField
              label="Slope Factor (Cs)"
              value={Cs}
              onChange={(v) => setCs(parseFloat(v) || 0)}
              step="0.1"
            />
            <InputField
              label="Shape Factor (Ca)"
              value={Ca}
              onChange={(v) => setCa(parseFloat(v) || 0)}
              step="0.1"
            />
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Visual Factor Indicators */}
        {/* ----------------------------------------------------------------- */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Factor Assessment
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FactorIndicator symbol="Cb" value={Cb} />
            <FactorIndicator symbol="Cw" value={Cw} />
            <FactorIndicator symbol="Cs" value={Cs} />
            <FactorIndicator symbol="Ca" value={Ca} />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--color-border)]" />

        {/* ----------------------------------------------------------------- */}
        {/* Results */}
        {/* ----------------------------------------------------------------- */}
        <ResultDisplay
          results={[
            { label: "Specified Snow Load (S)", value: result.S, unit: "kPa", highlight: true },
            { label: "Factored ULS (1.5S)", value: result.factoredULS, unit: "kPa", highlight: true },
            { label: "Snow Component", value: result.snowComponent, unit: "kPa" },
            { label: "Rain Component", value: result.rainComponent, unit: "kPa" },
          ]}
          formula={result.formula}
        />

        {/* Divider */}
        <div className="border-t border-[var(--color-border)]" />

        {/* ----------------------------------------------------------------- */}
        {/* Load Combinations */}
        {/* ----------------------------------------------------------------- */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Load Combinations
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mb-4">
            NBC 2020 factored load combinations involving snow. Enter estimated dead and live loads to compute factored totals.
          </p>

          {/* Dead/Live load inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <InputField
              label="Dead Load (D)"
              value={deadLoad}
              onChange={(v) => setDeadLoad(parseFloat(v) || 0)}
              unit="kPa"
              hint="estimated"
              step="0.1"
            />
            <InputField
              label="Live Load (L)"
              value={liveLoad}
              onChange={(v) => setLiveLoad(parseFloat(v) || 0)}
              unit="kPa"
              hint="estimated"
              step="0.1"
            />
          </div>

          {/* Load combination bar chart */}
          <div className="p-4 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            <LoadCombinationDisplay S={result.S} deadLoad={deadLoad} liveLoad={liveLoad} />
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}

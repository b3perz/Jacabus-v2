"use client";

import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import InputField from "@/components/InputField";
import SelectField from "@/components/SelectField";
import ResultDisplay from "@/components/ResultDisplay";
import LocationSelector from "@/components/LocationSelector";
import {
  calculateSnowDrift,
  SNOW_DRIFT_DEFAULTS,
  type SnowDriftInput,
} from "@/lib/calculators/snow-drift";
import { IMPORTANCE_CATEGORIES, type ImportanceCategory } from "@/lib/constants";
import type { ClimaticLocation } from "@/lib/climatic-data";

// ---------------------------------------------------------------------------
// Interactive Snow Drift Diagram
// ---------------------------------------------------------------------------
function SnowDriftDiagram({
  type,
  hp,
  balancedLoad,
  peakDriftLoad,
  xd,
  gamma,
  lu,
  ll,
}: {
  type: "step" | "obstruction";
  hp: number;
  balancedLoad: number;
  peakDriftLoad: number;
  xd: number;
  gamma: number;
  lu: number;
  ll: number;
}) {
  const svgW = 640;
  const svgH = 340;

  // Scale factors
  const totalWidth = lu + ll;
  const scaleX = 420 / totalWidth;
  const maxH = Math.max(hp, peakDriftLoad / gamma, 2);
  const scaleY = 160 / maxH;

  const groundY = 260;
  const upperRoofX = 100;
  const stepX = upperRoofX + lu * scaleX;
  const lowerEndX = stepX + ll * scaleX;

  const upperRoofY = groundY - hp * scaleY;
  const balancedH = balancedLoad / gamma;
  const peakH = peakDriftLoad / gamma;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto" style={{ maxHeight: 340 }}>
      <defs>
        <linearGradient id="snow-drift-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="drift-peak-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.3" />
        </linearGradient>
        <pattern id="snow-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Title */}
      <text x={svgW / 2} y={18} textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">
        Snow Drift — {type === "step" ? "Step Condition" : "Obstruction"}
      </text>

      {/* Upper roof */}
      <rect x={upperRoofX - 20} y={upperRoofY} width={lu * scaleX + 20} height={6} fill="#334155" rx="1" />
      {/* Upper building */}
      <rect x={upperRoofX - 20} y={upperRoofY} width={30} height={groundY - upperRoofY} fill="#1e293b" stroke="#475569" strokeWidth="1" />

      {/* Lower roof */}
      <rect x={stepX} y={groundY} width={ll * scaleX} height={6} fill="#334155" rx="1" />
      {/* Lower building wall at step */}
      <rect x={stepX - 4} y={upperRoofY} width={8} height={groundY - upperRoofY + 6} fill="#1e293b" stroke="#475569" strokeWidth="1" />

      {/* Ground hatching */}
      <line x1={50} y1={groundY + 30} x2={lowerEndX + 30} y2={groundY + 30} stroke="#475569" strokeWidth="1.5" strokeDasharray="6 4" />

      {/* Balanced snow on lower roof */}
      <rect
        x={stepX + 4}
        y={groundY - balancedH * scaleY}
        width={ll * scaleX - 8}
        height={balancedH * scaleY}
        fill="url(#snow-drift-grad)"
        stroke="#7dd3fc"
        strokeWidth="0.8"
        rx="2"
        style={{ transition: "all 0.5s ease" }}
      />
      <rect
        x={stepX + 4}
        y={groundY - balancedH * scaleY}
        width={ll * scaleX - 8}
        height={balancedH * scaleY}
        fill="url(#snow-hatch)"
        rx="2"
      />

      {/* Drift triangle */}
      <polygon
        points={`
          ${stepX + 4},${groundY - balancedH * scaleY}
          ${stepX + 4},${groundY - peakH * scaleY}
          ${stepX + 4 + xd * scaleX},${groundY - balancedH * scaleY}
        `}
        fill="url(#drift-peak-grad)"
        stroke="#0ea5e9"
        strokeWidth="1"
        style={{ transition: "all 0.5s ease" }}
      />

      {/* Dimension: hp */}
      <line x1={stepX - 20} y1={upperRoofY} x2={stepX - 20} y2={groundY} stroke="#818cf8" strokeWidth="1" />
      <line x1={stepX - 24} y1={upperRoofY} x2={stepX - 16} y2={upperRoofY} stroke="#818cf8" strokeWidth="1" />
      <line x1={stepX - 24} y1={groundY} x2={stepX - 16} y2={groundY} stroke="#818cf8" strokeWidth="1" />
      <text
        x={stepX - 22}
        y={upperRoofY + (groundY - upperRoofY) / 2 + 4}
        textAnchor="middle"
        fill="#818cf8"
        fontSize="9"
        fontFamily="monospace"
        fontWeight="600"
        transform={`rotate(-90, ${stepX - 22}, ${upperRoofY + (groundY - upperRoofY) / 2})`}
      >
        hp = {hp.toFixed(1)}m
      </text>

      {/* Dimension: xd */}
      <line x1={stepX + 4} y1={groundY + 16} x2={stepX + 4 + xd * scaleX} y2={groundY + 16} stroke="#22d3ee" strokeWidth="1" />
      <line x1={stepX + 4} y1={groundY + 12} x2={stepX + 4} y2={groundY + 20} stroke="#22d3ee" strokeWidth="1" />
      <line x1={stepX + 4 + xd * scaleX} y1={groundY + 12} x2={stepX + 4 + xd * scaleX} y2={groundY + 20} stroke="#22d3ee" strokeWidth="1" />
      <text x={stepX + 4 + (xd * scaleX) / 2} y={groundY + 28} textAnchor="middle" fill="#22d3ee" fontSize="9" fontFamily="monospace">
        xd = {xd.toFixed(1)}m
      </text>

      {/* Peak load label */}
      <rect
        x={stepX + 10}
        y={groundY - peakH * scaleY - 28}
        width={100}
        height={22}
        rx="6"
        fill="rgba(14,165,233,0.15)"
        stroke="rgba(14,165,233,0.4)"
        strokeWidth="1"
      />
      <text
        x={stepX + 60}
        y={groundY - peakH * scaleY - 13}
        textAnchor="middle"
        fill="#38bdf8"
        fontSize="10"
        fontFamily="monospace"
        fontWeight="700"
      >
        {peakDriftLoad.toFixed(2)} kPa
      </text>

      {/* Balanced load label */}
      <text
        x={stepX + ll * scaleX / 2}
        y={groundY - balancedH * scaleY / 2 + 4}
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontFamily="monospace"
        opacity="0.7"
      >
        {balancedLoad.toFixed(2)} kPa
      </text>

      {/* Upper roof length */}
      <text x={upperRoofX + (lu * scaleX) / 2} y={upperRoofY - 10} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
        lu = {lu}m
      </text>

      {/* Lower roof length */}
      <text x={stepX + (ll * scaleX) / 2} y={groundY + 42} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
        ll = {ll}m
      </text>

      {/* Snowflake decorations */}
      {[0, 1, 2, 3, 4].map((i) => (
        <text
          key={i}
          x={stepX + 20 + i * 30}
          y={groundY - peakH * scaleY - 40 - (i % 2) * 15}
          fill="#bae6fd"
          fontSize="14"
          opacity={0.25}
          style={{ animation: `snowfall ${2 + i * 0.3}s ease-in-out ${i * 0.4}s infinite` }}
        >
          *
        </text>
      ))}

      <style>{`
        @keyframes snowfall {
          0%, 100% { opacity: 0.15; transform: translateY(0px); }
          50% { opacity: 0.35; transform: translateY(6px); }
        }
      `}</style>
    </svg>
  );
}

// ===========================================================================
// Main Page Component
// ===========================================================================
export default function SnowDriftPage() {
  const [selectedLocation, setSelectedLocation] = useState<ClimaticLocation | null>(null);
  const [Ss, setSs] = useState(SNOW_DRIFT_DEFAULTS.Ss);
  const [Sr, setSr] = useState(SNOW_DRIFT_DEFAULTS.Sr);
  const [importance, setImportance] = useState<ImportanceCategory>("normal");
  const [lu, setLu] = useState(SNOW_DRIFT_DEFAULTS.lu);
  const [hp, setHp] = useState(SNOW_DRIFT_DEFAULTS.hp);
  const [ll, setLl] = useState(SNOW_DRIFT_DEFAULTS.ll);
  const [Cb, setCb] = useState(SNOW_DRIFT_DEFAULTS.Cb);
  const [Cw, setCw] = useState(SNOW_DRIFT_DEFAULTS.Cw);
  const [Cs, setCs] = useState(SNOW_DRIFT_DEFAULTS.Cs);
  const [driftType, setDriftType] = useState<"step" | "obstruction">(SNOW_DRIFT_DEFAULTS.type);
  const [ho, setHo] = useState(SNOW_DRIFT_DEFAULTS.ho ?? 3);

  const Is = IMPORTANCE_CATEGORIES[importance].Is;

  const result = useMemo(
    () =>
      calculateSnowDrift({
        Ss, Sr, Is, lu, hp, ll, Cb, Cw, Cs,
        type: driftType,
        ho: driftType === "obstruction" ? ho : undefined,
      }),
    [Ss, Sr, Is, lu, hp, ll, Cb, Cw, Cs, driftType, ho]
  );

  const handleLocationSelect = useCallback((loc: ClimaticLocation) => {
    setSelectedLocation(loc);
    setSs(loc.Ss);
    setSr(loc.Sr);
  }, []);

  return (
    <CalculatorLayout
      title="Snow Drift Calculator"
      description="Calculate snow drift loads on lower adjacent roofs per NBC 2020, Section 4.1.6. Supports step conditions and obstruction configurations with interactive visualization."
      codeRef="NBC 2020 -- Cl. 4.1.6"
    >
      <div className="space-y-8">
        {/* Location */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Location
          </h3>
          <LocationSelector onSelect={handleLocationSelect} selected={selectedLocation} />
          {selectedLocation && (
            <div className="mt-3 p-3 bg-[var(--color-surface-2)] rounded-xl text-sm flex flex-wrap gap-x-6 gap-y-1"
              style={{ animation: "fadeInScale 0.25s ease-out" }}>
              <div>
                <span className="text-[var(--color-text-muted)]">Ss = </span>
                <span className="font-mono font-semibold text-cyan-400">{selectedLocation.Ss} kPa</span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">Sr = </span>
                <span className="font-mono font-semibold text-white">{selectedLocation.Sr} kPa</span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--color-border)]" />

        {/* Inputs */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SelectField
              label="Drift Type"
              value={driftType}
              onChange={(v) => setDriftType(v as "step" | "obstruction")}
              options={[
                { value: "step", label: "Step Condition (adjacent roofs)" },
                { value: "obstruction", label: "Obstruction (parapet, etc.)" },
              ]}
            />
            <InputField label="Ground Snow Load (Ss)" value={Ss} onChange={(v) => setSs(parseFloat(v) || 0)} unit="kPa" step="0.1" />
            <InputField label="Rain Load (Sr)" value={Sr} onChange={(v) => setSr(parseFloat(v) || 0)} unit="kPa" step="0.1" />
            <SelectField
              label="Importance Category"
              value={importance}
              onChange={(v) => setImportance(v as ImportanceCategory)}
              options={Object.entries(IMPORTANCE_CATEGORIES).map(([k, v]) => ({
                value: k,
                label: `${v.label} (Is = ${v.Is})`,
              }))}
            />
            <InputField label="Upper Roof Length (lu)" value={lu} onChange={(v) => setLu(parseFloat(v) || 1)} unit="m" step="1" />
            <InputField label="Lower Roof Length (ll)" value={ll} onChange={(v) => setLl(parseFloat(v) || 1)} unit="m" step="1" />
            <InputField label="Step Height (hp)" value={hp} onChange={(v) => setHp(parseFloat(v) || 0.5)} unit="m" step="0.5" />
            {driftType === "obstruction" && (
              <InputField label="Obstruction Height (ho)" value={ho} onChange={(v) => setHo(parseFloat(v) || 0.5)} unit="m" step="0.5" />
            )}
            <InputField label="Cb" value={Cb} onChange={(v) => setCb(parseFloat(v) || 0)} step="0.1" hint="Basic roof factor" />
            <InputField label="Cw" value={Cw} onChange={(v) => setCw(parseFloat(v) || 0)} step="0.1" hint="Wind exposure" />
            <InputField label="Cs" value={Cs} onChange={(v) => setCs(parseFloat(v) || 0)} step="0.1" hint="Slope factor" />
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        {/* Interactive Diagram */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Snow Drift Diagram
            <span className="ml-auto flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </h3>
          <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4 overflow-hidden">
            <SnowDriftDiagram
              type={driftType}
              hp={hp}
              balancedLoad={result.balancedLoad}
              peakDriftLoad={result.peakDriftLoad}
              xd={result.xd}
              gamma={result.gamma}
              lu={lu}
              ll={ll}
            />
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        {/* Results */}
        <ResultDisplay
          results={[
            { label: "Peak Drift Load", value: result.peakDriftLoad, unit: "kPa", highlight: true },
            { label: "Factored ULS (1.5S)", value: result.factoredULS, unit: "kPa", highlight: true },
            { label: "Balanced Load", value: result.balancedLoad, unit: "kPa" },
            { label: "Drift Surcharge", value: result.driftSurcharge, unit: "kPa" },
            { label: "Ca₀", value: result.Ca0 },
            { label: "Drift Extent (xd)", value: `${result.xd.toFixed(1)} m` },
            { label: "Snow Density (γ)", value: `${result.gamma.toFixed(3)} kN/m³` },
          ]}
          formula={result.formula}
        />
      </div>
    </CalculatorLayout>
  );
}

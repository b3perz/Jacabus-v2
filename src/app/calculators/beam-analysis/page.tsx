"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import InputField from "@/components/InputField";
import SelectField from "@/components/SelectField";
import ResultDisplay from "@/components/ResultDisplay";
import BeamDiagram from "@/components/BeamDiagram";
import {
  calculateBeam,
  BEAM_DEFAULTS,
  type BeamType,
  type LoadType,
} from "@/lib/calculators/beam-analysis";

export default function BeamAnalysisPage() {
  const [L, setL] = useState(BEAM_DEFAULTS.L);
  const [E, setE] = useState(BEAM_DEFAULTS.E);
  const [I, setI] = useState(BEAM_DEFAULTS.I);
  const [beamType, setBeamType] = useState<BeamType>(BEAM_DEFAULTS.beamType);
  const [loadType, setLoadType] = useState<LoadType>(BEAM_DEFAULTS.loadType);
  const [load, setLoad] = useState(BEAM_DEFAULTS.load);
  const [a, setA] = useState(BEAM_DEFAULTS.L / 3);

  const result = useMemo(
    () =>
      calculateBeam({
        L,
        E,
        I,
        beamType,
        loadType,
        load,
        a: loadType === "point_any" ? a : undefined,
      }),
    [L, E, I, beamType, loadType, load, a]
  );

  const deflLimit = (L * 1000) / 360;
  const deflOk = result.maxDeflection <= deflLimit;

  return (
    <CalculatorLayout
      title="Beam Analysis"
      description="Interactive moment, shear, and deflection diagrams for common beam types and loading patterns. All diagrams update live as you modify inputs."
      codeRef="Classical Beam Theory"
    >
      <div className="space-y-8">
        {/* Configuration */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Beam Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SelectField
              label="Beam Type"
              value={beamType}
              onChange={(v) => setBeamType(v as BeamType)}
              options={[
                { value: "simply_supported", label: "Simply Supported" },
                { value: "cantilever", label: "Cantilever" },
                { value: "fixed_fixed", label: "Fixed-Fixed" },
              ]}
            />
            <SelectField
              label="Load Type"
              value={loadType}
              onChange={(v) => setLoadType(v as LoadType)}
              options={[
                { value: "uniform", label: "Uniform Distributed (kN/m)" },
                { value: "point_center", label: "Point Load at Center (kN)" },
                { value: "point_any", label: "Point Load at Distance (kN)" },
                { value: "triangular", label: "Triangular Distributed (kN/m)" },
              ]}
            />
            <InputField
              label="Span Length (L)"
              value={L}
              onChange={(v) => setL(parseFloat(v) || 0.1)}
              unit="m"
              step="0.5"
            />
            <InputField
              label={
                loadType === "uniform" || loadType === "triangular"
                  ? "Load Intensity (w)"
                  : "Point Load (P)"
              }
              value={load}
              onChange={(v) => setLoad(parseFloat(v) || 0)}
              unit={loadType === "uniform" || loadType === "triangular" ? "kN/m" : "kN"}
              step="1"
            />
            {loadType === "point_any" && (
              <InputField
                label="Distance from Left (a)"
                value={a}
                onChange={(v) => setA(parseFloat(v) || 0)}
                unit="m"
                step="0.1"
              />
            )}
            <InputField
              label="Elastic Modulus (E)"
              value={E}
              onChange={(v) => setE(parseFloat(v) || 1)}
              unit="MPa"
              hint="Steel: 200,000"
              step="1000"
            />
            <InputField
              label="Moment of Inertia (I)"
              value={I}
              onChange={(v) => setI(parseFloat(v) || 0.1)}
              unit="x10⁶ mm⁴"
              step="10"
            />
          </div>

          {/* Quick load slider */}
          <div className="mt-4 p-4 bg-[var(--color-surface-2)] rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium">
                Load Intensity
              </span>
              <span className="text-sm font-mono font-semibold text-white">
                {load} {loadType === "uniform" || loadType === "triangular" ? "kN/m" : "kN"}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={loadType === "uniform" || loadType === "triangular" ? "100" : "500"}
              step={loadType === "uniform" || loadType === "triangular" ? "0.5" : "5"}
              value={load}
              onChange={(e) => setLoad(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        {/* Interactive Diagram */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            Live Diagrams
            <span className="ml-auto flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </h3>
          <div className="bg-[var(--color-surface-2)] rounded-xl p-4 sm:p-6 border border-[var(--color-border)]">
            <BeamDiagram
              beamType={beamType}
              loadType={loadType}
              L={L}
              load={load}
              a={a}
              maxMoment={result.maxMoment}
              maxShear={result.maxShear}
              maxDeflection={result.maxDeflection}
              reactionLeft={result.reactionLeft}
              reactionRight={result.reactionRight}
            />
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-[10px] text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#a78bfa] rounded" /> Moment
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#fb7185] rounded" /> Shear
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#22d3ee] rounded" /> Deflection
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#34d399] rounded" /> Reactions
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        {/* Deflection Check */}
        <div className="p-4 rounded-xl border transition-all duration-300"
          style={{
            background: deflOk ? "rgba(52, 211, 153, 0.05)" : "rgba(251, 113, 133, 0.05)",
            borderColor: deflOk ? "rgba(52, 211, 153, 0.2)" : "rgba(251, 113, 133, 0.2)",
          }}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${deflOk ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
              {deflOk ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
            </div>
            <div>
              <p className={`text-sm font-semibold ${deflOk ? "text-emerald-400" : "text-rose-400"}`}>
                L/360 Deflection Check — {deflOk ? "PASS" : "FAILS"}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5">
                {result.maxDeflection.toFixed(2)} mm {deflOk ? "≤" : ">"} {deflLimit.toFixed(1)} mm (L/360)
              </p>
            </div>
          </div>
          {/* Visual bar */}
          <div className="mt-3 h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((result.maxDeflection / deflLimit) * 100, 100)}%`,
                background: deflOk
                  ? "linear-gradient(90deg, #34d399, #22d3ee)"
                  : "linear-gradient(90deg, #fbbf24, #fb7185)",
              }}
            />
          </div>
        </div>

        {/* Results */}
        <ResultDisplay
          results={[
            { label: "Max Bending Moment", value: result.maxMoment, unit: "kN·m", highlight: true },
            { label: "Max Shear Force", value: result.maxShear, unit: "kN", highlight: true },
            { label: "Max Deflection", value: result.maxDeflection, unit: "mm", highlight: true },
            { label: "Left Reaction", value: result.reactionLeft, unit: "kN" },
            { label: "Right Reaction", value: result.reactionRight, unit: "kN" },
            { label: "L/360 Limit", value: `${deflLimit.toFixed(1)} mm` },
          ]}
          formula={result.formula}
        />
      </div>
    </CalculatorLayout>
  );
}

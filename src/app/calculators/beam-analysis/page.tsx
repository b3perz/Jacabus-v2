"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import InputField from "@/components/InputField";
import SelectField from "@/components/SelectField";
import ResultDisplay from "@/components/ResultDisplay";
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

  return (
    <CalculatorLayout
      title="Beam Analysis"
      description="Calculate maximum moment, shear, and deflection for common beam types and loading patterns. Supports simply supported, cantilever, and fixed-fixed beams."
      codeRef="Classical Beam Theory"
    >
      <div className="space-y-8">
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
              unit="×10⁶ mm⁴"
              step="10"
            />
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        <ResultDisplay
          results={[
            {
              label: "Max Bending Moment",
              value: result.maxMoment,
              unit: "kN·m",
              highlight: true,
            },
            {
              label: "Max Shear Force",
              value: result.maxShear,
              unit: "kN",
              highlight: true,
            },
            {
              label: "Max Deflection",
              value: result.maxDeflection,
              unit: "mm",
              highlight: true,
            },
            {
              label: "L/360 Limit",
              value: `${deflLimit.toFixed(1)} mm — ${result.maxDeflection <= deflLimit ? "OK" : "EXCEEDS"}`,
              highlight: result.maxDeflection > deflLimit,
            },
            {
              label: "Left Reaction",
              value: result.reactionLeft,
              unit: "kN",
            },
            {
              label: "Right Reaction",
              value: result.reactionRight,
              unit: "kN",
            },
          ]}
          formula={result.formula}
        />
      </div>
    </CalculatorLayout>
  );
}

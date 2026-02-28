"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import InputField from "@/components/InputField";
import SelectField from "@/components/SelectField";
import ResultDisplay from "@/components/ResultDisplay";
import {
  calculateSeismicLoad,
  approximatePeriod,
  SFRS_SYSTEMS,
  SEISMIC_DEFAULTS,
  type SeismicInput,
} from "@/lib/calculators/seismic-load";
import { IMPORTANCE_CATEGORIES, type ImportanceCategory } from "@/lib/constants";

type SfrsKey = keyof typeof SFRS_SYSTEMS;

export default function SeismicLoadPage() {
  const [Sa, setSa] = useState(SEISMIC_DEFAULTS.Sa);
  const [Mv, setMv] = useState(SEISMIC_DEFAULTS.Mv);
  const [importance, setImportance] = useState<ImportanceCategory>("normal");
  const [W, setW] = useState(SEISMIC_DEFAULTS.W);
  const [sfrs, setSfrs] = useState<SfrsKey>("conventional_braced");
  const [height, setHeight] = useState(SEISMIC_DEFAULTS.height ?? 15);
  const [structureType, setStructureType] = useState<SeismicInput["structureType"]>("braced");

  const Ie = IMPORTANCE_CATEGORIES[importance].Ie;
  const { Rd, Ro } = SFRS_SYSTEMS[sfrs];

  const Ta = useMemo(
    () => approximatePeriod(height, structureType),
    [height, structureType]
  );

  const result = useMemo(
    () => calculateSeismicLoad({ Sa, Mv, Ie, W, Rd, Ro, height, structureType }),
    [Sa, Mv, Ie, W, Rd, Ro, height, structureType]
  );

  return (
    <CalculatorLayout
      title="Seismic Load Calculator"
      description="Compute equivalent static base shear V per NBC 2020, Section 4.1.8. Select from standard SFRS types with pre-populated Rd and Ro values."
      codeRef="NBC 2020 — Cl. 4.1.8"
    >
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Input Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InputField
              label="Spectral Acceleration Sa(T)"
              value={Sa}
              onChange={(v) => setSa(parseFloat(v) || 0)}
              unit="g"
              step="0.01"
            />
            <InputField
              label="Higher Mode Factor (Mv)"
              value={Mv}
              onChange={(v) => setMv(parseFloat(v) || 0)}
              step="0.1"
            />
            <SelectField
              label="Importance Category"
              value={importance}
              onChange={(v) => setImportance(v as ImportanceCategory)}
              options={Object.entries(IMPORTANCE_CATEGORIES).map(([k, v]) => ({
                value: k,
                label: `${v.label} (Ie = ${v.Ie})`,
              }))}
            />
            <InputField
              label="Seismic Weight (W)"
              value={W}
              onChange={(v) => setW(parseFloat(v) || 0)}
              unit="kN"
              step="100"
            />
            <SelectField
              label="SFRS Type"
              value={sfrs}
              onChange={(v) => setSfrs(v as SfrsKey)}
              options={Object.entries(SFRS_SYSTEMS).map(([k, v]) => ({
                value: k,
                label: `${v.label} (Rd=${v.Rd}, Ro=${v.Ro})`,
              }))}
            />
            <InputField
              label="Building Height"
              value={height}
              onChange={(v) => setHeight(parseFloat(v) || 1)}
              unit="m"
              step="1"
            />
            <SelectField
              label="Structure Type (for Ta)"
              value={structureType ?? "other"}
              onChange={(v) => setStructureType(v as SeismicInput["structureType"])}
              options={[
                { value: "steel_moment", label: "Steel Moment Frame" },
                { value: "concrete_moment", label: "Concrete Moment Frame" },
                { value: "braced", label: "Braced Frame" },
                { value: "shearwall", label: "Shear Wall" },
                { value: "other", label: "Other" },
              ]}
            />
          </div>

          <div className="mt-4 p-3 bg-[var(--color-surface-2)] rounded-xl text-sm flex flex-wrap gap-6">
            <div>
              <span className="text-[var(--color-text-muted)]">Rd = </span>
              <span className="font-mono font-semibold text-white">{Rd}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Ro = </span>
              <span className="font-mono font-semibold text-white">{Ro}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Ta = </span>
              <span className="font-mono font-semibold text-white">
                {Ta.toFixed(3)} s
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        <ResultDisplay
          results={[
            { label: "Base Shear (V)", value: result.V, unit: "kN", highlight: true },
            {
              label: "Base Shear Coefficient (V/W)",
              value: `${(result.baseShearCoeff * 100).toFixed(2)}%`,
              highlight: true,
            },
            { label: "Approximate Period (Ta)", value: `${Ta.toFixed(3)} s` },
            { label: "Seismic Weight (W)", value: W, unit: "kN" },
          ]}
          formula={result.formula}
        />
      </div>
    </CalculatorLayout>
  );
}

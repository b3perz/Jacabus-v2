"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import InputField from "@/components/InputField";
import SelectField from "@/components/SelectField";
import ResultDisplay from "@/components/ResultDisplay";
import { calculateSnowLoad, SNOW_LOAD_DEFAULTS } from "@/lib/calculators/snow-load";
import { IMPORTANCE_CATEGORIES, type ImportanceCategory } from "@/lib/constants";

export default function SnowLoadPage() {
  const [Ss, setSs] = useState(SNOW_LOAD_DEFAULTS.Ss);
  const [Sr, setSr] = useState(SNOW_LOAD_DEFAULTS.Sr);
  const [importance, setImportance] = useState<ImportanceCategory>("normal");
  const [Cb, setCb] = useState(SNOW_LOAD_DEFAULTS.Cb);
  const [Cw, setCw] = useState(SNOW_LOAD_DEFAULTS.Cw);
  const [Cs, setCs] = useState(SNOW_LOAD_DEFAULTS.Cs);
  const [Ca, setCa] = useState(SNOW_LOAD_DEFAULTS.Ca);

  const Is = IMPORTANCE_CATEGORIES[importance].Is;

  const result = useMemo(
    () => calculateSnowLoad({ Ss, Sr, Is, Cb, Cw, Cs, Ca }),
    [Ss, Sr, Is, Cb, Cw, Cs, Ca]
  );

  return (
    <CalculatorLayout
      title="Snow Load Calculator"
      description="Calculate specified snow loads on roofs per NBC 2020, Section 4.1.6. The snow load equation accounts for ground snow, associated rain, and roof geometry factors."
      codeRef="NBC 2020 — Cl. 4.1.6"
    >
      <div className="space-y-8">
        {/* Inputs */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Input Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InputField
              label="Ground Snow Load (Ss)"
              value={Ss}
              onChange={(v) => setSs(parseFloat(v) || 0)}
              unit="kPa"
              hint="1-in-50 year"
              step="0.1"
            />
            <InputField
              label="Associated Rain (Sr)"
              value={Sr}
              onChange={(v) => setSr(parseFloat(v) || 0)}
              unit="kPa"
              step="0.1"
            />
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

        {/* Divider */}
        <div className="border-t border-[var(--color-border)]" />

        {/* Results */}
        <ResultDisplay
          results={[
            { label: "Specified Snow Load (S)", value: result.S, unit: "kPa", highlight: true },
            { label: "Factored ULS (1.5S)", value: result.factoredULS, unit: "kPa", highlight: true },
            { label: "Snow Component", value: result.snowComponent, unit: "kPa" },
            { label: "Rain Component", value: result.rainComponent, unit: "kPa" },
          ]}
          formula={result.formula}
        />
      </div>
    </CalculatorLayout>
  );
}

"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import InputField from "@/components/InputField";
import SelectField from "@/components/SelectField";
import ResultDisplay from "@/components/ResultDisplay";
import {
  calculateWindLoad,
  computeCe,
  WIND_LOAD_DEFAULTS,
} from "@/lib/calculators/wind-load";
import { IMPORTANCE_CATEGORIES, type ImportanceCategory } from "@/lib/constants";

export default function WindLoadPage() {
  const [q, setQ] = useState(WIND_LOAD_DEFAULTS.q);
  const [importance, setImportance] = useState<ImportanceCategory>("normal");
  const [height, setHeight] = useState(10);
  const [terrain, setTerrain] = useState<"open" | "suburban" | "urban">("open");
  const [Ct, setCt] = useState(WIND_LOAD_DEFAULTS.Ct);
  const [Cg, setCg] = useState(WIND_LOAD_DEFAULTS.Cg);
  const [Cp, setCp] = useState(WIND_LOAD_DEFAULTS.Cp);
  const [Cpi, setCpi] = useState(WIND_LOAD_DEFAULTS.Cpi ?? 0);

  const Iw = IMPORTANCE_CATEGORIES[importance].Iw;
  const Ce = useMemo(() => computeCe(height, terrain), [height, terrain]);

  const result = useMemo(
    () => calculateWindLoad({ q, Iw, Ce, Ct, Cg, Cp, Cpi }),
    [q, Iw, Ce, Ct, Cg, Cp, Cpi]
  );

  return (
    <CalculatorLayout
      title="Wind Load Calculator"
      description="Calculate external and net wind pressures per NBC 2020, Section 4.1.7. Includes automatic exposure factor calculation based on building height and terrain."
      codeRef="NBC 2020 — Cl. 4.1.7"
    >
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Input Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InputField
              label="Velocity Pressure (q)"
              value={q}
              onChange={(v) => setQ(parseFloat(v) || 0)}
              unit="kPa"
              hint="1-in-50 year"
              step="0.01"
            />
            <SelectField
              label="Importance Category"
              value={importance}
              onChange={(v) => setImportance(v as ImportanceCategory)}
              options={Object.entries(IMPORTANCE_CATEGORIES).map(([k, v]) => ({
                value: k,
                label: `${v.label} (Iw = ${v.Iw})`,
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
              label="Terrain Category"
              value={terrain}
              onChange={(v) => setTerrain(v as "open" | "suburban" | "urban")}
              options={[
                { value: "open", label: "Open Terrain" },
                { value: "suburban", label: "Suburban / Rough" },
                { value: "urban", label: "Urban / Dense" },
              ]}
            />
            <InputField
              label="Topographic Factor (Ct)"
              value={Ct}
              onChange={(v) => setCt(parseFloat(v) || 0)}
              step="0.1"
            />
            <InputField
              label="Gust Effect Factor (Cg)"
              value={Cg}
              onChange={(v) => setCg(parseFloat(v) || 0)}
              step="0.1"
            />
            <InputField
              label="External Pressure Coeff (Cp)"
              value={Cp}
              onChange={(v) => setCp(parseFloat(v) || 0)}
              step="0.1"
            />
            <InputField
              label="Internal Pressure Coeff (Cpi)"
              value={Cpi}
              onChange={(v) => setCpi(parseFloat(v) || 0)}
              hint="0 if none"
              step="0.1"
            />
          </div>

          {/* Calculated Ce display */}
          <div className="mt-4 p-3 bg-[var(--color-surface-2)] rounded-xl text-sm">
            <span className="text-[var(--color-text-muted)]">
              Calculated Exposure Factor:{" "}
            </span>
            <span className="font-mono font-semibold text-white">
              Ce = {Ce.toFixed(3)}
            </span>
            <span className="text-[var(--color-text-muted)]">
              {" "}(h = {height}m, {terrain} terrain)
            </span>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        <ResultDisplay
          results={[
            { label: "Net Wind Pressure", value: result.pNet, unit: "kPa", highlight: true },
            { label: "Factored ULS (1.4W)", value: result.factoredULS, unit: "kPa", highlight: true },
            { label: "External Pressure", value: result.pExternal, unit: "kPa" },
            { label: "Internal Pressure", value: result.pInternal, unit: "kPa" },
          ]}
          formula={result.formula}
        />
      </div>
    </CalculatorLayout>
  );
}

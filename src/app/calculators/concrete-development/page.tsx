"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import InputField from "@/components/InputField";
import SelectField from "@/components/SelectField";
import ResultDisplay from "@/components/ResultDisplay";
import {
  calculateDevelopmentLength,
  CONCRETE_DEV_DEFAULTS,
} from "@/lib/calculators/concrete-development";
import { REBAR_SIZES } from "@/lib/constants";

export default function ConcreteDevelopmentPage() {
  const [barSize, setBarSize] = useState(CONCRETE_DEV_DEFAULTS.barSize);
  const [fy, setFy] = useState(CONCRETE_DEV_DEFAULTS.fy);
  const [fc, setFc] = useState(CONCRETE_DEV_DEFAULTS.fc);
  const [k1, setK1] = useState(CONCRETE_DEV_DEFAULTS.k1);
  const [k2, setK2] = useState(CONCRETE_DEV_DEFAULTS.k2);
  const [k3, setK3] = useState(CONCRETE_DEV_DEFAULTS.k3);
  const [k4, setK4] = useState(CONCRETE_DEV_DEFAULTS.k4);
  const [isHooked, setIsHooked] = useState(false);

  const result = useMemo(
    () =>
      calculateDevelopmentLength({
        barSize,
        fy,
        fc,
        k1,
        k2,
        k3,
        k4,
        isHooked,
      }),
    [barSize, fy, fc, k1, k2, k3, k4, isHooked]
  );

  return (
    <CalculatorLayout
      title="Concrete Development Length"
      description="Calculate rebar tension development lengths and standard hook development lengths per CSA A23.3-19, Clause 12."
      codeRef="CSA A23.3-19 — Cl. 12.2 & 12.5"
    >
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Input Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SelectField
              label="Bar Size"
              value={barSize}
              onChange={setBarSize}
              options={Object.entries(REBAR_SIZES).map(([k, v]) => ({
                value: k,
                label: `${v.label} (db = ${v.diameter} mm, Ab = ${v.area} mm²)`,
              }))}
            />
            <InputField
              label="Yield Strength (fy)"
              value={fy}
              onChange={(v) => setFy(parseFloat(v) || 0)}
              unit="MPa"
              hint="typ. 400"
              step="10"
            />
            <InputField
              label="Concrete Strength (f'c)"
              value={fc}
              onChange={(v) => setFc(parseFloat(v) || 1)}
              unit="MPa"
              hint="typ. 25–50"
              step="5"
            />
            <SelectField
              label="Bar Location Factor (k1)"
              value={k1.toString()}
              onChange={(v) => setK1(parseFloat(v))}
              options={[
                { value: "1.0", label: "1.0 — Bottom bars / other" },
                { value: "1.3", label: "1.3 — Top bars (>300mm concrete below)" },
              ]}
            />
            <SelectField
              label="Coating Factor (k2)"
              value={k2.toString()}
              onChange={(v) => setK2(parseFloat(v))}
              options={[
                { value: "1.0", label: "1.0 — Uncoated bars" },
                { value: "1.5", label: "1.5 — Epoxy-coated bars" },
              ]}
            />
            <SelectField
              label="Concrete Density Factor (k3)"
              value={k3.toString()}
              onChange={(v) => setK3(parseFloat(v))}
              options={[
                { value: "1.0", label: "1.0 — Normal density concrete" },
                { value: "1.3", label: "1.3 — Structural low-density" },
              ]}
            />
            <SelectField
              label="Bar Size Factor (k4)"
              value={k4.toString()}
              onChange={(v) => setK4(parseFloat(v))}
              options={[
                { value: "0.8", label: "0.8 — Bars ≤ 20M" },
                { value: "1.0", label: "1.0 — Bars ≥ 25M" },
              ]}
            />
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] w-full">
                <input
                  type="checkbox"
                  checked={isHooked}
                  onChange={(e) => setIsHooked(e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-500"
                />
                <span className="text-sm text-white">
                  Include hook development (ldh)
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        <ResultDisplay
          results={[
            {
              label: "Development Length (ld)",
              value: `${result.ldGoverning.toFixed(0)} mm`,
              highlight: true,
            },
            {
              label: "Calculated ld (before min)",
              value: `${result.ld.toFixed(0)} mm`,
            },
            {
              label: "Bar Diameter (db)",
              value: `${result.db.toFixed(1)} mm`,
            },
            ...(result.ldh !== undefined
              ? [
                  {
                    label: "Hook Development (ldh)",
                    value: `${result.ldh.toFixed(0)} mm`,
                    highlight: true as const,
                  },
                ]
              : []),
          ]}
          formula={result.formula}
        />
      </div>
    </CalculatorLayout>
  );
}

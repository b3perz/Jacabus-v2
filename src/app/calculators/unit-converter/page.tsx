"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import SelectField from "@/components/SelectField";
import { convert, UNIT_DEFS, type UnitCategory } from "@/lib/calculators/unit-converter";

const CATEGORIES: { value: UnitCategory; label: string }[] = [
  { value: "length", label: "Length" },
  { value: "area", label: "Area" },
  { value: "volume", label: "Volume" },
  { value: "force", label: "Force" },
  { value: "pressure", label: "Pressure / Stress" },
  { value: "moment", label: "Moment / Torque" },
  { value: "mass", label: "Mass" },
  { value: "density", label: "Density" },
  { value: "temperature", label: "Temperature" },
];

export default function UnitConverterPage() {
  const [category, setCategory] = useState<UnitCategory>("pressure");
  const [fromUnit, setFromUnit] = useState("MPa");
  const [toUnit, setToUnit] = useState("ksi");
  const [value, setValue] = useState(30);

  const units = useMemo(() => UNIT_DEFS[category], [category]);
  const unitKeys = useMemo(() => Object.keys(units), [units]);

  // Reset units when category changes
  const handleCategoryChange = (cat: UnitCategory) => {
    setCategory(cat);
    const keys = Object.keys(UNIT_DEFS[cat]);
    setFromUnit(keys[0]);
    setToUnit(keys[1] ?? keys[0]);
  };

  const result = useMemo(() => {
    try {
      return convert(value, fromUnit, toUnit, category);
    } catch {
      return 0;
    }
  }, [value, fromUnit, toUnit, category]);

  const fromSymbol = units[fromUnit]?.symbol ?? fromUnit;
  const toSymbol = units[toUnit]?.symbol ?? toUnit;

  // Format number smartly
  const formatResult = (n: number): string => {
    if (Math.abs(n) >= 1e6 || (Math.abs(n) < 0.001 && n !== 0)) {
      return n.toExponential(6);
    }
    return n.toFixed(6).replace(/\.?0+$/, "");
  };

  return (
    <CalculatorLayout
      title="Unit Converter"
      description="Convert between metric and imperial units commonly used in structural engineering. Covers length, force, pressure, moment, area, volume, mass, density, and temperature."
      codeRef="Standard Conversion Factors"
    >
      <div className="space-y-8">
        {/* Category selector */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                category === cat.value
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-border)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Conversion UI */}
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          {/* From */}
          <div className="flex-1 p-5 bg-[var(--color-surface-2)] rounded-2xl">
            <label className="input-label mb-3 block">From</label>
            <SelectField
              label=""
              value={fromUnit}
              onChange={setFromUnit}
              options={unitKeys.map((k) => ({
                value: k,
                label: `${units[k].label} (${units[k].symbol})`,
              }))}
            />
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="input-field mt-3 text-xl font-mono font-bold text-center"
              step="any"
            />
            <p className="text-center text-xs text-[var(--color-text-muted)] mt-2">
              {fromSymbol}
            </p>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center lg:py-10">
            <button
              onClick={() => {
                setFromUnit(toUnit);
                setToUnit(fromUnit);
                setValue(result);
              }}
              className="p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-indigo-500/40 transition-colors group"
              title="Swap units"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[var(--color-text-muted)] group-hover:text-indigo-400 transition-colors lg:rotate-0 rotate-90"
              >
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            </button>
          </div>

          {/* To */}
          <div className="flex-1 p-5 bg-[var(--color-surface-2)] rounded-2xl">
            <label className="input-label mb-3 block">To</label>
            <SelectField
              label=""
              value={toUnit}
              onChange={setToUnit}
              options={unitKeys.map((k) => ({
                value: k,
                label: `${units[k].label} (${units[k].symbol})`,
              }))}
            />
            <div className="input-field mt-3 text-xl font-mono font-bold text-center result-value py-3">
              {formatResult(result)}
            </div>
            <p className="text-center text-xs text-[var(--color-text-muted)] mt-2">
              {toSymbol}
            </p>
          </div>
        </div>

        {/* Conversion factor */}
        <div className="p-4 bg-[var(--color-surface-2)] rounded-xl text-sm font-mono text-[var(--color-text-muted)]">
          1 {fromSymbol} = {formatResult(convert(1, fromUnit, toUnit, category))}{" "}
          {toSymbol}
        </div>

        {/* Quick reference table */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
            All {CATEGORIES.find((c) => c.value === category)?.label} Units
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left py-2 pr-4 text-[var(--color-text-muted)] font-medium">
                    Unit
                  </th>
                  <th className="text-right py-2 pl-4 text-[var(--color-text-muted)] font-medium">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {unitKeys.map((k) => (
                  <tr
                    key={k}
                    className="border-b border-[var(--color-border)]/50"
                  >
                    <td className="py-2 pr-4 text-white">
                      {units[k].label}{" "}
                      <span className="text-[var(--color-text-muted)]">
                        ({units[k].symbol})
                      </span>
                    </td>
                    <td className="py-2 pl-4 text-right font-mono text-indigo-300">
                      {formatResult(convert(value, fromUnit, k, category))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}

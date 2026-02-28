"use client";

import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import InputField from "@/components/InputField";
import ResultDisplay from "@/components/ResultDisplay";
import { calculateDeadLoad, type DeadLoadComponent } from "@/lib/calculators/dead-load";
import { ASSEMBLY_LOADS } from "@/lib/constants";

export default function DeadLoadPage() {
  const [components, setComponents] = useState<DeadLoadComponent[]>([
    { id: "1", label: "Steel Deck + 65mm Concrete", load: 2.4, quantity: 1 },
    { id: "2", label: "Suspended Acoustic Ceiling", load: 0.15, quantity: 1 },
    { id: "3", label: "MEP Allowance", load: 0.25, quantity: 1 },
  ]);
  const [tributaryArea, setTributaryArea] = useState<number>(0);
  const [showLibrary, setShowLibrary] = useState(false);

  const addComponent = useCallback((key: string) => {
    const item = ASSEMBLY_LOADS[key];
    if (!item) return;
    setComponents((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        label: item.label,
        load: item.load,
        quantity: 1,
      },
    ]);
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateComponent = useCallback(
    (id: string, field: "load" | "quantity", value: number) => {
      setComponents((prev) =>
        prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
      );
    },
    []
  );

  const addCustom = useCallback(() => {
    setComponents((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        label: "Custom Component",
        load: 0,
        quantity: 1,
      },
    ]);
  }, []);

  const result = useMemo(
    () =>
      calculateDeadLoad({
        components,
        tributaryArea: tributaryArea > 0 ? tributaryArea : undefined,
      }),
    [components, tributaryArea]
  );

  // Group library items by category
  const groupedLibrary = useMemo(() => {
    const groups: Record<string, { key: string; label: string; load: number }[]> = {};
    Object.entries(ASSEMBLY_LOADS).forEach(([key, item]) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push({ key, label: item.label, load: item.load });
    });
    return groups;
  }, []);

  return (
    <CalculatorLayout
      title="Dead Load Assembly"
      description="Build up assembly dead loads from standard structural components. Select from the material library or add custom components."
      codeRef="NBC 2020 — Table 4.1.5.3"
    >
      <div className="space-y-8">
        {/* Component list */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Assembly Components
          </h3>

          <div className="space-y-3">
            {components.map((comp) => (
              <div
                key={comp.id}
                className="flex items-center gap-3 p-3 bg-[var(--color-surface-2)] rounded-xl"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{comp.label}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={comp.load}
                    onChange={(e) =>
                      updateComponent(comp.id, "load", parseFloat(e.target.value) || 0)
                    }
                    step="0.01"
                    className="w-20 input-field text-xs py-2 px-2 text-center"
                  />
                  <span className="text-xs text-[var(--color-text-muted)] w-8">kPa</span>
                  <span className="text-xs text-[var(--color-text-muted)]">×</span>
                  <input
                    type="number"
                    value={comp.quantity}
                    onChange={(e) =>
                      updateComponent(comp.id, "quantity", parseInt(e.target.value) || 1)
                    }
                    min="1"
                    className="w-14 input-field text-xs py-2 px-2 text-center"
                  />
                  <button
                    onClick={() => removeComponent(comp.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[var(--color-text-muted)] hover:text-rose-400 transition-colors"
                    aria-label="Remove"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={addCustom} className="btn-secondary text-sm py-2 px-4">
              + Custom
            </button>
            <button
              onClick={() => setShowLibrary(!showLibrary)}
              className="btn-secondary text-sm py-2 px-4"
            >
              {showLibrary ? "Hide Library" : "Material Library"}
            </button>
          </div>

          {/* Material library */}
          {showLibrary && (
            <div className="mt-4 p-4 bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] max-h-80 overflow-y-auto">
              {Object.entries(groupedLibrary).map(([category, items]) => (
                <div key={category} className="mb-4 last:mb-0">
                  <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                    {category}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {items.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => addComponent(item.key)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors text-left"
                      >
                        <span className="text-xs text-white truncate pr-2">
                          {item.label}
                        </span>
                        <span className="text-xs font-mono text-[var(--color-text-muted)] shrink-0">
                          {item.load} kPa
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Optional tributary area */}
        <div className="max-w-xs">
          <InputField
            label="Tributary Area (optional)"
            value={tributaryArea || ""}
            onChange={(v) => setTributaryArea(parseFloat(v) || 0)}
            unit="m²"
            hint="for total force"
            step="1"
          />
        </div>

        <div className="border-t border-[var(--color-border)]" />

        <ResultDisplay
          results={[
            {
              label: "Total Dead Load (D)",
              value: result.totalIntensity,
              unit: "kPa",
              highlight: true,
            },
            {
              label: "Factored ULS (1.25D)",
              value: result.factoredULS,
              unit: "kPa",
              highlight: true,
            },
            {
              label: "Counteracting (0.9D)",
              value: result.factoredCounteracting,
              unit: "kPa",
            },
            ...(result.totalForce !== null
              ? [
                  {
                    label: "Total Force",
                    value: result.totalForce as number,
                    unit: "kN",
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

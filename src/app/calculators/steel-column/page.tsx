"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import InputField from "@/components/InputField";
import SelectField from "@/components/SelectField";
import ResultDisplay from "@/components/ResultDisplay";
import {
  calculateSteelColumn,
  generateColumnCurve,
  STEEL_SECTIONS,
  STEEL_COLUMN_DEFAULTS,
} from "@/lib/calculators/steel-column";

// ---------------------------------------------------------------------------
// Column Buckling Curve Chart
// ---------------------------------------------------------------------------
function ColumnCurveChart({
  Fy,
  n,
  KLr_x,
  KLr_y,
  governs,
}: {
  Fy: number;
  n: number;
  KLr_x: number;
  KLr_y: number;
  governs: "x" | "y";
}) {
  const svgW = 540;
  const svgH = 300;
  const pad = { top: 30, bottom: 44, left: 54, right: 30 };
  const plotW = svgW - pad.left - pad.right;
  const plotH = svgH - pad.top - pad.bottom;

  const maxKLr = 200;
  const curve = useMemo(() => generateColumnCurve(Fy, n, maxKLr), [Fy, n]);

  const toX = (klr: number) => pad.left + (klr / maxKLr) * plotW;
  const toY = (ratio: number) => pad.top + plotH - ratio * plotH;

  const pathD = curve.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.klr).toFixed(1)},${toY(p.ratio).toFixed(1)}`).join(" ");
  const fillD = `${pathD} L${toX(maxKLr).toFixed(1)},${toY(0).toFixed(1)} L${toX(0).toFixed(1)},${toY(0).toFixed(1)} Z`;

  // Find ratio at KLr_x and KLr_y
  const ratioAtX = curve.find((p) => Math.abs(p.klr - KLr_x) < maxKLr / 100)?.ratio ?? 0;
  const ratioAtY = curve.find((p) => Math.abs(p.klr - KLr_y) < maxKLr / 100)?.ratio ?? 0;

  // Euler curve for comparison
  const E = 200000;
  const eulerPath = curve
    .filter((p) => p.klr > 5)
    .map((p, i) => {
      const Fe = (Math.PI * Math.PI * E) / (p.klr * p.klr);
      const ratio = Math.min(Fe / Fy, 1.0);
      return `${i === 0 ? "M" : "L"}${toX(p.klr).toFixed(1)},${toY(ratio).toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto" style={{ maxHeight: 300 }}>
      <defs>
        <linearGradient id="curve-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Title */}
      <text x={svgW / 2} y={16} textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">
        Column Buckling Curve — CSA S16 (n = {n})
      </text>

      {/* Grid */}
      {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((r) => (
        <g key={r}>
          <line x1={pad.left} y1={toY(r)} x2={pad.left + plotW} y2={toY(r)} stroke="#252640" strokeWidth="0.5" />
          <text x={pad.left - 8} y={toY(r) + 3} textAnchor="end" fill="#6b7280" fontSize="8" fontFamily="monospace">{r.toFixed(1)}</text>
        </g>
      ))}
      {[0, 25, 50, 75, 100, 125, 150, 175, 200].map((klr) => (
        <g key={klr}>
          <line x1={toX(klr)} y1={pad.top} x2={toX(klr)} y2={pad.top + plotH} stroke="#252640" strokeWidth="0.5" />
          <text x={toX(klr)} y={svgH - pad.bottom + 16} textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">{klr}</text>
        </g>
      ))}

      {/* Axes */}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH} stroke="#4b5563" strokeWidth="1" />
      <line x1={pad.left} y1={pad.top + plotH} x2={pad.left + plotW} y2={pad.top + plotH} stroke="#4b5563" strokeWidth="1" />

      {/* Euler curve (dashed) */}
      <path d={eulerPath} fill="none" stroke="#fb7185" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />

      {/* Column curve fill */}
      <path d={fillD} fill="url(#curve-fill)" />

      {/* Column curve line */}
      <path d={pathD} fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" />

      {/* Marker for x-axis */}
      {KLr_x > 0 && KLr_x <= maxKLr && (
        <g style={{ transition: "all 0.4s ease" }}>
          <line x1={toX(KLr_x)} y1={pad.top} x2={toX(KLr_x)} y2={pad.top + plotH}
            stroke="#22d3ee" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
          <circle cx={toX(KLr_x)} cy={toY(ratioAtX)} r="5" fill="#22d3ee" stroke="white" strokeWidth="2" />
          <text x={toX(KLr_x) + 8} y={toY(ratioAtX) - 8} fill="#22d3ee" fontSize="9" fontFamily="monospace" fontWeight="600">
            x-axis
          </text>
        </g>
      )}

      {/* Marker for y-axis */}
      {KLr_y > 0 && KLr_y <= maxKLr && (
        <g style={{ transition: "all 0.4s ease" }}>
          <line x1={toX(KLr_y)} y1={pad.top} x2={toX(KLr_y)} y2={pad.top + plotH}
            stroke="#fbbf24" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
          <circle cx={toX(KLr_y)} cy={toY(ratioAtY)} r="5" fill="#fbbf24" stroke="white" strokeWidth="2" />
          <text x={toX(KLr_y) + 8} y={toY(ratioAtY) + 16} fill="#fbbf24" fontSize="9" fontFamily="monospace" fontWeight="600">
            y-axis{governs === "y" ? " ←" : ""}
          </text>
        </g>
      )}

      {/* Axis labels */}
      <text x={svgW / 2} y={svgH - 6} textAnchor="middle" fill="#6b7280" fontSize="9">KL/r</text>
      <text x={10} y={pad.top + plotH / 2} textAnchor="middle" fill="#6b7280" fontSize="9"
        transform={`rotate(-90, 10, ${pad.top + plotH / 2})`}>Cr / AFy</text>

      {/* Legend */}
      <g transform={`translate(${pad.left + 10}, ${pad.top + 8})`}>
        <line x1="0" y1="0" x2="16" y2="0" stroke="#818cf8" strokeWidth="2.5" />
        <text x="20" y="4" fill="#94a3b8" fontSize="8">CSA S16</text>
        <line x1="80" y1="0" x2="96" y2="0" stroke="#fb7185" strokeWidth="1" strokeDasharray="4,3" />
        <text x="100" y="4" fill="#94a3b8" fontSize="8">Euler</text>
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Cross-section Diagram
// ---------------------------------------------------------------------------
function CrossSectionDiagram({ section }: { section: typeof STEEL_SECTIONS[0] }) {
  const svgW = 200;
  const svgH = 200;
  const cx = svgW / 2;
  const cy = svgH / 2;

  // Scale section to fit
  const scale = Math.min(160 / section.d, 160 / section.b);
  const d = section.d * scale;
  const b = section.b * scale;
  const tf = Math.max(section.t * scale, 4);
  const tw = Math.max(section.w * scale, 3);

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto" style={{ maxHeight: 200 }}>
      <defs>
        <linearGradient id="steel-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>

      {/* Top flange */}
      <rect x={cx - b / 2} y={cy - d / 2} width={b} height={tf} fill="url(#steel-grad)" stroke="#64748b" strokeWidth="1.5" rx="1" />
      {/* Bottom flange */}
      <rect x={cx - b / 2} y={cy + d / 2 - tf} width={b} height={tf} fill="url(#steel-grad)" stroke="#64748b" strokeWidth="1.5" rx="1" />
      {/* Web */}
      <rect x={cx - tw / 2} y={cy - d / 2 + tf} width={tw} height={d - 2 * tf} fill="url(#steel-grad)" stroke="#64748b" strokeWidth="1.5" />

      {/* Dimension: d */}
      <line x1={cx + b / 2 + 14} y1={cy - d / 2} x2={cx + b / 2 + 14} y2={cy + d / 2} stroke="#818cf8" strokeWidth="0.8" />
      <text x={cx + b / 2 + 18} y={cy + 3} fill="#818cf8" fontSize="9" fontFamily="monospace">{section.d}</text>

      {/* Dimension: b */}
      <line x1={cx - b / 2} y1={cy - d / 2 - 12} x2={cx + b / 2} y2={cy - d / 2 - 12} stroke="#22d3ee" strokeWidth="0.8" />
      <text x={cx} y={cy - d / 2 - 16} textAnchor="middle" fill="#22d3ee" fontSize="9" fontFamily="monospace">{section.b}</text>

      {/* Axes */}
      <line x1={cx - b / 2 - 6} y1={cy} x2={cx + b / 2 + 6} y2={cy} stroke="#fbbf24" strokeWidth="0.5" strokeDasharray="3,2" opacity="0.5" />
      <line x1={cx} y1={cy - d / 2 - 6} x2={cx} y2={cy + d / 2 + 6} stroke="#fbbf24" strokeWidth="0.5" strokeDasharray="3,2" opacity="0.5" />
      <text x={cx + b / 2 + 8} y={cy - 2} fill="#fbbf24" fontSize="7" opacity="0.6">x</text>
      <text x={cx + 4} y={cy - d / 2 - 8} fill="#fbbf24" fontSize="7" opacity="0.6">y</text>

      {/* Label */}
      <text x={cx} y={svgH - 6} textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="monospace">
        {section.designation}
      </text>
    </svg>
  );
}

// ===========================================================================
// Main Page
// ===========================================================================
export default function SteelColumnPage() {
  const [sectionIndex, setSectionIndex] = useState(STEEL_COLUMN_DEFAULTS.sectionIndex);
  const [Fy, setFy] = useState(STEEL_COLUMN_DEFAULTS.Fy);
  const [L, setL] = useState(STEEL_COLUMN_DEFAULTS.L);
  const [Kx, setKx] = useState(STEEL_COLUMN_DEFAULTS.Kx);
  const [Ky, setKy] = useState(STEEL_COLUMN_DEFAULTS.Ky);
  const [n, setN] = useState(STEEL_COLUMN_DEFAULTS.n);
  const [phi, setPhi] = useState(STEEL_COLUMN_DEFAULTS.phi);

  const result = useMemo(
    () => calculateSteelColumn({ sectionIndex, Fy, L, Kx, Ky, n, phi }),
    [sectionIndex, Fy, L, Kx, Ky, n, phi]
  );

  const section = STEEL_SECTIONS[sectionIndex];

  // Section comparison for the table
  const sectionResults = useMemo(() => {
    return STEEL_SECTIONS.map((_, i) => {
      const r = calculateSteelColumn({ sectionIndex: i, Fy, L, Kx, Ky, n, phi });
      return { index: i, section: STEEL_SECTIONS[i], Cr: r.Cr, governs: r.governs };
    });
  }, [Fy, L, Kx, Ky, n, phi]);

  return (
    <CalculatorLayout
      title="Steel Column Calculator"
      description="Compute factored axial compressive resistance Cr per CSA S16-19 Clause 13.3.1 for W-shape columns. Visualize buckling curves and compare sections."
      codeRef="CSA S16-19 -- Cl. 13.3.1"
    >
      <div className="space-y-8">
        {/* Section Selection */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            W-Shape Selection
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SelectField
              label="Section"
              value={sectionIndex.toString()}
              onChange={(v) => setSectionIndex(parseInt(v))}
              options={STEEL_SECTIONS.map((s, i) => ({
                value: i.toString(),
                label: `${s.designation} (${s.mass} kg/m)`,
              }))}
            />
            <SelectField
              label="Steel Grade"
              value={Fy.toString()}
              onChange={(v) => setFy(parseFloat(v))}
              options={[
                { value: "300", label: "300W (Fy = 300 MPa)" },
                { value: "345", label: "345W (Fy = 345 MPa)" },
                { value: "350", label: "350W (Fy = 350 MPa)" },
                { value: "400", label: "400W (Fy = 400 MPa)" },
              ]}
            />
            <InputField label="Unbraced Length" value={L} onChange={(v) => setL(parseFloat(v) || 100)} unit="mm" step="100" />
            <InputField label="Kx (strong axis)" value={Kx} onChange={(v) => setKx(parseFloat(v) || 0.1)} step="0.1" hint="Effective length" />
            <InputField label="Ky (weak axis)" value={Ky} onChange={(v) => setKy(parseFloat(v) || 0.1)} step="0.1" hint="Effective length" />
            <InputField label="n (curve param)" value={n} onChange={(v) => setN(parseFloat(v) || 1.0)} step="0.01" hint="1.34 hot-rolled" />
          </div>

          {/* Section properties summary */}
          <div className="mt-4 p-3 bg-[var(--color-surface-2)] rounded-xl text-sm flex flex-wrap gap-4">
            {[
              { label: "A", value: `${section.A} mm²` },
              { label: "d", value: `${section.d} mm` },
              { label: "b", value: `${section.b} mm` },
              { label: "rx", value: `${section.rx} mm` },
              { label: "ry", value: `${section.ry} mm` },
              { label: "Ix", value: `${section.Ix}×10⁶ mm⁴` },
              { label: "Iy", value: `${section.Iy}×10⁶ mm⁴` },
            ].map((prop) => (
              <div key={prop.label}>
                <span className="text-[var(--color-text-muted)]">{prop.label} = </span>
                <span className="font-mono font-semibold text-white">{prop.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        {/* Visualizations */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            Design Visualizations
            <span className="ml-auto flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Buckling curve */}
            <div className="lg:col-span-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4">
              <ColumnCurveChart
                Fy={Fy}
                n={n}
                KLr_x={result.KLr_x}
                KLr_y={result.KLr_y}
                governs={result.governs}
              />
            </div>
            {/* Cross section */}
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col items-center justify-center">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Cross Section</h4>
              <CrossSectionDiagram section={section} />
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        {/* Capacity check visual */}
        <div className="p-4 rounded-xl border transition-all duration-300"
          style={{
            background: "rgba(99,102,241,0.05)",
            borderColor: "rgba(99,102,241,0.2)",
          }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="4" x2="19" y2="4" />
                <line x1="12" y1="4" x2="12" y2="20" />
                <line x1="5" y1="20" x2="19" y2="20" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-400">
                Factored Resistance — Cr = {result.Cr.toFixed(1)} kN
              </p>
              <p className="text-xs text-[var(--color-text-muted)] font-mono">
                Governs about {result.governs}-axis | KL/r = {result.governs === "x" ? result.KLr_x.toFixed(1) : result.KLr_y.toFixed(1)}
              </p>
            </div>
          </div>

          {/* Cr(x) vs Cr(y) bar */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className={`p-3 rounded-lg ${result.governs === "x" ? "bg-cyan-500/10 border border-cyan-500/20" : "bg-white/[0.02]"}`}>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Cr(x) — strong axis</p>
              <p className={`font-mono font-bold text-lg ${result.governs === "x" ? "text-cyan-400" : "text-white"}`}>
                {result.CrX.toFixed(1)} <span className="text-xs font-normal text-gray-500">kN</span>
              </p>
            </div>
            <div className={`p-3 rounded-lg ${result.governs === "y" ? "bg-amber-500/10 border border-amber-500/20" : "bg-white/[0.02]"}`}>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Cr(y) — weak axis</p>
              <p className={`font-mono font-bold text-lg ${result.governs === "y" ? "text-amber-400" : "text-white"}`}>
                {result.CrY.toFixed(1)} <span className="text-xs font-normal text-gray-500">kN</span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        {/* Section comparison table */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Section Comparison
          </h3>
          <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left py-2 pr-3 text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Section</th>
                  <th className="text-right py-2 px-2 text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Mass</th>
                  <th className="text-right py-2 px-2 text-[var(--color-text-muted)] font-medium uppercase tracking-wider">A (mm²)</th>
                  <th className="text-right py-2 px-2 text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Cr (kN)</th>
                  <th className="text-right py-2 px-2 text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Governs</th>
                </tr>
              </thead>
              <tbody>
                {sectionResults.map((sr) => {
                  const isSelected = sr.index === sectionIndex;
                  return (
                    <tr key={sr.index}
                      className={`border-b border-[var(--color-border)]/30 cursor-pointer transition-colors duration-200
                        ${isSelected ? "bg-indigo-500/10" : "hover:bg-white/[0.02]"}`}
                      onClick={() => setSectionIndex(sr.index)}
                    >
                      <td className={`py-2 pr-3 font-mono ${isSelected ? "text-indigo-400 font-semibold" : "text-gray-300"}`}>
                        {isSelected && <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2 align-middle" />}
                        {sr.section.designation}
                      </td>
                      <td className="text-right py-2 px-2 font-mono text-gray-400">{sr.section.mass} kg/m</td>
                      <td className="text-right py-2 px-2 font-mono text-gray-400">{sr.section.A}</td>
                      <td className={`text-right py-2 px-2 font-mono font-bold ${isSelected ? "text-indigo-400" : "text-white"}`}>
                        {sr.Cr.toFixed(1)}
                      </td>
                      <td className="text-right py-2 px-2 font-mono text-gray-500">{sr.governs}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        {/* Results */}
        <ResultDisplay
          results={[
            { label: "Factored Resistance (Cr)", value: result.Cr, unit: "kN", highlight: true },
            { label: "Cr(x) — strong axis", value: result.CrX, unit: "kN" },
            { label: "Cr(y) — weak axis", value: result.CrY, unit: "kN" },
            { label: "KL/r(x)", value: result.KLr_x },
            { label: "KL/r(y)", value: result.KLr_y },
            { label: "Governing Axis", value: result.governs === "x" ? "Strong (x)" : "Weak (y)" },
          ]}
          formula={result.formula}
        />
      </div>
    </CalculatorLayout>
  );
}

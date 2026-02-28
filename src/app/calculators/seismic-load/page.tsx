"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import InputField from "@/components/InputField";
import SelectField from "@/components/SelectField";
import ResultDisplay from "@/components/ResultDisplay";
import LocationSelector from "@/components/LocationSelector";
import {
  calculateSeismicLoad,
  approximatePeriod,
  SFRS_SYSTEMS,
  SEISMIC_DEFAULTS,
  type SeismicInput,
} from "@/lib/calculators/seismic-load";
import { IMPORTANCE_CATEGORIES, type ImportanceCategory } from "@/lib/constants";
import type { ClimaticLocation } from "@/lib/climatic-data";

type SfrsKey = keyof typeof SFRS_SYSTEMS;

// ---------------------------------------------------------------------------
// Response Spectrum helpers
// ---------------------------------------------------------------------------

/** Interpolate the design spectral acceleration at any period T from anchor Sa values */
function interpolateSa(
  T: number,
  Sa02: number,
  Sa05: number,
  Sa10: number,
  Sa20: number
): number {
  if (T <= 0.2) return Sa02;
  if (T <= 0.5) return Sa02 + ((Sa05 - Sa02) / (0.5 - 0.2)) * (T - 0.2);
  if (T <= 1.0) return Sa05 + ((Sa10 - Sa05) / (1.0 - 0.5)) * (T - 0.5);
  if (T <= 2.0) return Sa10 + ((Sa20 - Sa10) / (2.0 - 1.0)) * (T - 1.0);
  // Beyond 2.0s: descend proportional to 1/T^2 (NBC approximation)
  return Sa20 * (2.0 / T) * (2.0 / T);
}

/** Build the design spectrum curve as SVG path data */
function buildSpectrumPoints(
  Sa02: number,
  Sa05: number,
  Sa10: number,
  Sa20: number,
  steps: number = 200
): { T: number; Sa: number }[] {
  const maxT = 4.0;
  const pts: { T: number; Sa: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const T = (i / steps) * maxT;
    pts.push({ T, Sa: interpolateSa(T, Sa02, Sa05, Sa10, Sa20) });
  }
  return pts;
}

// ---------------------------------------------------------------------------
// Response Spectrum Chart component
// ---------------------------------------------------------------------------

function ResponseSpectrumChart({
  Sa02,
  Sa05,
  Sa10,
  Sa20,
  Ta,
}: {
  Sa02: number;
  Sa05: number;
  Sa10: number;
  Sa20: number;
  Ta: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ T: number; Sa: number; x: number; y: number } | null>(null);

  const W = 560;
  const H = 320;
  const pad = { top: 30, right: 30, bottom: 50, left: 60 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const maxT = 4.0;
  const points = useMemo(() => buildSpectrumPoints(Sa02, Sa05, Sa10, Sa20), [Sa02, Sa05, Sa10, Sa20]);
  const maxSa = useMemo(() => Math.max(...points.map((p) => p.Sa), 0.1), [points]);
  const yMax = Math.ceil(maxSa * 10) / 10 + 0.1;

  const xScale = (T: number) => pad.left + (T / maxT) * plotW;
  const yScale = (sa: number) => pad.top + plotH - (sa / yMax) * plotH;

  // Build SVG path
  const linePath = useMemo(() => {
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"}${xScale(p.T).toFixed(2)},${yScale(p.Sa).toFixed(2)}`)
      .join(" ");
  }, [points, yMax]);

  // Fill path (closed to bottom)
  const fillPath = useMemo(() => {
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L${xScale(last.T).toFixed(2)},${yScale(0).toFixed(2)} L${xScale(first.T).toFixed(2)},${yScale(0).toFixed(2)} Z`;
  }, [linePath, points, yMax]);

  // Period marker
  const markerT = Math.min(Ta, maxT);
  const markerSa = interpolateSa(markerT, Sa02, Sa05, Sa10, Sa20);
  const mx = xScale(markerT);
  const my = yScale(markerSa);

  // Grid lines
  const xTicks = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
  const yTickCount = 5;
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) => (i / yTickCount) * yMax);

  // Anchor points
  const anchors = [
    { T: 0.2, Sa: Sa02, label: "Sa(0.2)" },
    { T: 0.5, Sa: Sa05, label: "Sa(0.5)" },
    { T: 1.0, Sa: Sa10, label: "Sa(1.0)" },
    { T: 2.0, Sa: Sa20, label: "Sa(2.0)" },
  ];

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = W / rect.width;
      const clientX = (e.clientX - rect.left) * scaleX;
      const clientY = (e.clientY - rect.top) * (H / rect.height);
      const T = ((clientX - pad.left) / plotW) * maxT;
      if (T < 0 || T > maxT) {
        setHover(null);
        return;
      }
      const sa = interpolateSa(T, Sa02, Sa05, Sa10, Sa20);
      setHover({ T, Sa: sa, x: clientX, y: clientY });
    },
    [Sa02, Sa05, Sa10, Sa20, plotW]
  );

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="spectrumFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="spectrumStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="50%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {yTicks.map((val) => (
          <g key={`y-${val}`}>
            <line
              x1={pad.left}
              y1={yScale(val)}
              x2={W - pad.right}
              y2={yScale(val)}
              stroke="#374151"
              strokeWidth="0.5"
              strokeDasharray={val === 0 ? "0" : "3,3"}
            />
            <text
              x={pad.left - 8}
              y={yScale(val) + 4}
              textAnchor="end"
              className="fill-gray-500"
              fontSize="10"
              fontFamily="monospace"
            >
              {val.toFixed(2)}
            </text>
          </g>
        ))}
        {xTicks.map((val) => (
          <g key={`x-${val}`}>
            <line
              x1={xScale(val)}
              y1={pad.top}
              x2={xScale(val)}
              y2={H - pad.bottom}
              stroke="#374151"
              strokeWidth="0.5"
              strokeDasharray="3,3"
            />
            <text
              x={xScale(val)}
              y={H - pad.bottom + 18}
              textAnchor="middle"
              className="fill-gray-500"
              fontSize="10"
              fontFamily="monospace"
            >
              {val.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Axis labels */}
        <text
          x={W / 2}
          y={H - 6}
          textAnchor="middle"
          className="fill-gray-400"
          fontSize="11"
          fontWeight="500"
        >
          Period T (s)
        </text>
        <text
          x={14}
          y={H / 2}
          textAnchor="middle"
          className="fill-gray-400"
          fontSize="11"
          fontWeight="500"
          transform={`rotate(-90 14 ${H / 2})`}
        >
          Sa(T) (g)
        </text>

        {/* Axes */}
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={H - pad.bottom} stroke="#4b5563" strokeWidth="1" />
        <line x1={pad.left} y1={H - pad.bottom} x2={W - pad.right} y2={H - pad.bottom} stroke="#4b5563" strokeWidth="1" />

        {/* Filled area under curve */}
        <path d={fillPath} fill="url(#spectrumFill)" />

        {/* Spectrum curve */}
        <path d={linePath} fill="none" stroke="url(#spectrumStroke)" strokeWidth="2.5" strokeLinejoin="round" />

        {/* Anchor dots */}
        {anchors.map((a) => (
          <g key={a.label}>
            <circle cx={xScale(a.T)} cy={yScale(a.Sa)} r="3.5" fill="#f43f5e" stroke="#1f2937" strokeWidth="1.5" />
            <text
              x={xScale(a.T)}
              y={yScale(a.Sa) - 10}
              textAnchor="middle"
              className="fill-gray-400"
              fontSize="9"
              fontFamily="monospace"
            >
              {a.Sa.toFixed(3)}
            </text>
          </g>
        ))}

        {/* Period marker — vertical dashed line */}
        <line
          x1={mx}
          y1={pad.top}
          x2={mx}
          y2={H - pad.bottom}
          stroke="#fbbf24"
          strokeWidth="1"
          strokeDasharray="5,4"
          opacity="0.6"
        />

        {/* Period marker — dot on curve */}
        <circle cx={mx} cy={my} r="6" fill="#fbbf24" opacity="0.25" />
        <circle cx={mx} cy={my} r="4" fill="#fbbf24" stroke="#1f2937" strokeWidth="1.5" />

        {/* Period marker label */}
        <g>
          <rect
            x={mx - 36}
            y={my - 30}
            width="72"
            height="18"
            rx="4"
            fill="#1f2937"
            stroke="#fbbf24"
            strokeWidth="0.7"
            opacity="0.9"
          />
          <text
            x={mx}
            y={my - 18}
            textAnchor="middle"
            fill="#fbbf24"
            fontSize="9.5"
            fontWeight="600"
            fontFamily="monospace"
          >
            Ta={markerT.toFixed(3)}s
          </text>
        </g>

        {/* Hover crosshair & tooltip */}
        {hover && hover.T >= 0 && (
          <g>
            <line
              x1={xScale(hover.T)}
              y1={pad.top}
              x2={xScale(hover.T)}
              y2={H - pad.bottom}
              stroke="#f43f5e"
              strokeWidth="0.7"
              strokeDasharray="2,2"
              opacity="0.5"
            />
            <circle cx={xScale(hover.T)} cy={yScale(hover.Sa)} r="3" fill="#f43f5e" />
            <rect
              x={Math.min(xScale(hover.T) + 10, W - pad.right - 110)}
              y={Math.max(yScale(hover.Sa) - 28, pad.top)}
              width="104"
              height="24"
              rx="4"
              fill="#111827"
              stroke="#374151"
              strokeWidth="0.7"
              opacity="0.95"
            />
            <text
              x={Math.min(xScale(hover.T) + 14, W - pad.right - 106)}
              y={Math.max(yScale(hover.Sa) - 12, pad.top + 16)}
              className="fill-gray-200"
              fontSize="10"
              fontFamily="monospace"
            >
              T={hover.T.toFixed(2)}s Sa={hover.Sa.toFixed(3)}g
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lateral Force Distribution Diagram component
// ---------------------------------------------------------------------------

function LateralForceDiagram({
  height,
  V,
  W,
}: {
  height: number;
  V: number;
  W: number;
}) {
  const floorHeight = 4; // metres per floor
  const numFloors = Math.max(1, Math.round(height / floorHeight));
  const svgW = 340;
  const svgH = Math.max(280, numFloors * 42 + 80);
  const buildingLeft = 100;
  const buildingWidth = 70;
  const buildingRight = buildingLeft + buildingWidth;
  const padTop = 30;
  const padBot = 40;
  const usableH = svgH - padTop - padBot;
  const floorSpacing = usableH / numFloors;

  // NBC inverted triangular: Fx proportional to hx * wx (assume uniform weight)
  // Fx = V * (hx) / sum(hi) for equal weight at each floor
  const floorHeights = Array.from({ length: numFloors }, (_, i) => (i + 1) * floorHeight);
  const sumH = floorHeights.reduce((a, b) => a + b, 0);
  const forces = floorHeights.map((hx) => (V * hx) / sumH);
  const maxForce = Math.max(...forces, 1);
  const maxArrowLen = 130;

  // Y position for each floor (top of building = padTop, base = padTop + usableH)
  const baseY = padTop + usableH;
  const floorY = (floorIdx: number) => baseY - (floorIdx + 1) * floorSpacing;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto max-h-[440px]">
      {/* Ground line */}
      <line x1={buildingLeft - 30} y1={baseY} x2={buildingRight + 30} y2={baseY} stroke="#6b7280" strokeWidth="2" />
      {/* Ground hatch */}
      {Array.from({ length: 8 }, (_, i) => {
        const x = buildingLeft - 20 + i * 16;
        return (
          <line key={i} x1={x} y1={baseY} x2={x - 8} y2={baseY + 10} stroke="#4b5563" strokeWidth="1" />
        );
      })}

      {/* Building outline */}
      <rect
        x={buildingLeft}
        y={floorY(numFloors - 1)}
        width={buildingWidth}
        height={baseY - floorY(numFloors - 1)}
        fill="#1e293b"
        stroke="#475569"
        strokeWidth="1.5"
        rx="2"
      />

      {/* Floor lines & force arrows */}
      {forces.map((F, i) => {
        const y = floorY(i);
        const arrowLen = (F / maxForce) * maxArrowLen;
        const arrowStart = buildingRight + 4;
        const arrowEnd = arrowStart + arrowLen;
        const arrowWidth = Math.max(1.5, (F / maxForce) * 4);

        return (
          <g key={i}>
            {/* Floor line */}
            <line x1={buildingLeft} y1={y} x2={buildingRight} y2={y} stroke="#475569" strokeWidth="0.8" strokeDasharray="3,2" />

            {/* Floor label (left side) */}
            <text x={buildingLeft - 6} y={y + 4} textAnchor="end" fill="#9ca3af" fontSize="9" fontFamily="monospace">
              {i + 1}F
            </text>

            {/* Height label */}
            <text x={buildingLeft - 6} y={y + 14} textAnchor="end" fill="#6b7280" fontSize="7.5" fontFamily="monospace">
              {floorHeights[i]}m
            </text>

            {/* Force arrow */}
            <line
              x1={arrowStart}
              y1={y}
              x2={arrowEnd}
              y2={y}
              stroke="#f43f5e"
              strokeWidth={arrowWidth}
              strokeLinecap="round"
            />
            {/* Arrowhead */}
            <polygon
              points={`${arrowEnd},${y} ${arrowEnd - 6},${y - 4} ${arrowEnd - 6},${y + 4}`}
              fill="#f43f5e"
            />

            {/* Force value label */}
            <text x={arrowEnd + 6} y={y + 4} fill="#fb7185" fontSize="9" fontWeight="600" fontFamily="monospace">
              {F.toFixed(1)} kN
            </text>
          </g>
        );
      })}

      {/* Roof label */}
      <text x={buildingLeft + buildingWidth / 2} y={floorY(numFloors - 1) - 8} textAnchor="middle" fill="#e5e7eb" fontSize="10" fontWeight="600">
        Roof
      </text>

      {/* Base shear label */}
      <text x={buildingLeft + buildingWidth / 2} y={baseY + 28} textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="700" fontFamily="monospace">
        V = {V.toFixed(1)} kN
      </text>

      {/* Title */}
      <text x={svgW / 2} y={16} textAnchor="middle" fill="#9ca3af" fontSize="10" fontWeight="600">
        Lateral Force Distribution
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SFRS Comparison Table component
// ---------------------------------------------------------------------------

function SfrsComparisonTable({ selectedKey }: { selectedKey: SfrsKey }) {
  const entries = Object.entries(SFRS_SYSTEMS) as [SfrsKey, (typeof SFRS_SYSTEMS)[SfrsKey]][];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="text-left py-2 pr-3 text-[var(--color-text-muted)] font-medium uppercase tracking-wider">System</th>
            <th className="text-center py-2 px-2 text-[var(--color-text-muted)] font-medium uppercase tracking-wider w-12">Rd</th>
            <th className="text-center py-2 px-2 text-[var(--color-text-muted)] font-medium uppercase tracking-wider w-12">Ro</th>
            <th className="text-center py-2 pl-2 text-[var(--color-text-muted)] font-medium uppercase tracking-wider w-16">Rd x Ro</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, sys]) => {
            const isSelected = key === selectedKey;
            const product = sys.Rd * sys.Ro;
            return (
              <tr
                key={key}
                className={`border-b border-[var(--color-border)]/30 transition-colors duration-200
                  ${isSelected ? "bg-rose-500/10" : "hover:bg-white/[0.02]"}`}
              >
                <td className={`py-2 pr-3 ${isSelected ? "text-rose-400 font-semibold" : "text-gray-300"}`}>
                  {isSelected && <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 mr-2 align-middle" />}
                  {sys.label}
                </td>
                <td className="text-center py-2 px-2 font-mono text-gray-400">{sys.Rd.toFixed(1)}</td>
                <td className="text-center py-2 px-2 font-mono text-gray-400">{sys.Ro.toFixed(1)}</td>
                <td className={`text-center py-2 pl-2 font-mono font-bold ${isSelected ? "text-rose-400" : "text-white"}`}>
                  {product.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Seismic Data Summary (auto-populated from location)
// ---------------------------------------------------------------------------

function SeismicDataSummary({ location }: { location: ClimaticLocation }) {
  const items = [
    { label: "Sa(0.2)", value: location.Sa02, color: "text-rose-400" },
    { label: "Sa(0.5)", value: location.Sa05, color: "text-rose-400" },
    { label: "Sa(1.0)", value: location.Sa10, color: "text-rose-400" },
    { label: "Sa(2.0)", value: location.Sa20, color: "text-rose-400" },
    { label: "PGA", value: location.PGA, color: "text-amber-400" },
    { label: "PGV", value: location.PGV, unit: "m/s", color: "text-amber-400" },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {items.map((item) => (
        <div key={item.label} className="bg-[var(--color-surface-2)] rounded-lg p-2 text-center">
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">{item.label}</p>
          <p className={`font-mono font-bold text-sm ${item.color}`}>
            {item.value.toFixed(3)}
            {item.unit ? (
              <span className="text-[10px] font-normal text-gray-500 ml-0.5">{item.unit}</span>
            ) : (
              <span className="text-[10px] font-normal text-gray-500 ml-0.5">g</span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}

// ===========================================================================
// Main Page
// ===========================================================================

export default function SeismicLoadPage() {
  // Location state
  const [selectedLocation, setSelectedLocation] = useState<ClimaticLocation | null>(null);

  // Input states
  const [Sa02, setSa02] = useState(SEISMIC_DEFAULTS.Sa);
  const [Sa05, setSa05] = useState(0.2);
  const [Sa10, setSa10] = useState(0.1);
  const [Sa20, setSa20] = useState(0.05);
  const [PGA, setPGA] = useState(0.15);
  const [PGV, setPGV] = useState(0.08);
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

  // Determine Sa(T) at design period from the spectrum
  const SaT = useMemo(
    () => interpolateSa(Ta, Sa02, Sa05, Sa10, Sa20),
    [Ta, Sa02, Sa05, Sa10, Sa20]
  );

  const result = useMemo(
    () => calculateSeismicLoad({ Sa: SaT, Mv, Ie, W, Rd, Ro, height, structureType }),
    [SaT, Mv, Ie, W, Rd, Ro, height, structureType]
  );

  // Location selection handler
  const handleLocationSelect = useCallback((loc: ClimaticLocation) => {
    setSelectedLocation(loc);
    setSa02(loc.Sa02);
    setSa05(loc.Sa05);
    setSa10(loc.Sa10);
    setSa20(loc.Sa20);
    setPGA(loc.PGA);
    setPGV(loc.PGV);
  }, []);

  return (
    <CalculatorLayout
      title="Seismic Load Calculator"
      description="Compute equivalent static base shear V per NBC 2020, Section 4.1.8. Select a location to auto-populate spectral accelerations, or enter values manually. Visualize the design response spectrum and lateral force distribution."
      codeRef="NBC 2020 -- Cl. 4.1.8"
    >
      <div className="space-y-8">
        {/* ================================================================= */}
        {/* LOCATION SELECTOR */}
        {/* ================================================================= */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Site Location
          </h3>
          <LocationSelector onSelect={handleLocationSelect} selected={selectedLocation} />
          {selectedLocation && (
            <div className="mt-3">
              <SeismicDataSummary location={selectedLocation} />
            </div>
          )}
        </div>

        <div className="border-t border-[var(--color-border)]" />

        {/* ================================================================= */}
        {/* INPUT PARAMETERS */}
        {/* ================================================================= */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Spectral Accelerations
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <InputField
              label="Sa(0.2)"
              value={Sa02}
              onChange={(v) => setSa02(parseFloat(v) || 0)}
              unit="g"
              step="0.01"
            />
            <InputField
              label="Sa(0.5)"
              value={Sa05}
              onChange={(v) => setSa05(parseFloat(v) || 0)}
              unit="g"
              step="0.01"
            />
            <InputField
              label="Sa(1.0)"
              value={Sa10}
              onChange={(v) => setSa10(parseFloat(v) || 0)}
              unit="g"
              step="0.01"
            />
            <InputField
              label="Sa(2.0)"
              value={Sa20}
              onChange={(v) => setSa20(parseFloat(v) || 0)}
              unit="g"
              step="0.01"
            />
            <InputField
              label="PGA"
              value={PGA}
              onChange={(v) => setPGA(parseFloat(v) || 0)}
              unit="g"
              step="0.01"
            />
            <InputField
              label="PGV"
              value={PGV}
              onChange={(v) => setPGV(parseFloat(v) || 0)}
              unit="m/s"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Building Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

          {/* Parameter summary bar */}
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
              <span className="text-[var(--color-text-muted)]">Rd x Ro = </span>
              <span className="font-mono font-semibold text-rose-400">{(Rd * Ro).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Ta = </span>
              <span className="font-mono font-semibold text-white">{Ta.toFixed(3)} s</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Sa(Ta) = </span>
              <span className="font-mono font-semibold text-rose-400">{SaT.toFixed(3)} g</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Ie = </span>
              <span className="font-mono font-semibold text-white">{Ie}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        {/* ================================================================= */}
        {/* RESULTS */}
        {/* ================================================================= */}
        <ResultDisplay
          results={[
            { label: "Base Shear (V)", value: result.V, unit: "kN", highlight: true },
            {
              label: "Base Shear Coefficient (V/W)",
              value: `${(result.baseShearCoeff * 100).toFixed(2)}%`,
              highlight: true,
            },
            { label: "Design Sa(Ta)", value: `${SaT.toFixed(3)} g` },
            { label: "Approximate Period (Ta)", value: `${Ta.toFixed(3)} s` },
            { label: "Seismic Weight (W)", value: W, unit: "kN" },
            { label: "Rd x Ro", value: `${(Rd * Ro).toFixed(2)}` },
          ]}
          formula={result.formula}
        />

        <div className="border-t border-[var(--color-border)]" />

        {/* ================================================================= */}
        {/* VISUALIZATIONS — Two column layout */}
        {/* ================================================================= */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Design Visualizations
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Response Spectrum */}
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                Design Response Spectrum
              </h4>
              <ResponseSpectrumChart
                Sa02={Sa02}
                Sa05={Sa05}
                Sa10={Sa10}
                Sa20={Sa20}
                Ta={Ta}
              />
              <p className="text-[10px] text-gray-600 mt-2 text-center">
                Hover over the chart to inspect Sa values at any period
              </p>
            </div>

            {/* Lateral Force Distribution */}
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                </svg>
                Building Lateral Force
              </h4>
              <LateralForceDiagram height={height} V={result.V} W={W} />
              <p className="text-[10px] text-gray-600 mt-2 text-center">
                Inverted triangular distribution, {Math.max(1, Math.round(height / 4))} floors at 4m each
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        {/* ================================================================= */}
        {/* SFRS COMPARISON TABLE */}
        {/* ================================================================= */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            SFRS System Comparison
          </h3>
          <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-3">
              Common Seismic Force Resisting Systems with ductility (Rd) and overstrength (Ro) factors per NBC 2020 Table 4.1.8.9.
              The currently selected system is highlighted.
            </p>
            <SfrsComparisonTable selectedKey={sfrs} />
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}

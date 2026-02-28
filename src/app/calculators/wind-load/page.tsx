"use client";

import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import InputField from "@/components/InputField";
import SelectField from "@/components/SelectField";
import ResultDisplay from "@/components/ResultDisplay";
import LocationSelector from "@/components/LocationSelector";
import {
  calculateWindLoad,
  computeCe,
  WIND_LOAD_DEFAULTS,
} from "@/lib/calculators/wind-load";
import { IMPORTANCE_CATEGORIES, type ImportanceCategory } from "@/lib/constants";
import type { ClimaticLocation } from "@/lib/climatic-data";

// ---------------------------------------------------------------------------
// Terrain type
// ---------------------------------------------------------------------------
type Terrain = "open" | "suburban" | "urban";

// ---------------------------------------------------------------------------
// Helper: generate Ce vs height data for the exposure curve
// ---------------------------------------------------------------------------
function generateCeProfile(
  terrain: Terrain,
  maxHeight: number
): { h: number; ce: number }[] {
  const points: { h: number; ce: number }[] = [];
  const top = Math.max(maxHeight * 1.4, 30);
  const step = Math.max(1, Math.round(top / 40));
  for (let h = 1; h <= top; h += step) {
    points.push({ h, ce: computeCe(h, terrain) });
  }
  return points;
}

// ---------------------------------------------------------------------------
// Helper: generate wind pressure profile at multiple heights
// ---------------------------------------------------------------------------
function generatePressureProfile(
  q: number,
  Iw: number,
  Ct: number,
  Cg: number,
  Cp: number,
  terrain: Terrain,
  maxHeight: number
): { h: number; p: number; ce: number }[] {
  const points: { h: number; p: number; ce: number }[] = [];
  const step = Math.max(1, Math.round(maxHeight / 16));
  for (let h = step; h <= maxHeight; h += step) {
    const ce = computeCe(h, terrain);
    const p = Iw * q * ce * Ct * Cg * Cp;
    points.push({ h, p, ce });
  }
  // always include the top
  const topCe = computeCe(maxHeight, terrain);
  const topP = Iw * q * topCe * Ct * Cg * Cp;
  if (!points.find((pt) => pt.h === maxHeight)) {
    points.push({ h: maxHeight, p: topP, ce: topCe });
  }
  return points.sort((a, b) => a.h - b.h);
}

// ---------------------------------------------------------------------------
// SVG Sub-components
// ---------------------------------------------------------------------------

/** Wind arrows on windward side */
function WindArrows({
  x,
  buildingTop,
  buildingBottom,
  intensity,
}: {
  x: number;
  buildingTop: number;
  buildingBottom: number;
  intensity: number;
}) {
  const count = 5;
  const arrowLen = 20 + Math.min(intensity * 30, 50);
  const arrows = [];
  const range = buildingBottom - buildingTop;
  for (let i = 0; i < count; i++) {
    const y = buildingTop + (range / (count + 1)) * (i + 1);
    const startX = x - arrowLen - 6;
    arrows.push(
      <g key={i} className="wind-arrow-group">
        <line
          x1={startX}
          y1={y}
          x2={x - 6}
          y2={y}
          stroke="#60a5fa"
          strokeWidth="2"
          strokeLinecap="round"
          opacity={0.7 + i * 0.06}
          style={{
            animation: `windBlow 1.6s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
        <polygon
          points={`${x - 6},${y} ${x - 14},${y - 4} ${x - 14},${y + 4}`}
          fill="#60a5fa"
          opacity={0.7 + i * 0.06}
          style={{
            animation: `windBlow 1.6s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
        {/* trailing dashes */}
        {[0, 1].map((d) => (
          <line
            key={d}
            x1={startX - 10 - d * 12}
            y1={y}
            x2={startX - 4 - d * 12}
            y2={y}
            stroke="#60a5fa"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity={0.3 + i * 0.04}
            style={{
              animation: `windBlow 1.6s ease-in-out ${i * 0.18 + d * 0.1}s infinite`,
            }}
          />
        ))}
      </g>
    );
  }
  return <>{arrows}</>;
}

/** Pressure zone overlay rectangle */
function PressureZone({
  x,
  y,
  width,
  height,
  color,
  label,
  value,
  labelX,
  labelY,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label: string;
  value: string;
  labelX: number;
  labelY: number;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        rx="2"
        style={{ transition: "all 0.5s ease" }}
      />
      {/* hatch pattern for suction */}
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="600"
        style={{ transition: "all 0.5s ease" }}
      >
        {label}
      </text>
      <text
        x={labelX}
        y={labelY + 14}
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontFamily="JetBrains Mono, monospace"
        opacity="0.8"
        style={{ transition: "all 0.5s ease" }}
      >
        {value}
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Building Pressure Diagram (main SVG)
// ---------------------------------------------------------------------------
function BuildingPressureDiagram({
  pExternal,
  pInternal,
  pNet,
  height,
  Ce,
  terrain,
  q,
  Iw,
  Ct,
  Cg,
  Cp,
}: {
  pExternal: number;
  pInternal: number;
  pNet: number;
  height: number;
  Ce: number;
  terrain: Terrain;
  q: number;
  Iw: number;
  Ct: number;
  Cg: number;
  Cp: number;
}) {
  const svgW = 520;
  const svgH = 340;
  const margin = { top: 30, bottom: 50, left: 80, right: 30 };
  const drawW = svgW - margin.left - margin.right;
  const drawH = svgH - margin.top - margin.bottom;

  // Building dimensions in SVG space
  const buildingW = Math.min(drawW * 0.35, 140);
  const buildingH = Math.min(drawH * 0.85, drawH * (Math.min(height, 60) / 60 * 0.5 + 0.4));
  const buildingX = margin.left + drawW * 0.35 - buildingW / 2;
  const buildingBottom = svgH - margin.bottom;
  const buildingTop = buildingBottom - buildingH;

  // Pressure profile data
  const profile = generatePressureProfile(q, Iw, Ct, Cg, Cp, terrain, height);
  const maxP = Math.max(...profile.map((pt) => Math.abs(pt.p)), 0.01);
  const barMaxW = drawW * 0.22;

  // Pressure bar chart (right of building)
  const barStartX = buildingX + buildingW + 30;

  const windIntensity = Math.abs(pExternal);

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      className="w-full h-auto"
      style={{ maxHeight: 340 }}
    >
      <defs>
        <linearGradient id="windward-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="leeward-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="building-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#334155" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="bar-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>

      {/* Ground line */}
      <line
        x1={margin.left - 20}
        y1={buildingBottom}
        x2={svgW - margin.right + 10}
        y2={buildingBottom}
        stroke="#3a3b5c"
        strokeWidth="2"
        strokeDasharray="6 4"
      />
      <text
        x={margin.left - 20}
        y={buildingBottom + 16}
        fill="#8889a8"
        fontSize="9"
        fontFamily="JetBrains Mono, monospace"
      >
        Ground
      </text>

      {/* Wind arrows */}
      <WindArrows
        x={buildingX}
        buildingTop={buildingTop}
        buildingBottom={buildingBottom}
        intensity={windIntensity}
      />

      {/* Wind label */}
      <text
        x={buildingX - 58}
        y={buildingTop - 8}
        fill="#60a5fa"
        fontSize="10"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
      >
        WIND
      </text>

      {/* Building body */}
      <rect
        x={buildingX}
        y={buildingTop}
        width={buildingW}
        height={buildingH}
        fill="url(#building-grad)"
        stroke="#475569"
        strokeWidth="1.5"
        rx="2"
        style={{ transition: "all 0.5s ease" }}
      />

      {/* Windward pressure zone (left half) */}
      <PressureZone
        x={buildingX + 2}
        y={buildingTop + 2}
        width={buildingW / 2 - 3}
        height={buildingH - 4}
        color={Cp >= 0 ? "url(#windward-grad)" : "url(#leeward-grad)"}
        label="p_ext"
        value={`${pExternal >= 0 ? "+" : ""}${pExternal.toFixed(3)} kPa`}
        labelX={buildingX + buildingW / 4}
        labelY={buildingTop + buildingH * 0.38}
      />

      {/* Leeward pressure zone (right half) */}
      <PressureZone
        x={buildingX + buildingW / 2 + 1}
        y={buildingTop + 2}
        width={buildingW / 2 - 3}
        height={buildingH - 4}
        color="url(#leeward-grad)"
        label="p_int"
        value={`${pInternal >= 0 ? "+" : ""}${pInternal.toFixed(3)} kPa`}
        labelX={buildingX + (buildingW * 3) / 4}
        labelY={buildingTop + buildingH * 0.38}
      />

      {/* Height dimension line */}
      <line
        x1={buildingX - 12}
        y1={buildingTop}
        x2={buildingX - 12}
        y2={buildingBottom}
        stroke="#818cf8"
        strokeWidth="1"
        markerStart="url(#dimArrowUp)"
        markerEnd="url(#dimArrowDown)"
      />
      <line x1={buildingX - 16} y1={buildingTop} x2={buildingX - 8} y2={buildingTop} stroke="#818cf8" strokeWidth="1" />
      <line x1={buildingX - 16} y1={buildingBottom} x2={buildingX - 8} y2={buildingBottom} stroke="#818cf8" strokeWidth="1" />
      <text
        x={buildingX - 14}
        y={buildingTop + buildingH / 2 + 4}
        textAnchor="middle"
        fill="#818cf8"
        fontSize="10"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="500"
        transform={`rotate(-90, ${buildingX - 14}, ${buildingTop + buildingH / 2})`}
      >
        h = {height}m
      </text>

      {/* Net pressure label below building */}
      <rect
        x={buildingX + buildingW / 2 - 52}
        y={buildingBottom + 10}
        width={104}
        height={24}
        rx="6"
        fill={pNet >= 0 ? "rgba(59,130,246,0.15)" : "rgba(239,68,68,0.15)"}
        stroke={pNet >= 0 ? "rgba(59,130,246,0.3)" : "rgba(239,68,68,0.3)"}
        strokeWidth="1"
      />
      <text
        x={buildingX + buildingW / 2}
        y={buildingBottom + 26}
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="600"
      >
        p_net = {pNet.toFixed(3)}
      </text>

      {/* Ce label */}
      <text
        x={buildingX + buildingW + 6}
        y={buildingTop - 8}
        fill="#a78bfa"
        fontSize="9"
        fontFamily="JetBrains Mono, monospace"
      >
        Ce = {Ce.toFixed(3)}
      </text>

      {/* Pressure profile bars */}
      <text
        x={barStartX + barMaxW / 2}
        y={margin.top - 6}
        textAnchor="middle"
        fill="#8889a8"
        fontSize="9"
        fontFamily="Inter, sans-serif"
        fontWeight="500"
      >
        Pressure Profile (kPa)
      </text>
      {profile.map((pt, i) => {
        const yFrac = 1 - pt.h / height;
        const barY = buildingTop + yFrac * buildingH + (buildingH / profile.length) * 0.1;
        const barH = Math.max((buildingH / profile.length) * 0.7, 4);
        const barW = (Math.abs(pt.p) / maxP) * barMaxW;
        return (
          <g key={i} style={{ transition: "all 0.5s ease" }}>
            <rect
              x={barStartX}
              y={barY}
              width={Math.max(barW, 2)}
              height={barH}
              fill="url(#bar-grad)"
              rx="2"
              opacity="0.85"
              style={{
                transition: "width 0.5s ease, y 0.5s ease",
              }}
            />
            <text
              x={barStartX + barW + 4}
              y={barY + barH / 2 + 3}
              fill="#8889a8"
              fontSize="7.5"
              fontFamily="JetBrains Mono, monospace"
            >
              {Math.abs(pt.p).toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* Height axis labels for pressure bars */}
      {profile
        .filter((_, i) => i % Math.max(1, Math.floor(profile.length / 5)) === 0 || i === profile.length - 1)
        .map((pt) => {
          const yFrac = 1 - pt.h / height;
          const barY = buildingTop + yFrac * buildingH;
          return (
            <text
              key={`label-${pt.h}`}
              x={barStartX - 6}
              y={barY + 3}
              textAnchor="end"
              fill="#6b7280"
              fontSize="7.5"
              fontFamily="JetBrains Mono, monospace"
            >
              {pt.h}m
            </text>
          );
        })}

      {/* Legend */}
      <g transform={`translate(${margin.left - 10}, ${svgH - 16})`}>
        <rect x="0" y="-8" width="10" height="10" fill="rgba(59,130,246,0.35)" rx="2" />
        <text x="14" y="0" fill="#8889a8" fontSize="8" fontFamily="Inter, sans-serif">
          Windward (+)
        </text>
        <rect x="84" y="-8" width="10" height="10" fill="rgba(239,68,68,0.3)" rx="2" />
        <text x="98" y="0" fill="#8889a8" fontSize="8" fontFamily="Inter, sans-serif">
          Leeward / Suction (-)
        </text>
      </g>

      <style>{`
        @keyframes windBlow {
          0%, 100% { opacity: 0.5; transform: translateX(0px); }
          50% { opacity: 1; transform: translateX(4px); }
        }
      `}</style>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Exposure Factor Chart (Ce vs Height)
// ---------------------------------------------------------------------------
function ExposureFactorChart({
  terrain,
  currentHeight,
  currentCe,
}: {
  terrain: Terrain;
  currentHeight: number;
  currentCe: number;
}) {
  const svgW = 320;
  const svgH = 200;
  const pad = { top: 24, bottom: 30, left: 42, right: 16 };
  const plotW = svgW - pad.left - pad.right;
  const plotH = svgH - pad.top - pad.bottom;

  const terrains: Terrain[] = ["open", "suburban", "urban"];
  const terrainColors: Record<Terrain, string> = {
    open: "#22d3ee",
    suburban: "#818cf8",
    urban: "#a78bfa",
  };
  const terrainLabels: Record<Terrain, string> = {
    open: "Open",
    suburban: "Suburban",
    urban: "Urban",
  };

  const maxH = Math.max(currentHeight * 1.5, 40);
  const allCeVals: number[] = [];
  const curves: Record<Terrain, { h: number; ce: number }[]> = {
    open: [],
    suburban: [],
    urban: [],
  };

  terrains.forEach((t) => {
    const pts = generateCeProfile(t, maxH);
    curves[t] = pts;
    pts.forEach((p) => allCeVals.push(p.ce));
  });

  const minCe = Math.floor(Math.min(...allCeVals) * 10) / 10;
  const maxCe = Math.ceil(Math.max(...allCeVals) * 10) / 10;
  const ceRange = maxCe - minCe || 0.5;

  function toX(h: number) {
    return pad.left + (h / maxH) * plotW;
  }
  function toY(ce: number) {
    return pad.top + plotH - ((ce - minCe) / ceRange) * plotH;
  }

  function pathD(points: { h: number; ce: number }[]) {
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.h).toFixed(1)} ${toY(p.ce).toFixed(1)}`)
      .join(" ");
  }

  // Grid lines
  const hTicks = 5;
  const ceTicks = 4;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto" style={{ maxHeight: 200 }}>
      {/* Title */}
      <text x={svgW / 2} y={14} textAnchor="middle" fill="#8889a8" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="500">
        Ce vs Height by Terrain
      </text>

      {/* Grid */}
      {Array.from({ length: hTicks + 1 }).map((_, i) => {
        const h = (maxH / hTicks) * i;
        const x = toX(h);
        return (
          <g key={`h-${i}`}>
            <line x1={x} y1={pad.top} x2={x} y2={pad.top + plotH} stroke="#252640" strokeWidth="0.5" />
            <text x={x} y={svgH - 8} textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="JetBrains Mono, monospace">
              {Math.round(h)}
            </text>
          </g>
        );
      })}
      {Array.from({ length: ceTicks + 1 }).map((_, i) => {
        const ce = minCe + (ceRange / ceTicks) * i;
        const y = toY(ce);
        return (
          <g key={`ce-${i}`}>
            <line x1={pad.left} y1={y} x2={pad.left + plotW} y2={y} stroke="#252640" strokeWidth="0.5" />
            <text x={pad.left - 6} y={y + 3} textAnchor="end" fill="#6b7280" fontSize="8" fontFamily="JetBrains Mono, monospace">
              {ce.toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* Axis labels */}
      <text x={svgW / 2} y={svgH - 0} textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="Inter, sans-serif">
        Height (m)
      </text>
      <text
        x={8}
        y={pad.top + plotH / 2}
        textAnchor="middle"
        fill="#6b7280"
        fontSize="8"
        fontFamily="Inter, sans-serif"
        transform={`rotate(-90, 8, ${pad.top + plotH / 2})`}
      >
        Ce
      </text>

      {/* Curves */}
      {terrains.map((t) => (
        <path
          key={t}
          d={pathD(curves[t])}
          fill="none"
          stroke={terrainColors[t]}
          strokeWidth={t === terrain ? "2.5" : "1.2"}
          opacity={t === terrain ? 1 : 0.35}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "all 0.4s ease" }}
        />
      ))}

      {/* Current point */}
      <circle
        cx={toX(currentHeight)}
        cy={toY(currentCe)}
        r="5"
        fill={terrainColors[terrain]}
        stroke="white"
        strokeWidth="2"
        style={{ transition: "all 0.4s ease" }}
      />
      {/* Crosshair lines */}
      <line
        x1={toX(currentHeight)}
        y1={toY(currentCe)}
        x2={toX(currentHeight)}
        y2={pad.top + plotH}
        stroke={terrainColors[terrain]}
        strokeWidth="0.8"
        strokeDasharray="3 3"
        opacity="0.5"
        style={{ transition: "all 0.4s ease" }}
      />
      <line
        x1={pad.left}
        y1={toY(currentCe)}
        x2={toX(currentHeight)}
        y2={toY(currentCe)}
        stroke={terrainColors[terrain]}
        strokeWidth="0.8"
        strokeDasharray="3 3"
        opacity="0.5"
        style={{ transition: "all 0.4s ease" }}
      />

      {/* Point label */}
      <text
        x={toX(currentHeight) + 8}
        y={toY(currentCe) - 8}
        fill="white"
        fontSize="9"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="600"
        style={{ transition: "all 0.4s ease" }}
      >
        ({currentHeight}m, {currentCe.toFixed(3)})
      </text>

      {/* Legend */}
      {terrains.map((t, i) => (
        <g key={t} transform={`translate(${pad.left + i * 80}, ${pad.top + plotH + 22})`}>
          <line x1="0" y1="0" x2="14" y2="0" stroke={terrainColors[t]} strokeWidth={t === terrain ? "2.5" : "1.2"} opacity={t === terrain ? 1 : 0.4} />
          <text x="18" y="3" fill={t === terrain ? "white" : "#6b7280"} fontSize="8" fontFamily="Inter, sans-serif" fontWeight={t === terrain ? "600" : "400"}>
            {terrainLabels[t]}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Wind Pressure Profile Chart (vertical bar chart)
// ---------------------------------------------------------------------------
function WindPressureProfileChart({
  q,
  Iw,
  Ct,
  Cg,
  Cp,
  terrain,
  height,
  Ce,
}: {
  q: number;
  Iw: number;
  Ct: number;
  Cg: number;
  Cp: number;
  terrain: Terrain;
  height: number;
  Ce: number;
}) {
  const svgW = 320;
  const svgH = 280;
  const pad = { top: 24, bottom: 28, left: 42, right: 52 };
  const plotW = svgW - pad.left - pad.right;
  const plotH = svgH - pad.top - pad.bottom;

  const profile = generatePressureProfile(q, Iw, Ct, Cg, Cp, terrain, height);
  const maxP = Math.max(...profile.map((pt) => Math.abs(pt.p)), 0.01);
  const barH = Math.max(plotH / (profile.length + 1) - 2, 6);

  function toY(h: number) {
    return pad.top + plotH - (h / height) * plotH;
  }

  // Pressure ticks
  const pTicks = 4;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto" style={{ maxHeight: 280 }}>
      <defs>
        <linearGradient id="profile-bar-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>

      {/* Title */}
      <text x={svgW / 2} y={14} textAnchor="middle" fill="#8889a8" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="500">
        Wind Pressure vs Height
      </text>

      {/* Vertical axis (height) */}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH} stroke="#3a3b5c" strokeWidth="1" />
      {/* Horizontal axis (pressure) */}
      <line x1={pad.left} y1={pad.top + plotH} x2={pad.left + plotW} y2={pad.top + plotH} stroke="#3a3b5c" strokeWidth="1" />

      {/* Height ticks */}
      {profile.map((pt) => {
        const y = toY(pt.h);
        return (
          <g key={pt.h}>
            <line x1={pad.left - 4} y1={y} x2={pad.left} y2={y} stroke="#6b7280" strokeWidth="0.5" />
            <text x={pad.left - 8} y={y + 3} textAnchor="end" fill="#6b7280" fontSize="8" fontFamily="JetBrains Mono, monospace">
              {pt.h}
            </text>
          </g>
        );
      })}

      {/* Pressure grid */}
      {Array.from({ length: pTicks + 1 }).map((_, i) => {
        const pVal = (maxP / pTicks) * i;
        const x = pad.left + (pVal / maxP) * plotW;
        return (
          <g key={i}>
            <line x1={x} y1={pad.top} x2={x} y2={pad.top + plotH} stroke="#252640" strokeWidth="0.5" />
            {i > 0 && (
              <text x={x} y={pad.top + plotH + 14} textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="JetBrains Mono, monospace">
                {pVal.toFixed(2)}
              </text>
            )}
          </g>
        );
      })}

      {/* Bars */}
      {profile.map((pt, i) => {
        const y = toY(pt.h) - barH / 2;
        const w = (Math.abs(pt.p) / maxP) * plotW;
        return (
          <g key={i}>
            <rect
              x={pad.left}
              y={y}
              width={Math.max(w, 2)}
              height={barH}
              fill="url(#profile-bar-grad)"
              rx="2"
              opacity="0.9"
              style={{ transition: "all 0.5s ease" }}
            />
            <text
              x={pad.left + w + 4}
              y={y + barH / 2 + 3}
              fill="#a5b4fc"
              fontSize="8"
              fontFamily="JetBrains Mono, monospace"
            >
              {Math.abs(pt.p).toFixed(3)}
            </text>
          </g>
        );
      })}

      {/* Axis labels */}
      <text
        x={10}
        y={pad.top + plotH / 2}
        textAnchor="middle"
        fill="#6b7280"
        fontSize="8"
        fontFamily="Inter, sans-serif"
        transform={`rotate(-90, 10, ${pad.top + plotH / 2})`}
      >
        Height (m)
      </text>
      <text x={pad.left + plotW / 2} y={svgH - 4} textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="Inter, sans-serif">
        Pressure (kPa)
      </text>

      {/* Current Ce annotation */}
      <text
        x={pad.left + plotW + 2}
        y={pad.top + 8}
        fill="#a78bfa"
        fontSize="8"
        fontFamily="JetBrains Mono, monospace"
      >
        Ce at top
      </text>
      <text
        x={pad.left + plotW + 2}
        y={pad.top + 19}
        fill="white"
        fontSize="9"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="600"
      >
        {Ce.toFixed(3)}
      </text>
    </svg>
  );
}

// ===========================================================================
// Main Page Component
// ===========================================================================
export default function WindLoadPage() {
  // ---- State ----
  const [selectedLocation, setSelectedLocation] = useState<ClimaticLocation | null>(null);
  const [q, setQ] = useState(WIND_LOAD_DEFAULTS.q);
  const [importance, setImportance] = useState<ImportanceCategory>("normal");
  const [height, setHeight] = useState(10);
  const [terrain, setTerrain] = useState<Terrain>("open");
  const [Ct, setCt] = useState(WIND_LOAD_DEFAULTS.Ct);
  const [Cg, setCg] = useState(WIND_LOAD_DEFAULTS.Cg);
  const [Cp, setCp] = useState(WIND_LOAD_DEFAULTS.Cp);
  const [Cpi, setCpi] = useState(WIND_LOAD_DEFAULTS.Cpi ?? 0);

  // ---- Derived ----
  const Iw = IMPORTANCE_CATEGORIES[importance].Iw;
  const Ce = useMemo(() => computeCe(height, terrain), [height, terrain]);

  const result = useMemo(
    () => calculateWindLoad({ q, Iw, Ce, Ct, Cg, Cp, Cpi }),
    [q, Iw, Ce, Ct, Cg, Cp, Cpi]
  );

  // ---- Handlers ----
  const handleLocationSelect = useCallback(
    (loc: ClimaticLocation) => {
      setSelectedLocation(loc);
      setQ(loc.q50);
    },
    []
  );

  return (
    <CalculatorLayout
      title="Wind Load Calculator"
      description="Calculate external and net wind pressures per NBC 2020, Section 4.1.7. Includes automatic exposure factor calculation based on building height and terrain."
      codeRef="NBC 2020 -- Cl. 4.1.7"
    >
      <div className="space-y-8">
        {/* ---------------------------------------------------------------- */}
        {/* Location Selector */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Location
          </h3>
          <LocationSelector
            onSelect={handleLocationSelect}
            selected={selectedLocation}
          />
          {selectedLocation && (
            <div
              className="mt-3 p-3 bg-[var(--color-surface-2)] rounded-xl text-sm flex flex-wrap gap-x-6 gap-y-1"
              style={{ animation: "fadeInScale 0.25s ease-out" }}
            >
              <div>
                <span className="text-[var(--color-text-muted)]">q50 = </span>
                <span className="font-mono font-semibold text-cyan-400">
                  {selectedLocation.q50} kPa
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">q10 = </span>
                <span className="font-mono font-semibold text-white">
                  {selectedLocation.q10} kPa
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">Ss = </span>
                <span className="font-mono font-semibold text-white">
                  {selectedLocation.Ss} kPa
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--color-border)]" />

        {/* ---------------------------------------------------------------- */}
        {/* Input Parameters */}
        {/* ---------------------------------------------------------------- */}
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
              onChange={(v) => setTerrain(v as Terrain)}
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

        {/* ---------------------------------------------------------------- */}
        {/* Interactive Building Pressure Diagram */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Building Pressure Diagram
          </h3>
          <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4 overflow-hidden">
            <BuildingPressureDiagram
              pExternal={result.pExternal}
              pInternal={result.pInternal}
              pNet={result.pNet}
              height={height}
              Ce={Ce}
              terrain={terrain}
              q={q}
              Iw={Iw}
              Ct={Ct}
              Cg={Cg}
              Cp={Cp}
            />
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        {/* ---------------------------------------------------------------- */}
        {/* Exposure Factor Visual + Wind Pressure Profile */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            Exposure &amp; Pressure Profiles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ce vs Height chart */}
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4">
              <ExposureFactorChart
                terrain={terrain}
                currentHeight={height}
                currentCe={Ce}
              />
            </div>
            {/* Wind Pressure Profile */}
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4">
              <WindPressureProfileChart
                q={q}
                Iw={Iw}
                Ct={Ct}
                Cg={Cg}
                Cp={Cp}
                terrain={terrain}
                height={height}
                Ce={Ce}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        {/* ---------------------------------------------------------------- */}
        {/* Results */}
        {/* ---------------------------------------------------------------- */}
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

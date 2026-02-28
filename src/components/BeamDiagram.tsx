"use client";

import { useMemo } from "react";
import type { BeamType, LoadType } from "@/lib/calculators/beam-analysis";

interface BeamDiagramProps {
  beamType: BeamType;
  loadType: LoadType;
  L: number;
  load: number;
  a?: number;
  maxMoment: number;
  maxShear: number;
  maxDeflection: number;
  reactionLeft: number;
  reactionRight: number;
}

export default function BeamDiagram({
  beamType,
  loadType,
  L,
  load,
  a,
  maxMoment,
  maxShear,
  maxDeflection,
  reactionLeft,
  reactionRight,
}: BeamDiagramProps) {
  const W = 700;
  const H = 520;
  const pad = { left: 60, right: 60, top: 40, bottom: 40 };
  const beamY = 120;
  const beamLeft = pad.left + 20;
  const beamRight = W - pad.right - 20;
  const beamLen = beamRight - beamLeft;

  const numPoints = 80;

  // Generate moment, shear, and deflection diagrams
  const diagrams = useMemo(() => {
    const pts = { moment: [] as number[], shear: [] as number[], deflection: [] as number[] };

    for (let i = 0; i <= numPoints; i++) {
      const x = (i / numPoints) * L;
      let M = 0, V = 0, d = 0;

      if (beamType === "simply_supported") {
        const RL = reactionLeft;
        if (loadType === "uniform") {
          const w = load;
          V = RL - w * x;
          M = RL * x - (w * x * x) / 2;
          const EI = 1; // normalized
          d = -(w * x * (L * L * L - 2 * L * x * x + x * x * x)) / (24 * EI);
        } else if (loadType === "point_center") {
          const P = load;
          if (x <= L / 2) {
            V = P / 2;
            M = (P * x) / 2;
          } else {
            V = -P / 2;
            M = (P * (L - x)) / 2;
          }
          d = x <= L / 2
            ? -(P * x * (3 * L * L - 4 * x * x)) / 48
            : -(P * (L - x) * (3 * L * L - 4 * (L - x) * (L - x))) / 48;
        } else if (loadType === "point_any") {
          const P = load;
          const aVal = a ?? L / 2;
          const b = L - aVal;
          if (x <= aVal) {
            V = (P * b) / L;
            M = (P * b * x) / L;
          } else {
            V = -(P * aVal) / L;
            M = (P * aVal * (L - x)) / L;
          }
          d = -M; // simplified shape
        } else if (loadType === "triangular") {
          const w = load;
          const R1 = (w * L) / 6;
          V = R1 - (w * x * x) / (2 * L);
          M = R1 * x - (w * x * x * x) / (6 * L);
          d = -M; // simplified shape
        }
      } else if (beamType === "cantilever") {
        if (loadType === "uniform") {
          const w = load;
          V = w * (L - x);
          M = -(w * (L - x) * (L - x)) / 2;
          d = -(w * x * x * (6 * L * L - 4 * L * x + x * x)) / 24;
        } else if (loadType === "point_center" || loadType === "point_any") {
          const P = load;
          const aVal = loadType === "point_any" ? (a ?? L) : L;
          if (x <= aVal) {
            V = P;
            M = -P * (aVal - x);
            d = -(P * x * x * (3 * aVal - x)) / 6;
          } else {
            V = 0;
            M = 0;
            d = -(P * aVal * aVal * (3 * x - aVal)) / 6;
          }
        } else {
          const w = load;
          V = (w * (L - x) * (L - x)) / (2 * L);
          M = -(w * (L - x) * (L - x) * (L - x)) / (6 * L);
          d = -M;
        }
      } else if (beamType === "fixed_fixed") {
        if (loadType === "uniform") {
          const w = load;
          V = w * (L / 2 - x);
          M = (w / 12) * (6 * L * x - 6 * x * x - L * L);
          d = -(w * x * x * (L - x) * (L - x)) / (24);
        } else {
          const P = load;
          V = x < L / 2 ? P / 2 : -P / 2;
          M = x <= L / 2 ? (P / 8) * (4 * x / L * 2 - 1) * L / 2 : (P / 8) * (4 * (L - x) / L * 2 - 1) * L / 2;
          d = -Math.sin(Math.PI * x / L);
        }
      }

      pts.moment.push(M);
      pts.shear.push(V);
      pts.deflection.push(d);
    }

    return pts;
  }, [beamType, loadType, L, load, a, reactionLeft]);

  function normalizePath(vals: number[], yCenter: number, maxHeight: number, color: string, fillColor: string) {
    const absMax = Math.max(...vals.map(Math.abs), 0.001);
    const scale = maxHeight / absMax;

    const pathPoints = vals.map((v, i) => {
      const px = beamLeft + (i / numPoints) * beamLen;
      const py = yCenter - v * scale;
      return `${px},${py}`;
    });

    const fillPoints = [
      `${beamLeft},${yCenter}`,
      ...pathPoints,
      `${beamRight},${yCenter}`,
    ].join(" ");

    return (
      <g>
        <polygon points={fillPoints} fill={fillColor} />
        <polyline
          points={pathPoints.join(" ")}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1={beamLeft} y1={yCenter} x2={beamRight} y2={yCenter}
          stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4,4" />
      </g>
    );
  }

  // Support renderers
  function renderPinSupport(cx: number, cy: number) {
    return (
      <g>
        <polygon points={`${cx},${cy} ${cx - 10},${cy + 16} ${cx + 10},${cy + 16}`}
          fill="none" stroke="#818cf8" strokeWidth="2" />
        <line x1={cx - 14} y1={cy + 18} x2={cx + 14} y2={cy + 18}
          stroke="#818cf8" strokeWidth="2" />
      </g>
    );
  }

  function renderRollerSupport(cx: number, cy: number) {
    return (
      <g>
        <polygon points={`${cx},${cy} ${cx - 10},${cy + 12} ${cx + 10},${cy + 12}`}
          fill="none" stroke="#818cf8" strokeWidth="2" />
        <circle cx={cx} cy={cy + 16} r="4" fill="none" stroke="#818cf8" strokeWidth="2" />
        <line x1={cx - 14} y1={cy + 22} x2={cx + 14} y2={cy + 22}
          stroke="#818cf8" strokeWidth="2" />
      </g>
    );
  }

  function renderFixedSupport(cx: number, cy: number, side: "left" | "right") {
    const dir = side === "left" ? -1 : 1;
    return (
      <g>
        <line x1={cx} y1={cy - 14} x2={cx} y2={cy + 14}
          stroke="#818cf8" strokeWidth="3" />
        {[-10, -4, 2, 8].map((dy) => (
          <line key={dy} x1={cx} y1={cy + dy} x2={cx + dir * 8} y2={cy + dy + 6}
            stroke="#818cf8" strokeWidth="1.5" />
        ))}
      </g>
    );
  }

  // Load arrows
  function renderLoads() {
    if (loadType === "uniform" || loadType === "triangular") {
      const arrows = [];
      const n = 12;
      for (let i = 0; i <= n; i++) {
        const x = beamLeft + (i / n) * beamLen;
        const intensityFactor = loadType === "triangular" ? i / n : 1;
        const arrowLen = 20 + intensityFactor * 20;
        arrows.push(
          <g key={i}>
            <line x1={x} y1={beamY - arrowLen - 8} x2={x} y2={beamY - 8}
              stroke="#22d3ee" strokeWidth="1.5" />
            <polygon
              points={`${x},${beamY - 6} ${x - 3},${beamY - 12} ${x + 3},${beamY - 12}`}
              fill="#22d3ee"
            />
          </g>
        );
      }
      // Top line connecting arrows
      const topPoints = Array.from({ length: n + 1 }, (_, i) => {
        const x = beamLeft + (i / n) * beamLen;
        const intensityFactor = loadType === "triangular" ? i / n : 1;
        return `${x},${beamY - 28 - intensityFactor * 20}`;
      }).join(" ");

      return (
        <g>
          <polyline points={topPoints} fill="none" stroke="#22d3ee" strokeWidth="1.5" />
          {arrows}
          <text x={beamLeft + beamLen / 2} y={beamY - 56} textAnchor="middle"
            fill="#22d3ee" fontSize="11" fontFamily="JetBrains Mono, monospace">
            {loadType === "uniform" ? `w = ${load} kN/m` : `w_max = ${load} kN/m`}
          </text>
        </g>
      );
    } else {
      // Point loads
      const px = loadType === "point_center"
        ? beamLeft + beamLen / 2
        : beamLeft + ((a ?? L / 2) / L) * beamLen;

      return (
        <g>
          <line x1={px} y1={beamY - 50} x2={px} y2={beamY - 6}
            stroke="#fb7185" strokeWidth="2.5" />
          <polygon
            points={`${px},${beamY - 4} ${px - 5},${beamY - 14} ${px + 5},${beamY - 14}`}
            fill="#fb7185"
          />
          <text x={px} y={beamY - 56} textAnchor="middle"
            fill="#fb7185" fontSize="11" fontFamily="JetBrains Mono, monospace" fontWeight="600">
            P = {load} kN
          </text>
        </g>
      );
    }
  }

  // Reaction arrows
  function renderReactions() {
    const arrows = [];
    if (reactionLeft > 0) {
      arrows.push(
        <g key="rl">
          <line x1={beamLeft} y1={beamY + 44} x2={beamLeft} y2={beamY + 24}
            stroke="#34d399" strokeWidth="2" />
          <polygon points={`${beamLeft},${beamY + 22} ${beamLeft - 4},${beamY + 30} ${beamLeft + 4},${beamY + 30}`}
            fill="#34d399" />
          <text x={beamLeft} y={beamY + 56} textAnchor="middle"
            fill="#34d399" fontSize="10" fontFamily="JetBrains Mono, monospace">
            {reactionLeft.toFixed(1)} kN
          </text>
        </g>
      );
    }
    if (reactionRight > 0) {
      arrows.push(
        <g key="rr">
          <line x1={beamRight} y1={beamY + 44} x2={beamRight} y2={beamY + 24}
            stroke="#34d399" strokeWidth="2" />
          <polygon points={`${beamRight},${beamY + 22} ${beamRight - 4},${beamY + 30} ${beamRight + 4},${beamY + 30}`}
            fill="#34d399" />
          <text x={beamRight} y={beamY + 56} textAnchor="middle"
            fill="#34d399" fontSize="10" fontFamily="JetBrains Mono, monospace">
            {reactionRight.toFixed(1)} kN
          </text>
        </g>
      );
    }
    return <>{arrows}</>;
  }

  // Dimension line
  function renderDimension() {
    const y = beamY + 70;
    return (
      <g>
        <line x1={beamLeft} y1={y} x2={beamRight} y2={y}
          stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1={beamLeft} y1={y - 4} x2={beamLeft} y2={y + 4}
          stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <line x1={beamRight} y1={y - 4} x2={beamRight} y2={y + 4}
          stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <text x={beamLeft + beamLen / 2} y={y + 14} textAnchor="middle"
          fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="JetBrains Mono, monospace">
          L = {L} m
        </text>
      </g>
    );
  }

  const momentY = 230;
  const shearY = 340;
  const deflectionY = 450;
  const diagramH = 40;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-[700px] mx-auto"
        style={{ minWidth: 400 }}
      >
        {/* Background */}
        <defs>
          <linearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="1" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* The beam */}
        <rect x={beamLeft} y={beamY - 4} width={beamLen} height={8} rx="2"
          fill="url(#beamGrad)" />

        {/* Supports */}
        {beamType === "simply_supported" && (
          <>
            {renderPinSupport(beamLeft, beamY + 4)}
            {renderRollerSupport(beamRight, beamY + 4)}
          </>
        )}
        {beamType === "cantilever" && renderFixedSupport(beamLeft, beamY, "left")}
        {beamType === "fixed_fixed" && (
          <>
            {renderFixedSupport(beamLeft, beamY, "left")}
            {renderFixedSupport(beamRight, beamY, "right")}
          </>
        )}

        {/* Applied loads */}
        {renderLoads()}

        {/* Reactions */}
        {renderReactions()}

        {/* Dimension */}
        {renderDimension()}

        {/* Moment diagram */}
        <text x={pad.left - 8} y={momentY} textAnchor="end" fill="#a78bfa" fontSize="10"
          fontFamily="JetBrains Mono, monospace" fontWeight="600">M</text>
        <text x={beamRight + 8} y={momentY - diagramH + 4} textAnchor="start" fill="rgba(167,139,250,0.5)"
          fontSize="9" fontFamily="JetBrains Mono, monospace">
          {maxMoment.toFixed(1)} kN·m
        </text>
        {normalizePath(diagrams.moment, momentY, diagramH, "#a78bfa", "rgba(167,139,250,0.08)")}

        {/* Shear diagram */}
        <text x={pad.left - 8} y={shearY} textAnchor="end" fill="#fb7185" fontSize="10"
          fontFamily="JetBrains Mono, monospace" fontWeight="600">V</text>
        <text x={beamRight + 8} y={shearY - diagramH + 4} textAnchor="start" fill="rgba(251,113,133,0.5)"
          fontSize="9" fontFamily="JetBrains Mono, monospace">
          {maxShear.toFixed(1)} kN
        </text>
        {normalizePath(diagrams.shear, shearY, diagramH, "#fb7185", "rgba(251,113,133,0.08)")}

        {/* Deflection diagram */}
        <text x={pad.left - 8} y={deflectionY} textAnchor="end" fill="#22d3ee" fontSize="10"
          fontFamily="JetBrains Mono, monospace" fontWeight="600">δ</text>
        <text x={beamRight + 8} y={deflectionY - diagramH + 4} textAnchor="start" fill="rgba(34,211,238,0.5)"
          fontSize="9" fontFamily="JetBrains Mono, monospace">
          {maxDeflection.toFixed(2)} mm
        </text>
        {normalizePath(diagrams.deflection, deflectionY, diagramH, "#22d3ee", "rgba(34,211,238,0.08)")}
      </svg>
    </div>
  );
}

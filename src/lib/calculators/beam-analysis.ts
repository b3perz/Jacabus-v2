// ============================================================================
// Beam Analysis Calculator
// Simply supported and cantilever beams under common loading patterns
// ============================================================================

export type BeamType = "simply_supported" | "cantilever" | "fixed_fixed";
export type LoadType = "point_center" | "point_any" | "uniform" | "triangular";

export interface BeamInput {
  /** Beam span (m) */
  L: number;
  /** Elastic modulus (MPa) */
  E: number;
  /** Moment of inertia (mm⁴ × 10⁶) — entered in 10⁶ mm⁴ */
  I: number;
  /** Beam type */
  beamType: BeamType;
  /** Load type */
  loadType: LoadType;
  /** Point load (kN) or distributed load (kN/m) */
  load: number;
  /** Distance to point load from left support (m), used for point_any */
  a?: number;
}

export interface BeamResult {
  /** Maximum bending moment (kN·m) */
  maxMoment: number;
  /** Maximum shear force (kN) */
  maxShear: number;
  /** Maximum deflection (mm) */
  maxDeflection: number;
  /** Left reaction (kN) */
  reactionLeft: number;
  /** Right reaction (kN) — 0 for cantilever */
  reactionRight: number;
  formula: string;
}

export function calculateBeam(input: BeamInput): BeamResult {
  const { L, E, I, beamType, loadType, load, a } = input;

  // Convert I from 10⁶ mm⁴ to mm⁴, E is MPa = N/mm²
  // EI in N·mm² = E(N/mm²) × I(mm⁴)
  const EI = E * I * 1e6; // N·mm²
  const Lmm = L * 1000; // mm

  let maxMoment = 0; // kN·m
  let maxShear = 0; // kN
  let maxDeflection = 0; // mm
  let reactionLeft = 0;
  let reactionRight = 0;
  let formula = "";

  if (beamType === "simply_supported") {
    if (loadType === "uniform") {
      // w in kN/m
      const w = load;
      maxMoment = (w * L * L) / 8;
      maxShear = (w * L) / 2;
      reactionLeft = (w * L) / 2;
      reactionRight = (w * L) / 2;
      // δ = 5wL⁴ / 384EI (w in N/mm, L in mm)
      const wNmm = (w * 1000) / 1000; // kN/m → N/mm
      maxDeflection = (5 * wNmm * Math.pow(Lmm, 4)) / (384 * EI);
      formula = `M_max = wL²/8 = ${w} × ${L}² / 8\nV_max = wL/2\nδ_max = 5wL⁴/(384EI)`;
    } else if (loadType === "point_center") {
      const P = load;
      maxMoment = (P * L) / 4;
      maxShear = P / 2;
      reactionLeft = P / 2;
      reactionRight = P / 2;
      const Pn = P * 1000; // N
      maxDeflection = (Pn * Math.pow(Lmm, 3)) / (48 * EI);
      formula = `M_max = PL/4 = ${P} × ${L} / 4\nV_max = P/2\nδ_max = PL³/(48EI)`;
    } else if (loadType === "point_any") {
      const P = load;
      const aVal = a ?? L / 2;
      const b = L - aVal;
      maxMoment = (P * aVal * b) / L;
      maxShear = Math.max((P * b) / L, (P * aVal) / L);
      reactionLeft = (P * b) / L;
      reactionRight = (P * aVal) / L;
      const Pn = P * 1000;
      const amm = aVal * 1000;
      const bmm = b * 1000;
      maxDeflection =
        (Pn * bmm * (Lmm * Lmm - bmm * bmm)) /
        (9 * Math.sqrt(3) * EI * Lmm) *
        Math.sqrt(Lmm * Lmm - bmm * bmm);
      // Simplified: use standard formula
      maxDeflection = (Pn * amm * bmm * (Lmm + bmm)) / (6 * EI * Lmm) *
        Math.sqrt((Lmm + bmm) * (Lmm - bmm + amm) / (3 * Lmm));
      // Use simpler approximate: δ ≈ Pa(L²-a²)^(3/2) / (9√3·EI·L)
      maxDeflection = (Pn * amm * Math.pow(Lmm * Lmm - amm * amm, 1.5)) /
        (9 * Math.sqrt(3) * EI * Lmm);
      formula = `M_max = Pab/L = ${P} × ${aVal.toFixed(2)} × ${b.toFixed(2)} / ${L}`;
    } else if (loadType === "triangular") {
      const w = load; // peak intensity kN/m
      maxMoment = (w * L * L) / (9 * Math.sqrt(3));
      const R1 = (w * L) / 6;
      const R2 = (w * L) / 3;
      maxShear = Math.max(R1, R2);
      reactionLeft = R1;
      reactionRight = R2;
      const wNmm = (w * 1000) / 1000;
      maxDeflection = (0.01304 * wNmm * Math.pow(Lmm, 4)) / EI;
      formula = `M_max = wL²/(9√3)\nR1 = wL/6, R2 = wL/3\nδ_max = 0.01304wL⁴/EI`;
    }
  } else if (beamType === "cantilever") {
    if (loadType === "uniform") {
      const w = load;
      maxMoment = (w * L * L) / 2;
      maxShear = w * L;
      reactionLeft = w * L;
      reactionRight = 0;
      const wNmm = (w * 1000) / 1000;
      maxDeflection = (wNmm * Math.pow(Lmm, 4)) / (8 * EI);
      formula = `M_max = wL²/2\nV_max = wL\nδ_max = wL⁴/(8EI)`;
    } else if (loadType === "point_center" || loadType === "point_any") {
      const P = load;
      const aVal = loadType === "point_any" ? (a ?? L) : L;
      maxMoment = P * aVal;
      maxShear = P;
      reactionLeft = P;
      reactionRight = 0;
      const Pn = P * 1000;
      const amm = aVal * 1000;
      maxDeflection = (Pn * amm * amm * (3 * Lmm - amm)) / (6 * EI);
      formula = `M_max = Pa = ${P} × ${aVal.toFixed(2)}\nδ_max = Pa²(3L-a)/(6EI)`;
    } else if (loadType === "triangular") {
      const w = load;
      maxMoment = (w * L * L) / 6;
      maxShear = (w * L) / 2;
      reactionLeft = (w * L) / 2;
      reactionRight = 0;
      const wNmm = (w * 1000) / 1000;
      maxDeflection = (wNmm * Math.pow(Lmm, 4)) / (30 * EI);
      formula = `M_max = wL²/6\nV_max = wL/2\nδ_max = wL⁴/(30EI)`;
    }
  } else if (beamType === "fixed_fixed") {
    if (loadType === "uniform") {
      const w = load;
      maxMoment = (w * L * L) / 12; // at supports (negative)
      maxShear = (w * L) / 2;
      reactionLeft = (w * L) / 2;
      reactionRight = (w * L) / 2;
      const wNmm = (w * 1000) / 1000;
      maxDeflection = (wNmm * Math.pow(Lmm, 4)) / (384 * EI);
      formula = `M_max = wL²/12 (at supports)\nM_mid = wL²/24\nδ_max = wL⁴/(384EI)`;
    } else if (loadType === "point_center") {
      const P = load;
      maxMoment = (P * L) / 8;
      maxShear = P / 2;
      reactionLeft = P / 2;
      reactionRight = P / 2;
      const Pn = P * 1000;
      maxDeflection = (Pn * Math.pow(Lmm, 3)) / (192 * EI);
      formula = `M_max = PL/8 (at supports)\nδ_max = PL³/(192EI)`;
    } else {
      // For other load types on fixed-fixed, approximate
      const P = load;
      maxMoment = (P * L) / 8;
      maxShear = P / 2;
      reactionLeft = P / 2;
      reactionRight = P / 2;
      const Pn = P * 1000;
      maxDeflection = (Pn * Math.pow(Lmm, 3)) / (192 * EI);
      formula = `Approximate: M_max ≈ PL/8, δ ≈ PL³/(192EI)`;
    }
  }

  return {
    maxMoment: Math.abs(maxMoment),
    maxShear: Math.abs(maxShear),
    maxDeflection: Math.abs(maxDeflection),
    reactionLeft,
    reactionRight,
    formula,
  };
}

export const BEAM_DEFAULTS: BeamInput = {
  L: 6,
  E: 200000,
  I: 300,
  beamType: "simply_supported",
  loadType: "uniform",
  load: 10,
};

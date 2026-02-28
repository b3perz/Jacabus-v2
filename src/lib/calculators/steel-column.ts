// ============================================================================
// Steel Column Calculator — CSA S16-19
// Axial compressive resistance for W-shapes
// Cr = φ × A × Fy × (1 + λ^(2n))^(-1/n)
// ============================================================================

export interface SteelSection {
  designation: string;
  A: number;  // mm²
  d: number;  // mm
  b: number;  // mm
  t: number;  // mm (flange)
  w: number;  // mm (web)
  Ix: number; // mm⁴ × 10⁶
  Iy: number; // mm⁴ × 10⁶
  rx: number; // mm
  ry: number; // mm
  mass: number; // kg/m
  Zx: number; // mm³ × 10³
}

// Common W-shapes from CISC Handbook
export const STEEL_SECTIONS: SteelSection[] = [
  { designation: "W150x22", A: 2860, d: 152, b: 152, t: 6.6, w: 5.8, Ix: 12.1, Iy: 3.87, rx: 65.0, ry: 36.8, mass: 22.0, Zx: 177 },
  { designation: "W150x30", A: 3790, d: 157, b: 153, t: 9.3, w: 6.6, Ix: 17.1, Iy: 5.56, rx: 67.2, ry: 38.3, mass: 30.0, Zx: 244 },
  { designation: "W200x27", A: 3390, d: 207, b: 133, t: 8.4, w: 5.8, Ix: 25.8, Iy: 3.32, rx: 87.3, ry: 31.3, mass: 27.0, Zx: 276 },
  { designation: "W200x36", A: 4570, d: 201, b: 165, t: 10.2, w: 6.2, Ix: 34.4, Iy: 7.64, rx: 86.7, ry: 40.9, mass: 36.0, Zx: 380 },
  { designation: "W200x46", A: 5890, d: 203, b: 203, t: 11.0, w: 7.2, Ix: 45.5, Iy: 15.3, rx: 87.9, ry: 51.0, mass: 46.1, Zx: 498 },
  { designation: "W250x33", A: 4190, d: 258, b: 146, t: 9.1, w: 6.1, Ix: 48.9, Iy: 4.73, rx: 108, ry: 33.6, mass: 33.0, Zx: 418 },
  { designation: "W250x45", A: 5700, d: 266, b: 148, t: 13.0, w: 7.6, Ix: 71.1, Iy: 7.03, rx: 112, ry: 35.1, mass: 44.8, Zx: 592 },
  { designation: "W250x58", A: 7420, d: 252, b: 203, t: 13.5, w: 8.0, Ix: 87.3, Iy: 18.8, rx: 108, ry: 50.3, mass: 58.0, Zx: 764 },
  { designation: "W250x73", A: 9290, d: 253, b: 254, t: 14.2, w: 8.6, Ix: 113, Iy: 38.8, rx: 110, ry: 64.6, mass: 73.0, Zx: 985 },
  { designation: "W310x39", A: 4930, d: 310, b: 165, t: 9.7, w: 5.8, Ix: 84.8, Iy: 7.23, rx: 131, ry: 38.3, mass: 38.7, Zx: 605 },
  { designation: "W310x52", A: 6650, d: 318, b: 167, t: 13.2, w: 7.6, Ix: 119, Iy: 10.2, rx: 134, ry: 39.2, mass: 52.0, Zx: 827 },
  { designation: "W310x67", A: 8530, d: 306, b: 204, t: 14.6, w: 8.5, Ix: 145, Iy: 20.7, rx: 130, ry: 49.3, mass: 67.0, Zx: 1050 },
  { designation: "W310x86", A: 11000, d: 310, b: 254, t: 16.3, w: 9.1, Ix: 199, Iy: 44.5, rx: 135, ry: 63.6, mass: 86.0, Zx: 1410 },
  { designation: "W310x107", A: 13600, d: 311, b: 306, t: 17.0, w: 10.9, Ix: 248, Iy: 81.2, rx: 135, ry: 77.3, mass: 107, Zx: 1750 },
  { designation: "W360x45", A: 5710, d: 352, b: 171, t: 9.8, w: 6.9, Ix: 121, Iy: 8.16, rx: 146, ry: 37.8, mass: 44.6, Zx: 762 },
  { designation: "W360x57", A: 7230, d: 358, b: 172, t: 13.1, w: 7.9, Ix: 160, Iy: 11.1, rx: 149, ry: 39.2, mass: 57.0, Zx: 989 },
  { designation: "W360x79", A: 10100, d: 354, b: 205, t: 16.8, w: 9.4, Ix: 227, Iy: 24.2, rx: 150, ry: 49.0, mass: 79.0, Zx: 1420 },
  { designation: "W360x101", A: 12900, d: 357, b: 255, t: 18.3, w: 10.5, Ix: 302, Iy: 50.5, rx: 153, ry: 62.6, mass: 101, Zx: 1870 },
  { designation: "W410x54", A: 6840, d: 403, b: 177, t: 10.9, w: 7.5, Ix: 186, Iy: 10.1, rx: 165, ry: 38.4, mass: 53.6, Zx: 1020 },
  { designation: "W410x67", A: 8580, d: 410, b: 179, t: 14.4, w: 8.8, Ix: 245, Iy: 13.8, rx: 169, ry: 40.1, mass: 67.0, Zx: 1330 },
  { designation: "W410x85", A: 10800, d: 417, b: 181, t: 18.2, w: 10.9, Ix: 316, Iy: 18.0, rx: 171, ry: 40.8, mass: 85.0, Zx: 1700 },
];

export interface SteelColumnInput {
  sectionIndex: number;
  Fy: number;       // MPa (yield stress)
  L: number;        // mm (unbraced length)
  Kx: number;       // Effective length factor about x-axis
  Ky: number;       // Effective length factor about y-axis
  n: number;         // Column curve parameter (1.34 for hot-rolled)
  phi: number;       // Resistance factor (0.9)
}

export interface SteelColumnResult {
  Cr: number;        // Factored axial resistance (kN)
  CrX: number;       // Cr about x-axis (kN)
  CrY: number;       // Cr about y-axis (kN)
  KLr_x: number;     // Slenderness about x
  KLr_y: number;     // Slenderness about y
  lambda_x: number;  // Non-dimensional slenderness about x
  lambda_y: number;  // Non-dimensional slenderness about y
  Fe_x: number;      // Euler buckling stress about x (MPa)
  Fe_y: number;      // Euler buckling stress about y (MPa)
  governs: "x" | "y";
  formula: string;
}

export function calculateSteelColumn(input: SteelColumnInput): SteelColumnResult {
  const section = STEEL_SECTIONS[input.sectionIndex];
  const { Fy, L, Kx, Ky, n, phi } = input;

  const A = section.A; // mm²
  const rx = section.rx; // mm
  const ry = section.ry; // mm

  // Slenderness ratios
  const KLr_x = (Kx * L) / rx;
  const KLr_y = (Ky * L) / ry;

  // Euler buckling stress
  const E = 200000; // MPa
  const Fe_x = (Math.PI * Math.PI * E) / (KLr_x * KLr_x);
  const Fe_y = (Math.PI * Math.PI * E) / (KLr_y * KLr_y);

  // Non-dimensional slenderness
  const lambda_x = Math.sqrt(Fy / Fe_x);
  const lambda_y = Math.sqrt(Fy / Fe_y);

  // Cr = φ × A × Fy × (1 + λ^(2n))^(-1/n)
  const factorX = Math.pow(1 + Math.pow(lambda_x, 2 * n), -1 / n);
  const factorY = Math.pow(1 + Math.pow(lambda_y, 2 * n), -1 / n);

  const CrX = (phi * A * Fy * factorX) / 1000; // kN
  const CrY = (phi * A * Fy * factorY) / 1000; // kN

  const governs: "x" | "y" = CrX <= CrY ? "x" : "y";
  const Cr = Math.min(CrX, CrY);

  const formula = `Steel Column — CSA S16-19, Cl. 13.3.1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Section:          ${section.designation}
Area:             A = ${A} mm²
rx / ry:          ${rx} / ${ry} mm

Slenderness:
  KL/r(x) = ${Kx}×${L}/${rx} = ${KLr_x.toFixed(1)}
  KL/r(y) = ${Ky}×${L}/${ry} = ${KLr_y.toFixed(1)}

Euler Stress:
  Fe(x) = π²E/(KL/r)² = ${Fe_x.toFixed(1)} MPa
  Fe(y) = π²E/(KL/r)² = ${Fe_y.toFixed(1)} MPa

Non-dimensional λ:
  λ(x) = √(Fy/Fe_x) = ${lambda_x.toFixed(3)}
  λ(y) = √(Fy/Fe_y) = ${lambda_y.toFixed(3)}

Cr = φAFy(1+λ^2n)^(-1/n):
  Cr(x) = ${CrX.toFixed(1)} kN
  Cr(y) = ${CrY.toFixed(1)} kN
  Cr = min = ${Cr.toFixed(1)} kN ← governs about ${governs}-axis`;

  return { Cr, CrX, CrY, KLr_x, KLr_y, lambda_x, lambda_y, Fe_x, Fe_y, governs, formula };
}

export const STEEL_COLUMN_DEFAULTS: SteelColumnInput = {
  sectionIndex: 8, // W250x73
  Fy: 350,
  L: 4000,
  Kx: 1.0,
  Ky: 1.0,
  n: 1.34,
  phi: 0.9,
};

/**
 * Generate column curve data (Cr/AFy vs KL/r) for charting
 */
export function generateColumnCurve(
  Fy: number,
  n: number,
  maxKLr: number = 200,
  steps: number = 100
): { klr: number; ratio: number }[] {
  const E = 200000;
  const pts: { klr: number; ratio: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const klr = (i / steps) * maxKLr;
    if (klr === 0) {
      pts.push({ klr, ratio: 1.0 });
      continue;
    }
    const Fe = (Math.PI * Math.PI * E) / (klr * klr);
    const lambda = Math.sqrt(Fy / Fe);
    const factor = Math.pow(1 + Math.pow(lambda, 2 * n), -1 / n);
    pts.push({ klr, ratio: factor });
  }
  return pts;
}

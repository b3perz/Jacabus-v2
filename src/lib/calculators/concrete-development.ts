// ============================================================================
// Concrete Rebar Development Length — CSA A23.3-19, Clause 12
// ld = 0.45 × k1 × k2 × k3 × k4 × fy / (fc'^0.5) × db
// ============================================================================

export interface ConcreteDevInput {
  /** Bar size key (e.g. "20M") */
  barSize: string;
  /** Or direct bar diameter (mm) */
  db?: number;
  /** Specified yield strength of rebar (MPa), typically 400 */
  fy: number;
  /** Specified compressive strength of concrete (MPa) */
  fc: number;
  /** Bar location factor k1 — 1.3 for top bars, 1.0 otherwise */
  k1: number;
  /** Coating factor k2 — 1.5 for epoxy, 1.0 uncoated */
  k2: number;
  /** Concrete density factor k3 — 1.3 for structural low-density, 1.0 normal */
  k3: number;
  /** Bar size factor k4 — 0.8 for ≤20M, 1.0 for ≥25M */
  k4: number;
  /** Is it a hook development? */
  isHooked?: boolean;
}

export interface ConcreteDevResult {
  /** Development length in tension (mm) */
  ld: number;
  /** Minimum ld (300mm per code) */
  ldMin: number;
  /** Governing ld */
  ldGoverning: number;
  /** Hook development length ldh (mm) if applicable */
  ldh?: number;
  /** Bar diameter used (mm) */
  db: number;
  formula: string;
}

export function calculateDevelopmentLength(
  input: ConcreteDevInput
): ConcreteDevResult {
  const { barSize, fy, fc, k1, k2, k3, k4, isHooked } = input;

  // Look up bar diameter from REBAR_SIZES or use direct input
  const REBAR_DB: Record<string, number> = {
    "10M": 11.3,
    "15M": 16.0,
    "20M": 19.5,
    "25M": 25.2,
    "30M": 29.9,
    "35M": 35.7,
    "45M": 43.7,
    "55M": 56.4,
  };

  const db = input.db ?? REBAR_DB[barSize] ?? 20;

  // CSA A23.3-19 Cl. 12.2.3
  // ld = 0.45 × k1 × k2 × k3 × k4 × fy / sqrt(fc') × db
  const ld = 0.45 * k1 * k2 * k3 * k4 * (fy / Math.sqrt(fc)) * db;
  const ldMin = Math.max(300, ld);
  const ldGoverning = ldMin;

  let ldh: number | undefined;
  if (isHooked) {
    // CSA A23.3-19 Cl. 12.5.2
    // ldh = 100 × db / sqrt(fc'), min 8db or 150mm
    ldh = (100 * db) / Math.sqrt(fc);
    ldh = Math.max(ldh, 8 * db, 150);
  }

  const formula = `ld = 0.45 × k1 × k2 × k3 × k4 × fy / √fc' × db
ld = 0.45 × ${k1} × ${k2} × ${k3} × ${k4} × ${fy} / √${fc} × ${db.toFixed(1)}
ld = ${ld.toFixed(0)} mm
ld,governing = max(${ld.toFixed(0)}, 300) = ${ldGoverning.toFixed(0)} mm${
    ldh ? `\nldh = ${ldh.toFixed(0)} mm (hooked)` : ""
  }`;

  return { ld, ldMin, ldGoverning, ldh, db, formula };
}

export const CONCRETE_DEV_DEFAULTS: ConcreteDevInput = {
  barSize: "20M",
  fy: 400,
  fc: 30,
  k1: 1.0,
  k2: 1.0,
  k3: 1.0,
  k4: 0.8,
  isHooked: false,
};

// ============================================================================
// Wind Load Calculator — NBC 2020, Section 4.1.7
// p = Iw × q × Ce × Ct × Cg × Cp
// ============================================================================

export interface WindLoadInput {
  /** Hourly wind pressure, 1-in-50 year return (kPa) */
  q: number;
  /** Importance factor for wind */
  Iw: number;
  /** Exposure factor */
  Ce: number;
  /** Topographic factor (default 1.0) */
  Ct: number;
  /** Gust effect factor */
  Cg: number;
  /** External pressure coefficient (positive = push, negative = suction) */
  Cp: number;
  /** Internal pressure coefficient (optional) */
  Cpi?: number;
  /** Internal gust factor (optional, default same as Cg) */
  Cgi?: number;
}

export interface WindLoadResult {
  /** External wind pressure (kPa) */
  pExternal: number;
  /** Internal wind pressure (kPa), if Cpi provided */
  pInternal: number;
  /** Net wind pressure (kPa) */
  pNet: number;
  /** Factored wind load (1.4 × pNet for ULS) */
  factoredULS: number;
  formula: string;
}

export function calculateWindLoad(input: WindLoadInput): WindLoadResult {
  const { q, Iw, Ce, Ct, Cg, Cp, Cpi = 0, Cgi } = input;

  const pExternal = Iw * q * Ce * Ct * Cg * Cp;
  const pInternal = Cpi !== 0 ? Iw * q * Ce * Ct * (Cgi ?? Cg) * Cpi : 0;
  const pNet = pExternal - pInternal;
  const factoredULS = 1.4 * Math.abs(pNet);

  const formula = `p = Iw × q × Ce × Ct × Cg × Cp
p_ext = ${Iw} × ${q} × ${Ce} × ${Ct} × ${Cg} × ${Cp}
p_ext = ${pExternal.toFixed(3)} kPa
p_net = ${pNet.toFixed(3)} kPa`;

  return { pExternal, pInternal, pNet, factoredULS, formula };
}

/**
 * Compute exposure factor Ce per NBC 2020 Cl. 4.1.7.3
 * Ce = (h/10)^0.2 but not less than 0.9 (open) or per table
 */
export function computeCe(
  height: number,
  terrain: "open" | "suburban" | "urban"
): number {
  const exponents: Record<string, number> = {
    open: 0.28,
    suburban: 0.3,
    urban: 0.36,
  };
  const minCe: Record<string, number> = {
    open: 0.9,
    suburban: 0.7,
    urban: 0.5,
  };

  const exp = exponents[terrain];
  const Ce = Math.pow(Math.max(height, 1) / 10, exp);
  return Math.max(Ce, minCe[terrain]);
}

export const WIND_LOAD_DEFAULTS: WindLoadInput = {
  q: 0.45,
  Iw: 1.0,
  Ce: 0.9,
  Ct: 1.0,
  Cg: 2.0,
  Cp: 0.8,
  Cpi: 0,
};

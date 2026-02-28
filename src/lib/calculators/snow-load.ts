// ============================================================================
// Snow Load Calculator — NBC 2020, Section 4.1.6
// S = Is × [Ss × (Cb × Cw × Cs × Ca) + Sr]
// ============================================================================

export interface SnowLoadInput {
  /** Ground snow load, 1-in-50 year return (kPa) */
  Ss: number;
  /** Associated rain load (kPa) */
  Sr: number;
  /** Importance factor for snow */
  Is: number;
  /** Basic roof snow load factor (default 0.8) */
  Cb: number;
  /** Wind exposure factor (0.5–1.0, default 1.0) */
  Cw: number;
  /** Slope factor (default 1.0) */
  Cs: number;
  /** Shape/accumulation factor (default 1.0) */
  Ca: number;
}

export interface SnowLoadResult {
  /** Specified snow load on the roof (kPa) */
  S: number;
  /** Snow component only: Is × Ss × Cb × Cw × Cs × Ca */
  snowComponent: number;
  /** Rain component: Is × Sr */
  rainComponent: number;
  /** Factored snow load (1.5 × S for ULS) */
  factoredULS: number;
  /** Breakdown string for display */
  formula: string;
}

export function calculateSnowLoad(input: SnowLoadInput): SnowLoadResult {
  const { Ss, Sr, Is, Cb, Cw, Cs, Ca } = input;

  const snowComponent = Is * Ss * Cb * Cw * Cs * Ca;
  const rainComponent = Is * Sr;
  const S = snowComponent + rainComponent;
  const factoredULS = 1.5 * S;

  const formula = `S = Is × [Ss × (Cb × Cw × Cs × Ca) + Sr]
S = ${Is} × [${Ss} × (${Cb} × ${Cw} × ${Cs} × ${Ca}) + ${Sr}]
S = ${S.toFixed(3)} kPa`;

  return { S, snowComponent, rainComponent, factoredULS, formula };
}

export const SNOW_LOAD_DEFAULTS: SnowLoadInput = {
  Ss: 1.0,
  Sr: 0.4,
  Is: 1.0,
  Cb: 0.8,
  Cw: 1.0,
  Cs: 1.0,
  Ca: 1.0,
};

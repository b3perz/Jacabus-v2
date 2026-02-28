// ============================================================================
// Snow Drift Calculator — NBC 2020, Section 4.1.6
// Snow drift loads on lower adjacent roofs (step condition)
// and adjacent to obstructions
// ============================================================================

export interface SnowDriftInput {
  /** Ground snow load (kPa) */
  Ss: number;
  /** Associated rain load (kPa) */
  Sr: number;
  /** Importance factor for snow */
  Is: number;
  /** Upper roof length in wind direction (m) */
  lu: number;
  /** Height difference between roofs (m) */
  hp: number;
  /** Lower roof length in wind direction (m) */
  ll: number;
  /** Basic roof factor for lower roof */
  Cb: number;
  /** Wind exposure factor */
  Cw: number;
  /** Slope factor */
  Cs: number;
  /** Type: "step" or "obstruction" */
  type: "step" | "obstruction";
  /** Obstruction height if type=obstruction (m) */
  ho?: number;
}

export interface SnowDriftResult {
  /** Peak drift load at the step (kPa) */
  peakDriftLoad: number;
  /** Balanced snow load on lower roof (kPa) */
  balancedLoad: number;
  /** Drift surcharge (kPa) */
  driftSurcharge: number;
  /** Accumulation factor Ca0 at step */
  Ca0: number;
  /** Drift extent from step (m) */
  xd: number;
  /** Factored ULS (1.5 x peak) */
  factoredULS: number;
  /** Gamma snow density (kN/m³) */
  gamma: number;
  /** Formula breakdown */
  formula: string;
}

/**
 * Snow density per NBC 2020 Commentary C-2:
 * γ = 0.43 * Ss^0.5 + 2.2 (kN/m³), min 1.0, max 4.0
 */
function snowDensity(Ss: number): number {
  return Math.max(1.0, Math.min(4.0, 0.43 * Math.sqrt(Ss) + 2.2));
}

export function calculateSnowDrift(input: SnowDriftInput): SnowDriftResult {
  const { Ss, Sr, Is, lu, hp, ll, Cb, Cw, Cs, type, ho } = input;

  const gamma = snowDensity(Ss);

  // Balanced snow load on lower roof
  const balancedLoad = Is * (Ss * Cb * Cw * Cs + Sr);

  // Height of balanced snow (m)
  const hb = balancedLoad / gamma;

  let hd: number; // drift height
  if (type === "step") {
    // Step condition: drift height is the lesser of:
    // hp - hb  (available height above balanced snow)
    // or a function of fetch distance
    const fetchHeight = 0.8 * Math.sqrt(lu); // approximate max drift height from fetch
    hd = Math.max(0, Math.min(hp - hb, fetchHeight));
  } else {
    // Obstruction: drift height based on obstruction height
    const obsH = ho ?? hp;
    hd = Math.max(0, Math.min(obsH - hb, 0.7 * obsH));
  }

  // Ca0 = (hd * gamma + balancedLoad) / (Ss * Cb * Cw * Cs * Is) if denominator > 0
  const denominator = Ss * Cb * Cw * Cs;
  const Ca0 = denominator > 0
    ? (hd * gamma) / (Is * denominator) + 1.0
    : 1.0;

  // Drift surcharge
  const driftSurcharge = hd * gamma;

  // Peak load at step
  const peakDriftLoad = balancedLoad + driftSurcharge;

  // Drift extent: xd from the step
  // NBC 2020: triangular drift, extent = min(5*hd, ll, lu)
  const xd = Math.min(5 * Math.max(hd, 0.5), ll, lu);

  const factoredULS = 1.5 * peakDriftLoad;

  const formula = `Snow Drift — ${type === "step" ? "Step Condition" : "Obstruction"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Snow Density:     γ = 0.43√Ss + 2.2 = ${gamma.toFixed(3)} kN/m³
Balanced Load:    S_bal = Is[Ss·Cb·Cw·Cs + Sr] = ${balancedLoad.toFixed(3)} kPa
Balanced Height:  h_b = S_bal / γ = ${hb.toFixed(3)} m
${type === "step" ? `Step Height:      h_p = ${hp.toFixed(1)} m` : `Obstruction:      h_o = ${(ho ?? hp).toFixed(1)} m`}
Drift Height:     h_d = ${hd.toFixed(3)} m
Drift Surcharge:  ΔS = h_d × γ = ${driftSurcharge.toFixed(3)} kPa
Peak Drift Load:  S_peak = S_bal + ΔS = ${peakDriftLoad.toFixed(3)} kPa
Ca₀:              ${Ca0.toFixed(3)}
Drift Extent:     x_d = ${xd.toFixed(1)} m
Factored (1.5S):  ${factoredULS.toFixed(3)} kPa`;

  return {
    peakDriftLoad,
    balancedLoad,
    driftSurcharge,
    Ca0,
    xd,
    factoredULS,
    gamma,
    formula,
  };
}

export const SNOW_DRIFT_DEFAULTS: SnowDriftInput = {
  Ss: 2.0,
  Sr: 0.2,
  Is: 1.0,
  lu: 30,
  hp: 4,
  ll: 20,
  Cb: 0.8,
  Cw: 1.0,
  Cs: 1.0,
  type: "step",
  ho: 3,
};

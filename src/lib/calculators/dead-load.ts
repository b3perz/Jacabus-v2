// ============================================================================
// Dead Load / Assembly Weight Calculator
// Sum assembly component weights for structural design
// ============================================================================

export interface DeadLoadComponent {
  id: string;
  label: string;
  load: number; // kPa
  quantity: number;
}

export interface DeadLoadInput {
  components: DeadLoadComponent[];
  /** Tributary area (m²), optional for total load calculation */
  tributaryArea?: number;
}

export interface DeadLoadResult {
  /** Total dead load intensity (kPa) */
  totalIntensity: number;
  /** Total dead load force (kN) if area provided */
  totalForce: number | null;
  /** Factored dead load (1.25 × D for ULS) */
  factoredULS: number;
  /** Companion factor (0.9 × D for checking uplift) */
  factoredCounteracting: number;
  /** Breakdown by component */
  breakdown: { label: string; load: number }[];
  formula: string;
}

export function calculateDeadLoad(input: DeadLoadInput): DeadLoadResult {
  const { components, tributaryArea } = input;

  const breakdown = components.map((c) => ({
    label: c.label,
    load: c.load * c.quantity,
  }));

  const totalIntensity = breakdown.reduce((sum, b) => sum + b.load, 0);
  const totalForce = tributaryArea ? totalIntensity * tributaryArea : null;
  const factoredULS = 1.25 * totalIntensity;
  const factoredCounteracting = 0.9 * totalIntensity;

  const lines = breakdown.map((b) => `  ${b.label}: ${b.load.toFixed(3)} kPa`);
  const formula = `Dead Load Summary:\n${lines.join("\n")}\n────────────────\nTotal D = ${totalIntensity.toFixed(3)} kPa\n1.25D = ${factoredULS.toFixed(3)} kPa (ULS)\n0.9D = ${factoredCounteracting.toFixed(3)} kPa (counteracting)${
    totalForce !== null ? `\nTotal Force = ${totalForce.toFixed(1)} kN` : ""
  }`;

  return {
    totalIntensity,
    totalForce,
    factoredULS,
    factoredCounteracting,
    breakdown,
    formula,
  };
}

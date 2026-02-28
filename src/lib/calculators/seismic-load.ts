// ============================================================================
// Seismic Load Calculator — NBC 2020, Section 4.1.8
// V = S(Ta) × Mv × IE × W / (Rd × Ro)
// ============================================================================

export interface SeismicInput {
  /** Spectral acceleration at design period Sa(T) (g) */
  Sa: number;
  /** Higher mode factor Mv */
  Mv: number;
  /** Importance factor for earthquake */
  Ie: number;
  /** Seismic weight of the structure (kN) */
  W: number;
  /** Ductility-related force modification factor */
  Rd: number;
  /** Overstrength-related force modification factor */
  Ro: number;
  /** Building height (m) — for period calculation */
  height?: number;
  /** Structure type for period calculation */
  structureType?: "steel_moment" | "concrete_moment" | "braced" | "shearwall" | "other";
}

export interface SeismicResult {
  /** Base shear V (kN) */
  V: number;
  /** Approximate fundamental period Ta (s) */
  Ta: number;
  /** V/W ratio */
  baseShearCoeff: number;
  /** Factored base shear */
  factoredV: number;
  formula: string;
}

/**
 * Approximate fundamental period per NBC 2020 4.1.8.11(3)
 */
export function approximatePeriod(
  height: number,
  type: SeismicInput["structureType"] = "other"
): number {
  switch (type) {
    case "steel_moment":
      return 0.085 * Math.pow(height, 0.75);
    case "concrete_moment":
      return 0.075 * Math.pow(height, 0.75);
    case "braced":
      return 0.025 * height;
    case "shearwall":
      return 0.05 * Math.pow(height, 0.75);
    default:
      return 0.05 * Math.pow(height, 0.75);
  }
}

export function calculateSeismicLoad(input: SeismicInput): SeismicResult {
  const { Sa, Mv, Ie, W, Rd, Ro, height, structureType } = input;

  const Ta = height ? approximatePeriod(height, structureType) : 0;
  const RdRo = Rd * Ro;
  const V = RdRo > 0 ? (Sa * Mv * Ie * W) / RdRo : 0;
  const baseShearCoeff = W > 0 ? V / W : 0;

  const formula = `V = S(Ta) × Mv × IE × W / (Rd × Ro)
V = ${Sa} × ${Mv} × ${Ie} × ${W} / (${Rd} × ${Ro})
V = ${V.toFixed(1)} kN
V/W = ${(baseShearCoeff * 100).toFixed(2)}%`;

  return { V, Ta, baseShearCoeff, factoredV: V, formula };
}

// Common SFRS types with Rd and Ro values
export const SFRS_SYSTEMS = {
  ductile_moment_steel: { Rd: 5.0, Ro: 1.5, label: "Ductile Moment Frame (Steel)" },
  moderate_moment_steel: { Rd: 3.5, Ro: 1.5, label: "Moderately Ductile MF (Steel)" },
  limited_moment_steel: { Rd: 2.0, Ro: 1.3, label: "Limited Ductility MF (Steel)" },
  ductile_moment_concrete: { Rd: 4.0, Ro: 1.7, label: "Ductile Moment Frame (Concrete)" },
  moderate_moment_concrete: { Rd: 2.5, Ro: 1.4, label: "Moderately Ductile MF (Concrete)" },
  ductile_braced: { Rd: 3.0, Ro: 1.3, label: "Ductile Concentrically Braced" },
  limited_braced: { Rd: 2.0, Ro: 1.3, label: "Limited Ductility Braced" },
  conventional_braced: { Rd: 1.5, Ro: 1.3, label: "Conventional Braced Frame" },
  ductile_shearwall: { Rd: 3.5, Ro: 1.6, label: "Ductile Shear Wall (Concrete)" },
  conventional_shearwall: { Rd: 1.5, Ro: 1.3, label: "Conventional Shear Wall" },
  wood_shearwall: { Rd: 3.0, Ro: 1.7, label: "Nailed Shear Wall (Wood)" },
  unreinforced_masonry: { Rd: 1.0, Ro: 1.0, label: "Unreinforced Masonry" },
} as const;

export const SEISMIC_DEFAULTS: SeismicInput = {
  Sa: 0.3,
  Mv: 1.0,
  Ie: 1.0,
  W: 5000,
  Rd: 3.0,
  Ro: 1.3,
  height: 15,
  structureType: "braced",
};

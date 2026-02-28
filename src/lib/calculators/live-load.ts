// ============================================================================
// Live Load Calculator — NBC 2020, Section 4.1.5
// Specified live loads for different occupancy types
// ============================================================================

export interface OccupancyType {
  id: string;
  category: string;
  description: string;
  uniformLoad: number; // kPa
  concentratedLoad: number; // kN
  note?: string;
}

// NBC 2020 Table 4.1.5.3 — Specified Uniformly Distributed Live Loads
export const OCCUPANCY_TYPES: OccupancyType[] = [
  // Assembly
  { id: "assembly_fixed", category: "Assembly", description: "Assembly areas — fixed seats", uniformLoad: 2.4, concentratedLoad: 9.0 },
  { id: "assembly_movable", category: "Assembly", description: "Assembly areas — movable seats", uniformLoad: 4.8, concentratedLoad: 9.0 },
  { id: "assembly_stages", category: "Assembly", description: "Stages and platforms", uniformLoad: 4.8, concentratedLoad: 9.0 },
  { id: "assembly_corridors", category: "Assembly", description: "Corridors, lobbies, aisles (ground floor)", uniformLoad: 4.8, concentratedLoad: 9.0 },
  { id: "assembly_balconies", category: "Assembly", description: "Balconies (exterior)", uniformLoad: 4.8, concentratedLoad: 9.0 },

  // Business / Office
  { id: "office_general", category: "Office", description: "Offices — general", uniformLoad: 2.4, concentratedLoad: 9.0 },
  { id: "office_corridors", category: "Office", description: "Office corridors above ground floor", uniformLoad: 4.8, concentratedLoad: 9.0 },

  // Institutional
  { id: "hospital_private", category: "Institutional", description: "Hospital — private rooms", uniformLoad: 2.4, concentratedLoad: 9.0 },
  { id: "hospital_wards", category: "Institutional", description: "Hospital — wards", uniformLoad: 2.4, concentratedLoad: 9.0 },
  { id: "hospital_corridors", category: "Institutional", description: "Hospital — corridors", uniformLoad: 4.8, concentratedLoad: 9.0 },
  { id: "school_classrooms", category: "Institutional", description: "Schools — classrooms", uniformLoad: 2.4, concentratedLoad: 9.0 },
  { id: "school_corridors", category: "Institutional", description: "Schools — corridors", uniformLoad: 4.8, concentratedLoad: 9.0 },

  // Mercantile
  { id: "retail_ground", category: "Mercantile", description: "Retail — ground floor", uniformLoad: 4.8, concentratedLoad: 9.0 },
  { id: "retail_upper", category: "Mercantile", description: "Retail — upper floors", uniformLoad: 4.8, concentratedLoad: 9.0 },

  // Residential
  { id: "residential_general", category: "Residential", description: "Residential — dwelling units", uniformLoad: 1.9, concentratedLoad: 9.0 },
  { id: "residential_corridors", category: "Residential", description: "Residential — corridors, stairs", uniformLoad: 4.8, concentratedLoad: 9.0 },
  { id: "residential_balconies", category: "Residential", description: "Residential — balconies", uniformLoad: 4.8, concentratedLoad: 9.0 },

  // Industrial
  { id: "industrial_light", category: "Industrial", description: "Light manufacturing / storage", uniformLoad: 4.8, concentratedLoad: 9.0 },
  { id: "industrial_heavy", category: "Industrial", description: "Heavy manufacturing / storage", uniformLoad: 7.2, concentratedLoad: 13.5, note: "Verify with actual equipment loads" },
  { id: "storage_light", category: "Industrial", description: "Storage — light", uniformLoad: 6.0, concentratedLoad: 13.5 },
  { id: "storage_heavy", category: "Industrial", description: "Storage — heavy", uniformLoad: 12.0, concentratedLoad: 13.5 },

  // Parking
  { id: "parking_passenger", category: "Parking", description: "Parking — passenger vehicles", uniformLoad: 2.4, concentratedLoad: 9.0 },
  { id: "parking_heavy", category: "Parking", description: "Parking — heavy vehicles", uniformLoad: 12.0, concentratedLoad: 54.0 },

  // Roof
  { id: "roof_inaccessible", category: "Roof", description: "Roof — not accessible", uniformLoad: 1.0, concentratedLoad: 1.3 },
  { id: "roof_accessible", category: "Roof", description: "Roof — accessible", uniformLoad: 4.8, concentratedLoad: 9.0 },
  { id: "roof_gardens", category: "Roof", description: "Roof — gardens / landscaped", uniformLoad: 4.8, concentratedLoad: 9.0 },

  // Stairs
  { id: "stairs_exit", category: "Stairs", description: "Exit stairs and fire escapes", uniformLoad: 4.8, concentratedLoad: 9.0 },
];

export interface LiveLoadInput {
  occupancyId: string;
  tributaryArea: number; // m²
  deadLoad: number; // kPa (for load combinations)
  snowLoad: number; // kPa (for load combinations)
}

export interface LiveLoadResult {
  /** Specified uniform live load (kPa) */
  uniformLoad: number;
  /** Concentrated live load (kN) */
  concentratedLoad: number;
  /** Live load reduction factor (NBC 2020 Cl. 4.1.5.9) */
  reductionFactor: number;
  /** Reduced live load (kPa) */
  reducedLoad: number;
  /** Total factored load — 1.25D + 1.5L (kPa) */
  combo_DL: number;
  /** Total factored load — 1.25D + 1.5L + 0.5S (kPa) */
  combo_DLS: number;
  /** Total factored load — 1.25D + 0.5L + 1.5S (kPa) */
  combo_DSL: number;
  /** Serviceability: 1.0D + 1.0L (kPa) */
  combo_SLS: number;
  /** Formula */
  formula: string;
}

/**
 * NBC 2020 Cl. 4.1.5.9 — Live load reduction
 * For tributary areas > 20 m², reduce by:
 *   factor = 0.3 + sqrt(9.8 / B)
 * where B = tributary area (m²)
 * factor shall not be less than 0.5 for assembly areas
 * or less than 0.3 + sqrt(9.8 / B) in general
 */
function liveLoadReductionFactor(area: number, category: string): number {
  if (area <= 20) return 1.0;
  // Storage areas: no reduction
  if (category === "Industrial" || category === "Parking") return 1.0;
  // Assembly: min factor 0.5
  const factor = 0.3 + Math.sqrt(9.8 / area);
  if (category === "Assembly") return Math.max(0.5, Math.min(1.0, factor));
  return Math.max(0.5, Math.min(1.0, factor));
}

export function calculateLiveLoad(input: LiveLoadInput): LiveLoadResult {
  const { occupancyId, tributaryArea, deadLoad, snowLoad } = input;

  const occupancy = OCCUPANCY_TYPES.find((o) => o.id === occupancyId) ?? OCCUPANCY_TYPES[0];

  const uniformLoad = occupancy.uniformLoad;
  const concentratedLoad = occupancy.concentratedLoad;
  const reductionFactor = liveLoadReductionFactor(tributaryArea, occupancy.category);
  const reducedLoad = uniformLoad * reductionFactor;

  const D = deadLoad;
  const L = reducedLoad;
  const S = snowLoad;

  const combo_DL = 1.25 * D + 1.5 * L;
  const combo_DLS = 1.25 * D + 1.5 * L + 0.5 * S;
  const combo_DSL = 1.25 * D + 0.5 * L + 1.5 * S;
  const combo_SLS = 1.0 * D + 1.0 * L;

  const formula = `Live Load — NBC 2020, Table 4.1.5.3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Occupancy:        ${occupancy.description}
Specified Load:   L₀ = ${uniformLoad.toFixed(1)} kPa
Concentrated:     P = ${concentratedLoad.toFixed(1)} kN
Tributary Area:   A = ${tributaryArea.toFixed(1)} m²
Reduction Factor: ${reductionFactor.toFixed(3)}
Reduced Load:     L = L₀ × LLRF = ${reducedLoad.toFixed(3)} kPa

Load Combinations (NBC 2020 Table 4.1.3.2):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1.25D + 1.5L          = ${combo_DL.toFixed(3)} kPa
1.25D + 1.5L + 0.5S   = ${combo_DLS.toFixed(3)} kPa
1.25D + 0.5L + 1.5S   = ${combo_DSL.toFixed(3)} kPa
1.0D + 1.0L (SLS)     = ${combo_SLS.toFixed(3)} kPa`;

  return {
    uniformLoad,
    concentratedLoad,
    reductionFactor,
    reducedLoad,
    combo_DL,
    combo_DLS,
    combo_DSL,
    combo_SLS,
    formula,
  };
}

export const LIVE_LOAD_DEFAULTS: LiveLoadInput = {
  occupancyId: "office_general",
  tributaryArea: 50,
  deadLoad: 3.5,
  snowLoad: 1.5,
};

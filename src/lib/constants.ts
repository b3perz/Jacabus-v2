// ============================================================================
// Jacabus — Structural Engineering Constants
// Based on NBC 2020, CSA S16, CSA A23.3, CSA O86
// ============================================================================

/** Standard gravity (m/s²) */
export const GRAVITY = 9.81;

/** Air density at standard conditions (kg/m³) */
export const AIR_DENSITY = 1.225;

// ---------------------------------------------------------------------------
// NBC 2020 Importance Categories
// ---------------------------------------------------------------------------
export const IMPORTANCE_CATEGORIES = {
  low: { label: "Low", Is: 0.8, Iw: 0.8, Ie: 0.8 },
  normal: { label: "Normal", Is: 1.0, Iw: 1.0, Ie: 1.0 },
  high: { label: "High", Is: 1.15, Iw: 1.15, Ie: 1.25 },
  postDisaster: { label: "Post-Disaster", Is: 1.25, Iw: 1.25, Ie: 1.5 },
} as const;

export type ImportanceCategory = keyof typeof IMPORTANCE_CATEGORIES;

// ---------------------------------------------------------------------------
// Common Material Densities (kN/m³)
// ---------------------------------------------------------------------------
export const MATERIAL_DENSITIES: Record<string, { density: number; label: string }> = {
  concrete_normal: { density: 23.5, label: "Normal Weight Concrete" },
  concrete_lightweight: { density: 17.5, label: "Lightweight Concrete" },
  steel: { density: 77.0, label: "Structural Steel" },
  aluminum: { density: 27.0, label: "Aluminum" },
  timber_softwood: { density: 5.0, label: "Softwood Timber" },
  timber_hardwood: { density: 8.5, label: "Hardwood Timber" },
  masonry_solid: { density: 21.2, label: "Solid Masonry" },
  masonry_hollow: { density: 13.5, label: "Hollow Masonry" },
  glass: { density: 25.0, label: "Glass" },
  water: { density: 9.81, label: "Water" },
  soil_dry: { density: 16.0, label: "Dry Soil" },
  soil_wet: { density: 20.0, label: "Wet Soil" },
  gravel: { density: 18.0, label: "Gravel" },
  sand: { density: 17.0, label: "Sand" },
  asphalt: { density: 23.0, label: "Asphalt" },
  gypsum_board: { density: 7.85, label: "Gypsum Board" },
  insulation_rigid: { density: 0.45, label: "Rigid Insulation" },
};

// ---------------------------------------------------------------------------
// Common Assembly Dead Loads (kPa)
// ---------------------------------------------------------------------------
export const ASSEMBLY_LOADS: Record<string, { load: number; label: string; category: string }> = {
  steel_deck_concrete: { load: 2.4, label: "Steel Deck + 65mm Concrete", category: "Floor" },
  concrete_slab_150: { load: 3.6, label: "150mm Concrete Slab", category: "Floor" },
  concrete_slab_200: { load: 4.8, label: "200mm Concrete Slab", category: "Floor" },
  wood_joist_floor: { load: 0.5, label: "Wood Joist Floor (no concrete)", category: "Floor" },
  steel_joist_floor: { load: 0.35, label: "Open Web Steel Joist Floor", category: "Floor" },
  membrane_roof: { load: 0.25, label: "Single-Ply Membrane Roof", category: "Roof" },
  built_up_roof: { load: 0.5, label: "Built-Up Roof (4-ply)", category: "Roof" },
  metal_roof: { load: 0.15, label: "Metal Roof Deck", category: "Roof" },
  green_roof_ext: { load: 2.5, label: "Extensive Green Roof", category: "Roof" },
  drywall_one_side: { load: 0.2, label: "12.7mm Drywall (one side)", category: "Wall" },
  drywall_both_sides: { load: 0.4, label: "12.7mm Drywall (both sides)", category: "Wall" },
  brick_veneer_100: { load: 1.9, label: "100mm Brick Veneer", category: "Wall" },
  curtain_wall: { load: 0.75, label: "Aluminum Curtain Wall", category: "Wall" },
  cmu_200_grouted: { load: 4.0, label: "200mm CMU (fully grouted)", category: "Wall" },
  cmu_200_ungrouted: { load: 2.2, label: "200mm CMU (ungrouted)", category: "Wall" },
  ceramic_tile: { load: 1.1, label: "Ceramic Tile on Mortar Bed", category: "Finish" },
  hardwood_floor: { load: 0.2, label: "Hardwood Flooring", category: "Finish" },
  carpet: { load: 0.05, label: "Carpet and Underpad", category: "Finish" },
  suspended_ceiling: { load: 0.15, label: "Suspended Acoustic Ceiling", category: "Finish" },
  mep_allowance: { load: 0.25, label: "MEP Allowance (typical)", category: "Services" },
  sprinkler: { load: 0.15, label: "Sprinkler System", category: "Services" },
};

// ---------------------------------------------------------------------------
// Standard Rebar Sizes (CSA)
// ---------------------------------------------------------------------------
export const REBAR_SIZES: Record<string, { diameter: number; area: number; label: string }> = {
  "10M": { diameter: 11.3, area: 100, label: "10M" },
  "15M": { diameter: 16.0, area: 200, label: "15M" },
  "20M": { diameter: 19.5, area: 300, label: "20M" },
  "25M": { diameter: 25.2, area: 500, label: "25M" },
  "30M": { diameter: 29.9, area: 700, label: "30M" },
  "35M": { diameter: 35.7, area: 1000, label: "35M" },
  "45M": { diameter: 43.7, area: 1500, label: "45M" },
  "55M": { diameter: 56.4, area: 2500, label: "55M" },
};

// ---------------------------------------------------------------------------
// Unit Conversion Factors
// ---------------------------------------------------------------------------
export const UNIT_CONVERSIONS = {
  length: {
    m_to_ft: 3.28084,
    ft_to_m: 0.3048,
    m_to_in: 39.3701,
    in_to_m: 0.0254,
    mm_to_in: 0.0393701,
    in_to_mm: 25.4,
    m_to_mm: 1000,
    mm_to_m: 0.001,
  },
  force: {
    kN_to_kip: 0.224809,
    kip_to_kN: 4.44822,
    kN_to_lbf: 224.809,
    lbf_to_kN: 0.00444822,
    N_to_lbf: 0.224809,
    lbf_to_N: 4.44822,
  },
  pressure: {
    kPa_to_psf: 20.8854,
    psf_to_kPa: 0.04788,
    MPa_to_ksi: 0.145038,
    ksi_to_MPa: 6.89476,
    MPa_to_psi: 145.038,
    psi_to_MPa: 0.00689476,
  },
  moment: {
    kNm_to_kipft: 0.737562,
    kipft_to_kNm: 1.35582,
    kNm_to_kipIn: 8.85075,
    kipIn_to_kNm: 0.112985,
  },
  area: {
    m2_to_ft2: 10.7639,
    ft2_to_m2: 0.092903,
    mm2_to_in2: 0.00155,
    in2_to_mm2: 645.16,
  },
  volume: {
    m3_to_ft3: 35.3147,
    ft3_to_m3: 0.0283168,
  },
  mass: {
    kg_to_lb: 2.20462,
    lb_to_kg: 0.453592,
  },
} as const;

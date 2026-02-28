// ============================================================================
// Unit Converter — Comprehensive Engineering Unit Conversions
// ============================================================================

export type UnitCategory =
  | "length"
  | "area"
  | "volume"
  | "force"
  | "pressure"
  | "moment"
  | "mass"
  | "density"
  | "temperature";

export interface UnitDef {
  label: string;
  symbol: string;
  /** Factor to convert TO the base unit of this category */
  toBase: number;
}

/**
 * All units defined relative to a base unit per category.
 * Conversion: value_in_target = value_in_source × (source.toBase / target.toBase)
 */
export const UNIT_DEFS: Record<UnitCategory, Record<string, UnitDef>> = {
  length: {
    mm: { label: "Millimeters", symbol: "mm", toBase: 0.001 },
    cm: { label: "Centimeters", symbol: "cm", toBase: 0.01 },
    m: { label: "Meters", symbol: "m", toBase: 1 },
    km: { label: "Kilometers", symbol: "km", toBase: 1000 },
    in: { label: "Inches", symbol: "in", toBase: 0.0254 },
    ft: { label: "Feet", symbol: "ft", toBase: 0.3048 },
    yd: { label: "Yards", symbol: "yd", toBase: 0.9144 },
    mi: { label: "Miles", symbol: "mi", toBase: 1609.344 },
  },
  area: {
    mm2: { label: "Square Millimeters", symbol: "mm²", toBase: 1e-6 },
    cm2: { label: "Square Centimeters", symbol: "cm²", toBase: 1e-4 },
    m2: { label: "Square Meters", symbol: "m²", toBase: 1 },
    in2: { label: "Square Inches", symbol: "in²", toBase: 6.4516e-4 },
    ft2: { label: "Square Feet", symbol: "ft²", toBase: 0.092903 },
  },
  volume: {
    mm3: { label: "Cubic Millimeters", symbol: "mm³", toBase: 1e-9 },
    cm3: { label: "Cubic Centimeters", symbol: "cm³", toBase: 1e-6 },
    m3: { label: "Cubic Meters", symbol: "m³", toBase: 1 },
    L: { label: "Litres", symbol: "L", toBase: 0.001 },
    in3: { label: "Cubic Inches", symbol: "in³", toBase: 1.6387e-5 },
    ft3: { label: "Cubic Feet", symbol: "ft³", toBase: 0.0283168 },
    gal_us: { label: "US Gallons", symbol: "gal", toBase: 0.003785 },
  },
  force: {
    N: { label: "Newtons", symbol: "N", toBase: 1 },
    kN: { label: "Kilonewtons", symbol: "kN", toBase: 1000 },
    MN: { label: "Meganewtons", symbol: "MN", toBase: 1e6 },
    lbf: { label: "Pounds-force", symbol: "lbf", toBase: 4.44822 },
    kip: { label: "Kips", symbol: "kip", toBase: 4448.22 },
    kgf: { label: "Kilogram-force", symbol: "kgf", toBase: 9.80665 },
  },
  pressure: {
    Pa: { label: "Pascals", symbol: "Pa", toBase: 1 },
    kPa: { label: "Kilopascals", symbol: "kPa", toBase: 1000 },
    MPa: { label: "Megapascals", symbol: "MPa", toBase: 1e6 },
    GPa: { label: "Gigapascals", symbol: "GPa", toBase: 1e9 },
    psi: { label: "Pounds/sq inch", symbol: "psi", toBase: 6894.76 },
    ksi: { label: "Kips/sq inch", symbol: "ksi", toBase: 6.89476e6 },
    psf: { label: "Pounds/sq foot", symbol: "psf", toBase: 47.8803 },
    atm: { label: "Atmospheres", symbol: "atm", toBase: 101325 },
  },
  moment: {
    Nm: { label: "Newton-meters", symbol: "N·m", toBase: 1 },
    kNm: { label: "Kilonewton-meters", symbol: "kN·m", toBase: 1000 },
    lbft: { label: "Pound-feet", symbol: "lb·ft", toBase: 1.35582 },
    kipft: { label: "Kip-feet", symbol: "kip·ft", toBase: 1355.82 },
    kipin: { label: "Kip-inches", symbol: "kip·in", toBase: 112.985 },
  },
  mass: {
    g: { label: "Grams", symbol: "g", toBase: 0.001 },
    kg: { label: "Kilograms", symbol: "kg", toBase: 1 },
    tonne: { label: "Metric Tonnes", symbol: "t", toBase: 1000 },
    lb: { label: "Pounds", symbol: "lb", toBase: 0.453592 },
    oz: { label: "Ounces", symbol: "oz", toBase: 0.0283495 },
    ton_short: { label: "Short Tons", symbol: "ton", toBase: 907.185 },
  },
  density: {
    kg_m3: { label: "kg/m³", symbol: "kg/m³", toBase: 1 },
    kN_m3: { label: "kN/m³", symbol: "kN/m³", toBase: 101.972 },
    pcf: { label: "lb/ft³", symbol: "pcf", toBase: 16.0185 },
    pci: { label: "lb/in³", symbol: "pci", toBase: 27679.9 },
  },
  temperature: {
    C: { label: "Celsius", symbol: "°C", toBase: 1 },
    F: { label: "Fahrenheit", symbol: "°F", toBase: 1 },
    K: { label: "Kelvin", symbol: "K", toBase: 1 },
  },
};

/**
 * Convert between any two units in the same category.
 * Temperature uses special handling.
 */
export function convert(
  value: number,
  fromUnit: string,
  toUnit: string,
  category: UnitCategory
): number {
  if (category === "temperature") {
    return convertTemperature(value, fromUnit, toUnit);
  }

  const from = UNIT_DEFS[category][fromUnit];
  const to = UNIT_DEFS[category][toUnit];

  if (!from || !to) throw new Error(`Unknown unit: ${fromUnit} or ${toUnit}`);

  // Convert to base, then from base to target
  return (value * from.toBase) / to.toBase;
}

function convertTemperature(value: number, from: string, to: string): number {
  // Convert to Celsius first
  let celsius: number;
  switch (from) {
    case "C":
      celsius = value;
      break;
    case "F":
      celsius = (value - 32) * (5 / 9);
      break;
    case "K":
      celsius = value - 273.15;
      break;
    default:
      throw new Error(`Unknown temperature unit: ${from}`);
  }

  // Convert from Celsius to target
  switch (to) {
    case "C":
      return celsius;
    case "F":
      return celsius * (9 / 5) + 32;
    case "K":
      return celsius + 273.15;
    default:
      throw new Error(`Unknown temperature unit: ${to}`);
  }
}

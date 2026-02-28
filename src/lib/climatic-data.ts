// =============================================================================
// Canadian Climatic Design Data Database
// Based on NBC 2020 (National Building Code of Canada 2020)
// =============================================================================
//
// This module provides climatic design data for structural engineering
// calculations across Canadian locations. Values are representative of
// NBC 2020 Appendix C climatic data for the 1-in-50-year return period
// (except q10 which is 1-in-10-year).
//
// Data fields:
//   Ss   - Ground snow load, 1-in-50-year return period (kPa)
//   Sr   - Associated rain load (kPa)
//   q10  - Hourly wind pressure, 1-in-10-year return period (kPa)
//   q50  - Hourly wind pressure, 1-in-50-year return period (kPa)
//   Sa02 - 5% damped spectral response acceleration at 0.2s period (g)
//   Sa05 - 5% damped spectral response acceleration at 0.5s period (g)
//   Sa10 - 5% damped spectral response acceleration at 1.0s period (g)
//   Sa20 - 5% damped spectral response acceleration at 2.0s period (g)
//   PGA  - Peak ground acceleration (g)
//   PGV  - Peak ground velocity (m/s)
//
// DISCLAIMER: These values are for reference and preliminary design only.
// Always verify against the official NBC 2020 Appendix C for final design.
// =============================================================================

export interface ClimaticLocation {
  name: string;
  province: string;
  provinceFull: string;
  lat: number;
  lng: number;
  /** Ground snow load, 1-in-50-year (kPa) */
  Ss: number;
  /** Associated rain load (kPa) */
  Sr: number;
  /** Hourly wind pressure, 1-in-10-year (kPa) */
  q10: number;
  /** Hourly wind pressure, 1-in-50-year (kPa) */
  q50: number;
  /** Spectral acceleration at 0.2s (g) */
  Sa02: number;
  /** Spectral acceleration at 0.5s (g) */
  Sa05: number;
  /** Spectral acceleration at 1.0s (g) */
  Sa10: number;
  /** Spectral acceleration at 2.0s (g) */
  Sa20: number;
  /** Peak ground acceleration (g) */
  PGA: number;
  /** Peak ground velocity (m/s) */
  PGV: number;
}

export interface Province {
  code: string;
  name: string;
}

export interface ProvinceStats {
  minSnow: number;
  maxSnow: number;
  avgSnow: number;
  minWind: number;
  maxWind: number;
  avgWind: number;
  maxSa: number;
}

// -----------------------------------------------------------------------------
// Province / Territory list
// -----------------------------------------------------------------------------

export const PROVINCES: Province[] = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];

// -----------------------------------------------------------------------------
// Helper to build a location record
// -----------------------------------------------------------------------------

function loc(
  name: string,
  province: string,
  provinceFull: string,
  lat: number,
  lng: number,
  Ss: number,
  Sr: number,
  q10: number,
  q50: number,
  Sa02: number,
  Sa05: number,
  Sa10: number,
  Sa20: number,
  PGA: number,
  PGV: number,
): ClimaticLocation {
  return { name, province, provinceFull, lat, lng, Ss, Sr, q10, q50, Sa02, Sa05, Sa10, Sa20, PGA, PGV };
}

// =============================================================================
// CLIMATIC DATA — Organised by Province / Territory
// =============================================================================

export const CLIMATIC_DATA: ClimaticLocation[] = [

  // ===========================================================================
  // BRITISH COLUMBIA
  // ===========================================================================
  // Coastal BC: high seismic, moderate snow, strong wind near coast
  // Interior BC: moderate seismic, high snow, variable wind
  // Northern BC: lower seismic, high snow, moderate wind

  // Vancouver — major coastal city, high seismic zone
  loc("Vancouver",        "BC", "British Columbia", 49.2827, -123.1207, 1.6,  0.2,  0.45, 0.57, 0.848, 0.751, 0.425, 0.213, 0.369, 0.291),
  // Victoria — south Vancouver Island, high seismic
  loc("Victoria",         "BC", "British Columbia", 48.4284, -123.3656, 1.2,  0.2,  0.48, 0.61, 0.948, 0.817, 0.468, 0.234, 0.403, 0.318),
  // Surrey — Lower Mainland, similar to Vancouver
  loc("Surrey",           "BC", "British Columbia", 49.1913, -122.8490, 1.7,  0.2,  0.44, 0.56, 0.835, 0.738, 0.418, 0.209, 0.363, 0.286),
  // Burnaby — metro Vancouver
  loc("Burnaby",          "BC", "British Columbia", 49.2488, -122.9805, 1.8,  0.2,  0.44, 0.56, 0.842, 0.745, 0.422, 0.211, 0.366, 0.289),
  // Richmond — low-lying delta, similar seismic to Vancouver
  loc("Richmond",         "BC", "British Columbia", 49.1666, -123.1336, 1.6,  0.2,  0.46, 0.58, 0.843, 0.746, 0.423, 0.212, 0.367, 0.290),
  // Kelowna — Okanagan interior, moderate seismic
  loc("Kelowna",          "BC", "British Columbia", 49.8880, -119.4960, 2.3,  0.2,  0.30, 0.38, 0.279, 0.195, 0.098, 0.047, 0.145, 0.081),
  // Kamloops — interior, semi-arid, moderate seismic
  loc("Kamloops",         "BC", "British Columbia", 50.6745, -120.3273, 2.1,  0.1,  0.28, 0.36, 0.249, 0.178, 0.090, 0.044, 0.133, 0.073),
  // Nanaimo — east coast Vancouver Island, high seismic
  loc("Nanaimo",          "BC", "British Columbia", 49.1659, -123.9401, 1.8,  0.3,  0.45, 0.57, 0.890, 0.780, 0.442, 0.221, 0.383, 0.302),
  // Prince George — northern interior, lower seismic, high snow
  loc("Prince George",    "BC", "British Columbia", 53.9171, -122.7497, 2.8,  0.1,  0.28, 0.36, 0.119, 0.068, 0.030, 0.014, 0.069, 0.030),
  // Abbotsford — Fraser Valley
  loc("Abbotsford",       "BC", "British Columbia", 49.0504, -122.3045, 1.9,  0.3,  0.38, 0.48, 0.780, 0.690, 0.390, 0.195, 0.340, 0.268),
  // Chilliwack — upper Fraser Valley
  loc("Chilliwack",       "BC", "British Columbia", 49.1579, -121.9514, 2.1,  0.3,  0.36, 0.46, 0.720, 0.630, 0.356, 0.178, 0.313, 0.245),
  // Whistler — coastal mountains, very high snow
  loc("Whistler",         "BC", "British Columbia", 50.1163, -122.9574, 4.4,  0.3,  0.40, 0.51, 0.620, 0.520, 0.290, 0.145, 0.268, 0.198),
  // Terrace — north coast, high snow
  loc("Terrace",          "BC", "British Columbia", 54.5164, -128.5997, 3.8,  0.2,  0.32, 0.41, 0.250, 0.173, 0.087, 0.042, 0.130, 0.072),
  // Prince Rupert — extreme north coast, moderate snow, high wind
  loc("Prince Rupert",    "BC", "British Columbia", 54.3150, -130.3208, 2.4,  0.4,  0.56, 0.71, 0.307, 0.215, 0.108, 0.053, 0.159, 0.090),
  // Cranbrook — East Kootenay interior
  loc("Cranbrook",        "BC", "British Columbia", 49.5097, -115.7688, 2.2,  0.1,  0.26, 0.33, 0.168, 0.108, 0.052, 0.025, 0.096, 0.048),
  // Vernon — North Okanagan
  loc("Vernon",           "BC", "British Columbia", 50.2671, -119.2720, 2.5,  0.2,  0.28, 0.36, 0.262, 0.183, 0.092, 0.045, 0.137, 0.076),
  // Penticton — South Okanagan
  loc("Penticton",        "BC", "British Columbia", 49.4991, -119.5937, 1.8,  0.2,  0.28, 0.36, 0.271, 0.190, 0.095, 0.046, 0.141, 0.079),
  // Courtenay — east Vancouver Island
  loc("Courtenay",        "BC", "British Columbia", 49.6841, -124.9928, 2.3,  0.3,  0.44, 0.56, 0.740, 0.640, 0.362, 0.181, 0.320, 0.250),
  // Campbell River — north Vancouver Island
  loc("Campbell River",   "BC", "British Columbia", 50.0244, -125.2475, 2.5,  0.3,  0.46, 0.58, 0.680, 0.580, 0.328, 0.164, 0.292, 0.226),
  // Fort St John — northeast BC, Peace River area
  loc("Fort St John",     "BC", "British Columbia", 56.2499, -120.8476, 2.0,  0.1,  0.30, 0.38, 0.086, 0.048, 0.022, 0.010, 0.050, 0.021),
  // Dawson Creek — northeast BC
  loc("Dawson Creek",     "BC", "British Columbia", 55.7596, -120.2353, 2.1,  0.1,  0.28, 0.36, 0.079, 0.044, 0.020, 0.009, 0.046, 0.019),

  // ===========================================================================
  // ALBERTA
  // ===========================================================================
  // Generally low seismic, moderate snow, moderate to strong wind (chinook areas)

  // Calgary — moderate snow, chinook influence, moderate wind
  loc("Calgary",          "AB", "Alberta", 51.0447, -114.0719, 1.2,  0.1,  0.36, 0.46, 0.150, 0.084, 0.040, 0.019, 0.084, 0.038),
  // Edmonton — moderate snow, moderate wind
  loc("Edmonton",         "AB", "Alberta", 53.5461, -113.4938, 1.4,  0.1,  0.32, 0.41, 0.098, 0.056, 0.026, 0.012, 0.058, 0.025),
  // Red Deer — central Alberta
  loc("Red Deer",         "AB", "Alberta", 52.2681, -113.8112, 1.4,  0.1,  0.32, 0.41, 0.120, 0.068, 0.032, 0.015, 0.070, 0.031),
  // Lethbridge — southern Alberta, very high wind
  loc("Lethbridge",       "AB", "Alberta", 49.6935, -112.8418, 1.0,  0.1,  0.50, 0.64, 0.131, 0.074, 0.035, 0.016, 0.074, 0.033),
  // Medicine Hat — southeast, low snow, moderate wind
  loc("Medicine Hat",     "AB", "Alberta", 50.0405, -110.6764, 1.0,  0.1,  0.38, 0.48, 0.098, 0.057, 0.027, 0.012, 0.058, 0.025),
  // Grande Prairie — northwest Alberta
  loc("Grande Prairie",   "AB", "Alberta", 55.1707, -118.7946, 1.8,  0.1,  0.30, 0.38, 0.079, 0.044, 0.020, 0.009, 0.047, 0.019),
  // Fort McMurray — northeast Alberta
  loc("Fort McMurray",    "AB", "Alberta", 56.7264, -111.3803, 2.0,  0.1,  0.28, 0.36, 0.056, 0.032, 0.015, 0.007, 0.034, 0.014),
  // Airdrie — just north of Calgary
  loc("Airdrie",          "AB", "Alberta", 51.2917, -114.0144, 1.2,  0.1,  0.36, 0.46, 0.148, 0.083, 0.039, 0.019, 0.083, 0.037),
  // Spruce Grove — near Edmonton
  loc("Spruce Grove",     "AB", "Alberta", 53.5450, -113.9009, 1.4,  0.1,  0.32, 0.41, 0.097, 0.055, 0.025, 0.012, 0.057, 0.024),
  // Banff — Rocky Mountain town, high snow
  loc("Banff",            "AB", "Alberta", 51.1784, -115.5708, 2.4,  0.1,  0.32, 0.41, 0.230, 0.133, 0.063, 0.030, 0.122, 0.058),
  // Canmore — Bow Valley near Banff
  loc("Canmore",          "AB", "Alberta", 51.0884, -115.3479, 2.0,  0.1,  0.34, 0.43, 0.218, 0.125, 0.059, 0.028, 0.116, 0.054),
  // Jasper — mountain park town
  loc("Jasper",           "AB", "Alberta", 52.8737, -118.0814, 2.2,  0.1,  0.28, 0.36, 0.174, 0.098, 0.046, 0.022, 0.098, 0.044),
  // Brooks — southeast Alberta
  loc("Brooks",           "AB", "Alberta", 50.5642, -111.8989, 1.0,  0.1,  0.34, 0.43, 0.091, 0.052, 0.024, 0.011, 0.054, 0.023),
  // Camrose — east central Alberta
  loc("Camrose",          "AB", "Alberta", 53.0172, -112.8343, 1.3,  0.1,  0.30, 0.38, 0.088, 0.050, 0.023, 0.011, 0.052, 0.022),
  // Lloydminster — Alberta/Saskatchewan border
  loc("Lloydminster",     "AB", "Alberta", 53.2784, -110.0050, 1.4,  0.1,  0.30, 0.38, 0.066, 0.038, 0.018, 0.008, 0.040, 0.017),
  // Wetaskiwin — central Alberta
  loc("Wetaskiwin",       "AB", "Alberta", 52.9694, -113.3769, 1.3,  0.1,  0.30, 0.38, 0.095, 0.054, 0.025, 0.012, 0.056, 0.024),

  // ===========================================================================
  // SASKATCHEWAN
  // ===========================================================================
  // Low seismic throughout, moderate snow, moderate wind

  // Regina — southern Saskatchewan
  loc("Regina",           "SK", "Saskatchewan", 50.4452, -104.6189, 1.1,  0.1,  0.38, 0.48, 0.073, 0.037, 0.016, 0.007, 0.042, 0.014),
  // Saskatoon — central Saskatchewan
  loc("Saskatoon",        "SK", "Saskatchewan", 52.1332, -106.6700, 1.1,  0.1,  0.36, 0.46, 0.058, 0.030, 0.013, 0.006, 0.034, 0.012),
  // Prince Albert — north central
  loc("Prince Albert",    "SK", "Saskatchewan", 53.2034, -105.7531, 1.6,  0.1,  0.32, 0.41, 0.051, 0.027, 0.012, 0.005, 0.031, 0.011),
  // Moose Jaw — south central
  loc("Moose Jaw",        "SK", "Saskatchewan", 50.3934, -105.5519, 1.1,  0.1,  0.38, 0.48, 0.070, 0.036, 0.016, 0.007, 0.041, 0.014),
  // Swift Current — southwest
  loc("Swift Current",    "SK", "Saskatchewan", 50.2881, -107.7938, 1.0,  0.1,  0.40, 0.51, 0.064, 0.033, 0.014, 0.006, 0.037, 0.013),
  // North Battleford — northwest
  loc("North Battleford", "SK", "Saskatchewan", 52.7575, -108.2861, 1.3,  0.1,  0.34, 0.43, 0.052, 0.028, 0.012, 0.005, 0.032, 0.011),
  // Yorkton — southeast
  loc("Yorkton",          "SK", "Saskatchewan", 51.2139, -102.4628, 1.4,  0.1,  0.34, 0.43, 0.065, 0.034, 0.015, 0.006, 0.038, 0.013),
  // Estevan — far south
  loc("Estevan",          "SK", "Saskatchewan", 49.1391, -102.9869, 1.2,  0.1,  0.38, 0.48, 0.060, 0.031, 0.013, 0.006, 0.035, 0.012),
  // Weyburn — south central
  loc("Weyburn",          "SK", "Saskatchewan", 49.6636, -103.8524, 1.1,  0.1,  0.36, 0.46, 0.064, 0.033, 0.014, 0.006, 0.037, 0.013),
  // Humboldt — central
  loc("Humboldt",         "SK", "Saskatchewan", 52.2017, -105.1231, 1.4,  0.1,  0.34, 0.43, 0.054, 0.028, 0.012, 0.005, 0.032, 0.011),

  // ===========================================================================
  // MANITOBA
  // ===========================================================================
  // Low seismic, moderate to high snow (increases northward), moderate wind

  // Winnipeg — southern Manitoba
  loc("Winnipeg",         "MB", "Manitoba", 49.8951, -97.1384, 1.6,  0.2,  0.38, 0.48, 0.078, 0.040, 0.017, 0.008, 0.045, 0.016),
  // Brandon — southwestern Manitoba
  loc("Brandon",          "MB", "Manitoba", 49.8440, -99.9539, 1.4,  0.1,  0.36, 0.46, 0.063, 0.033, 0.014, 0.006, 0.037, 0.013),
  // Thompson — northern Manitoba
  loc("Thompson",         "MB", "Manitoba", 55.7433, -97.8553, 2.6,  0.1,  0.30, 0.38, 0.042, 0.022, 0.009, 0.004, 0.025, 0.009),
  // Steinbach — southeast Manitoba
  loc("Steinbach",        "MB", "Manitoba", 49.5258, -96.6839, 1.6,  0.2,  0.36, 0.46, 0.074, 0.038, 0.016, 0.007, 0.043, 0.015),
  // Portage la Prairie — south central
  loc("Portage la Prairie","MB","Manitoba", 49.9726, -98.2927, 1.5,  0.1,  0.38, 0.48, 0.071, 0.037, 0.016, 0.007, 0.041, 0.015),
  // Selkirk — north of Winnipeg
  loc("Selkirk",          "MB", "Manitoba", 50.1436, -96.8841, 1.7,  0.2,  0.36, 0.46, 0.076, 0.039, 0.017, 0.007, 0.044, 0.016),
  // Dauphin — west central
  loc("Dauphin",          "MB", "Manitoba", 51.1496, -100.0503, 1.8,  0.1,  0.34, 0.43, 0.057, 0.030, 0.013, 0.006, 0.034, 0.012),
  // The Pas — northern Manitoba
  loc("The Pas",          "MB", "Manitoba", 53.8236, -101.2514, 2.2,  0.1,  0.30, 0.38, 0.046, 0.024, 0.010, 0.005, 0.028, 0.010),
  // Flin Flon — northern Manitoba
  loc("Flin Flon",        "MB", "Manitoba", 54.7679, -101.8781, 2.4,  0.1,  0.30, 0.38, 0.043, 0.023, 0.010, 0.004, 0.026, 0.009),
  // Morden — southern Manitoba
  loc("Morden",           "MB", "Manitoba", 49.1919, -98.1010, 1.4,  0.1,  0.36, 0.46, 0.068, 0.035, 0.015, 0.007, 0.039, 0.014),

  // ===========================================================================
  // ONTARIO
  // ===========================================================================
  // Low seismic in southwest; moderate near Ottawa/St Lawrence; high snow in north
  // Lake effect snow in Georgian Bay/Barrie areas

  // Toronto — south central Ontario
  loc("Toronto",          "ON", "Ontario", 43.6532, -79.3832, 1.1,  0.3,  0.45, 0.57, 0.230, 0.138, 0.060, 0.024, 0.130, 0.060),
  // Ottawa — eastern Ontario, moderate seismic (Western Quebec zone)
  loc("Ottawa",           "ON", "Ontario", 45.4215, -75.6972, 2.4,  0.2,  0.36, 0.46, 0.332, 0.220, 0.110, 0.048, 0.184, 0.102),
  // Mississauga — GTA
  loc("Mississauga",      "ON", "Ontario", 43.5890, -79.6441, 1.1,  0.3,  0.44, 0.56, 0.225, 0.135, 0.059, 0.023, 0.127, 0.058),
  // Hamilton — Golden Horseshoe
  loc("Hamilton",         "ON", "Ontario", 43.2557, -79.8711, 1.2,  0.3,  0.42, 0.53, 0.218, 0.131, 0.057, 0.023, 0.123, 0.057),
  // London — southwestern Ontario
  loc("London",           "ON", "Ontario", 42.9849, -81.2453, 1.3,  0.3,  0.40, 0.51, 0.165, 0.098, 0.042, 0.017, 0.094, 0.042),
  // Kitchener — southwestern Ontario
  loc("Kitchener",        "ON", "Ontario", 43.4516, -80.4925, 1.2,  0.3,  0.38, 0.48, 0.190, 0.114, 0.050, 0.020, 0.107, 0.048),
  // Windsor — extreme southwest, low snow, moderate seismic
  loc("Windsor",          "ON", "Ontario", 42.3149, -83.0364, 0.8,  0.3,  0.42, 0.53, 0.148, 0.089, 0.039, 0.015, 0.085, 0.038),
  // Barrie — Georgian Bay region, lake effect snow
  loc("Barrie",           "ON", "Ontario", 44.3894, -79.6903, 1.9,  0.2,  0.38, 0.48, 0.208, 0.125, 0.054, 0.022, 0.118, 0.053),
  // Sudbury — northern Ontario
  loc("Sudbury",          "ON", "Ontario", 46.4917, -80.9930, 2.4,  0.2,  0.32, 0.41, 0.182, 0.107, 0.046, 0.019, 0.103, 0.046),
  // Thunder Bay — northwestern Ontario
  loc("Thunder Bay",      "ON", "Ontario", 48.3809, -89.2477, 2.0,  0.2,  0.38, 0.48, 0.067, 0.038, 0.017, 0.007, 0.040, 0.016),
  // Kingston — eastern Ontario, St Lawrence corridor
  loc("Kingston",         "ON", "Ontario", 44.2312, -76.4860, 1.7,  0.2,  0.38, 0.48, 0.290, 0.189, 0.092, 0.039, 0.161, 0.086),
  // Oshawa — Durham region
  loc("Oshawa",           "ON", "Ontario", 43.8971, -78.8658, 1.2,  0.3,  0.42, 0.53, 0.235, 0.141, 0.061, 0.025, 0.132, 0.061),
  // St Catharines — Niagara region
  loc("St Catharines",    "ON", "Ontario", 43.1594, -79.2469, 1.1,  0.3,  0.42, 0.53, 0.210, 0.126, 0.055, 0.022, 0.119, 0.054),
  // Cambridge — southwestern Ontario
  loc("Cambridge",        "ON", "Ontario", 43.3616, -80.3144, 1.2,  0.3,  0.38, 0.48, 0.186, 0.112, 0.049, 0.019, 0.105, 0.047),
  // Guelph — southwestern Ontario
  loc("Guelph",           "ON", "Ontario", 43.5448, -80.2482, 1.3,  0.3,  0.38, 0.48, 0.192, 0.115, 0.050, 0.020, 0.108, 0.049),
  // Waterloo — southwestern Ontario
  loc("Waterloo",         "ON", "Ontario", 43.4643, -80.5204, 1.2,  0.3,  0.38, 0.48, 0.188, 0.113, 0.049, 0.020, 0.106, 0.048),
  // Brantford — southwestern Ontario
  loc("Brantford",        "ON", "Ontario", 43.1394, -80.2644, 1.1,  0.3,  0.40, 0.51, 0.180, 0.108, 0.047, 0.019, 0.102, 0.046),
  // Peterborough — eastern Ontario
  loc("Peterborough",     "ON", "Ontario", 44.3091, -78.3197, 1.6,  0.2,  0.36, 0.46, 0.243, 0.148, 0.065, 0.027, 0.137, 0.064),
  // Sarnia — extreme southwest
  loc("Sarnia",           "ON", "Ontario", 42.9745, -82.4066, 0.9,  0.3,  0.44, 0.56, 0.148, 0.089, 0.039, 0.015, 0.085, 0.038),
  // Niagara Falls — Niagara
  loc("Niagara Falls",    "ON", "Ontario", 43.0896, -79.0849, 1.2,  0.3,  0.42, 0.53, 0.214, 0.128, 0.056, 0.022, 0.121, 0.055),
  // North Bay — northeastern Ontario
  loc("North Bay",        "ON", "Ontario", 46.3091, -79.4608, 2.3,  0.2,  0.32, 0.41, 0.195, 0.115, 0.050, 0.020, 0.110, 0.049),
  // Sault Ste Marie — northern Ontario
  loc("Sault Ste Marie",  "ON", "Ontario", 46.5219, -84.3461, 2.5,  0.2,  0.36, 0.46, 0.105, 0.061, 0.027, 0.011, 0.061, 0.026),
  // Timmins — northern Ontario
  loc("Timmins",          "ON", "Ontario", 48.4758, -81.3305, 2.8,  0.1,  0.28, 0.36, 0.128, 0.074, 0.032, 0.013, 0.073, 0.032),
  // Kenora — far northwest Ontario
  loc("Kenora",           "ON", "Ontario", 49.7667, -94.4894, 1.8,  0.1,  0.34, 0.43, 0.052, 0.029, 0.013, 0.005, 0.031, 0.012),
  // Cornwall — St Lawrence corridor, moderate seismic
  loc("Cornwall",         "ON", "Ontario", 45.0181, -74.7286, 2.3,  0.2,  0.34, 0.43, 0.372, 0.248, 0.126, 0.056, 0.206, 0.119),
  // Belleville — eastern Ontario
  loc("Belleville",       "ON", "Ontario", 44.1628, -77.3832, 1.5,  0.2,  0.38, 0.48, 0.268, 0.172, 0.082, 0.034, 0.150, 0.076),
  // Brockville — St Lawrence
  loc("Brockville",       "ON", "Ontario", 44.5895, -75.6843, 2.0,  0.2,  0.36, 0.46, 0.318, 0.208, 0.103, 0.044, 0.176, 0.096),
  // Owen Sound — Georgian Bay
  loc("Owen Sound",       "ON", "Ontario", 44.5690, -80.9406, 2.2,  0.2,  0.38, 0.48, 0.168, 0.100, 0.043, 0.017, 0.095, 0.043),
  // Orillia — central Ontario
  loc("Orillia",          "ON", "Ontario", 44.6082, -79.4197, 1.8,  0.2,  0.36, 0.46, 0.200, 0.120, 0.052, 0.021, 0.113, 0.051),
  // Huntsville — Muskoka
  loc("Huntsville",       "ON", "Ontario", 45.3335, -79.2169, 2.2,  0.2,  0.32, 0.41, 0.195, 0.115, 0.050, 0.020, 0.110, 0.049),

  // ===========================================================================
  // QUEBEC
  // ===========================================================================
  // Western Quebec seismic zone near Ottawa/Gatineau
  // Charlevoix seismic zone near Quebec City / La Malbaie (highest in eastern Canada)
  // High snow throughout, increasing northward

  // Montreal — St Lawrence, moderate seismic
  loc("Montreal",         "QC", "Quebec", 45.5017, -73.5673, 2.6,  0.2,  0.42, 0.53, 0.595, 0.370, 0.180, 0.078, 0.320, 0.183),
  // Quebec City — Charlevoix influence, higher seismic
  loc("Quebec City",      "QC", "Quebec", 46.8139, -71.2080, 3.2,  0.2,  0.42, 0.53, 0.560, 0.385, 0.198, 0.090, 0.310, 0.192),
  // Laval — north of Montreal
  loc("Laval",            "QC", "Quebec", 45.6066, -73.7124, 2.6,  0.2,  0.40, 0.51, 0.583, 0.363, 0.177, 0.077, 0.314, 0.180),
  // Gatineau — across from Ottawa
  loc("Gatineau",         "QC", "Quebec", 45.4765, -75.7013, 2.4,  0.2,  0.36, 0.46, 0.340, 0.225, 0.113, 0.049, 0.188, 0.105),
  // Sherbrooke — Eastern Townships
  loc("Sherbrooke",       "QC", "Quebec", 45.4009, -71.8891, 2.8,  0.2,  0.36, 0.46, 0.420, 0.270, 0.135, 0.059, 0.232, 0.133),
  // Trois-Rivieres — St Lawrence
  loc("Trois-Rivieres",   "QC", "Quebec", 46.3432, -72.5425, 2.8,  0.2,  0.40, 0.51, 0.510, 0.335, 0.168, 0.074, 0.280, 0.165),
  // Saguenay (Chicoutimi) — Saguenay–Lac-Saint-Jean
  loc("Saguenay",         "QC", "Quebec", 48.4279, -71.0548, 3.6,  0.2,  0.36, 0.46, 0.468, 0.308, 0.155, 0.068, 0.258, 0.152),
  // Rimouski — Lower St Lawrence
  loc("Rimouski",         "QC", "Quebec", 48.4490, -68.5230, 3.0,  0.2,  0.42, 0.53, 0.380, 0.258, 0.130, 0.058, 0.211, 0.125),
  // Val-d'Or — Abitibi-Temiscamingue
  loc("Val-d'Or",         "QC", "Quebec", 48.0975, -77.7969, 2.8,  0.1,  0.30, 0.38, 0.160, 0.094, 0.041, 0.017, 0.091, 0.040),
  // Sept-Iles — North Shore
  loc("Sept-Iles",        "QC", "Quebec", 50.2110, -66.3754, 3.4,  0.2,  0.46, 0.58, 0.249, 0.163, 0.080, 0.035, 0.140, 0.078),
  // Drummondville — Centre-du-Quebec
  loc("Drummondville",    "QC", "Quebec", 45.8838, -72.4843, 2.6,  0.2,  0.38, 0.48, 0.490, 0.318, 0.158, 0.069, 0.270, 0.157),
  // Granby — Eastern Townships
  loc("Granby",           "QC", "Quebec", 45.4000, -72.7333, 2.6,  0.2,  0.36, 0.46, 0.440, 0.284, 0.142, 0.062, 0.242, 0.140),
  // Saint-Hyacinthe — Monteregie
  loc("Saint-Hyacinthe",  "QC", "Quebec", 45.6307, -72.9571, 2.4,  0.2,  0.38, 0.48, 0.510, 0.328, 0.163, 0.071, 0.280, 0.160),
  // Shawinigan — Mauricie
  loc("Shawinigan",       "QC", "Quebec", 46.5668, -72.7491, 3.0,  0.2,  0.36, 0.46, 0.482, 0.316, 0.158, 0.069, 0.265, 0.155),
  // Rouyn-Noranda — Abitibi-Temiscamingue
  loc("Rouyn-Noranda",    "QC", "Quebec", 48.2391, -79.0231, 2.6,  0.1,  0.30, 0.38, 0.148, 0.086, 0.037, 0.016, 0.084, 0.037),
  // Victoriaville — Centre-du-Quebec
  loc("Victoriaville",    "QC", "Quebec", 46.0500, -71.9590, 2.8,  0.2,  0.36, 0.46, 0.460, 0.298, 0.148, 0.065, 0.254, 0.147),
  // Baie-Comeau — North Shore
  loc("Baie-Comeau",      "QC", "Quebec", 49.2167, -68.1500, 3.6,  0.2,  0.46, 0.58, 0.290, 0.193, 0.096, 0.042, 0.163, 0.094),
  // Riviere-du-Loup — Lower St Lawrence
  loc("Riviere-du-Loup",  "QC", "Quebec", 47.8333, -69.5333, 2.8,  0.2,  0.40, 0.51, 0.425, 0.290, 0.147, 0.065, 0.236, 0.140),
  // Alma — Lac-Saint-Jean
  loc("Alma",             "QC", "Quebec", 48.5500, -71.6500, 3.4,  0.2,  0.34, 0.43, 0.435, 0.286, 0.143, 0.063, 0.240, 0.140),
  // Thetford Mines — Chaudiere-Appalaches
  loc("Thetford Mines",   "QC", "Quebec", 46.1000, -71.3000, 3.0,  0.2,  0.34, 0.43, 0.480, 0.312, 0.156, 0.068, 0.264, 0.153),
  // Matane — Bas-Saint-Laurent / Gaspesie
  loc("Matane",           "QC", "Quebec", 48.8500, -67.5333, 3.0,  0.2,  0.44, 0.56, 0.340, 0.228, 0.114, 0.050, 0.190, 0.110),
  // Gaspe — tip of Gaspesie
  loc("Gaspe",            "QC", "Quebec", 48.8316, -64.4854, 2.8,  0.2,  0.50, 0.64, 0.218, 0.146, 0.072, 0.031, 0.124, 0.068),

  // ===========================================================================
  // NEW BRUNSWICK
  // ===========================================================================
  // Low-moderate seismic, moderate-high snow, moderate-high wind

  // Fredericton — central NB, interior
  loc("Fredericton",      "NB", "New Brunswick", 45.9636, -66.6431, 2.8,  0.3,  0.36, 0.46, 0.290, 0.182, 0.086, 0.037, 0.160, 0.086),
  // Saint John — Bay of Fundy coast
  loc("Saint John",       "NB", "New Brunswick", 45.2733, -66.0633, 2.4,  0.4,  0.48, 0.61, 0.310, 0.198, 0.095, 0.041, 0.174, 0.095),
  // Moncton — southeast NB
  loc("Moncton",          "NB", "New Brunswick", 46.0878, -64.7782, 2.6,  0.3,  0.42, 0.53, 0.230, 0.146, 0.068, 0.029, 0.129, 0.068),
  // Bathurst — north coast
  loc("Bathurst",         "NB", "New Brunswick", 47.6197, -65.6511, 3.0,  0.2,  0.40, 0.51, 0.208, 0.132, 0.062, 0.027, 0.117, 0.062),
  // Edmundston — northwest NB
  loc("Edmundston",       "NB", "New Brunswick", 47.3765, -68.3253, 3.2,  0.2,  0.36, 0.46, 0.248, 0.158, 0.075, 0.032, 0.140, 0.075),
  // Miramichi — Northumberland coast
  loc("Miramichi",        "NB", "New Brunswick", 47.0296, -65.5024, 2.8,  0.2,  0.40, 0.51, 0.218, 0.138, 0.065, 0.028, 0.123, 0.065),
  // Campbellton — north, Restigouche
  loc("Campbellton",      "NB", "New Brunswick", 48.0072, -66.6725, 3.0,  0.2,  0.40, 0.51, 0.230, 0.146, 0.069, 0.030, 0.130, 0.069),
  // Sussex — south central
  loc("Sussex",           "NB", "New Brunswick", 45.7200, -65.5100, 2.6,  0.3,  0.38, 0.48, 0.278, 0.175, 0.082, 0.035, 0.155, 0.082),
  // Woodstock — Carleton County
  loc("Woodstock",        "NB", "New Brunswick", 46.1519, -67.5986, 2.8,  0.2,  0.34, 0.43, 0.260, 0.164, 0.077, 0.033, 0.146, 0.077),

  // ===========================================================================
  // NOVA SCOTIA
  // ===========================================================================
  // Low-moderate seismic, moderate-high snow, high wind (Atlantic exposure)

  // Halifax — Atlantic coast
  loc("Halifax",          "NS", "Nova Scotia", 44.6488, -63.5752, 2.0,  0.4,  0.50, 0.64, 0.230, 0.150, 0.072, 0.031, 0.132, 0.072),
  // Sydney — Cape Breton
  loc("Sydney",           "NS", "Nova Scotia", 46.1368, -60.1942, 2.4,  0.3,  0.52, 0.66, 0.175, 0.114, 0.054, 0.023, 0.100, 0.054),
  // Truro — central NS
  loc("Truro",            "NS", "Nova Scotia", 45.3647, -63.2800, 2.2,  0.3,  0.44, 0.56, 0.210, 0.136, 0.065, 0.028, 0.120, 0.065),
  // New Glasgow — Pictou County
  loc("New Glasgow",      "NS", "Nova Scotia", 45.5926, -62.6467, 2.2,  0.3,  0.44, 0.56, 0.195, 0.127, 0.060, 0.026, 0.112, 0.060),
  // Yarmouth — southwest NS
  loc("Yarmouth",         "NS", "Nova Scotia", 43.8361, -66.1175, 1.6,  0.4,  0.52, 0.66, 0.195, 0.127, 0.060, 0.026, 0.112, 0.060),
  // Kentville — Annapolis Valley
  loc("Kentville",        "NS", "Nova Scotia", 45.0775, -64.4958, 1.8,  0.3,  0.44, 0.56, 0.218, 0.142, 0.067, 0.029, 0.125, 0.067),
  // Amherst — Cumberland County, near NB border
  loc("Amherst",          "NS", "Nova Scotia", 45.8275, -64.2117, 2.4,  0.3,  0.44, 0.56, 0.220, 0.143, 0.068, 0.029, 0.126, 0.068),
  // Antigonish — northeast NS
  loc("Antigonish",       "NS", "Nova Scotia", 45.6222, -61.9986, 2.4,  0.3,  0.44, 0.56, 0.190, 0.124, 0.058, 0.025, 0.109, 0.058),
  // Bridgewater — south shore
  loc("Bridgewater",      "NS", "Nova Scotia", 44.3741, -64.5186, 1.8,  0.4,  0.48, 0.61, 0.218, 0.142, 0.067, 0.029, 0.125, 0.067),

  // ===========================================================================
  // PRINCE EDWARD ISLAND
  // ===========================================================================
  // Low-moderate seismic, moderate-high snow, high wind

  // Charlottetown — provincial capital
  loc("Charlottetown",    "PE", "Prince Edward Island", 46.2382, -63.1311, 2.4,  0.3,  0.46, 0.58, 0.180, 0.117, 0.055, 0.024, 0.103, 0.055),
  // Summerside — western PEI
  loc("Summerside",       "PE", "Prince Edward Island", 46.3935, -63.7913, 2.2,  0.3,  0.46, 0.58, 0.175, 0.114, 0.054, 0.023, 0.100, 0.054),
  // Stratford — near Charlottetown
  loc("Stratford",        "PE", "Prince Edward Island", 46.2167, -63.0833, 2.4,  0.3,  0.46, 0.58, 0.180, 0.117, 0.055, 0.024, 0.103, 0.055),
  // Montague — southeastern PEI
  loc("Montague",         "PE", "Prince Edward Island", 46.1667, -62.6500, 2.4,  0.3,  0.44, 0.56, 0.178, 0.116, 0.055, 0.024, 0.102, 0.054),

  // ===========================================================================
  // NEWFOUNDLAND AND LABRADOR
  // ===========================================================================
  // Low-moderate seismic; very high snow in central NL; extreme wind on coast

  // St John's — Avalon Peninsula, extreme wind, moderate snow
  loc("St Johns",         "NL", "Newfoundland and Labrador", 47.5615, -52.7126, 2.4,  0.4,  0.62, 0.79, 0.210, 0.137, 0.066, 0.028, 0.120, 0.066),
  // Corner Brook — western NL, high snow
  loc("Corner Brook",     "NL", "Newfoundland and Labrador", 48.9500, -57.9500, 3.4,  0.3,  0.48, 0.61, 0.175, 0.114, 0.054, 0.023, 0.100, 0.054),
  // Mount Pearl — near St John's
  loc("Mount Pearl",      "NL", "Newfoundland and Labrador", 47.5189, -52.8058, 2.4,  0.4,  0.60, 0.76, 0.208, 0.136, 0.065, 0.028, 0.119, 0.065),
  // Gander — central NL
  loc("Gander",           "NL", "Newfoundland and Labrador", 48.9569, -54.6089, 3.2,  0.3,  0.48, 0.61, 0.155, 0.101, 0.048, 0.021, 0.089, 0.048),
  // Grand Falls-Windsor — central NL
  loc("Grand Falls-Windsor","NL","Newfoundland and Labrador", 48.9347, -55.6622, 3.8,  0.2,  0.42, 0.53, 0.148, 0.097, 0.046, 0.020, 0.085, 0.046),
  // Happy Valley-Goose Bay — Labrador
  loc("Happy Valley-Goose Bay","NL","Newfoundland and Labrador", 53.3018, -60.3261, 3.6,  0.2,  0.38, 0.48, 0.092, 0.052, 0.023, 0.010, 0.054, 0.023),
  // Labrador City — western Labrador
  loc("Labrador City",    "NL", "Newfoundland and Labrador", 52.9399, -66.9261, 4.0,  0.1,  0.36, 0.46, 0.075, 0.042, 0.019, 0.008, 0.044, 0.019),
  // Stephenville — southwest coast NL
  loc("Stephenville",     "NL", "Newfoundland and Labrador", 48.5500, -58.5800, 2.8,  0.3,  0.50, 0.64, 0.168, 0.110, 0.052, 0.022, 0.096, 0.052),

  // ===========================================================================
  // NORTHWEST TERRITORIES
  // ===========================================================================
  // Very low seismic; high snow in some areas; extreme cold but moderate wind

  // Yellowknife — Great Slave Lake
  loc("Yellowknife",      "NT", "Northwest Territories", 62.4540, -114.3718, 2.4,  0.1,  0.28, 0.36, 0.048, 0.026, 0.011, 0.005, 0.029, 0.010),
  // Hay River — south shore of Great Slave Lake
  loc("Hay River",        "NT", "Northwest Territories", 60.8156, -115.7129, 2.2,  0.1,  0.28, 0.36, 0.044, 0.024, 0.010, 0.004, 0.027, 0.009),
  // Inuvik — Arctic, Mackenzie Delta
  loc("Inuvik",           "NT", "Northwest Territories", 68.3607, -133.7230, 2.0,  0.1,  0.32, 0.41, 0.068, 0.038, 0.017, 0.007, 0.040, 0.016),
  // Norman Wells — central Mackenzie Valley
  loc("Norman Wells",     "NT", "Northwest Territories", 65.2819, -126.8329, 2.2,  0.1,  0.28, 0.36, 0.058, 0.032, 0.014, 0.006, 0.034, 0.013),
  // Fort Smith — south NT
  loc("Fort Smith",       "NT", "Northwest Territories", 60.0000, -111.8833, 2.0,  0.1,  0.26, 0.33, 0.040, 0.022, 0.009, 0.004, 0.024, 0.008),

  // ===========================================================================
  // NUNAVUT
  // ===========================================================================
  // Very low seismic; moderate snow (cold dry climate); moderate wind

  // Iqaluit — Baffin Island
  loc("Iqaluit",          "NU", "Nunavut", 63.7467, -68.5170, 2.8,  0.1,  0.40, 0.51, 0.082, 0.046, 0.020, 0.009, 0.048, 0.019),
  // Rankin Inlet — western Hudson Bay
  loc("Rankin Inlet",     "NU", "Nunavut", 62.8091, -92.0852, 2.0,  0.1,  0.38, 0.48, 0.044, 0.024, 0.010, 0.004, 0.026, 0.009),
  // Baker Lake — interior Nunavut
  loc("Baker Lake",       "NU", "Nunavut", 64.3167, -96.0167, 2.0,  0.1,  0.34, 0.43, 0.038, 0.020, 0.009, 0.004, 0.023, 0.008),
  // Cambridge Bay — Victoria Island
  loc("Cambridge Bay",    "NU", "Nunavut", 69.1169, -105.0597, 1.6,  0.1,  0.32, 0.41, 0.032, 0.018, 0.008, 0.003, 0.020, 0.007),
  // Arviat — west coast Hudson Bay
  loc("Arviat",           "NU", "Nunavut", 61.1078, -94.0624, 2.2,  0.1,  0.38, 0.48, 0.042, 0.023, 0.010, 0.004, 0.025, 0.009),

  // ===========================================================================
  // YUKON
  // ===========================================================================
  // Moderate to high seismic in southwest (near Alaska subduction zone)
  // High snow; cold but moderate wind

  // Whitehorse — southern Yukon, moderate seismic
  loc("Whitehorse",       "YT", "Yukon", 60.7212, -135.0568, 2.0,  0.1,  0.30, 0.38, 0.230, 0.140, 0.068, 0.030, 0.128, 0.068),
  // Dawson City — central Yukon, moderate seismic
  loc("Dawson City",      "YT", "Yukon", 64.0601, -139.4326, 1.8,  0.1,  0.28, 0.36, 0.268, 0.168, 0.082, 0.037, 0.150, 0.082),
  // Watson Lake — southeast Yukon
  loc("Watson Lake",      "YT", "Yukon", 60.0614, -128.8078, 2.4,  0.1,  0.26, 0.33, 0.180, 0.108, 0.052, 0.023, 0.102, 0.052),
];

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Returns all climatic data locations for a given province code.
 * @param province - Two-letter province/territory code (e.g. "BC", "ON", "QC")
 * @returns Array of ClimaticLocation entries for that province
 */
export function getLocationsByProvince(province: string): ClimaticLocation[] {
  const code = province.toUpperCase().trim();
  return CLIMATIC_DATA.filter((loc) => loc.province === code);
}

/**
 * Searches locations by a case-insensitive substring match on the location
 * name or province name / code. Returns all matching entries.
 * @param query - Search string (e.g. "Vanc", "BC", "British")
 * @returns Array of matching ClimaticLocation entries
 */
export function searchLocations(query: string): ClimaticLocation[] {
  if (!query || query.trim().length === 0) {
    return [];
  }
  const q = query.toLowerCase().trim();
  return CLIMATIC_DATA.filter(
    (loc) =>
      loc.name.toLowerCase().includes(q) ||
      loc.province.toLowerCase() === q ||
      loc.provinceFull.toLowerCase().includes(q),
  );
}

/**
 * Computes summary statistics for a given province:
 * - minSnow / maxSnow / avgSnow : min, max, and mean Ss across all locations
 * - minWind / maxWind / avgWind : min, max, and mean q50 across all locations
 * - maxSa : maximum Sa(0.2) across all locations in the province
 *
 * @param province - Two-letter province/territory code
 * @returns ProvinceStats object, or zeroes if province not found
 */
export function getProvinceStats(province: string): ProvinceStats {
  const locations = getLocationsByProvince(province);

  if (locations.length === 0) {
    return {
      minSnow: 0,
      maxSnow: 0,
      avgSnow: 0,
      minWind: 0,
      maxWind: 0,
      avgWind: 0,
      maxSa: 0,
    };
  }

  const snowValues = locations.map((l) => l.Ss);
  const windValues = locations.map((l) => l.q50);
  const saValues = locations.map((l) => l.Sa02);

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const round3 = (n: number) => Math.round(n * 1000) / 1000;

  return {
    minSnow: round3(Math.min(...snowValues)),
    maxSnow: round3(Math.max(...snowValues)),
    avgSnow: round3(sum(snowValues) / snowValues.length),
    minWind: round3(Math.min(...windValues)),
    maxWind: round3(Math.max(...windValues)),
    avgWind: round3(sum(windValues) / windValues.length),
    maxSa: round3(Math.max(...saValues)),
  };
}

/**
 * Returns the full province name for a two-letter code.
 * @param code - Two-letter province/territory code
 * @returns Full province name, or undefined if not found
 */
export function getProvinceName(code: string): string | undefined {
  const c = code.toUpperCase().trim();
  return PROVINCES.find((p) => p.code === c)?.name;
}

/**
 * Returns the nearest location to a given lat/lng using Haversine distance.
 * Useful for interpolation or finding the closest reference station.
 * @param lat - Latitude in decimal degrees
 * @param lng - Longitude in decimal degrees
 * @returns The closest ClimaticLocation entry, or undefined if database is empty
 */
export function findNearestLocation(
  lat: number,
  lng: number,
): ClimaticLocation | undefined {
  if (CLIMATIC_DATA.length === 0) return undefined;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  let nearest: ClimaticLocation | undefined;
  let minDist = Infinity;

  for (const loc of CLIMATIC_DATA) {
    const dLat = toRad(loc.lat - lat);
    const dLng = toRad(loc.lng - lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat)) *
        Math.cos(toRad(loc.lat)) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = 6371 * c; // km

    if (dist < minDist) {
      minDist = dist;
      nearest = loc;
    }
  }

  return nearest;
}

/**
 * Returns a sorted list of unique province codes present in the database.
 */
export function getAvailableProvinces(): string[] {
  const codes = new Set(CLIMATIC_DATA.map((l) => l.province));
  return Array.from(codes).sort();
}

/**
 * Returns the total count of locations in the database.
 */
export function getLocationCount(): number {
  return CLIMATIC_DATA.length;
}

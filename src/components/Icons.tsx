interface IconProps {
  className?: string;
}

// ---------- Snow Load ----------
export const SnowflakeIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Vertical axis */}
    <line x1="12" y1="2" x2="12" y2="22" />
    {/* Horizontal axis */}
    <line x1="2" y1="12" x2="22" y2="12" />
    {/* Diagonal axis top-left to bottom-right */}
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    {/* Diagonal axis top-right to bottom-left */}
    <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
    {/* Top branches */}
    <line x1="12" y1="2" x2="10" y2="4.5" />
    <line x1="12" y1="2" x2="14" y2="4.5" />
    {/* Bottom branches */}
    <line x1="12" y1="22" x2="10" y2="19.5" />
    <line x1="12" y1="22" x2="14" y2="19.5" />
    {/* Left branches */}
    <line x1="2" y1="12" x2="4.5" y2="10" />
    <line x1="2" y1="12" x2="4.5" y2="14" />
    {/* Right branches */}
    <line x1="22" y1="12" x2="19.5" y2="10" />
    <line x1="22" y1="12" x2="19.5" y2="14" />
  </svg>
);

// ---------- Wind / Air Flow ----------
export const WindIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Top stream curving up */}
    <path d="M2 6h10a3 3 0 1 0-3-3" />
    {/* Middle stream curving up */}
    <path d="M2 12h14a3 3 0 1 1-3 3" />
    {/* Bottom stream curving down */}
    <path d="M2 18h8a3 3 0 1 1-3 3" />
  </svg>
);

// ---------- Seismic Wave ----------
export const SeismicIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Seismograph waveform */}
    <polyline points="2 12 5 12 7 4 9 20 11 8 13 16 15 10 17 14 19 12 22 12" />
    {/* Ground line */}
    <line x1="2" y1="22" x2="22" y2="22" />
    {/* Building outline shaking */}
    <path d="M8 22v-6h3v6" />
    <path d="M13 22v-9h3v9" />
  </svg>
);

// ---------- Structural Beam with Supports ----------
export const BeamIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Beam */}
    <line x1="2" y1="10" x2="22" y2="10" />
    {/* Left triangular support (pin) */}
    <polygon points="5,10 3,16 7,16" fill="none" stroke="currentColor" />
    {/* Right triangular support (roller) */}
    <polygon points="19,10 17,15 21,15" fill="none" stroke="currentColor" />
    <circle cx="19" cy="16" r="1" fill="none" stroke="currentColor" />
    {/* Distributed load arrows */}
    <line x1="8" y1="4" x2="8" y2="10" />
    <line x1="12" y1="4" x2="12" y2="10" />
    <line x1="16" y1="4" x2="16" y2="10" />
    <line x1="8" y1="4" x2="16" y2="4" />
    {/* Arrowheads */}
    <polyline points="7 8 8 10 9 8" />
    <polyline points="11 8 12 10 13 8" />
    <polyline points="15 8 16 10 17 8" />
  </svg>
);

// ---------- Dead Load / Gravity ----------
export const WeightIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Weight body */}
    <path d="M6 10h12l-1 10H7L6 10z" />
    {/* Handle arc */}
    <path d="M9 10V8a3 3 0 0 1 6 0v2" />
    {/* Down arrow indicating gravity */}
    <line x1="12" y1="2" x2="12" y2="5" />
    <polyline points="10 3.5 12 5 14 3.5" />
    {/* Weight text */}
    <text
      x="12"
      y="17"
      textAnchor="middle"
      fontSize="5"
      fill="currentColor"
      stroke="none"
      fontWeight="bold"
    >
      kg
    </text>
  </svg>
);

// ---------- Concrete / Rebar ----------
export const ConcreteIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Concrete block outline */}
    <rect x="3" y="5" width="18" height="14" rx="1" />
    {/* Rebar horizontal */}
    <line x1="5" y1="15" x2="19" y2="15" />
    <line x1="5" y1="9" x2="19" y2="9" />
    {/* Rebar vertical */}
    <line x1="8" y1="7" x2="8" y2="17" />
    <line x1="12" y1="7" x2="12" y2="17" />
    <line x1="16" y1="7" x2="16" y2="17" />
    {/* Cross-hatch dots at intersections */}
    <circle cx="8" cy="9" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="12" cy="9" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="16" cy="9" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="8" cy="15" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="12" cy="15" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="16" cy="15" r="0.7" fill="currentColor" stroke="none" />
  </svg>
);

// ---------- Unit Converter Arrows ----------
export const ConverterIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Top arrow left to right */}
    <line x1="4" y1="8" x2="20" y2="8" />
    <polyline points="16 4 20 8 16 12" />
    {/* Bottom arrow right to left */}
    <line x1="20" y1="16" x2="4" y2="16" />
    <polyline points="8 12 4 16 8 20" />
  </svg>
);

// ---------- Building / Structure ----------
export const BuildingIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Main building */}
    <rect x="4" y="3" width="16" height="18" rx="1" />
    {/* Ground line */}
    <line x1="2" y1="21" x2="22" y2="21" />
    {/* Windows row 1 */}
    <rect x="7" y="6" width="3" height="2.5" rx="0.5" />
    <rect x="14" y="6" width="3" height="2.5" rx="0.5" />
    {/* Windows row 2 */}
    <rect x="7" y="11" width="3" height="2.5" rx="0.5" />
    <rect x="14" y="11" width="3" height="2.5" rx="0.5" />
    {/* Door */}
    <rect x="10" y="16" width="4" height="5" rx="0.5" />
    <circle cx="13" cy="18.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

// ---------- Map Pin / Location ----------
export const MapPinIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

// ---------- Province / Region Map ----------
export const ProvinceIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Irregular region outline */}
    <path d="M3 7l3-3 4 1 3-2 4 2 4-1v5l-2 3 1 4-2 3-4 1-3-1-4 2-3-2-1-4z" />
    {/* Grid lines for latitude / longitude feel */}
    <line x1="9" y1="5" x2="8" y2="19" />
    <line x1="16" y1="4" x2="15" y2="18" />
    <line x1="4" y1="11" x2="20" y2="10" />
  </svg>
);

// ---------- Chart / Diagram ----------
export const ChartIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Axes */}
    <polyline points="3 20 3 4" />
    <polyline points="3 20 21 20" />
    {/* Line chart */}
    <polyline points="6 16 10 10 14 13 18 6" />
    {/* Data points */}
    <circle cx="6" cy="16" r="1" fill="currentColor" stroke="none" />
    <circle cx="10" cy="10" r="1" fill="currentColor" stroke="none" />
    <circle cx="14" cy="13" r="1" fill="currentColor" stroke="none" />
    <circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" />
    {/* Axis arrows */}
    <polyline points="2 6 3 4 4 6" />
    <polyline points="19 19 21 20 19 21" />
  </svg>
);

// ---------- Code Book Reference ----------
export const CodeBookIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Book body */}
    <path d="M4 4h13a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4" />
    {/* Spine */}
    <path d="M4 4v16" />
    <line x1="4" y1="4" x2="4" y2="20" strokeWidth={2.5} />
    {/* Pages */}
    <line x1="8" y1="8" x2="15" y2="8" />
    <line x1="8" y1="11" x2="15" y2="11" />
    <line x1="8" y1="14" x2="12" y2="14" />
    {/* Bookmark tab */}
    <path d="M14 2v5l1.5-1.5L17 7V2" />
  </svg>
);

// ---------- Search Magnifying Glass ----------
export const SearchIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="10.5" cy="10.5" r="6.5" />
    <line x1="15.5" y1="15.5" x2="21" y2="21" />
  </svg>
);

// ---------- Filter Funnel ----------
export const FilterIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="2 4 22 4 14 14 14 20 10 22 10 14 2 4" />
  </svg>
);

// ---------- Navigation Arrow Right ----------
export const ArrowRightIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" y1="12" x2="20" y2="12" />
    <polyline points="14 6 20 12 14 18" />
  </svg>
);

// ---------- Checkmark ----------
export const CheckIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="4 12 9 17 20 6" />
  </svg>
);

// ---------- Information Circle ----------
export const InfoIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="11" x2="12" y2="17" />
    <circle cx="12" cy="8" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

// ---------- Warning Triangle ----------
export const WarningIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="14" />
    <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

// ---------- General Calculator ----------
export const CalculatorIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Calculator body */}
    <rect x="4" y="2" width="16" height="20" rx="2" />
    {/* Display */}
    <rect x="7" y="5" width="10" height="4" rx="1" />
    {/* Buttons row 1 */}
    <circle cx="8" cy="13" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="12" cy="13" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="16" cy="13" r="0.8" fill="currentColor" stroke="none" />
    {/* Buttons row 2 */}
    <circle cx="8" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="16" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
    {/* Buttons row 3 */}
    <circle cx="8" cy="20" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="12" cy="20" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="16" cy="20" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

// ---------- Database ----------
export const DatabaseIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M20 5v14c0 1.66-3.58 3-8 3s-8-1.34-8-3V5" />
    <path d="M20 12c0 1.66-3.58 3-8 3s-8-1.34-8-3" />
  </svg>
);

// ---------- Live / Real-time Pulse ----------
export const LiveIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Pulse line */}
    <polyline points="2 12 6 12 8 8 10 16 12 10 14 14 16 12 22 12" />
    {/* Radiating arcs */}
    <path d="M18 6a8.5 8.5 0 0 1 0 12" />
    <path d="M20 3.5a12 12 0 0 1 0 17" />
  </svg>
);

// ---------- Engineering Diagram ----------
export const DiagramIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Top node */}
    <rect x="9" y="2" width="6" height="4" rx="1" />
    {/* Bottom left node */}
    <rect x="2" y="18" width="6" height="4" rx="1" />
    {/* Bottom right node */}
    <rect x="16" y="18" width="6" height="4" rx="1" />
    {/* Middle node */}
    <rect x="9" y="10" width="6" height="4" rx="1" />
    {/* Connectors */}
    <line x1="12" y1="6" x2="12" y2="10" />
    <line x1="9" y1="13" x2="5" y2="18" />
    <line x1="15" y1="13" x2="19" y2="18" />
  </svg>
);

// ---------- Canada Maple Leaf ----------
export const CanadaIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Simplified maple leaf */}
    <path d="M12 2l-1.5 4-3-1 1.5 3.5-4 .5 3 2.5-2 2h3l-1 3.5 3-2 1 3 1-3 3 2-1-3.5h3l-2-2 3-2.5-4-.5L16.5 5l-3 1L12 2z" />
    {/* Stem */}
    <line x1="12" y1="18" x2="12" y2="22" />
  </svg>
);

// ---------- Steel I-Beam Cross Section ----------
export const SteelIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Top flange */}
    <line x1="5" y1="4" x2="19" y2="4" />
    <line x1="5" y1="4" x2="5" y2="6.5" />
    <line x1="19" y1="4" x2="19" y2="6.5" />
    <line x1="5" y1="6.5" x2="10.5" y2="6.5" />
    <line x1="13.5" y1="6.5" x2="19" y2="6.5" />
    {/* Web */}
    <line x1="10.5" y1="6.5" x2="10.5" y2="17.5" />
    <line x1="13.5" y1="6.5" x2="13.5" y2="17.5" />
    {/* Bottom flange */}
    <line x1="5" y1="17.5" x2="10.5" y2="17.5" />
    <line x1="13.5" y1="17.5" x2="19" y2="17.5" />
    <line x1="5" y1="17.5" x2="5" y2="20" />
    <line x1="19" y1="17.5" x2="19" y2="20" />
    <line x1="5" y1="20" x2="19" y2="20" />
  </svg>
);

// ---------- Timber / Wood Grain ----------
export const TimberIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Log cross-section circle */}
    <circle cx="12" cy="12" r="9" />
    {/* Growth rings */}
    <ellipse cx="12" cy="12" rx="6" ry="5.5" />
    <ellipse cx="12" cy="12" rx="3.5" ry="3" />
    <ellipse cx="12" cy="12" rx="1.2" ry="1" />
    {/* Grain crack lines */}
    <line x1="12" y1="3" x2="12" y2="6.5" />
    <line x1="12" y1="15" x2="12.5" y2="21" />
    <line x1="5" y1="7" x2="8.5" y2="9" />
  </svg>
);

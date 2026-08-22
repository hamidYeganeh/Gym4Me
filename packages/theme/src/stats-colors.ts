/**
 * Stats / chart palette — CSS variables defined in `tokens.css`.
 * Prefer these over hard-coded hex in components.
 */
export const statsColors = {
  red: "var(--stats-red)",
  purple: "var(--stats-purple)",
  orange: "var(--stats-orange)",
  green: "var(--stats-green)",
  blue: "var(--stats-blue)",
  navy: "var(--stats-navy)",
  midnight: "var(--stats-midnight)",
  rose: "var(--stats-rose)",
  forest: "var(--stats-forest)",
  yellow: "var(--stats-yellow)",
  foreground: "var(--stats-foreground)",
} as const;

/** Hex values for cases that need a resolved color (canvas, native, etc.). */
export const statsColorHex = {
  red: "#9D1337",
  purple: "#6B3E74",
  orange: "#FA5425",
  green: "#1DC453",
  blue: "#043DDD",
  navy: "#0F2660",
  midnight: "#0B2358",
  rose: "#E65769",
  forest: "#417665",
  yellow: "#CA8A04",
  foreground: "#FFFFFF",
} as const;

/**
 * Chromatic fills in design order — cycle on sport cards, categories, charts.
 * Excludes `yellow` (legacy) and `foreground`.
 */
export const statsPalette = [
  statsColors.red,
  statsColors.purple,
  statsColors.orange,
  statsColors.green,
  statsColors.blue,
  statsColors.navy,
  statsColors.midnight,
  statsColors.rose,
  statsColors.forest,
] as const;

export type StatsColorName = keyof typeof statsColors;
export type StatsPaletteColor = (typeof statsPalette)[number];

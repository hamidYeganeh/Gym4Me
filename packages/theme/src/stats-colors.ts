/**
 * Stats / chart palette — CSS variables defined in `tokens.css`.
 * Prefer these over hard-coded hex in components.
 */
export const statsColors = {
  red: "var(--stats-red)",
  blue: "var(--stats-blue)",
  yellow: "var(--stats-yellow)",
  purple: "var(--stats-purple)",
  orange: "var(--stats-orange)",
  foreground: "var(--stats-foreground)",
} as const;

/** Hex values for cases that need a resolved color (canvas, native, etc.). */
export const statsColorHex = {
  red: "#DC2626",
  blue: "#2563EB",
  yellow: "#CA8A04",
  purple: "#9333EA",
  orange: "#EA580C",
  foreground: "#FFFFFF",
} as const;

export type StatsColorName = keyof typeof statsColors;

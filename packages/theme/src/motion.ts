/**
 * Shared motion tokens — durations, eases, and Motion spring configs.
 * CSS counterparts live in `tokens.css` (`--duration-*`, `--ease-app`).
 */

/** Durations in seconds (Motion / JS). */
export const duration = {
  instant: 0.075,
  fast: 0.15,
  normal: 0.2,
  moderate: 0.3,
  slow: 0.35,
} as const;

/** Durations in milliseconds. */
export const durationMs = {
  instant: 75,
  fast: 150,
  normal: 200,
  moderate: 300,
  slow: 350,
} as const;

/**
 * Motion-compatible eases.
 * `outFluid` matches HeroUI `--ease-out-fluid` (Apple-style).
 */
export const ease = {
  inOut: "easeInOut" as const,
  outFluid: [0.32, 0.72, 0, 1] as const,
  linear: "linear" as const,
} as const;

/**
 * Default Motion transition — laggy soft spring from ProfileHeader morph.
 * Prefer this for entrances, layout shifts, and scroll-linked follows.
 */
export const transition = {
  type: "spring" as const,
  stiffness: 160,
  damping: 22,
  mass: 0.95,
  restDelta: 0.001,
} as const;

/** Stagger timings (seconds) for list / section entrances. */
export const stagger = {
  children: 0.09,
  delayChildren: 0.05,
} as const;

/** Motion spring presets used across kit / cards. */
export const spring = {
  /** Alias of {@link transition} — default app spring. */
  default: transition,
  snap: {
    type: "spring" as const,
    stiffness: 420,
    damping: 36,
  },
  picker: {
    type: "spring" as const,
    stiffness: 400,
    damping: 40,
  },
  soft: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  },
  digit: {
    type: "spring" as const,
    stiffness: 280,
    damping: 24,
  },
  gentle: {
    type: "spring" as const,
    stiffness: 200,
    damping: 20,
  },
  bounce: {
    bounce: 0.45,
  },
} as const;

export type DurationToken = keyof typeof duration;
export type SpringToken = keyof typeof spring;

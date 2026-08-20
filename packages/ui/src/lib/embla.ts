import type { EmblaOptionsType } from "embla-carousel";

/**
 * Embla scroll `duration` (engine units, not ms). Higher = slower / smoother.
 * Docs recommend roughly 20–60; default Embla value is 25.
 */
export const EMBLA_DURATION = {
  /** Near-instant; prefer with `prefers-reduced-motion`. */
  instant: 0,
  /** Control-driven steppers (onboarding). */
  snappy: 22,
  /** Default card strips / free-scroll rows. */
  smooth: 34,
  /** Full-bleed banners, lightbox, hero snaps. */
  juicy: 42,
} as const;

/** Snap carousel defaults — banners, lightbox mains, onboarding. */
export const emblaSnapOptions = {
  duration: EMBLA_DURATION.juicy,
  skipSnaps: false,
  dragFree: false,
} as const satisfies EmblaOptionsType;

/** Free-scroll strip defaults — gallery / discovery card rows. */
export const emblaFreeScrollOptions = {
  align: "start",
  containScroll: "trimSnaps",
  dragFree: true,
  duration: EMBLA_DURATION.smooth,
} as const satisfies EmblaOptionsType;

/** Merge shared snap defaults with call-site overrides. */
export function emblaOptions(
  overrides: EmblaOptionsType = {},
): EmblaOptionsType {
  return { ...emblaSnapOptions, ...overrides };
}

/** Merge shared free-scroll defaults with call-site overrides. */
export function emblaFreeOptions(
  overrides: EmblaOptionsType = {},
): EmblaOptionsType {
  return { ...emblaFreeScrollOptions, ...overrides };
}

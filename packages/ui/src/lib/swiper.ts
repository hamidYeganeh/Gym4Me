import type { SwiperOptions } from "swiper/types";

/**
 * Swiper `speed` in milliseconds.
 * Higher = slower / smoother settle.
 */
export const SWIPER_SPEED = {
  /** Near-instant; prefer with `prefers-reduced-motion`. */
  instant: 0,
  /** Control-driven steppers (onboarding). */
  snappy: 320,
  /** Default card strips / free-scroll rows. */
  smooth: 450,
  /** Full-bleed banners, lightbox, hero snaps. */
  juicy: 560,
} as const;

/** Snap carousel defaults — banners, lightbox mains, onboarding. */
export const swiperSnapOptions = {
  speed: SWIPER_SPEED.juicy,
  slidesPerView: 1,
  spaceBetween: 0,
  resistanceRatio: 0.65,
} as const satisfies Partial<SwiperOptions>;

/** Free-scroll strip defaults — gallery / discovery card rows. */
export const swiperFreeScrollOptions = {
  freeMode: { enabled: true, sticky: false },
  slidesPerView: "auto",
  spaceBetween: 12,
  resistanceRatio: 0.85,
  speed: SWIPER_SPEED.smooth,
} as const satisfies Partial<SwiperOptions>;

/** Merge shared snap defaults with call-site overrides. */
export function swiperOptions(
  overrides: Partial<SwiperOptions> = {},
): Partial<SwiperOptions> {
  return { ...swiperSnapOptions, ...overrides };
}

/** Merge shared free-scroll defaults with call-site overrides. */
export function swiperFreeOptions(
  overrides: Partial<SwiperOptions> = {},
): Partial<SwiperOptions> {
  return { ...swiperFreeScrollOptions, ...overrides };
}

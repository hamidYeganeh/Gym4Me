export type BannerCarouselAspectRatio = "16/9" | "2/1" | "4/3" | "1/1";

/**
 * Corner radius from `@repo/theme` tokens.
 * - `none` — square
 * - `sm` — `--radius`
 * - `field` — `--field-radius`
 * - `compact` — `--surface-radius-compact`
 * - `auth` — `--auth-field-radius`
 * - `surface` — `--surface-radius`
 * - `full` — pill / fully rounded
 */
export type BannerCarouselRadius =
  | "none"
  | "sm"
  | "field"
  | "compact"
  | "auth"
  | "surface"
  | "full";

/** Nine-point overlay placement using logical inline start/end (RTL-safe). */
export type BannerOverlayPlacement =
  | "top-start"
  | "top-center"
  | "top-end"
  | "center-start"
  | "center"
  | "center-end"
  | "bottom-start"
  | "bottom-center"
  | "bottom-end";

export type BannerCarouselSlideTitle = {
  text: string;
  /** @default "bottom-start" */
  placement?: BannerOverlayPlacement;
};

export type BannerCarouselSlideAction = {
  label: string;
  /** @default "bottom-end" */
  placement?: BannerOverlayPlacement;
  onPress?: () => void;
};

export type BannerCarouselSlide = {
  /** Stable key for the slide. */
  id: string;
  imageUrl: string;
  alt?: string | null;
  /**
   * Frame ratio for this slide. Falls back to the carousel `aspectRatio`.
   * @default carousel aspectRatio
   */
  ratio?: BannerCarouselAspectRatio;
  /**
   * Frame corner radius. Falls back to the carousel `radius`.
   * @default carousel radius
   */
  radius?: BannerCarouselRadius;
  /** Soft bottom scrim so title/action stay readable on busy photos. */
  gradient?: boolean;
  title?: BannerCarouselSlideTitle;
  action?: BannerCarouselSlideAction;
  /**
   * Whole-slide press when there is no dedicated `action` button.
   * Ignored when `action` is present (use `action.onPress` instead).
   */
  onPress?: () => void;
};

export interface BannerCarouselProps {
  slides: BannerCarouselSlide[];
  /**
   * Milliseconds between automatic slide advances. Pass 0 to disable.
   * Autoplay pauses while the user is interacting with the carousel.
   * @default 6000
   */
  autoplayMs?: number;
  /** Scroll direction of the track. @default "rtl" */
  direction?: "ltr" | "rtl";
  /**
   * Default image frame ratio when a slide omits `ratio`.
   * @default "16/9"
   */
  aspectRatio?: BannerCarouselAspectRatio;
  /**
   * Default corner radius when a slide omits `radius`.
   * @default "surface"
   */
  radius?: BannerCarouselRadius;
  /**
   * Bleed past AppLayout `px-screen` so slides span the viewport edge-to-edge.
   * @default false
   */
  fullBleed?: boolean;
  className?: string;
  "aria-label"?: string;
  /** Accessible label for a dot indicator, e.g. (1, 3) => "اسلاید ۱ از ۳". */
  slideLabel?: (index: number, total: number) => string;
}

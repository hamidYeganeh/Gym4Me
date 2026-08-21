import type { CarouselNavigationVariantProps } from "./CarouselNavigation.styles";

export type CarouselNavigationSize = NonNullable<
  CarouselNavigationVariantProps["size"]
>;

export interface CarouselNavigationProps {
  /** Total slide count. */
  totalSlides?: number;
  /** Controlled selected index (0-based). */
  currentIndex?: number;
  /** Called when the user changes the selected index. */
  onIndexChange?: (index: number) => void;
  /** Duration of the active indicator fill animation, in milliseconds. */
  autoDelay?: number;
  /**
   * When true, prev wraps from the first slide and next wraps from the last.
   * @default false
   */
  loop?: boolean;
  size?: CarouselNavigationSize;
  className?: string;
  "aria-label"?: string;
  prevLabel?: string;
  nextLabel?: string;
}

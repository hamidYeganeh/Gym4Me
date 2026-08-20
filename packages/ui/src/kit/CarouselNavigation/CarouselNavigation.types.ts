import type { EmblaCarouselType } from "embla-carousel";
import type { CarouselNavigationVariantProps } from "./CarouselNavigation.styles";

export type CarouselNavigationSize = NonNullable<
  CarouselNavigationVariantProps["size"]
>;

export interface CarouselNavigationProps {
  /**
   * Total slide count. Required when not driven by `emblaApi`.
   * When `emblaApi` is set, defaults to Embla's scroll snap list length.
   */
  totalSlides?: number;
  /** Controlled selected index (0-based). Ignored when `emblaApi` is set. */
  currentIndex?: number;
  /** Called when the user changes the selected index. */
  onIndexChange?: (index: number) => void;
  /** Duration of the active indicator fill animation, in milliseconds. */
  autoDelay?: number;
  /**
   * Optional Embla API. When provided, navigation scrolls Embla and
   * selected index syncs from Embla's `select` event.
   */
  emblaApi?: EmblaCarouselType;
  /**
   * When true, prev wraps from the first slide and next wraps from the last.
   * When using `emblaApi`, Embla's own loop option takes precedence for scrolling.
   * @default false
   */
  loop?: boolean;
  size?: CarouselNavigationSize;
  className?: string;
  "aria-label"?: string;
  prevLabel?: string;
  nextLabel?: string;
}

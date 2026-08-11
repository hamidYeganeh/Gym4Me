export type BannerCarouselSlide = {
  /** Stable key for the slide. */
  id: string;
  imageUrl: string;
  alt?: string | null;
  /** Present when the slide links somewhere; omitted slides are static. */
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
  className?: string;
  "aria-label"?: string;
  /** Accessible label for a dot indicator, e.g. (1, 3) => "اسلاید ۱ از ۳". */
  slideLabel?: (index: number, total: number) => string;
}

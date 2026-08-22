import type { ReactNode } from "react";

export type DiscoverySectionCarouselProps = {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
  slideClassName?: string;
  spaceBetween?: number;
  onSlideChange?: (index: number) => void;
};

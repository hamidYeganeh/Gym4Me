import type { ReactNode } from "react";

export type DiscoverySectionSheetTone = "surface" | "warning" | "accent" | "muted";

export type DiscoverySectionRailProps = {
  title: string;
  hint?: string;
  ariaLabel: string;
  seeAllLabel?: string;
  onSeeAll?: () => void;
  children: ReactNode;
  scrollerClassName?: string;
  swiperClassName?: string;
  slideClassName?: string;
  spaceBetween?: number;
  /** Accent icon beside the title (home rails). Default true. */
  accent?: boolean;
  /** Optional override for the accent icon. Defaults to Sparkle1. */
  accentIcon?: ReactNode;
  titleSize?: "h3" | "h4";
  className?: string;
  /** Full-bleed stacked band with rounded top corners. */
  sheet?: boolean;
  /** Fill when `sheet` is on. Default `surface`. */
  tone?: DiscoverySectionSheetTone;
  /** Repeating watermark on colored sheets. */
  pattern?: boolean;
};

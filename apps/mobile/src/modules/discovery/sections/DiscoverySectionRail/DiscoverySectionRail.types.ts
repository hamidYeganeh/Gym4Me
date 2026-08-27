import type { DiscoveryActionButtonVariant } from "@repo/api/discovery";
import type { ReactNode } from "react";

export type DiscoverySectionSheetTone = "surface" | "warning" | "accent" | "muted";

export type DiscoverySectionRailProps = {
  title: string;
  hint?: string;
  ariaLabel: string;
  seeAllLabel?: string;
  /** HeroUI Button variant for the see-all control. Default `ghost`. */
  seeAllVariant?: DiscoveryActionButtonVariant;
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
  /** Full-bleed section band with rounded corners. */
  sheet?: boolean;
  /** Fill when `sheet` is on. Default `surface`. */
  tone?: DiscoverySectionSheetTone;
  /** Repeating watermark on colored sheets. */
  pattern?: boolean;
};

import type { ReactNode } from "react";

export type DiscoverySectionRailProps = {
  title: string;
  hint?: string;
  ariaLabel: string;
  seeAllLabel?: string;
  onSeeAll?: () => void;
  children: ReactNode;
  scrollerClassName?: string;
  /** Accent icon beside the title (home rails). Default true. */
  accent?: boolean;
  /** Optional override for the accent icon. Defaults to Sparkle1. */
  accentIcon?: ReactNode;
  titleSize?: "h3" | "h4";
  className?: string;
};

import type { ReactNode } from "react";

export type DiscoverySectionRailProps = {
  title: string;
  hint?: string;
  ariaLabel: string;
  seeAllLabel?: string;
  onSeeAll?: () => void;
  children: ReactNode;
  scrollerClassName?: string;
  /** Accent bar beside the title (home rails). Default true. */
  accent?: boolean;
  titleSize?: "h3" | "h4";
  className?: string;
};

import type { ReactNode } from "react";

export type DiscoveryClubsDetailHeroSectionPullToViewProps = {
  children: ReactNode;
  /** Fired when the user pulls past the open threshold. */
  onPullOpen: () => void;
  /** Fired on a committed horizontal swipe. `+1` toward start, `-1` toward end (LTR-aware). */
  onSwipeHorizontal?: (direction: 1 | -1) => void;
};

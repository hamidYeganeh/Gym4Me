import type { ReactNode } from "react";

export type SecondaryPageHeaderProps = {
  /** Centered page title. */
  title?: ReactNode;
  /** Accessible label for the back control. */
  backAriaLabel?: string;
  /** Back navigation handler (typically `router.back()`). */
  onBack?: () => void;
  /** Optional trailing actions (search, menu, …). */
  endContent?: ReactNode;
  /** Hide the back button for rare flows that reuse the bar chrome only. */
  showBack?: boolean;
  className?: string;
};

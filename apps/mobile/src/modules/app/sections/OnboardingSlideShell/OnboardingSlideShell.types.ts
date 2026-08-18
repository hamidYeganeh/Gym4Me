import type { ReactNode } from "react";

export type OnboardingSlideShellProps = {
  title: string;
  subtitle?: string;
  /** When false, title/subtitle chrome is hidden (section owns its copy). */
  showChrome?: boolean;
  /** Full-viewport hero — no chrome padding; section paints edge-to-edge. */
  bleed?: boolean;
  isActive: boolean;
  children?: ReactNode;
  className?: string;
};

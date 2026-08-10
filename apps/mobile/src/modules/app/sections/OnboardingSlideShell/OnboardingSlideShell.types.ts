import type { ReactNode } from "react";

export type OnboardingSlideShellProps = {
  title: string;
  subtitle?: string;
  /** When false, title/subtitle chrome is hidden (section owns its copy). */
  showChrome?: boolean;
  isActive: boolean;
  children?: ReactNode;
  className?: string;
};

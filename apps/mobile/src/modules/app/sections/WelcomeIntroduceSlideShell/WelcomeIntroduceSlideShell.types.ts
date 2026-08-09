import type { ReactNode } from "react";

export type WelcomeIntroduceSlideShellProps = {
  className?: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  children?: ReactNode;
};

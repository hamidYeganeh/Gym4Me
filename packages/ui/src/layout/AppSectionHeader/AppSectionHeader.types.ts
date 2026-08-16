import type { ReactNode } from "react";

export type AppSectionHeaderProps = {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  actionLabel?: ReactNode;
  actionAriaLabel?: string;
  onAction?: () => void;
  className?: string;
};

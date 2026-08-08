import type { ReactNode } from "react";

export type AdminFormDrawerProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  className?: string;
};

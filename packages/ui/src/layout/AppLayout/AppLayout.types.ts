import type { ReactNode } from "react";

export type AppLayoutProps = {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
};

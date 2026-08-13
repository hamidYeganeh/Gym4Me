import type { ReactNode } from "react";

export type AdminFormPageProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

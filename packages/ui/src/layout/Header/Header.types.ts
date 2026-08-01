import type { ReactNode } from "react";

export type HeaderProps = {
  title?: ReactNode;
  startContent?: ReactNode;
  endContent?: ReactNode;
  className?: string;
};

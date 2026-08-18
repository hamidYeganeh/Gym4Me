import type { ReactNode } from "react";

export type HeaderAppearance = "fade" | "bar";

export type HeaderProps = {
  title?: ReactNode;
  startContent?: ReactNode;
  endContent?: ReactNode;
  /** `bar` matches the discovery home cap (rounded bottom, solid surface). */
  appearance?: HeaderAppearance;
  className?: string;
};

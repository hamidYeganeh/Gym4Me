import type { ReactNode } from "react";
import type { FormBannerVariantProps } from "./FormBanner.styles";

export type FormBannerProps = {
  children: ReactNode;
  className?: string;
  tone?: NonNullable<FormBannerVariantProps["tone"]>;
  /** When set, shows an icon-only dismiss control. */
  onDismiss?: () => void;
  dismissLabel?: string;
  role?: "alert" | "status";
};

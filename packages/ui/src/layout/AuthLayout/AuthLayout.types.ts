import type { ReactNode } from "react";

export type AuthLayoutLabels = {
  /** Optional page headline under the brand. Omit for brand + subtitle only. */
  title?: string;
  subtitle: string;
  brandAriaLabel: string;
  heroAlt: string;
};

export type AuthLayoutProps = {
  children: ReactNode;
  labels: AuthLayoutLabels;
  /** URL or imported src for background media. Omit for solid dark shell. */
  heroSrc?: string;
  /** Optional content below the form (e.g. sign-up link) */
  footer?: ReactNode;
  /** Optional content between form and footer (e.g. social providers) */
  belowForm?: ReactNode;
  className?: string;
};

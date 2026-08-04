import type { ReactNode } from "react";

export type AuthLayoutLabels = {
  title: string;
  subtitle: string;
  brandAriaLabel: string;
  heroAlt: string;
};

export type AuthLayoutProps = {
  children: ReactNode;
  labels: AuthLayoutLabels;
  /** URL or imported src for the right-side hero media */
  heroSrc: string;
  /** Optional content below the form (e.g. sign-up link) */
  footer?: ReactNode;
  /** Optional content between form and footer (e.g. social providers) */
  belowForm?: ReactNode;
  className?: string;
};

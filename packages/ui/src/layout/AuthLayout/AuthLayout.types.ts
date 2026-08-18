import type { ReactNode } from "react";

export type AuthLayoutLabels = {
  /**
   * Optional page headline under the logo.
   * When set, replaces the brand name under the mark (welcome-style).
   * When omitted, the brand name is shown under the logo (sign-in-style).
   */
  title?: string;
  /** Optional supporting copy under the title / brand. */
  subtitle?: string;
  brandAriaLabel: string;
  heroAlt: string;
};

export type AuthLayoutTone = "plain" | "hero" | "dark";

export type AuthLayoutProps = {
  children: ReactNode;
  labels: AuthLayoutLabels;
  /**
   * Background media. Defaults layout tone to `hero` (welcome-style)
   * unless `tone` is set explicitly (e.g. `plain` for form screens).
   */
  heroSrc?: string;
  /**
   * Visual shell. When `heroSrc` is set and `tone` is omitted, uses `hero`.
   * Pass `plain` / `dark` with `heroSrc` for form screens over a photo wash.
   */
  tone?: AuthLayoutTone;
  /** Show logo (+ brand name when no title). Default true. */
  showBrand?: boolean;
  /**
   * Wrap the form body in the frosted panel used by plain/dark tones.
   * Defaults to true for `plain` / `dark`, false for `hero`.
   * Pass `false` for flat setup screens (e.g. phone OTP).
   */
  framed?: boolean;
  /** Optional control pinned top-start (e.g. back button). */
  topStart?: ReactNode;
  /**
   * Optional illustration. Defaults to between header and form.
   * Pass `beforeHeader` for lock-first screens (e.g. forgot password).
   */
  figure?: ReactNode;
  /** Where to render `figure`. Default `afterHeader`. */
  figurePlacement?: "beforeHeader" | "afterHeader";
  /** Optional content below the form (e.g. sign-up link) */
  footer?: ReactNode;
  /** Optional content between form and footer (e.g. social providers) */
  belowForm?: ReactNode;
  className?: string;
};

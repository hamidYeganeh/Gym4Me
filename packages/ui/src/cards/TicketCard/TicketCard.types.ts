import type { CardProps } from "@heroui/react/card";
import type { ReactNode } from "react";

export type TicketCardProps = Omit<
  CardProps,
  "children" | "variant" | "className" | "title"
> & {
  /**
   * Primary footer line (e.g. cardholder / ticket name).
   * When omitted with `subtitle`, skeleton bars match the design.
   */
  title?: ReactNode;
  /** Secondary footer line (e.g. ticket id / expiry). */
  subtitle?: ReactNode;
  /**
   * Top-start payment / network mark.
   * Defaults to the Mastercard artwork from the design.
   * Pass `null` to hide.
   */
  paymentLogo?: ReactNode | null;
  /** Top-end contactless icon. Defaults to WifiHigh. Pass `null` to hide. */
  contactlessIcon?: ReactNode | null;
  /**
   * Center brand mark. Defaults to `Logo` tinted with `var(--accent)`.
   * Pass `null` to hide.
   */
  mark?: ReactNode | null;
  /** Extra classes for the root card. */
  className?: string;
};

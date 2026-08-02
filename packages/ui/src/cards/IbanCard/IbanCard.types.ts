import type { CardProps } from "@heroui/react";
import type { ReactNode } from "react";

export type IbanCardProps = Omit<
  CardProps,
  "children" | "variant" | "className" | "title"
> & {
  /** Cardholder / account holder name. */
  holderName: ReactNode;
  /** Expiry label (e.g. `"08/11"`). */
  expiry: ReactNode;
  /**
   * IBAN or card number. Whitespace is normalized into 4-character groups
   * when the value is a plain string.
   */
  number: ReactNode;
  /** Optional network mark (defaults to Mastercard). */
  networkLogo?: ReactNode;
  /** Accessible label for the default network mark. */
  networkLogoLabel?: string;
  /** Extra classes for the root card. */
  className?: string;
};

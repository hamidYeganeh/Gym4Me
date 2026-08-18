import type { ButtonProps } from "@heroui/react/button";
import type { CardProps } from "@heroui/react/card";
import type { ReactNode } from "react";

export type ClubSubscriptionCardProps = Omit<
  CardProps,
  "children" | "variant" | "className" | "title"
> & {
  /** Plan label (e.g. "FREE PLAN"). */
  planName: ReactNode;
  /** Main price amount (e.g. "$0 USD"). */
  price: ReactNode;
  /** Period / unit after the price (e.g. "/mo"). */
  priceSuffix?: ReactNode;
  /** Short plan summary under the price. */
  description?: ReactNode;
  /** Optional promo pill at the top-right (e.g. "50% OFF"). */
  badge?: ReactNode;
  /** CTA label (e.g. "Learn More"). Hidden when omitted. */
  actionLabel?: string;
  /** Called when the CTA is pressed. */
  onAction?: ButtonProps["onPress"];
  /** Whether this plan is the selected radio option. */
  selected?: boolean;
  /**
   * Trailing status control. Defaults to a check when `selected`.
   * Pass a HeroUI `Radio.Control` here when using inside `RadioGroup`.
   */
  control?: ReactNode;
  /** Override the default selected check icon. */
  statusIcon?: ReactNode;
  /** Extra classes for the CTA control. */
  actionClassName?: string;
  /** Extra classes for the root card. */
  className?: string;
};

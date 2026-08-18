import type { ButtonProps } from "@heroui/react/button";
import type { HTMLAttributes, ReactNode } from "react";

export type CoachMatchCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "title" | "children"
> & {
  /** Promo copy shown above the CTA. */
  title: ReactNode;
  /** CTA label (e.g. "Browse coaches"). */
  actionLabel: string;
  /** Optional leading icon inside the CTA. */
  actionIcon?: ReactNode;
  /** Called when the CTA is pressed. */
  onAction?: ButtonProps["onPress"];
  /** Extra classes for the CTA control. */
  actionClassName?: string;
};

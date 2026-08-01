import type { ButtonProps } from "@heroui/react";
import type { HTMLAttributes, ReactNode } from "react";

export type CoachAiCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "title" | "children"
> & {
  /** Promo copy shown above the CTA. */
  title: ReactNode;
  /** CTA label (e.g. "Autosuggest with AI"). */
  actionLabel: string;
  /** Optional leading icon inside the CTA. */
  actionIcon?: ReactNode;
  /** Called when the CTA is pressed. */
  onAction?: ButtonProps["onPress"];
  /** Extra classes for the CTA control. */
  actionClassName?: string;
};

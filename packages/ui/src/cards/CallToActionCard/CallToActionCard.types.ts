import type { ButtonProps } from "@heroui/react";
import type { HTMLAttributes, ReactNode } from "react";

export type CallToActionCardVariant = "primary" | "outlined";

/** Action control style. `plus` is a circular + button; `icon` is a squircle with a custom icon. */
export type CallToActionCardActionType = "plus" | "icon";

export type CallToActionCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "title" | "children"
> & {
  /** Visual style. `primary` is filled accent; `outlined` is border-only. */
  variant?: CallToActionCardVariant;
  /** Action control style. Defaults to `plus`. */
  actionType?: CallToActionCardActionType;
  /** Smaller top line (e.g. "215 New Messages"). */
  subtitle: ReactNode;
  /** Larger bold title (e.g. "Fitness AI Chatbot"). */
  title: ReactNode;
  /** Icon shown inside the squircle when `actionType` is `icon`. */
  icon?: ReactNode;
  /** Accessible label for the action button. */
  actionLabel: string;
  /** Called when the action button is pressed. */
  onAction?: ButtonProps["onPress"];
  /** Extra classes for the action button. */
  actionClassName?: string;
};

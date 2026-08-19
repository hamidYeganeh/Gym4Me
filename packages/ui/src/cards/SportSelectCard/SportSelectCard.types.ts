import type { ToggleButtonProps } from "@heroui/react/toggle-button";
import type { ReactNode } from "react";

export type SportSelectCardProps = Omit<
  ToggleButtonProps,
  "children" | "variant" | "isIconOnly" | "size" | "className"
> & {
  /** Sport / activity label under the icon. */
  label: ReactNode;
  /** Line-art icon above the label. */
  icon: ReactNode;
  /** Accessible name for the pressable card. */
  actionLabel: string;
  /** Extra classes for the root pressable. */
  className?: string;
};

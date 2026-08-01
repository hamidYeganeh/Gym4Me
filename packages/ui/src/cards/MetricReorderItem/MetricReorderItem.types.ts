import type { ButtonProps } from "@heroui/react";
import type { HTMLAttributes, ReactNode } from "react";

export type MetricReorderItemProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "title" | "children"
> & {
  /** Metric label (e.g. "Weight"). */
  title: ReactNode;
  /** Outlined metric icon. */
  icon: ReactNode;
  /** Accessible label for the remove control. */
  removeLabel: string;
  /** Accessible label for the drag handle. */
  dragLabel: string;
  /** Called when the remove control is pressed. */
  onRemove?: ButtonProps["onPress"];
  /**
   * Props for the drag handle (listeners/attributes from a DnD library).
   * Applied to the handle button so dragging starts from the grip only.
   */
  dragHandleProps?: HTMLAttributes<HTMLButtonElement> & Record<string, unknown>;
  /** Extra classes for the remove button. */
  removeClassName?: string;
  /** Extra classes for the drag handle. */
  dragClassName?: string;
};

import type { ButtonProps } from "@heroui/react/button";
import type { ReactNode } from "react";

export type ClubCategoryTileProps = Omit<
  ButtonProps,
  "children" | "variant" | "isIconOnly" | "size" | "fullWidth" | "className"
> & {
  /** Line-art icon shown at the start (right in RTL). */
  icon: ReactNode;
  /** Bold category name. */
  title: ReactNode;
  /** Optional muted count or supporting line under the title. */
  subtitle?: ReactNode;
  /** Accessible name. Defaults to `title` when that is a string. */
  actionLabel?: string;
  /** Extra classes for the root pressable. */
  className?: string;
};

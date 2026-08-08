import type { ButtonProps } from "@heroui/react";
import type { ReactNode } from "react";
import type { FilterChipVariantProps } from "./FilterChip.styles";

export type FilterChipSelectedVariant = NonNullable<
  FilterChipVariantProps["selectedVariant"]
>;

export type FilterChipProps = Omit<
  ButtonProps,
  "children" | "variant" | "size" | "isIconOnly"
> & {
  children: ReactNode;
  /** Leading icon shown before the label. */
  icon?: ReactNode;
  /** Whether this chip is the active filter. */
  selected?: boolean;
  /**
   * Selected appearance.
   * - `outline` — accent border + accent text (default; matches choice chips)
   * - `solid` — accent fill + accent-foreground text
   */
  selectedVariant?: FilterChipSelectedVariant;
};

export type FilterChipBarProps = {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
};

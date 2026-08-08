import type { ButtonProps } from "@heroui/react";
import type { ReactNode } from "react";

export type FilterFieldTrailing = "chevron" | "edit" | "none";

export type FilterFieldProps = Omit<
  ButtonProps,
  "children" | "variant" | "size" | "isIconOnly"
> & {
  /** Field label above the trigger. */
  label?: ReactNode;
  /** Current value shown in the trigger. */
  value: ReactNode;
  /** Leading icon inside the trigger. */
  icon?: ReactNode;
  /** Trailing affordance. Defaults to chevron. */
  trailing?: FilterFieldTrailing;
  /** Custom trailing node; overrides `trailing`. */
  trailingIcon?: ReactNode;
  className?: string;
  triggerClassName?: string;
  labelClassName?: string;
};

import type { ButtonProps } from "@heroui/react";
import type { ReactNode } from "react";

export type ReservationDayAvailability = "available" | "unavailable";

export type ReservationDayChipProps = Omit<
  ButtonProps,
  | "children"
  | "variant"
  | "isIconOnly"
  | "size"
  | "fullWidth"
  | "className"
  | "isDisabled"
> & {
  /** Short date label, e.g. "Mar 11". */
  dateLabel: ReactNode;
  /** Availability state for the day. */
  availability: ReservationDayAvailability;
  /** Status text under the date. Defaults to Available / Unavailable. */
  statusLabel?: ReactNode;
  /** Whether this chip is the active selection. */
  selected?: boolean;
  /** Extra classes for the root pressable. */
  className?: string;
};

import type { CardProps } from "@heroui/react/card";
import type { ReactNode } from "react";

/** Prefer status enum over an `isAvailable` boolean. */
export type CoachConsultationAvailabilityStatus =
  | "available"
  | "unavailable";

export type CoachConsultationTypeKind = "in-person" | "remote";

export type CoachConsultationOption = {
  /** Stable key for the option. */
  id: string;
  /** Built-in icon mapping when `icon` is omitted. */
  kind: CoachConsultationTypeKind;
  /** Primary label, e.g. `In-person`. */
  title: ReactNode;
  /** Availability status for the option. */
  status: CoachConsultationAvailabilityStatus;
  /** Status copy under the title, e.g. `Available Today`. */
  statusLabel: ReactNode;
  /** Formatted amount, e.g. `۲۰۰٬۰۰۰`. */
  price: ReactNode;
  /** Currency/label shown before the amount (e.g. `تومان`). */
  pricePrefix?: ReactNode;
  /** Optional label after the amount (e.g. `/جلسه`). */
  priceSuffix?: ReactNode;
  /** Optional custom icon; defaults from `kind`. */
  icon?: ReactNode;
};

export type CoachConsultationTypeProps = Omit<
  CardProps,
  "children" | "variant" | "className" | "title"
> & {
  /** Section title above the card (e.g. "Consultation Type"). */
  title: ReactNode;
  /** Consultation options to list. */
  options: CoachConsultationOption[];
  /** Currently selected option id. */
  selectedId?: string;
  /** Called when an available option is pressed. */
  onOptionPress?: (option: CoachConsultationOption) => void;
  /** Extra classes for the outer section root. */
  className?: string;
  /** Extra classes for the inner card. */
  cardClassName?: string;
};

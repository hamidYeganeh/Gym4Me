import type { ButtonProps } from "@heroui/react/button";
import type { CardProps } from "@heroui/react/card";
import type { LinkProps } from "@heroui/react/link";
import type { ReactNode } from "react";

/** Slot booking state — prefer status enum over an `isAvailable` boolean. */
export type CoachAvailabilitySlotStatus = "available" | "unavailable";

export type CoachAvailabilitySlot = {
  /** Stable key for the slot. */
  id: string;
  /** Display time, e.g. `10:00 AM`. */
  timeLabel: string;
  /** Whether the slot can be booked. */
  status: CoachAvailabilitySlotStatus;
};

export type CoachAvailabilityDay = {
  /** Stable key for the day group. */
  id: string;
  /** Day heading, e.g. `Today` or `Tomorrow, Jun 23`. */
  label: string;
  /** Time slots for this day. */
  slots: CoachAvailabilitySlot[];
};

export type CoachAvailabilitySlotsProps = Omit<
  CardProps,
  "children" | "variant" | "className" | "title"
> & {
  /** Section title above the card (e.g. "Availability Slot"). */
  title: ReactNode;
  /** Days with their time slots. */
  days: CoachAvailabilityDay[];
  /** Label shown on available slots. */
  availableLabel: string;
  /** Label shown on unavailable slots. */
  unavailableLabel: string;
  /** Optional "See All" link label. */
  seeAllLabel?: ReactNode;
  /** Called when "See All" is pressed. */
  onSeeAll?: LinkProps["onPress"];
  /** Optional href for "See All" (renders as an anchor when provided). */
  seeAllHref?: string;
  /** Called when an available slot is pressed. */
  onSlotPress?: (
    slot: CoachAvailabilitySlot,
    day: CoachAvailabilityDay,
  ) => void;
  /** Currently selected available slot id. */
  selectedSlotId?: string;
  /** Extra classes for the outer section root. */
  className?: string;
  /** Extra classes for the inner card. */
  cardClassName?: string;
  /** Slot button props omit — reserved for future. */
  slotButtonProps?: Omit<ButtonProps, "children" | "onPress" | "isDisabled">;
};

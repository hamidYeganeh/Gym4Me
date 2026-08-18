"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { reservationDayChipVariants } from "./ReservationDayChip.styles";
import type { ReservationDayChipProps } from "./ReservationDayChip.types";

const DEFAULT_STATUS = {
  available: "Available",
  unavailable: "Unavailable",
} as const;

export function ReservationDayChip({
  dateLabel,
  availability,
  statusLabel,
  selected = false,
  className,
  onPress,
  ...props
}: ReservationDayChipProps) {
  const slots = reservationDayChipVariants({ availability, selected });
  const isUnavailable = availability === "unavailable";
  const resolvedStatus = statusLabel ?? DEFAULT_STATUS[availability];

  return (
    <Button
      {...props}
      aria-disabled={isUnavailable || undefined}
      aria-pressed={selected}
      className={slots.root({ className })}
      isDisabled={isUnavailable}
      onPress={isUnavailable ? undefined : onPress}
      variant="ghost"
    >
      <Typography className={slots.date()} type="body-sm">
        {dateLabel}
      </Typography>
      <Typography className={slots.status()} type="body" weight="bold">
        {resolvedStatus}
      </Typography>
    </Button>
  );
}

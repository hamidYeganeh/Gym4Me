"use client";

import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Link } from "@heroui/react/link";
import { Typography } from "@heroui/react/typography";
import { coachAvailabilitySlotsVariants } from "./CoachAvailabilitySlots.styles";
import type {
  CoachAvailabilityDay,
  CoachAvailabilitySlot,
  CoachAvailabilitySlotsProps,
} from "./CoachAvailabilitySlots.types";

function statusLabel(
  status: CoachAvailabilitySlot["status"],
  availableLabel: string,
  unavailableLabel: string,
) {
  return status === "available" ? availableLabel : unavailableLabel;
}

export function CoachAvailabilitySlots({
  title,
  days,
  availableLabel,
  unavailableLabel,
  seeAllLabel,
  onSeeAll,
  seeAllHref,
  onSlotPress,
  selectedSlotId,
  className,
  cardClassName,
  slotButtonProps,
  ...props
}: CoachAvailabilitySlotsProps) {
  const slots = coachAvailabilitySlotsVariants();
  const showSeeAll = seeAllLabel != null && (onSeeAll != null || seeAllHref);

  return (
    <section className={slots.root({ className })}>
      <div className={slots.header()}>
        <Typography className={slots.title()} type="body">
          {title}
        </Typography>
        {showSeeAll ? (
          <Link
            className={slots.seeAll()}
            href={seeAllHref}
            onPress={onSeeAll}
          >
            {seeAllLabel}
          </Link>
        ) : null}
      </div>

      <Card
        className={slots.card({ className: cardClassName })}
        variant="transparent"
        {...props}
      >
        <Card.Content className={slots.content()}>
          {days.map((day) => (
            <DayRow
              availableLabel={availableLabel}
              day={day}
              key={day.id}
              onSlotPress={onSlotPress}
              selectedSlotId={selectedSlotId}
              slotButtonProps={slotButtonProps}
              slots={slots}
              unavailableLabel={unavailableLabel}
            />
          ))}
        </Card.Content>
      </Card>
    </section>
  );
}

function DayRow({
  day,
  availableLabel,
  unavailableLabel,
  onSlotPress,
  selectedSlotId,
  slotButtonProps,
  slots,
}: {
  day: CoachAvailabilityDay;
  availableLabel: string;
  unavailableLabel: string;
  onSlotPress?: CoachAvailabilitySlotsProps["onSlotPress"];
  selectedSlotId?: string;
  slotButtonProps?: CoachAvailabilitySlotsProps["slotButtonProps"];
  slots: ReturnType<typeof coachAvailabilitySlotsVariants>;
}) {
  return (
    <div className={slots.day()}>
      <Typography className={slots.dayLabel()} weight="bold">
        {day.label}
      </Typography>
      <div aria-label={day.label} className={slots.slotsRow()}>
        {day.slots.map((slot) => {
          const isUnavailable = slot.status === "unavailable";
          const isSelected = !isUnavailable && selectedSlotId === slot.id;
          const label = statusLabel(
            slot.status,
            availableLabel,
            unavailableLabel,
          );

          return (
            <Button
              aria-disabled={isUnavailable || undefined}
              aria-label={`${slot.timeLabel}, ${label}`}
              aria-pressed={isUnavailable ? undefined : isSelected}
              className={slots.slot({
                status: slot.status,
                selected: isSelected,
              })}
              isDisabled={isUnavailable}
              key={slot.id}
              variant="ghost"
              {...slotButtonProps}
              onPress={() => {
                if (isUnavailable) return;
                onSlotPress?.(slot, day);
              }}
            >
              <span
                className={slots.slotTime({
                  status: slot.status,
                  selected: isSelected,
                })}
              >
                {slot.timeLabel}
              </span>
              <span
                className={slots.slotStatus({
                  status: slot.status,
                  selected: isSelected,
                })}
              >
                {label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

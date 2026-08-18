"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Check } from "@repo/icons/Check";
import { Clock } from "@repo/icons/Clock";
import { UsersTwo } from "@repo/icons/UsersTwo";
import { ReservationDayChip } from "@repo/ui/kit/ReservationDayChip";
import { useTranslations } from "next-intl";
import {
  discoveryClubsReserveTimeStepSectionVariants as styles,
  getSlotCapacityClassName,
} from "./DiscoveryClubsReserveTimeStepSection.styles";
import type { DiscoveryClubsReserveTimeStepSectionProps } from "./DiscoveryClubsReserveTimeStepSection.types";

const SLOT_ICON_SIZE = 20;

export function DiscoveryClubsReserveTimeStepSection({
  days,
  activeDayId,
  activeDay,
  onDayPress,
  slots,
  selectedSlotId,
  onSlotPress,
}: DiscoveryClubsReserveTimeStepSectionProps) {
  const t = useTranslations("ReserveFlow");
  const slotsStyles = styles();

  return (
    <>
      <section className={slotsStyles.section()}>
        <div className={slotsStyles.sectionHeader()}>
          <Typography
            className={slotsStyles.sectionTitle()}
            type="h4"
            weight="semibold"
          >
            {t("daysLabel")}
          </Typography>
        </div>
        <div
          aria-label={t("daysLabel")}
          className={slotsStyles.days()}
          role="group"
        >
          {days.map((day) => (
            <ReservationDayChip
              availability={day.availability}
              dateLabel={day.dateLabel}
              key={day.id}
              onPress={() => onDayPress(day.id)}
              selected={activeDayId === day.id}
              statusLabel={t(`dayAvailability.${day.availability}`)}
            />
          ))}
        </div>
      </section>

      <section className={slotsStyles.section()}>
        <div className={slotsStyles.sectionHeader()}>
          <Typography
            className={slotsStyles.sectionTitle()}
            type="h4"
            weight="semibold"
          >
            {t("slotsTitle")}
          </Typography>
          {activeDay ? (
            <Typography className={slotsStyles.sectionHint()} type="body-xs">
              {activeDay.weekdayLabel}
            </Typography>
          ) : null}
        </div>
        <div className={slotsStyles.slotsGrid()}>
          {slots.length > 0 ? (
            slots.map((slot) => {
              const selected = selectedSlotId === slot.id;
              return (
                <Button
                  className={[
                    slotsStyles.slot(),
                    selected ? slotsStyles.slotSelected() : "",
                    slot.state === "full" ? slotsStyles.slotDisabled() : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  isDisabled={slot.state === "full"}
                  key={slot.id}
                  onPress={() => onSlotPress(slot.id)}
                  size="lg"
                  variant="ghost"
                >
                  <span
                    aria-hidden
                    className={[
                      slotsStyles.slotIconWrap(),
                      selected ? slotsStyles.slotIconWrapSelected() : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <Clock size={SLOT_ICON_SIZE} />
                  </span>
                  <span className={slotsStyles.slotBody()}>
                    <Typography
                      className={slotsStyles.slotTime()}
                      type="body"
                      weight="semibold"
                    >
                      {slot.timeLabel}
                    </Typography>
                    <Typography
                      className={[
                        getSlotCapacityClassName(slot.state, slotsStyles),
                        "inline-flex items-center gap-1",
                      ].join(" ")}
                      type="body-sm"
                    >
                      <UsersTwo aria-hidden size={14} />
                      {slot.capacityLabel}
                    </Typography>
                  </span>
                  {selected ? (
                    <Check
                      aria-hidden
                      className={slotsStyles.slotCheck()}
                      size={18}
                    />
                  ) : null}
                </Button>
              );
            })
          ) : (
            <div className={slotsStyles.empty()}>
              <Typography className={slotsStyles.emptyBody()} type="body-sm">
                {t("emptySlots")}
              </Typography>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

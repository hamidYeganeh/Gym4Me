"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { MapPin1 } from "@repo/icons/MapPin1";
import { Video } from "@repo/icons/Video";
import { CoachAvailabilitySlots } from "@repo/ui/cards/CoachAvailabilitySlots";
import { CoachConsultationType } from "@repo/ui/cards/CoachConsultationType";
import { useTranslations } from "next-intl";
import { formatJalaliRangeLabel } from "../../lib/club-calendar-data";
import { discoveryCoachesReserveTimeStepSectionVariants as styles } from "./DiscoveryCoachesReserveTimeStepSection.styles";
import type { DiscoveryCoachesReserveTimeStepSectionProps } from "./DiscoveryCoachesReserveTimeStepSection.types";

export function DiscoveryCoachesReserveTimeStepSection({
  consultationOptions,
  selectedConsultation,
  onConsultationPress,
  range,
  onPrevWeek,
  onNextWeek,
  week,
  availabilityDays,
  selectedSlotId,
  onSlotPress,
  selectedSlot,
}: DiscoveryCoachesReserveTimeStepSectionProps) {
  const t = useTranslations("CoachReserve");
  const slots = styles();

  return (
    <>
      {consultationOptions.length > 0 ? (
        <CoachConsultationType
          onOptionPress={(option) => onConsultationPress(option.id)}
          options={consultationOptions.map((option) => ({
            id: option.id,
            kind: option.kind,
            title: t(
              option.kind === "remote"
                ? "consultationRemote"
                : "consultationInPerson",
            ),
            status: option.status,
            statusLabel: t(
              option.status === "available"
                ? "consultationAvailable"
                : "consultationUnavailable",
            ),
            price: option.price.toLocaleString("fa-IR"),
            priceSuffix: t("priceSuffix"),
          }))}
          selectedId={selectedConsultation?.id}
          title={t("consultationTitle")}
        />
      ) : null}

      <div className={slots.weekRow()}>
        <Typography className={slots.weekLabel()} weight="bold">
          {formatJalaliRangeLabel(range.from, range.to)}
        </Typography>
        <div className={slots.weekNav()}>
          <Button
            aria-label={t("prevWeek")}
            className={slots.weekButton()}
            isIconOnly
            onPress={onPrevWeek}
            size="lg"
          >
            <ChevronRight
              aria-hidden
              className={slots.weekButtonIcon()}
              rtlMirror={false}
              size={18}
            />
          </Button>
          <Button
            aria-label={t("nextWeek")}
            className={slots.weekButton()}
            isIconOnly
            onPress={onNextWeek}
            size="lg"
          >
            <ChevronLeft
              aria-hidden
              className={slots.weekButtonIcon()}
              rtlMirror={false}
              size={18}
            />
          </Button>
        </div>
      </div>

      {availabilityDays.length > 0 ? (
        <CoachAvailabilitySlots
          availableLabel={t("slotAvailable")}
          days={availabilityDays}
          onSlotPress={(slot) => onSlotPress(slot.id)}
          selectedSlotId={selectedSlotId}
          title={t("slotsTitle")}
          unavailableLabel={t("slotUnavailable")}
        />
      ) : (
        <div className={slots.emptySlots()}>
          <Typography type="body-sm">
            {week.isLoading ? t("slotsLoading") : t("slotsEmpty")}
          </Typography>
        </div>
      )}

      {selectedConsultation?.kind === "remote" ? (
        <div className={slots.remoteHint()}>
          <Typography type="body-sm">
            <Video aria-hidden className="me-1 inline" size={16} />
            {t("remoteHint")}
          </Typography>
        </div>
      ) : selectedSlot?.clubName ? (
        <div className={slots.locationCard()}>
          <Typography
            className={slots.locationTitle()}
            type="body"
            weight="semibold"
          >
            <MapPin1 aria-hidden className="me-1 inline" size={16} />
            {t("locationTitle", { club: selectedSlot.clubName })}
          </Typography>
          {selectedSlot.clubAddress ? (
            <Typography className={slots.locationAddress()} type="body-sm">
              {selectedSlot.clubAddress}
            </Typography>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

"use client";

import { Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import { discoveryClubsReserveReviewStepSectionVariants as styles } from "./DiscoveryClubsReserveReviewStepSection.styles";
import type { DiscoveryClubsReserveReviewStepSectionProps } from "./DiscoveryClubsReserveReviewStepSection.types";

export function DiscoveryClubsReserveReviewStepSection({
  clubTitle,
  activeDay,
  selectedSlot,
  selectedPlan,
  getPlanPrice,
}: DiscoveryClubsReserveReviewStepSectionProps) {
  const t = useTranslations("ReserveFlow");
  const slots = styles();

  return (
    <section className={slots.section()}>
      <Typography className={slots.sectionTitle()} type="h4" weight="semibold">
        {t("summaryTitle")}
      </Typography>
      <div className={slots.summaryCard()}>
        <div className={slots.summaryRow()}>
          <Typography className={slots.summaryLabel()} type="body-sm">
            {t("summaryClub")}
          </Typography>
          <Typography
            className={slots.summaryValue()}
            type="body"
            weight="medium"
          >
            {clubTitle || t("notSelected")}
          </Typography>
        </div>
        <div className={slots.summaryRow()}>
          <Typography className={slots.summaryLabel()} type="body-sm">
            {t("summaryDay")}
          </Typography>
          <Typography
            className={slots.summaryValue()}
            type="body"
            weight="medium"
          >
            {activeDay
              ? `${activeDay.weekdayLabel} ${activeDay.dayLabel}`
              : t("notSelected")}
          </Typography>
        </div>
        <div className={slots.summaryRow()}>
          <Typography className={slots.summaryLabel()} type="body-sm">
            {t("summarySlot")}
          </Typography>
          <Typography
            className={slots.summaryValue()}
            type="body"
            weight="medium"
          >
            {selectedSlot?.timeLabel ?? t("notSelected")}
          </Typography>
        </div>
        <div className={slots.summaryRow()}>
          <Typography className={slots.summaryLabel()} type="body-sm">
            {t("summaryPlan")}
          </Typography>
          <Typography
            className={slots.summaryValue()}
            type="body"
            weight="medium"
          >
            {selectedPlan?.title ?? t("notSelected")}
          </Typography>
        </div>
        <div className={`${slots.summaryRow()} ${slots.summaryTotalRow()}`}>
          <Typography className={slots.summaryLabel()} type="body-sm">
            {t("summaryTotal")}
          </Typography>
          <Typography
            className={slots.summaryTotalValue()}
            type="h4"
            weight="bold"
          >
            {selectedPlan
              ? `${getPlanPrice(selectedPlan).toLocaleString("en-US")} ${selectedPlan.priceSuffix ?? ""}`.trim()
              : t("notSelected")}
          </Typography>
        </div>
      </div>
    </section>
  );
}

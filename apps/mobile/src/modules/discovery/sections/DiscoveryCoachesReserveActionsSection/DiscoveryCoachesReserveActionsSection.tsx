"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ArrowForward2 } from "@repo/icons/ArrowForward2";
import { StickyBottomActions } from "@repo/ui/kit/StickyBottomActions";
import NumberFlow from "@number-flow/react";
import { useTranslations } from "next-intl";
import { discoveryCoachesReserveActionsSectionVariants as styles } from "./DiscoveryCoachesReserveActionsSection.styles";
import type { DiscoveryCoachesReserveActionsSectionProps } from "./DiscoveryCoachesReserveActionsSection.types";

export function DiscoveryCoachesReserveActionsSection({
  price,
  ctaLabel,
  canGoNext,
  isSubmitting,
  step,
  hasSelectedSlot,
  onNext,
}: DiscoveryCoachesReserveActionsSectionProps) {
  const t = useTranslations("CoachReserve");
  const slots = styles();

  return (
    <StickyBottomActions contentClassName={slots.footerRow()}>
      <div className={slots.priceGroup()}>
        <Typography className={slots.priceLabel()} type="body-xs">
          {t("totalLabel")}
        </Typography>
        <div className={slots.priceRow()}>
          <NumberFlow
            className={slots.price()}
            format={{ useGrouping: true }}
            locales="fa-IR"
            value={price}
          />
          <span className={slots.priceSuffix()}>{t("priceSuffix")}</span>
        </div>
      </div>

      <Button
        aria-label={ctaLabel}
        className={slots.confirm()}
        isDisabled={!canGoNext || (step === 2 && !hasSelectedSlot)}
        isPending={isSubmitting}
        onPress={onNext}
        size="lg"
        variant="primary"
      >
        <Typography
          className={slots.confirmLabel()}
          type="body"
          weight="semibold"
        >
          {ctaLabel}
        </Typography>
        <ArrowForward2 aria-hidden size={18} />
      </Button>
    </StickyBottomActions>
  );
}

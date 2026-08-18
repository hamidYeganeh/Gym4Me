"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ArrowForward2 } from "@repo/icons/ArrowForward2";
import { StickyBottomActions } from "@repo/ui/kit/StickyBottomActions";
import NumberFlow from "@number-flow/react";
import { useTranslations } from "next-intl";
import { discoveryClubsReserveActionsSectionVariants as styles } from "./DiscoveryClubsReserveActionsSection.styles";
import type { DiscoveryClubsReserveActionsSectionProps } from "./DiscoveryClubsReserveActionsSection.types";

export function DiscoveryClubsReserveActionsSection({
  displayPrice,
  priceSuffix,
  selectedPlan,
  ctaLabel,
  canGoNext,
  isSubmitting,
  step,
  hasSelectedSlot,
  hasSelectedPlan,
  submitError,
  onNext,
}: DiscoveryClubsReserveActionsSectionProps) {
  const t = useTranslations("ReserveFlow");
  const slots = styles();

  return (
    <StickyBottomActions contentClassName={slots.footerRow()}>
      {submitError ? (
        <Typography className={slots.errorText()} type="body-sm">
          {submitError}
        </Typography>
      ) : null}
      <div className={slots.priceGroup()}>
        <Typography className={slots.priceLabel()} type="body-xs">
          {selectedPlan ? t("totalLabel") : t("selectPlanHint")}
        </Typography>
        <div className={slots.priceRow()}>
          {selectedPlan ? (
            <span className={slots.pricePrefix()}>{t("pricePrefix")}</span>
          ) : null}
          <NumberFlow
            className={slots.price()}
            format={{ useGrouping: true }}
            locales="en-US"
            style={{ color: "var(--foreground)" }}
            value={displayPrice}
          />
          {selectedPlan || displayPrice > 0 ? (
            <span className={slots.priceSuffix()}>{priceSuffix}</span>
          ) : null}
        </div>
      </div>

      <Button
        aria-label={ctaLabel}
        className={slots.confirm()}
        isDisabled={step < 2 ? !canGoNext : !hasSelectedSlot || !hasSelectedPlan}
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
        <ArrowForward2 aria-hidden className={slots.confirmIcon()} size={18} />
      </Button>
    </StickyBottomActions>
  );
}

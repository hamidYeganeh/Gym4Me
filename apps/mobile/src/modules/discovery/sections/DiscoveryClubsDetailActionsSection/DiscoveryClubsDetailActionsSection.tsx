"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ArrowForward2 } from "@repo/icons/ArrowForward2";
import { StickyBottomActions } from "@repo/ui/kit/StickyBottomActions";
import NumberFlow from "@number-flow/react";
import { useTranslations } from "next-intl";
import { discoveryClubsDetailActionsSectionStyles as styles } from "./DiscoveryClubsDetailActionsSection.styles";
import type { DiscoveryClubsDetailActionsSectionProps } from "./DiscoveryClubsDetailActionsSection.types";

export function DiscoveryClubsDetailActionsSection({
  pricePrefix,
  price,
  priceSuffix,
  ctaLabel,
  pending = false,
  onReserve,
}: DiscoveryClubsDetailActionsSectionProps) {
  const t = useTranslations("ClubDetail");

  return (
    <StickyBottomActions contentClassName={styles.row}>
      <div className={styles.priceGroup}>
        <Typography className={styles.priceLabel} type="body-xs">
          {t("totalLabel")}
        </Typography>
        <div className={styles.priceRow}>
          {pricePrefix ? (
            <span className={styles.pricePrefix}>{pricePrefix}</span>
          ) : null}
          <NumberFlow
            className={styles.price}
            format={{ useGrouping: true }}
            locales="en-US"
            style={{ color: "var(--foreground)" }}
            value={price}
          />
          {priceSuffix ? (
            <span className={styles.priceSuffix}>{priceSuffix}</span>
          ) : null}
        </div>
      </div>

      <Button
        aria-label={ctaLabel ?? t("confirmBooking")}
        className={styles.confirm}
        isDisabled={pending}
        onPress={onReserve}
        size="lg"
        variant="primary"
      >
        <Typography
          className={styles.confirmLabel}
          type="body"
          weight="semibold"
        >
          {ctaLabel ?? t("confirmBooking")}
        </Typography>
        <ArrowForward2 aria-hidden className={styles.confirmIcon} size={18} />
      </Button>
    </StickyBottomActions>
  );
}

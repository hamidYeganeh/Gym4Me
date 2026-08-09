"use client";

import { Button, Typography } from "@heroui/react";
import { ArrowForward2 } from "@repo/icons/ArrowForward2";
import { StickyBottomActions } from "@repo/ui/kit/StickyBottomActions";
import NumberFlow from "@number-flow/react";
import { useTranslations } from "next-intl";
import { discoveryCoachesDetailActionsSectionStyles as styles } from "./DiscoveryCoachesDetailActionsSection.styles";
import type { DiscoveryCoachesDetailActionsSectionProps } from "./DiscoveryCoachesDetailActionsSection.types";

export function DiscoveryCoachesDetailActionsSection({
  pricePrefix,
  price,
  priceSuffix,
  onBook,
}: DiscoveryCoachesDetailActionsSectionProps) {
  const t = useTranslations("CoachDetail");

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
          {price > 0 ? (
            <NumberFlow
              className={styles.price}
              format={{ useGrouping: true }}
              locales="en-US"
              style={{ color: "var(--foreground)" }}
              value={price}
            />
          ) : (
            <Typography className={styles.price} type="body" weight="semibold">
              {t("packageTrial")}
            </Typography>
          )}
          {price > 0 && priceSuffix ? (
            <span className={styles.priceSuffix}>{priceSuffix}</span>
          ) : null}
        </div>
      </div>

      <Button
        aria-label={t("confirmBooking")}
        className={styles.confirm}
        onPress={onBook}
        size="lg"
        variant="primary"
      >
        <Typography
          className={styles.confirmLabel}
          type="body"
          weight="semibold"
        >
          {t("confirmBooking")}
        </Typography>
        <ArrowForward2 aria-hidden className={styles.confirmIcon} size={18} />
      </Button>
    </StickyBottomActions>
  );
}

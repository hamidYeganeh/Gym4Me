"use client";

import { Button, Typography } from "@heroui/react";
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
        aria-label={t("confirmBooking")}
        className={styles.confirm}
        onPress={onReserve}
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

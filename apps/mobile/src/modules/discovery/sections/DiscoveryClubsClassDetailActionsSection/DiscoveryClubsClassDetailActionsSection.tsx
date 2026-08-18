"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ArrowForward2 } from "@repo/icons/ArrowForward2";
import { StickyBottomActions } from "@repo/ui/kit/StickyBottomActions";
import NumberFlow from "@number-flow/react";
import { useTranslations } from "next-intl";
import { discoveryClubsClassDetailActionsSectionStyles as styles } from "./DiscoveryClubsClassDetailActionsSection.styles";
import type { DiscoveryClubsClassDetailActionsSectionProps } from "./DiscoveryClubsClassDetailActionsSection.types";

export function DiscoveryClubsClassDetailActionsSection({
  classDetail,
  onBook,
}: DiscoveryClubsClassDetailActionsSectionProps) {
  const t = useTranslations("ClubClassDetail");
  const price = classDetail.enrollment.price;
  const priceSuffix = classDetail.enrollment.priceSuffix ?? "تومان";

  return (
    <StickyBottomActions contentClassName={styles.row}>
      <div className={styles.priceGroup}>
        <Typography className={styles.priceLabel} type="body-xs">
          {t("totalLabel")}
        </Typography>
        <div className={styles.priceRow}>
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
              —
            </Typography>
          )}
          {price > 0 ? (
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

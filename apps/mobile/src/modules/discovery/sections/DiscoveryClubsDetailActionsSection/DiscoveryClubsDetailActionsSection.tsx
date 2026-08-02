"use client";

import { Button } from "@heroui/react";
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
    <div className={styles.root}>
      <div className={styles.row}>
        <div className={styles.priceGroup}>
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
        <Button onPress={onReserve} size="lg" variant="primary">
          {t("reserve")}
        </Button>
      </div>
    </div>
  );
}

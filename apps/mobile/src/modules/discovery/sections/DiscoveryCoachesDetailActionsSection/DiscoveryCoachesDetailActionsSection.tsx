"use client";

import { Button, Typography } from "@heroui/react";
import { Plus } from "@repo/icons/Plus";
import { ProgressiveBlur } from "@repo/ui/kit/ProgressiveBlur";
import { useTranslations } from "next-intl";
import { discoveryCoachesDetailActionsSectionStyles as styles } from "./DiscoveryCoachesDetailActionsSection.styles";
import type { DiscoveryCoachesDetailActionsSectionProps } from "./DiscoveryCoachesDetailActionsSection.types";

export function DiscoveryCoachesDetailActionsSection({
  onBook,
  onSecondary,
}: DiscoveryCoachesDetailActionsSectionProps) {
  const t = useTranslations("CoachDetail");

  return (
    <div className={styles.root}>
      <ProgressiveBlur
        blurIntensity={0.85}
        blurLayers={12}
        className={styles.blur}
        direction="bottom"
      />

      <div className={styles.stack}>
        <Button
          aria-label={t("bookSession")}
          className={styles.primary}
          onPress={onBook}
          size="lg"
          variant="primary"
        >
          <Plus aria-hidden size={18} />
          <Typography
            className={styles.confirmLabel}
            type="body"
            weight="semibold"
          >
            {t("bookSession")}
          </Typography>
        </Button>
        <Button
          aria-label={t("consultAvailability")}
          className={styles.secondary}
          onPress={onSecondary}
          size="lg"
          variant="outline"
        >
          <Typography
            className={styles.confirmLabel}
            type="body"
            weight="semibold"
          >
            {t("consultAvailability")}
          </Typography>
        </Button>
      </div>
    </div>
  );
}

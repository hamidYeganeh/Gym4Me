"use client";

import { Button, Typography } from "@heroui/react";
import { ArrowForward2 } from "@repo/icons/ArrowForward2";
import { useTranslations } from "next-intl";
import { discoveryCoachesDetailActionsSectionStyles as styles } from "./DiscoveryCoachesDetailActionsSection.styles";
import type { DiscoveryCoachesDetailActionsSectionProps } from "./DiscoveryCoachesDetailActionsSection.types";

export function DiscoveryCoachesDetailActionsSection({
  onBook,
}: DiscoveryCoachesDetailActionsSectionProps) {
  const t = useTranslations("CoachDetail");

  return (
    <div className={styles.root}>
      <div className={styles.pill}>
        <Button
          aria-label={t("bookSession")}
          className={styles.action}
          onPress={onBook}
          size="lg"
          variant="ghost"
        >
          <Typography
            className={styles.actionLabel}
            type="body"
            weight="semibold"
          >
            {t("bookSession")}
          </Typography>
          <ArrowForward2 aria-hidden className="text-background" size={18} />
        </Button>
        <span aria-hidden className={styles.accent} />
      </div>
    </div>
  );
}

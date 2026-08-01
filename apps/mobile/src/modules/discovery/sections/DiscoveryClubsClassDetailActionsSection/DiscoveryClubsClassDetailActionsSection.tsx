"use client";

import { Button } from "@heroui/react";
import { CancerRibbon } from "@repo/icons/CancerRibbon";
import { Plus } from "@repo/icons/Plus";
import { useTranslations } from "next-intl";
import { discoveryClubsClassDetailActionsSectionStyles as styles } from "./DiscoveryClubsClassDetailActionsSection.styles";
import type { DiscoveryClubsClassDetailActionsSectionProps } from "./DiscoveryClubsClassDetailActionsSection.types";

export function DiscoveryClubsClassDetailActionsSection({
  onBook,
  onConsult,
}: DiscoveryClubsClassDetailActionsSectionProps) {
  const t = useTranslations("ClubClassDetail");

  return (
    <div className={styles.root}>
      <div className={styles.stack}>
        <Button
          className={styles.primary}
          onPress={onBook}
          size="lg"
          variant="primary"
        >
          {t("bookClass")}
          <Plus size={18} />
        </Button>
        <Button
          className={styles.secondary}
          onPress={onConsult}
          size="lg"
          variant="outline"
        >
          <CancerRibbon size={18} />
          {t("consultCoach")}
        </Button>
      </div>
    </div>
  );
}

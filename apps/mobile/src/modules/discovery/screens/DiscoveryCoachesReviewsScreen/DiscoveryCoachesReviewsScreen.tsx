"use client";

import { Button, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { DiscoveryCoachesDetailReviewsSection } from "../../sections/DiscoveryCoachesDetailReviewsSection";
import { discoveryCoachesReviewsScreenStyles as styles } from "./DiscoveryCoachesReviewsScreen.styles";
import type { DiscoveryCoachesReviewsScreenProps } from "./DiscoveryCoachesReviewsScreen.types";

export function DiscoveryCoachesReviewsScreen({
  coach,
}: DiscoveryCoachesReviewsScreenProps) {
  const t = useTranslations("CoachDetail");
  const router = useRouter();

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Button
          aria-label={t("back")}
          isIconOnly
          onPress={() => router.back()}
          size="lg"
          variant="secondary"
        >
          <ChevronLeft size={20} />
        </Button>
        <Typography className={styles.title} type="h4" weight="semibold">
          {t("reviewsPageTitle")}
        </Typography>
      </header>

      <div className={styles.body}>
        <DiscoveryCoachesDetailReviewsSection coach={coach} />
      </div>
    </div>
  );
}

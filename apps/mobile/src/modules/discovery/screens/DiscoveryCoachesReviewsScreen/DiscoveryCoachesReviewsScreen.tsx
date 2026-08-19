"use client";

import { Button } from "@heroui/react/button";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
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
    <AppLayout
      className={styles.root}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("reviewsPageTitle")}
        />
      }
    >
      <div className={styles.body}>
        <DiscoveryCoachesDetailReviewsSection coach={coach} />
      </div>
    </AppLayout>
  );
}

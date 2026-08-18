"use client";

import { Button } from "@heroui/react/button";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
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
        <Header
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
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

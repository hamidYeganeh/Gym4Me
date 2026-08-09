"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRequireAuthAction } from "@/shared/hooks/useRequireAuthAction";
import { DiscoveryCoachesDetailActionsSection } from "../../sections/DiscoveryCoachesDetailActionsSection";
import { DiscoveryCoachesDetailBodySection } from "../../sections/DiscoveryCoachesDetailBodySection";
import { DiscoveryCoachesDetailHeroSection } from "../../sections/DiscoveryCoachesDetailHeroSection";
import { discoveryCoachesDetailScreenStyles as styles } from "./DiscoveryCoachesDetailScreen.styles";
import type { DiscoveryCoachesDetailScreenProps } from "./DiscoveryCoachesDetailScreen.types";

export function DiscoveryCoachesDetailScreen({
  coach,
}: DiscoveryCoachesDetailScreenProps) {
  const t = useTranslations("CoachDetail");
  const pathname = usePathname();
  const { runWithAuth } = useRequireAuthAction();
  const defaultPackageId =
    coach.packages.find((plan) => plan.price > 0)?.id ??
    coach.packages[0]?.id ??
    "";
  const [selectedPackageId, setSelectedPackageId] = useState(defaultPackageId);

  const selectedPackage =
    coach.packages.find((plan) => plan.id === selectedPackageId) ??
    coach.packages[0];

  const priceSuffix =
    selectedPackage?.planNameKey === "packageMonthly"
      ? t("packagePriceSuffixMonthly")
      : selectedPackage?.planNameKey === "packageTrial"
        ? ""
        : coach.priceSuffix || t("packagePriceSuffix");

  return (
    <div className={styles.root}>
      <div className={styles.scroll}>
        <DiscoveryCoachesDetailHeroSection coach={coach}>
          <DiscoveryCoachesDetailBodySection
            coach={coach}
            onPackageChange={setSelectedPackageId}
            selectedPackageId={selectedPackageId}
          />
        </DiscoveryCoachesDetailHeroSection>
      </div>
      <DiscoveryCoachesDetailActionsSection
        onBook={() => runWithAuth(() => undefined, pathname)}
        price={selectedPackage?.price ?? 0}
        pricePrefix={selectedPackage ? coach.pricePrefix : undefined}
        priceSuffix={selectedPackage ? priceSuffix : undefined}
      />
    </div>
  );
}

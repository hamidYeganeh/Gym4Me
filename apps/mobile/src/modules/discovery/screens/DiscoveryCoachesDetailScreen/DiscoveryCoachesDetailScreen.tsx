"use client";

import { Tabs } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { DiscoveryCoachesDetailActionsSection } from "../../sections/DiscoveryCoachesDetailActionsSection";
import { DiscoveryCoachesDetailBodySection } from "../../sections/DiscoveryCoachesDetailBodySection";
import { DiscoveryCoachesDetailHeroSection } from "../../sections/DiscoveryCoachesDetailHeroSection";
import { DiscoveryCoachesDetailReviewsSection } from "../../sections/DiscoveryCoachesDetailReviewsSection";
import { discoveryCoachesDetailScreenStyles as styles } from "./DiscoveryCoachesDetailScreen.styles";
import type { DiscoveryCoachesDetailScreenProps } from "./DiscoveryCoachesDetailScreen.types";

export function DiscoveryCoachesDetailScreen({
  coach,
}: DiscoveryCoachesDetailScreenProps) {
  const t = useTranslations("CoachDetail");
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
        <DiscoveryCoachesDetailHeroSection coach={coach} />

        <div className={styles.tabsWrap}>
          <Tabs className={styles.tabs} defaultSelectedKey="overview">
            <Tabs.ListContainer className={styles.tabsListContainer}>
              <Tabs.List aria-label={t("tabsLabel")} className={styles.tabsList}>
                <Tabs.Tab id="overview">
                  {t("tabOverview")}
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="review">
                  {t("tabReview")}
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>

            <Tabs.Panel className={styles.panel} id="overview">
              <DiscoveryCoachesDetailBodySection
                coach={coach}
                onPackageChange={setSelectedPackageId}
                selectedPackageId={selectedPackageId}
              />
            </Tabs.Panel>

            <Tabs.Panel className={styles.panel} id="review">
              <DiscoveryCoachesDetailReviewsSection coach={coach} />
            </Tabs.Panel>
          </Tabs>
        </div>
      </div>

      <DiscoveryCoachesDetailActionsSection
        price={selectedPackage?.price ?? 0}
        pricePrefix={selectedPackage ? coach.pricePrefix : undefined}
        priceSuffix={selectedPackage ? priceSuffix : undefined}
      />
    </div>
  );
}

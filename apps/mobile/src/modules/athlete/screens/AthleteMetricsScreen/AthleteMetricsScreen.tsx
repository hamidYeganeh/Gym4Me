"use client";

import { Button } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useHealthMetricsConnect } from "@/lib/health";
import { AthleteMetricsConnectSection } from "../../sections/AthleteMetricsConnectSection";
import { AthleteMetricsIntroSection } from "../../sections/AthleteMetricsIntroSection";
import { AthleteMetricsListSection } from "../../sections/AthleteMetricsListSection";
import { AthleteMetricsPrivacySection } from "../../sections/AthleteMetricsPrivacySection";
import { athleteMetricsScreenStyles as styles } from "./AthleteMetricsScreen.styles";
import type { AthleteMetricsScreenProps } from "./AthleteMetricsScreen.types";

export function AthleteMetricsScreen({
  metrics,
  promoImage,
}: AthleteMetricsScreenProps) {
  const t = useTranslations("FitnessMetrics");
  const router = useRouter();
  const health = useHealthMetricsConnect();

  return (
    <AppLayout
      className={styles.root}
      header={
        <Header
          className="border-b-0 bg-background"
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
        />
      }
    >
      <div className={styles.content}>
        <AthleteMetricsIntroSection
          promoAction={t("promoAction")}
          promoImage={promoImage}
          promoImageAlt={t("promoImageAlt")}
          promoTitle={t("promoTitle")}
          subtitle={t("subtitle")}
          title={t("title")}
        />

        <AthleteMetricsConnectSection
          actionLabel={
            health.isConnected ? t("connectAgain") : t("connectAction")
          }
          connectedLabel={t("connectConnected")}
          connectingLabel={t("connectConnecting")}
          deniedLabel={t("connectDenied")}
          errorLabel={t("connectError")}
          onConnect={() => {
            void health.connect();
          }}
          onOpenSettings={
            health.platform === "android"
              ? () => {
                  void health.openSettings();
                }
              : undefined
          }
          settingsLabel={t("connectSettings")}
          status={health.status}
          subtitle={t("connectSubtitle")}
          title={t("connectTitle")}
          unsupportedLabel={t("connectUnsupported")}
        />

        <AthleteMetricsListSection
          labels={{
            periodLabel: t("periodLabel"),
            heartRateTitle: t("heartRateTitle"),
            heartRateStatus: t("heartRateStatus"),
            heartRateUnit: t("heartRateUnit"),
            heartRateValue: t("heartRateValue"),
            weightTitle: t("weightTitle"),
            weightStatus: t("weightStatus"),
            weightUnit: t("weightUnit"),
            weightValue: t("weightValue"),
            hydrationTitle: t("hydrationTitle"),
            hydrationStatus: t("hydrationStatus"),
            hydrationUnit: t("hydrationUnit"),
            hydrationValue: t("hydrationValue"),
            bloodPressureTitle: t("bloodPressureTitle"),
            bloodPressureStatus: t("bloodPressureStatus"),
            bloodPressureUnit: t("bloodPressureUnit"),
            bloodPressureValue: t("bloodPressureValue"),
            sleepTitle: t("sleepTitle"),
            sleepStatus: t("sleepStatus"),
            sleepUnit: t("sleepUnit"),
            sleepValue: t("sleepValue"),
            nutritionTitle: t("nutritionTitle"),
            nutritionStatus: t("nutritionStatus"),
            nutritionUnit: t("nutritionUnit"),
            nutritionValue: t("nutritionValue"),
            moodTitle: t("moodTitle"),
            moodStatus: t("moodStatus"),
            moodValue: t("moodValue"),
            stepsTitle: t("stepsTitle"),
            stepsStatus: t("stepsStatus"),
            stepsUnit: t("stepsUnit"),
            stepsValue: t("stepsValue"),
          }}
          metrics={metrics}
          onMetricPress={(href) => router.push(href)}
          onViewPress={() => router.push("/athlete/metrics/reorder")}
          sectionTitle={t("allMetrics")}
          viewAriaLabel={t("listViewLabel")}
          viewLabel={t("listView")}
        />

        <AthleteMetricsPrivacySection message={t("privacy")} />
      </div>
    </AppLayout>
  );
}

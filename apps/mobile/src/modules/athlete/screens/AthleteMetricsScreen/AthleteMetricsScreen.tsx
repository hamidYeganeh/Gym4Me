"use client";

import { Button } from "@heroui/react/button";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useHealthMetricsConnect, resolveHealthProvider, upsertConnectedHealthState } from "@/shared/lib/health";
import { useFeatureFlag } from "@/shared/providers/AppConfigProvider";
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
  const selfTrackingEnabled = useFeatureFlag("athlete.self_tracking");
  const deviceSyncEnabled = useFeatureFlag("health.device_sync");

  return (
    <AppLayout
      className={styles.root}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
        />
      }
    >
      <div className={styles.content}>
        <AthleteMetricsIntroSection
          promoAction={t("promoAction")}
          promoImage={promoImage}
          promoImageAlt={t("promoImageAlt")}
          promoTitle={t("promoTitle")}
          onPromoAction={
            selfTrackingEnabled
              ? () => router.push("/athlete/metrics/log")
              : undefined
          }
          subtitle={t("subtitle")}
          title={t("title")}
        />

        {deviceSyncEnabled ? (
          <>
            <AthleteMetricsConnectSection
              actionLabel={
                health.isConnected ? t("connectAgain") : t("connectAction")
              }
              connectedLabel={t("connectConnected")}
              connectingLabel={t("connectConnecting")}
              deniedLabel={t("connectDenied")}
              errorLabel={t("connectError")}
              onConnect={() => {
                void (async () => {
                  const result = await health.connect();
                  if (result.ok && result.status === "connected") {
                    const provider = resolveHealthProvider(result.platform);
                    if (provider) {
                      await upsertConnectedHealthState({
                        provider,
                        authorization: result.authorization,
                        lastSyncAt: new Date().toISOString(),
                      });
                    }
                  }
                })();
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
            <div className="flex flex-wrap gap-2 px-0">
              <Button
                onPress={() => router.push("/athlete/health-sync")}
                size="sm"
                variant="secondary"
              >
                مدیریت همگام‌سازی
              </Button>
              <Button
                onPress={() => router.push("/athlete/goals")}
                size="sm"
                variant="tertiary"
              >
                اهداف و یادآوری
              </Button>
              <Button
                onPress={() => router.push("/athlete/data-rights")}
                size="sm"
                variant="tertiary"
              >
                حقوق داده
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              onPress={() => router.push("/athlete/goals")}
              size="sm"
              variant="tertiary"
            >
              اهداف و یادآوری
            </Button>
            <Button
              onPress={() => router.push("/athlete/data-rights")}
              size="sm"
              variant="tertiary"
            >
              حقوق داده
            </Button>
          </div>
        )}

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

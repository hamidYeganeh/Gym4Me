"use client";

import { Button } from "@heroui/react/button";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReorderableMetric } from "../../lib/metrics-reorder-data";
import { AthleteMetricsReorderIntroSection } from "../../sections/AthleteMetricsReorderIntroSection";
import { AthleteMetricsReorderListSection } from "../../sections/AthleteMetricsReorderListSection";
import { athleteMetricsReorderScreenStyles as styles } from "./AthleteMetricsReorderScreen.styles";
import type { AthleteMetricsReorderScreenProps } from "./AthleteMetricsReorderScreen.types";

export function AthleteMetricsReorderScreen({
  initialMetrics,
  onPersist,
}: AthleteMetricsReorderScreenProps) {
  const t = useTranslations("FitnessMetricsReorder");
  const router = useRouter();
  const [metrics, setMetrics] = useState(initialMetrics);
  const [saving, setSaving] = useState(false);

  const onRemove = (id: ReorderableMetric["id"]) => {
    setMetrics((current) => current.filter((metric) => metric.id !== id));
  };

  const onSave = async () => {
    if (onPersist) {
      setSaving(true);
      try {
        await onPersist(metrics);
      } finally {
        setSaving(false);
      }
    }
    router.push("/athlete/metrics");
  };

  return (
    <AppLayout
      className={styles.root}
      footer={
        <div className={styles.footer}>
          <Button
            className={styles.saveButton}
            isDisabled={saving}
            onPress={() => {
              void onSave();
            }}
          >
            {t("save")}
          </Button>
        </div>
      }
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
        />
      }
    >
      <div className={styles.content}>
        <AthleteMetricsReorderIntroSection
          subtitle={t("subtitle")}
          title={t("title")}
        />

        <AthleteMetricsReorderListSection
          labels={{
            weight: t("weight"),
            bloodPressure: t("bloodPressure"),
            heartRate: t("heartRate"),
            sleep: t("sleep"),
            nutrition: t("nutrition"),
            hydration: t("hydration"),
            respiration: t("respiration"),
            removeLabel: t("removeLabel"),
            dragLabel: t("dragLabel"),
          }}
          metrics={metrics}
          onRemove={onRemove}
          onReorder={setMetrics}
        />
      </div>
    </AppLayout>
  );
}

"use client";

import { Button } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Pencil1 } from "@repo/icons/Pencil1";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { AthleteWeightDetailHeroSection } from "../../sections/AthleteWeightDetailHeroSection";
import { AthleteWeightDetailKeyMetricsSection } from "../../sections/AthleteWeightDetailKeyMetricsSection";
import type { AthleteWeightDetailScreenProps } from "./AthleteWeightDetailScreen.types";

export function AthleteWeightDetailScreen({
  metric: _metric,
  detail,
}: AthleteWeightDetailScreenProps) {
  const t = useTranslations("WeightDetail");
  const tMetrics = useTranslations("WeightMetrics");
  const router = useRouter();
  const unit = tMetrics("unit");

  return (
    <AppLayout
      className="bg-background"
      footer={
        <div className="flex flex-col gap-3 border-t border-border bg-background px-screen py-4">
          <Button
            className="h-12 w-full border-stats-orange bg-transparent text-stats-orange"
            onPress={() => undefined}
            variant="outline"
          >
            {t("viewInsight")}
          </Button>
          <Button
            className="h-12 w-full gap-2 bg-stats-orange text-stats-foreground data-[hovered=true]:bg-stats-orange/90"
            onPress={() => router.push("/athlete/metrics/weight/history")}
          >
            {t("viewHistory")}
          </Button>
        </div>
      }
      header={
        <Header
          endContent={
            <Button
              aria-label={t("edit")}
              isIconOnly
              onPress={() => undefined}
              size="lg"
              variant="ghost"
            >
              <Pencil1 className="text-foreground" size={22} />
            </Button>
          }
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
          title={t("title")}
        />
      }
    >
      <div className="flex flex-col gap-8 pb-6 pt-2">
        <AthleteWeightDetailHeroSection detail={detail} unit={unit} />
        <AthleteWeightDetailKeyMetricsSection
          metrics={detail.metrics}
          unit={unit}
        />
      </div>
    </AppLayout>
  );
}

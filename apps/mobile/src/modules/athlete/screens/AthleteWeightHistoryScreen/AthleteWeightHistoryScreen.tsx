"use client";

import { Button, Typography } from "@heroui/react";
import { Calendar1 } from "@repo/icons/Calendar1";
import { ChevronDown } from "@repo/icons/ChevronDown";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { MetricHistoryItem } from "@repo/ui/cards/MetricHistoryItem";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { formatTimeFa, formatWeightKg, toPersianDigits } from "@/modules/athlete/lib/weight/format";
import {
  formatHistoryDateLabel,
  groupWeightHistoryByDate,
  WEIGHT_HISTORY,
  type WeightHistoryEntry,
} from "@/modules/athlete/lib/weight/weight-history-data";
import type { AthleteWeightHistoryScreenProps } from "./AthleteWeightHistoryScreen.types";

function entrySubtitle(
  entry: WeightHistoryEntry,
  labels: {
    stepsLeft: (count: string) => string;
    goalCompleted: string;
  },
) {
  if (entry.status === "goalCompleted") {
    return labels.goalCompleted;
  }
  return labels.stepsLeft(toPersianDigits(entry.stepsLeft ?? 0));
}

export function AthleteWeightHistoryScreen({ metric }: AthleteWeightHistoryScreenProps) {
  const t = useTranslations("WeightHistory");
  const tMetrics = useTranslations("WeightMetrics");
  const router = useRouter();
  const unit = tMetrics("unit");

  const [entries, setEntries] = useState(WEIGHT_HISTORY);
  const [openId, setOpenId] = useState<string | null>(null);

  const groups = useMemo(() => {
    const dateLabels = {
      today: t("dateToday"),
      yesterday: t("dateYesterday"),
    };

    return groupWeightHistoryByDate(entries).map((group) => ({
      ...group,
      dateLabel: formatHistoryDateLabel(group.dateKey, dateLabels),
    }));
  }, [entries, t]);

  const handleDelete = useCallback((id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
    setOpenId(null);
  }, []);

  return (
    <AppLayout
      className="bg-background"
      header={
        <Header
          endContent={<span aria-hidden className="size-10" />}
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
      <div className="flex flex-col gap-5 pb-10 pt-2">
        <section className="flex items-center justify-between gap-3">
          <Typography className="text-foreground" type="h3" weight="semibold">
            {t("heading")}
          </Typography>
          <Button
            aria-label={t("filter")}
            className="min-w-0 gap-1 px-2 text-stats-orange"
            onPress={() => undefined}
            size="sm"
            variant="ghost"
          >
            <Calendar1 size={18} />
            <span className="text-sm font-medium">{t("filter")}</span>
            <ChevronDown size={16} />
          </Button>
        </section>

        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <section className="flex flex-col gap-2.5" key={group.dateKey}>
              <Typography
                className="text-muted"
                type="body-sm"
                weight="medium"
              >
                {group.dateLabel}
              </Typography>

              <div className="flex flex-col gap-2.5">
                {group.entries.map((entry) => {
                  const value = formatWeightKg(entry.kg, unit);
                  return (
                    <MetricHistoryItem
                      alert={
                        entry.showAlert ? t("alertHeavier") : undefined
                      }
                      aria-label={`${t("entryLabel")}: ${value}`}
                      deleteLabel={t("deleteEntry")}
                      isOpen={openId === entry.id}
                      key={entry.id}
                      onDelete={() => handleDelete(entry.id)}
                      onOpenChange={(open) =>
                        setOpenId(open ? entry.id : null)
                      }
                      onPress={() =>
                        router.push(
                          `/athlete/metrics/${metric}/${entry.id}`,
                        )
                      }
                      subtitle={entrySubtitle(entry, {
                        goalCompleted: t("statusGoalCompleted"),
                        stepsLeft: (count) =>
                          t("statusStepsLeft", { count }),
                      })}
                      time={formatTimeFa(entry.hours, entry.minutes)}
                      value={value}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Calendar1 } from "@repo/icons/Calendar1";
import { ChevronDown } from "@repo/icons/ChevronDown";
import { MetricHistoryItem } from "@repo/ui/cards/MetricHistoryItem";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useCallback, useMemo, useState } from "react";
import {
  formatTimeFa,
  formatWeightKg,
  toPersianDigits,
} from "@/modules/athlete/lib/weight/format";
import {
  formatHistoryDateLabel,
  groupWeightHistoryByDate,
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

export function AthleteWeightHistoryScreen({
  metric,
  entries,
  onDelete,
}: AthleteWeightHistoryScreenProps) {
  const t = useTranslations("WeightHistory");
  const tMetrics = useTranslations("WeightMetrics");
  const router = useRouter();
  const unit = tMetrics("unit");

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

  const handleDelete = useCallback(
    (id: string) => {
      void onDelete?.(id);
      setOpenId(null);
    },
    [onDelete],
  );

  return (
    <AppLayout
      className="bg-background"
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("title")}
          endContent={<span aria-hidden className="size-10" />}
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

        {groups.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-[24px] border border-border bg-surface px-6 py-10 text-center">
            <Typography type="h4" weight="semibold">
              {t("emptyTitle")}
            </Typography>
            <Typography className="text-muted" type="body-sm">
              {t("emptyBody")}
            </Typography>
          </div>
        ) : (
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
        )}
      </div>
    </AppLayout>
  );
}

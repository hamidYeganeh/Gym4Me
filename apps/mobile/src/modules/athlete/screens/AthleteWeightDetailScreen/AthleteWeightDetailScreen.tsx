"use client";

import { Button, Link, Separator, Typography } from "@heroui/react";
import { ArrowDown } from "@repo/icons/ArrowDown";
import { ArrowUp } from "@repo/icons/ArrowUp";
import { Calendar1 } from "@repo/icons/Calendar1";
import { ChartTrendDown } from "@repo/icons/ChartTrendDown";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Clock } from "@repo/icons/Clock";
import { FootSteps } from "@repo/icons/FootSteps";
import { Pencil1 } from "@repo/icons/Pencil1";
import { Percentage } from "@repo/icons/Percentage";
import { RobotFace1 } from "@repo/icons/RobotFace1";
import { StepSneaker } from "@repo/icons/StepSneaker";
import { Stopwatch } from "@repo/icons/Stopwatch";
import { WeightScale } from "@repo/icons/WeightScale";
import { Wind } from "@repo/icons/Wind";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  formatPercent,
  formatTimeFa,
  formatWeightKg,
  toPersianDigits,
} from "@/modules/athlete/lib/weight/format";
import type { AthleteWeightDetailScreenProps } from "./AthleteWeightDetailScreen.types";

type KeyMetricRowProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  showDivider?: boolean;
};

function KeyMetricRow({
  icon,
  label,
  value,
  showDivider = true,
}: KeyMetricRowProps) {
  return (
    <>
      <div className="flex items-center gap-3 py-3.5">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center text-muted [&_svg]:block"
        >
          {icon}
        </span>
        <Typography className="min-w-0 flex-1 text-foreground" type="body">
          {label}
        </Typography>
        <div className="flex shrink-0 items-center gap-1 text-foreground">
          {value}
        </div>
      </div>
      {showDivider ? <Separator className="bg-separator" /> : null}
    </>
  );
}

function formatRecordedDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function AthleteWeightDetailScreen({
  metric: _metric,
  detail,
}: AthleteWeightDetailScreenProps) {
  const t = useTranslations("WeightDetail");
  const tMetrics = useTranslations("WeightMetrics");
  const router = useRouter();
  const unit = tMetrics("unit");
  const { metrics } = detail;

  const changeSign = metrics.changePercent > 0 ? "+" : metrics.changePercent < 0 ? "−" : "";
  const changeLabel = `${changeSign}${toPersianDigits(Math.abs(metrics.changePercent))}٪`;
  const trendLabel = t("trendValue", {
    value: formatPercent(metrics.trendPercent),
  });

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
            onPress={() => undefined}
          >
            <RobotFace1 size={20} />
            {t("consultAi")}
          </Button>
        </div>
      }
      header={
        <Header
          className="border-b-0 bg-background"
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
        <section className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-success text-success-foreground">
            <WeightScale size={30} />
          </span>

          <div className="flex items-baseline justify-center gap-1.5">
            <Typography
              className="text-[40px] leading-none tracking-tight text-foreground"
              weight="bold"
            >
              {toPersianDigits(
                detail.kg.toLocaleString("fa-IR", {
                  maximumFractionDigits: 1,
                  minimumFractionDigits: 1,
                }),
              )}
            </Typography>
            <Typography className="text-xl text-muted" weight="medium">
              {unit}
            </Typography>
          </div>

          <Typography className="text-foreground" type="body" weight="medium">
            {t("bmiStatus")}
          </Typography>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar1 size={16} />
              <Typography type="body-sm">
                {formatRecordedDate(detail.recordedAt)}
              </Typography>
            </span>
            <span aria-hidden className="size-1 rounded-full bg-muted" />
            <span className="inline-flex items-center gap-1.5">
              <Clock size={16} />
              <Typography type="body-sm" className="tabular-nums">
                {formatTimeFa(detail.hours, detail.minutes)}
              </Typography>
            </span>
          </div>

          <Typography
            className="max-w-sm text-muted"
            type="body-sm"
          >
            {t("tip")}
          </Typography>
        </section>

        <section className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <Typography className="text-foreground" type="h4" weight="semibold">
              {t("keyMetrics")}
            </Typography>
            <Link className="cursor-pointer text-sm font-medium text-stats-orange no-underline">
              {t("seeAll")}
            </Link>
          </div>

          <div>
            <KeyMetricRow
              icon={<Stopwatch size={22} />}
              label={t("goalWeight")}
              value={
                <Typography weight="semibold">
                  {formatWeightKg(metrics.goalKg, unit)}
                </Typography>
              }
            />
            <KeyMetricRow
              icon={<FootSteps size={22} />}
              label={t("bmi")}
              value={
                <Typography className="tabular-nums" weight="semibold">
                  {toPersianDigits(
                    metrics.bmi.toLocaleString("fa-IR", {
                      maximumFractionDigits: 1,
                    }),
                  )}
                </Typography>
              }
            />
            <KeyMetricRow
              icon={<Percentage size={22} />}
              label={t("changeVsLastMonth")}
              value={
                <>
                  <Typography
                    className={
                      metrics.changePercent >= 0
                        ? "tabular-nums text-success"
                        : "tabular-nums text-danger"
                    }
                    weight="semibold"
                  >
                    {changeLabel}
                  </Typography>
                  {metrics.changePercent >= 0 ? (
                    <ArrowUp className="text-success" size={16} />
                  ) : (
                    <ArrowDown className="text-danger" size={16} />
                  )}
                </>
              }
            />
            <KeyMetricRow
              icon={<Wind size={22} />}
              label={t("weeklyAverage")}
              value={
                <Typography weight="semibold">{metrics.weeklyAverage}</Typography>
              }
            />
            <KeyMetricRow
              icon={<StepSneaker size={22} />}
              label={t("monthlyAverage")}
              value={
                <Typography className="tabular-nums" weight="semibold">
                  {metrics.monthlyAverage}
                </Typography>
              }
            />
            <KeyMetricRow
              icon={<ChartTrendDown size={22} />}
              label={t("trend")}
              showDivider={false}
              value={
                <Typography className="tabular-nums" weight="semibold">
                  {trendLabel}
                </Typography>
              }
            />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

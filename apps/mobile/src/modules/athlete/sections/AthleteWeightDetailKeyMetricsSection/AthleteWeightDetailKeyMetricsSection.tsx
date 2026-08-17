import { Link, Separator, Typography } from "@heroui/react";
import { ArrowDown } from "@repo/icons/ArrowDown";
import { ArrowUp } from "@repo/icons/ArrowUp";
import { ChartTrendDown } from "@repo/icons/ChartTrendDown";
import { FootSteps } from "@repo/icons/FootSteps";
import { Percentage } from "@repo/icons/Percentage";
import { StepSneaker } from "@repo/icons/StepSneaker";
import { Stopwatch } from "@repo/icons/Stopwatch";
import { Wind } from "@repo/icons/Wind";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
  formatPercent,
  formatWeightKg,
  toPersianDigits,
} from "@/modules/athlete/lib/weight/format";
import { athleteWeightDetailKeyMetricsSectionVariants } from "./AthleteWeightDetailKeyMetricsSection.styles";
import type { AthleteWeightDetailKeyMetricsSectionProps } from "./AthleteWeightDetailKeyMetricsSection.types";

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
  styles,
}: KeyMetricRowProps & {
  styles: ReturnType<typeof athleteWeightDetailKeyMetricsSectionVariants>;
}) {
  return (
    <>
      <div className={styles.row()}>
        <span aria-hidden className={styles.rowIcon()}>
          {icon}
        </span>
        <Typography className={styles.rowLabel()} type="body">
          {label}
        </Typography>
        <div className={styles.rowValue()}>{value}</div>
      </div>
      {showDivider ? <Separator className={styles.separator()} /> : null}
    </>
  );
}

export function AthleteWeightDetailKeyMetricsSection({
  metrics,
  unit,
  className,
}: AthleteWeightDetailKeyMetricsSectionProps) {
  const t = useTranslations("WeightDetail");
  const styles = athleteWeightDetailKeyMetricsSectionVariants();

  const changeSign =
    metrics.changePercent > 0 ? "+" : metrics.changePercent < 0 ? "−" : "";
  const changeLabel = `${changeSign}${toPersianDigits(Math.abs(metrics.changePercent))}٪`;
  const trendLabel = t("trendValue", {
    value: formatPercent(metrics.trendPercent),
  });

  return (
    <section className={styles.root({ className })}>
      <div className={styles.header()}>
        <Typography className={styles.title()} type="h4" weight="semibold">
          {t("keyMetrics")}
        </Typography>
        <Link className={styles.seeAll()}>{t("seeAll")}</Link>
      </div>

      <div>
        <KeyMetricRow
          icon={<Stopwatch size={22} />}
          label={t("goalWeight")}
          styles={styles}
          value={
            <Typography weight="semibold">
              {formatWeightKg(metrics.goalKg, unit)}
            </Typography>
          }
        />
        <KeyMetricRow
          icon={<FootSteps size={22} />}
          label={t("bmi")}
          styles={styles}
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
          styles={styles}
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
          styles={styles}
          value={
            <Typography weight="semibold">{metrics.weeklyAverage}</Typography>
          }
        />
        <KeyMetricRow
          icon={<StepSneaker size={22} />}
          label={t("monthlyAverage")}
          styles={styles}
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
          styles={styles}
          value={
            <Typography className="tabular-nums" weight="semibold">
              {trendLabel}
            </Typography>
          }
        />
      </div>
    </section>
  );
}

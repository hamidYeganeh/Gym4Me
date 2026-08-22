import { Typography } from "@heroui/react/typography";
import { statsColors } from "@repo/theme/stats-colors";
import { StatsCard } from "@repo/ui/cards/StatsCard";
import { AreaLineChart } from "@repo/ui/kit/AreaLineChart";
import { ownerClubDetailOverviewSectionVariants } from "./OwnerClubDetailOverviewSection.styles";
import type { OwnerClubDetailOverviewSectionProps } from "./OwnerClubDetailOverviewSection.types";

export function OwnerClubDetailOverviewSection({
  revenueTitle,
  revenueUnit,
  revenueValue,
  revenueSeries,
  revenueComparisonSeries,
  attendanceTitle,
  attendanceUnit,
  attendanceValue,
  attendanceSeries,
  occupancyTrendTitle,
  occupancyTrend,
  todayTitle,
  todayRows,
  todayLabelFor,
  className,
}: OwnerClubDetailOverviewSectionProps) {
  const styles = ownerClubDetailOverviewSectionVariants();

  return (
    <>
      <div className={styles.statsGrid({ className })}>
        <StatsCard
          chart="line"
          color={statsColors.blue}
          comparisonSeries={revenueComparisonSeries}
          series={revenueSeries}
          title={revenueTitle}
          unit={revenueUnit}
          value={revenueValue}
        />
        <StatsCard
          chart="bar"
          color={statsColors.orange}
          series={attendanceSeries}
          title={attendanceTitle}
          unit={attendanceUnit}
          value={attendanceValue}
        />
      </div>

      <div className={styles.chartCard()}>
        <Typography
          className={styles.chartTitle()}
          type="body"
          weight="semibold"
        >
          {occupancyTrendTitle}
        </Typography>
        <AreaLineChart
          aria-label={occupancyTrendTitle}
          className={styles.chart()}
          data={occupancyTrend}
        />
      </div>

      <section className={styles.section()}>
        <Typography
          className={styles.sectionTitle()}
          type="h4"
          weight="semibold"
        >
          {todayTitle}
        </Typography>
        <div className={styles.groupCard()}>
          {todayRows.map((row, index) => (
            <div key={row.id}>
              <div className={styles.row()}>
                <span className={styles.rowBody()}>
                  <Typography
                    className={styles.rowLabel()}
                    type="body"
                    weight="medium"
                  >
                    {todayLabelFor(row.id)}
                  </Typography>
                </span>
                <span className={styles.rowValue()}>{row.value}</span>
              </div>
              {index < todayRows.length - 1 ? (
                <div aria-hidden className={styles.divider()} />
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

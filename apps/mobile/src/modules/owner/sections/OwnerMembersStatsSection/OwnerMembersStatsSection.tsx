import { StatsCard } from "@repo/ui/cards/StatsCard";
import { ownerMembersStatsSectionVariants } from "./OwnerMembersStatsSection.styles";
import type { OwnerMembersStatsSectionProps } from "./OwnerMembersStatsSection.types";

export function OwnerMembersStatsSection({
  stats,
  activeTitle,
  activeUnit,
  weekTitle,
  weekUnit,
  className,
}: OwnerMembersStatsSectionProps) {
  const styles = ownerMembersStatsSectionVariants();

  return (
    <div className={styles.root({ className })}>
      <StatsCard
        chart="line"
        color={stats.activeColor}
        comparisonSeries={stats.activeComparisonSeries}
        series={stats.activeSeries}
        title={activeTitle}
        unit={activeUnit}
        value={stats.activeValue}
      />
      <StatsCard
        chart="bar"
        color={stats.weekColor}
        series={stats.weekSeries}
        title={weekTitle}
        unit={weekUnit}
        value={stats.weekValue}
      />
    </div>
  );
}

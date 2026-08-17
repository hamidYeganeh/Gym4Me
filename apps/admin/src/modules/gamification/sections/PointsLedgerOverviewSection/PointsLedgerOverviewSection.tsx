import { Card, Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import { pointsLedgerOverviewSectionVariants } from "./PointsLedgerOverviewSection.styles";
import type { PointsLedgerOverviewSectionProps } from "./PointsLedgerOverviewSection.types";

export function PointsLedgerOverviewSection({
  overview,
  overviewError,
  className,
}: PointsLedgerOverviewSectionProps) {
  const t = useTranslations("Admin.Gamification");
  const styles = pointsLedgerOverviewSectionVariants();

  return (
    <div className={className}>
      {overviewError ? (
        <Typography className="text-sm text-danger" role="alert">
          {overviewError}
        </Typography>
      ) : null}

      {overview ? (
        <>
          <div className={styles.statsGrid()}>
            {(
              [
                ["earned", overview.totals.earned],
                ["spent", overview.totals.spent],
                ["transactions", overview.totals.transactions],
                ["grants", overview.totals.grants],
              ] as const
            ).map(([key, value]) => (
              <Card key={key} className="p-4">
                <span className={styles.statValue()}>
                  {value.toLocaleString("fa-IR")}
                </span>
                <span className={styles.statLabel()}>
                  {t(`ledger.stats.${key}`)}
                </span>
              </Card>
            ))}
          </div>

          <div className={styles.breakdownGrid()}>
            <Card className="p-4">
              <Typography className="mb-3 font-bold">
                {t("ledger.byReason")}
              </Typography>
              <div className={styles.breakdownList()}>
                {overview.byReason.length === 0 ? (
                  <span className="text-sm text-muted">
                    {t("ledger.emptyBreakdown")}
                  </span>
                ) : (
                  overview.byReason.map((row) => (
                    <div key={row.reason} className={styles.breakdownRow()}>
                      <span>{t(`reasons.${row.reason}`)}</span>
                      <span className="tabular-nums">
                        {row.total.toLocaleString("fa-IR")} (
                        {row.count.toLocaleString("fa-IR")})
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-4">
              <Typography className="mb-3 font-bold">
                {t("ledger.byRule")}
              </Typography>
              <div className={styles.breakdownList()}>
                {overview.byRule.length === 0 ? (
                  <span className="text-sm text-muted">
                    {t("ledger.emptyBreakdown")}
                  </span>
                ) : (
                  overview.byRule.map((row) => (
                    <div key={row.ruleId} className={styles.breakdownRow()}>
                      <span className="truncate">
                        {row.title ??
                          (row.event ? t(`events.${row.event}`) : row.ruleId)}
                      </span>
                      <span className="tabular-nums">
                        {row.total.toLocaleString("fa-IR")} (
                        {row.count.toLocaleString("fa-IR")})
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}

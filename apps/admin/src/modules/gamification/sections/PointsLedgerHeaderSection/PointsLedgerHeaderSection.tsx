import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { pointsLedgerHeaderSectionVariants } from "./PointsLedgerHeaderSection.styles";
import type { PointsLedgerHeaderSectionProps } from "./PointsLedgerHeaderSection.types";

export function PointsLedgerHeaderSection({
  onAdjustOpen,
  onRefresh,
  className,
}: PointsLedgerHeaderSectionProps) {
  const t = useTranslations("Admin.Gamification");
  const styles = pointsLedgerHeaderSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {t("ledger.title")}
      </Typography>
      <Typography className={styles.subtitle()}>{t("ledger.subtitle")}</Typography>
      <div className={styles.actions()}>
        <Button size="sm" variant="primary" onPress={onAdjustOpen}>
          {t("ledger.actions.adjust")}
        </Button>
        <Button size="sm" variant="ghost" onPress={onRefresh}>
          {t("refresh")}
        </Button>
      </div>
    </section>
  );
}

import { Card } from "@heroui/react";
import { useTranslations } from "next-intl";
import {
  formatFaNumber,
  type MarketplaceEntry,
} from "../../lib/analytics-data";
import { analyticsMarketplaceSectionVariants } from "./AnalyticsMarketplaceSection.styles";
import type { AnalyticsMarketplaceSectionProps } from "./AnalyticsMarketplaceSection.types";

type RankedListProps = {
  title: string;
  unit: string;
  entries: MarketplaceEntry[];
};

function RankedList({ title, unit, entries }: RankedListProps) {
  const styles = analyticsMarketplaceSectionVariants();
  const maxCount = Math.max(...entries.map((entry) => entry.count), 1);

  return (
    <div className={styles.list()}>
      <span className={styles.listTitle()}>{title}</span>
      {entries.map((entry, index) => (
        <div className={styles.row()} key={entry.id}>
          <span className={styles.rank()}>{formatFaNumber(index + 1)}</span>
          <div className={styles.rowBody()}>
            <div className={styles.rowTop()}>
              <span className={styles.rowName()}>{entry.name}</span>
              <span className={styles.rowCount()}>
                {formatFaNumber(entry.count)} {unit}
              </span>
            </div>
            <div className={styles.track()}>
              <span
                className={styles.fill()}
                style={{ width: `${(entry.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsMarketplaceSection({
  topClubs,
  topCoaches,
  className,
}: AnalyticsMarketplaceSectionProps) {
  const t = useTranslations("Admin.Analytics.marketplace");
  const styles = analyticsMarketplaceSectionVariants();

  return (
    <Card className={styles.card({ className })}>
      <Card.Header className={styles.cardHeader()}>
        <Card.Title className={styles.cardTitle()}>{t("title")}</Card.Title>
        <Card.Description className={styles.cardDescription()}>
          {t("description")}
        </Card.Description>
      </Card.Header>
      <Card.Content className={styles.content()}>
        <RankedList
          entries={topClubs}
          title={t("clubsTitle")}
          unit={t("clubsUnit")}
        />
        <RankedList
          entries={topCoaches}
          title={t("coachesTitle")}
          unit={t("coachesUnit")}
        />
      </Card.Content>
    </Card>
  );
}

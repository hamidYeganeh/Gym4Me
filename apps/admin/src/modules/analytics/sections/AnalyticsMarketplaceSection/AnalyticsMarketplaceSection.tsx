import { Card } from "@heroui/react";
import { HorizontalBarChart } from "@repo/ui/kit/HorizontalBarChart";
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
  color: string;
};

function RankedList({ title, unit, entries, color }: RankedListProps) {
  const styles = analyticsMarketplaceSectionVariants();

  return (
    <div className={styles.list()}>
      <span className={styles.listTitle()}>{title}</span>
      <HorizontalBarChart
        aria-label={title}
        color={color}
        data={entries.map((entry) => ({
          id: entry.id,
          label: entry.name,
          value: entry.count,
        }))}
        formatValue={(value) => `${formatFaNumber(value)} ${unit}`}
      />
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
          color="var(--accent)"
          entries={topClubs}
          title={t("clubsTitle")}
          unit={t("clubsUnit")}
        />
        <RankedList
          color="var(--stats-purple)"
          entries={topCoaches}
          title={t("coachesTitle")}
          unit={t("coachesUnit")}
        />
      </Card.Content>
    </Card>
  );
}

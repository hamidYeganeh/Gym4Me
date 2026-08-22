import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import type { EntityStatus, PointRuleEvent } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFilterSelect } from "@/shared/components";
import {
  ENTITY_STATUSES,
  POINT_RULE_EVENTS,
} from "../../lib/gamification-constants";
import { pointRulesListHeaderSectionVariants } from "./PointRulesListHeaderSection.styles";
import type { PointRulesListHeaderSectionProps } from "./PointRulesListHeaderSection.types";

export function PointRulesListHeaderSection({
  eventFilter,
  statusFilter,
  onEventChange,
  onStatusChange,
  onCreate,
  onRefresh,
  className,
}: PointRulesListHeaderSectionProps) {
  const t = useTranslations("Admin.Gamification");
  const styles = pointRulesListHeaderSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {t("rules.title")}
      </Typography>
      <Typography className={styles.subtitle()}>{t("rules.subtitle")}</Typography>
      <div className={styles.filters()}>
        <AdminFilterSelect
          allLabel={t("filterAll")}
          label={t("filters.event")}
          options={POINT_RULE_EVENTS.map((item) => ({
            value: item,
            label: t(`events.${item}`),
          }))}
          value={eventFilter}
          onChange={(value) =>
            onEventChange(value as PointRuleEvent | "all")
          }
        />
        <AdminFilterSelect
          allLabel={t("filterAll")}
          label={t("filters.status")}
          options={ENTITY_STATUSES.map((item) => ({
            value: item,
            label: t(`statuses.${item}`),
          }))}
          value={statusFilter}
          onChange={(value) =>
            onStatusChange(value as EntityStatus | "all")
          }
        />
        <Button size="sm" variant="primary" onPress={onCreate}>
          {t("rules.actions.create")}
        </Button>
        <Button size="sm" variant="ghost" onPress={onRefresh}>
          {t("refresh")}
        </Button>
      </div>
    </section>
  );
}

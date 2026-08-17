import { Button, Typography } from "@heroui/react";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { useTranslations } from "next-intl";
import { POINT_RULE_EVENTS } from "../../lib/gamification-constants";
import { pointRulesListHeaderSectionVariants } from "./PointRulesListHeaderSection.styles";
import type { PointRulesListHeaderSectionProps } from "./PointRulesListHeaderSection.types";

export function PointRulesListHeaderSection({
  eventFilter,
  onEventChange,
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
      <div className={styles.actions()}>
        {(["all", ...POINT_RULE_EVENTS] as const).map((value) => (
          <FilterChip
            key={value}
            onPress={() => onEventChange(value)}
            selected={eventFilter === value}
          >
            {value === "all" ? t("filterAll") : t(`events.${value}`)}
          </FilterChip>
        ))}
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

import { Button, Typography } from "@heroui/react";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { useTranslations } from "next-intl";
import { SUBJECT_TYPES } from "../../lib/gamification-constants";
import { achievementsListHeaderSectionVariants } from "./AchievementsListHeaderSection.styles";
import type { AchievementsListHeaderSectionProps } from "./AchievementsListHeaderSection.types";

export function AchievementsListHeaderSection({
  audienceFilter,
  onAudienceChange,
  onCreate,
  onRefresh,
  className,
}: AchievementsListHeaderSectionProps) {
  const t = useTranslations("Admin.Gamification");
  const styles = achievementsListHeaderSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {t("achievements.title")}
      </Typography>
      <Typography className={styles.subtitle()}>
        {t("achievements.subtitle")}
      </Typography>
      <div className={styles.actions()}>
        {(["all", ...SUBJECT_TYPES] as const).map((value) => (
          <FilterChip
            key={value}
            onPress={() => onAudienceChange(value)}
            selected={audienceFilter === value}
          >
            {value === "all" ? t("filterAll") : t(`subjects.${value}`)}
          </FilterChip>
        ))}
        <Button size="sm" variant="primary" onPress={onCreate}>
          {t("achievements.actions.create")}
        </Button>
        <Button size="sm" variant="ghost" onPress={onRefresh}>
          {t("refresh")}
        </Button>
      </div>
    </section>
  );
}

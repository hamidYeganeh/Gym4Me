import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import type { EntityStatus, GamificationSubjectType } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFilterSelect } from "@/shared/components";
import {
  ENTITY_STATUSES,
  SUBJECT_TYPES,
} from "../../lib/gamification-constants";
import { achievementsListHeaderSectionVariants } from "./AchievementsListHeaderSection.styles";
import type { AchievementsListHeaderSectionProps } from "./AchievementsListHeaderSection.types";

export function AchievementsListHeaderSection({
  audienceFilter,
  statusFilter,
  onAudienceChange,
  onStatusChange,
  onCreate,
  onRefresh,
  onImportDefaults,
  importDefaultsPending = false,
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
      <div className={styles.filters()}>
        <AdminFilterSelect
          allLabel={t("filterAll")}
          label={t("filters.audience")}
          options={SUBJECT_TYPES.map((item) => ({
            value: item,
            label: t(`subjects.${item}`),
          }))}
          value={audienceFilter}
          onChange={(value) =>
            onAudienceChange(value as GamificationSubjectType | "all")
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
        {onImportDefaults ? (
          <Button
            isDisabled={importDefaultsPending}
            size="sm"
            variant="outline"
            onPress={onImportDefaults}
          >
            {t("importDefaults")}
          </Button>
        ) : null}
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

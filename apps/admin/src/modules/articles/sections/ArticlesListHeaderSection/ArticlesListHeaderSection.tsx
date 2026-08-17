import { Button, Typography } from "@heroui/react";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { useTranslations } from "next-intl";
import { PUBLISH_STATUSES } from "../../lib/article-constants";
import { articlesListHeaderSectionVariants } from "./ArticlesListHeaderSection.styles";
import type { ArticlesListHeaderSectionProps } from "./ArticlesListHeaderSection.types";

export function ArticlesListHeaderSection({
  statusFilter,
  onStatusChange,
  onCreate,
  onRefresh,
  className,
}: ArticlesListHeaderSectionProps) {
  const t = useTranslations("Admin.Articles");
  const styles = articlesListHeaderSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {t("title")}
      </Typography>
      <Typography className={styles.subtitle()}>{t("subtitle")}</Typography>
      <div className={styles.actions()}>
        {(["all", ...PUBLISH_STATUSES] as const).map((value) => (
          <FilterChip
            key={value}
            onPress={() => onStatusChange(value)}
            selected={statusFilter === value}
          >
            {value === "all" ? t("filterAll") : t(`publishStatus.${value}`)}
          </FilterChip>
        ))}
        <Button size="sm" variant="primary" onPress={onCreate}>
          {t("actions.create")}
        </Button>
        <Button size="sm" variant="ghost" onPress={onRefresh}>
          {t("refresh")}
        </Button>
      </div>
    </section>
  );
}

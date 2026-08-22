import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import type { ArticleAudience, ArticleKind, PublishStatus } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFilterSelect } from "@/shared/components";
import {
  ARTICLE_AUDIENCES,
  ARTICLE_KINDS,
  PUBLISH_STATUSES,
} from "../../lib/article-constants";
import { articlesListHeaderSectionVariants } from "./ArticlesListHeaderSection.styles";
import type { ArticlesListHeaderSectionProps } from "./ArticlesListHeaderSection.types";

export function ArticlesListHeaderSection({
  statusFilter,
  kindFilter,
  audienceFilter,
  onStatusChange,
  onKindChange,
  onAudienceChange,
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
      <div className={styles.filters()}>
        <AdminFilterSelect
          allLabel={t("filterAll")}
          label={t("filters.publishStatus")}
          options={PUBLISH_STATUSES.map((item) => ({
            value: item,
            label: t(`publishStatus.${item}`),
          }))}
          value={statusFilter}
          onChange={(value) =>
            onStatusChange(value as PublishStatus | "all")
          }
        />
        <AdminFilterSelect
          allLabel={t("filterAll")}
          label={t("filters.kind")}
          options={ARTICLE_KINDS.map((item) => ({
            value: item,
            label: t(`kinds.${item}`),
          }))}
          value={kindFilter}
          onChange={(value) => onKindChange(value as ArticleKind | "all")}
        />
        <AdminFilterSelect
          allLabel={t("filterAll")}
          allValue="any"
          label={t("filters.audience")}
          options={ARTICLE_AUDIENCES.map((item) => ({
            value: item,
            label: t(`audiences.${item}`),
          }))}
          value={audienceFilter}
          onChange={(value) =>
            onAudienceChange(value as ArticleAudience | "any")
          }
        />
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

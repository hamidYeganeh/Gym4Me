import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import type { FaqAudience, PublishStatus } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFilterSelect } from "@/shared/components";
import { FAQ_AUDIENCES, PUBLISH_STATUSES } from "../../lib/support-constants";
import { faqListHeaderSectionVariants } from "./FaqListHeaderSection.styles";
import type { FaqListHeaderSectionProps } from "./FaqListHeaderSection.types";

export function FaqListHeaderSection({
  statusFilter,
  audienceFilter,
  onStatusChange,
  onAudienceChange,
  onCreate,
  onRefresh,
  className,
}: FaqListHeaderSectionProps) {
  const t = useTranslations("Admin.Support");
  const styles = faqListHeaderSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {t("faqTitle")}
      </Typography>
      <Typography className={styles.subtitle()}>{t("faqSubtitle")}</Typography>
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
          allValue="any"
          label={t("filters.audience")}
          options={FAQ_AUDIENCES.map((item) => ({
            value: item,
            label: t(`audience.${item}`),
          }))}
          value={audienceFilter}
          onChange={(value) =>
            onAudienceChange(value as FaqAudience | "any")
          }
        />
        <Button size="sm" variant="primary" onPress={onCreate}>
          {t("faqActions.create")}
        </Button>
        <Button size="sm" variant="ghost" onPress={onRefresh}>
          {t("refresh")}
        </Button>
      </div>
    </section>
  );
}

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { useTranslations } from "next-intl";
import { PUBLISH_STATUSES } from "../../lib/support-constants";
import { faqListHeaderSectionVariants } from "./FaqListHeaderSection.styles";
import type { FaqListHeaderSectionProps } from "./FaqListHeaderSection.types";

export function FaqListHeaderSection({
  statusFilter,
  onStatusChange,
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
          {t("faqActions.create")}
        </Button>
        <Button size="sm" variant="ghost" onPress={onRefresh}>
          {t("refresh")}
        </Button>
      </div>
    </section>
  );
}

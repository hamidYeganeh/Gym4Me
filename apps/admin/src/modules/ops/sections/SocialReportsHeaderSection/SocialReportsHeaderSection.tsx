import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { useTranslations } from "next-intl";
import { socialReportsHeaderSectionVariants } from "./SocialReportsHeaderSection.styles";
import {
  SOCIAL_REPORT_STATUS_FILTERS,
  type SocialReportsHeaderSectionProps,
} from "./SocialReportsHeaderSection.types";

export function SocialReportsHeaderSection({
  statusFilter,
  onStatusChange,
  onRefresh,
  className,
}: SocialReportsHeaderSectionProps) {
  const t = useTranslations("Admin.Ops");
  const styles = socialReportsHeaderSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {t("social.title")}
      </Typography>
      <Typography className={styles.subtitle()}>{t("social.subtitle")}</Typography>
      <div className={styles.actions()}>
        {SOCIAL_REPORT_STATUS_FILTERS.map((status) => (
          <FilterChip
            key={status}
            onPress={() => onStatusChange(status)}
            selected={statusFilter === status}
          >
            {status === "all" ? t("filterAll") : status}
          </FilterChip>
        ))}
        <Button size="sm" variant="ghost" onPress={onRefresh}>
          {t("refresh")}
        </Button>
      </div>
    </section>
  );
}

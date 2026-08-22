import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import type { SocialReportStatus } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFilterSelect } from "@/shared/components";
import { socialReportsHeaderSectionVariants } from "./SocialReportsHeaderSection.styles";
import type { SocialReportsHeaderSectionProps } from "./SocialReportsHeaderSection.types";

const SOCIAL_REPORT_STATUSES: SocialReportStatus[] = [
  "open",
  "resolved",
  "rejected",
];

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
      <div className={styles.filters()}>
        <AdminFilterSelect
          allLabel={t("filterAll")}
          label={t("social.filters.status")}
          options={SOCIAL_REPORT_STATUSES.map((item) => ({
            value: item,
            label: t(`social.statuses.${item}`),
          }))}
          value={statusFilter}
          onChange={(value) => onStatusChange(value as typeof statusFilter)}
        />
        <Button size="sm" variant="ghost" onPress={onRefresh}>
          {t("refresh")}
        </Button>
      </div>
    </section>
  );
}

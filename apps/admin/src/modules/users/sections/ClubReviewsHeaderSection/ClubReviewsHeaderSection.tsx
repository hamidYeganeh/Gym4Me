import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import type { ClubLifecycleStatus } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFilterSelect } from "@/shared/components";
import { clubReviewsHeaderSectionVariants } from "./ClubReviewsHeaderSection.styles";
import type { ClubReviewsHeaderSectionProps } from "./ClubReviewsHeaderSection.types";

const STATUSES: ClubLifecycleStatus[] = [
  "pending_review",
  "approved",
  "rejected",
];

export function ClubReviewsHeaderSection({
  statusFilter,
  onStatusChange,
  onRefresh,
  className,
}: ClubReviewsHeaderSectionProps) {
  const t = useTranslations("Admin.Users");
  const styles = clubReviewsHeaderSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {t("clubsTitle")}
      </Typography>
      <Typography className={styles.subtitle()}>{t("clubsSubtitle")}</Typography>
      <div className={styles.actions()}>
        <AdminFilterSelect
          allLabel={t("filterAll")}
          label={t("filterStatus")}
          options={STATUSES.map((item) => ({
            value: item,
            label: t(`clubLifecycle.${item}`),
          }))}
          value={statusFilter}
          onChange={(value) =>
            onStatusChange(value as ClubLifecycleStatus | "all")
          }
        />
        <Button size="lg" variant="secondary" onPress={onRefresh}>
          {t("refresh")}
        </Button>
      </div>
    </section>
  );
}

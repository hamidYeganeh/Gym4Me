import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { clubReviewsHeaderSectionVariants } from "./ClubReviewsHeaderSection.styles";
import type { ClubReviewsHeaderSectionProps } from "./ClubReviewsHeaderSection.types";

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
        {(["pending_review", "approved", "rejected", "all"] as const).map(
          (value) => (
            <Button
              key={value}
              size="sm"
              variant={statusFilter === value ? "primary" : "secondary"}
              onPress={() => onStatusChange(value)}
            >
              {value === "all" ? t("filterAll") : t(`clubLifecycle.${value}`)}
            </Button>
          ),
        )}
        <Button size="sm" variant="ghost" onPress={onRefresh}>
          {t("refresh")}
        </Button>
      </div>
    </section>
  );
}

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import type { VerificationStatus } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFilterSelect } from "@/shared/components";
import { coachVerificationsHeaderSectionVariants } from "./CoachVerificationsHeaderSection.styles";
import type { CoachVerificationsHeaderSectionProps } from "./CoachVerificationsHeaderSection.types";

const STATUSES: VerificationStatus[] = ["pending", "approved", "rejected"];

export function CoachVerificationsHeaderSection({
  statusFilter,
  onStatusChange,
  onRefresh,
  className,
}: CoachVerificationsHeaderSectionProps) {
  const t = useTranslations("Admin.Users");
  const styles = coachVerificationsHeaderSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {t("coachTitle")}
      </Typography>
      <Typography className={styles.subtitle()}>{t("coachSubtitle")}</Typography>
      <div className={styles.actions()}>
        <AdminFilterSelect
          allLabel={t("filterAll")}
          label={t("filterStatus")}
          options={STATUSES.map((item) => ({
            value: item,
            label: t(`verification.${item}`),
          }))}
          value={statusFilter}
          onChange={(value) =>
            onStatusChange(value as VerificationStatus | "all")
          }
        />
        <Button size="lg" variant="secondary" onPress={onRefresh}>
          {t("refresh")}
        </Button>
      </div>
    </section>
  );
}

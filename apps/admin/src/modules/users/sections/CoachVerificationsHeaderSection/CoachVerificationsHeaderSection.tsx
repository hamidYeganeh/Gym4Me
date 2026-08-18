import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { coachVerificationsHeaderSectionVariants } from "./CoachVerificationsHeaderSection.styles";
import type { CoachVerificationsHeaderSectionProps } from "./CoachVerificationsHeaderSection.types";

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
        {(["pending", "approved", "rejected", "all"] as const).map((value) => (
          <Button
            key={value}
            size="sm"
            variant={statusFilter === value ? "primary" : "secondary"}
            onPress={() => onStatusChange(value)}
          >
            {value === "all" ? t("filterAll") : t(`verification.${value}`)}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onPress={onRefresh}>
          {t("refresh")}
        </Button>
      </div>
    </section>
  );
}

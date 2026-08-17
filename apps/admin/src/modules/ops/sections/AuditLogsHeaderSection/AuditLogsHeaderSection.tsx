import { Button, Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import { auditLogsHeaderSectionVariants } from "./AuditLogsHeaderSection.styles";
import type { AuditLogsHeaderSectionProps } from "./AuditLogsHeaderSection.types";

export function AuditLogsHeaderSection({
  onStartImpersonation,
  onRefresh,
  className,
}: AuditLogsHeaderSectionProps) {
  const t = useTranslations("Admin.Ops");
  const styles = auditLogsHeaderSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {t("audit.title")}
      </Typography>
      <Typography className={styles.subtitle()}>{t("audit.subtitle")}</Typography>
      <div className={styles.actions()}>
        <Button size="sm" variant="primary" onPress={onStartImpersonation}>
          {t("audit.impersonation.start")}
        </Button>
        <Button size="sm" variant="ghost" onPress={onRefresh}>
          {t("refresh")}
        </Button>
      </div>
    </section>
  );
}

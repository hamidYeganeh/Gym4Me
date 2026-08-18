import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { AdminFormDrawer } from "@/shared/components";
import { auditLogsImpersonationDrawerSectionVariants } from "./AuditLogsImpersonationDrawerSection.styles";
import type { AuditLogsImpersonationDrawerSectionProps } from "./AuditLogsImpersonationDrawerSection.types";

export function AuditLogsImpersonationDrawerSection({
  isOpen,
  session,
  targetUserId,
  reason,
  pending,
  copied,
  actionError,
  onOpenChange,
  onTargetUserIdChange,
  onReasonChange,
  onStart,
  onEnd,
  onCopy,
}: AuditLogsImpersonationDrawerSectionProps) {
  const t = useTranslations("Admin.Ops");
  const styles = auditLogsImpersonationDrawerSectionVariants();

  return (
    <AdminFormDrawer
      isOpen={isOpen}
      title={t("audit.impersonation.startTitle")}
      onOpenChange={onOpenChange}
    >
      <div className={styles.form()}>
        {session ? (
          <>
            <Typography className={styles.subtitle()} weight="medium">
              {t("audit.impersonation.tokenTitle")}
            </Typography>
            <Typography className={styles.subtitle()}>
              {t("audit.impersonation.tokenBody")}
            </Typography>
            <Typography className={styles.token()} dir="ltr">
              {session.accessToken}
            </Typography>
            <div className={styles.actions()}>
              <Button variant="primary" onPress={onCopy}>
                {copied
                  ? t("audit.impersonation.copied")
                  : t("audit.impersonation.copy")}
              </Button>
              <Button
                isDisabled={pending}
                variant="danger"
                onPress={onEnd}
              >
                {t("audit.impersonation.end")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <TextField
              className={styles.field()}
              fullWidth
              name="targetUserId"
              value={targetUserId}
              onChange={onTargetUserIdChange}
            >
              <Label>{t("audit.impersonation.targetUserIdLabel")}</Label>
              <Input dir="ltr" />
            </TextField>
            <TextField
              className={styles.field()}
              fullWidth
              name="reason"
              value={reason}
              onChange={onReasonChange}
            >
              <Label>{t("audit.impersonation.reasonLabel")}</Label>
              <Input />
            </TextField>

            <div className={styles.actions()}>
              <Button
                isDisabled={pending || !targetUserId.trim() || !reason.trim()}
                variant="primary"
                onPress={onStart}
              >
                {t("audit.impersonation.confirm")}
              </Button>
              <Button
                isDisabled={pending}
                variant="secondary"
                onPress={() => onOpenChange(false)}
              >
                {t("cancel")}
              </Button>
            </div>
          </>
        )}

        {actionError ? (
          <Typography className="text-sm text-danger" role="alert">
            {actionError}
          </Typography>
        ) : null}
      </div>
    </AdminFormDrawer>
  );
}

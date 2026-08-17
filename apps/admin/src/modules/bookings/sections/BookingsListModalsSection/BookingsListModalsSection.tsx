import { Button, Input, Label, TextField, Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import { AdminConfirmDialog, AdminFormDrawer } from "@/shared/components";
import { bookingsListModalsSectionVariants } from "./BookingsListModalsSection.styles";
import type { BookingsListModalsSectionProps } from "./BookingsListModalsSection.types";

export function BookingsListModalsSection({
  cancelling,
  onCancellingOpenChange,
  cancelReason,
  onCancelReasonChange,
  refunding,
  onRefundingOpenChange,
  pending,
  actionError,
  onCancelConfirm,
  onRefundConfirm,
}: BookingsListModalsSectionProps) {
  const t = useTranslations("Admin.Bookings");
  const styles = bookingsListModalsSectionVariants();

  return (
    <>
      <AdminFormDrawer
        isOpen={Boolean(cancelling)}
        title={t("actions.cancelTitle")}
        onOpenChange={onCancellingOpenChange}
      >
        <div className="flex flex-col gap-4">
          <Typography className={styles.subtitle()}>
            {t("actions.cancelBody")}
          </Typography>
          <TextField
            fullWidth
            name="cancelReason"
            value={cancelReason}
            onChange={onCancelReasonChange}
          >
            <Label>{t("actions.reasonLabel")}</Label>
            <Input />
          </TextField>

          {actionError ? (
            <Typography className="text-sm text-danger" role="alert">
              {actionError}
            </Typography>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={pending}
              variant="danger"
              onPress={onCancelConfirm}
            >
              {t("actions.confirm")}
            </Button>
            <Button
              isDisabled={pending}
              variant="secondary"
              onPress={() => onCancellingOpenChange(false)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </AdminFormDrawer>

      <AdminConfirmDialog
        body={
          <>
            <Typography>{t("actions.refundBody")}</Typography>
            {actionError ? (
              <Typography className="mt-2 text-sm text-danger" role="alert">
                {actionError}
              </Typography>
            ) : null}
          </>
        }
        cancelLabel={t("cancel")}
        confirmLabel={t("actions.refund")}
        confirmVariant="primary"
        isOpen={Boolean(refunding)}
        isPending={pending}
        title={t("actions.refundTitle")}
        onConfirm={onRefundConfirm}
        onOpenChange={onRefundingOpenChange}
      />
    </>
  );
}

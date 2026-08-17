import { Input, Label, TextField, Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import { AdminConfirmDialog } from "@/shared/components";
import { kycListReviewDialogSectionVariants } from "./KycListReviewDialogSection.styles";
import type { KycListReviewDialogSectionProps } from "./KycListReviewDialogSection.types";

export function KycListReviewDialogSection({
  isOpen,
  reviewAction,
  rejectReason,
  onRejectReasonChange,
  reviewPending,
  reviewError,
  onConfirm,
  onOpenChange,
}: KycListReviewDialogSectionProps) {
  const t = useTranslations("Admin.Users");
  const styles = kycListReviewDialogSectionVariants();

  return (
    <AdminConfirmDialog
      body={
        <>
          <Typography>
            {reviewAction === "approve"
              ? t("kycActions.approveBody")
              : t("kycActions.rejectBody")}
          </Typography>
          {reviewAction === "reject" ? (
            <TextField
              className={styles.rejectField()}
              fullWidth
              name="rejectionReason"
              value={rejectReason}
              onChange={onRejectReasonChange}
            >
              <Label>{t("kycActions.rejectReason")}</Label>
              <Input />
            </TextField>
          ) : null}
          {reviewError ? (
            <Typography className="mt-2 text-sm text-danger" role="alert">
              {reviewError}
            </Typography>
          ) : null}
        </>
      }
      cancelLabel={t("kycActions.cancel")}
      confirmLabel={
        reviewAction === "approve"
          ? t("kycActions.approve")
          : t("kycActions.reject")
      }
      confirmVariant={reviewAction === "approve" ? "primary" : "danger"}
      isOpen={isOpen}
      isPending={reviewPending}
      title={
        reviewAction === "approve"
          ? t("kycActions.approveTitle")
          : t("kycActions.rejectTitle")
      }
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
    />
  );
}

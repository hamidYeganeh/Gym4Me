import { Input, Label, TextField } from "@heroui/react";
import { useTranslations } from "next-intl";
import { AdminConfirmDialog } from "@/shared/components";
import type { CoachVerificationsReviewDialogSectionProps } from "./CoachVerificationsReviewDialogSection.types";

export function CoachVerificationsReviewDialogSection({
  review,
  reviewNote,
  onReviewNoteChange,
  pending,
  reviewError,
  onConfirm,
  onOpenChange,
}: CoachVerificationsReviewDialogSectionProps) {
  const t = useTranslations("Admin.Users");

  return (
    <AdminConfirmDialog
      body={
        <>
          <p>
            {review?.action === "approve"
              ? t("coachActions.approveBody")
              : t("coachActions.rejectBody")}
          </p>
          <TextField
            className="mt-3 flex flex-col gap-2"
            fullWidth
            name="reviewNote"
            value={reviewNote}
            onChange={onReviewNoteChange}
          >
            <Label>
              {review?.action === "reject"
                ? t("kycActions.rejectReason")
                : t("coachActions.note")}
            </Label>
            <Input />
          </TextField>
          {reviewError ? (
            <p className="mt-2 text-sm text-danger" role="alert">
              {reviewError}
            </p>
          ) : null}
        </>
      }
      cancelLabel={t("kycActions.cancel")}
      confirmLabel={
        review?.action === "approve"
          ? t("kycActions.approve")
          : t("kycActions.reject")
      }
      confirmVariant={review?.action === "approve" ? "primary" : "danger"}
      isOpen={Boolean(review)}
      isPending={pending}
      title={
        review?.action === "approve"
          ? t("kycActions.approveTitle")
          : t("kycActions.rejectTitle")
      }
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
    />
  );
}

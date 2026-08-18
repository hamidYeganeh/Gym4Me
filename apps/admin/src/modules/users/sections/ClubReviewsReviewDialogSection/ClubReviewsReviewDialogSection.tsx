import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { AdminConfirmDialog } from "@/shared/components";
import type { ClubReviewsReviewDialogSectionProps } from "./ClubReviewsReviewDialogSection.types";

export function ClubReviewsReviewDialogSection({
  review,
  reviewNote,
  onReviewNoteChange,
  pending,
  reviewError,
  onConfirm,
  onOpenChange,
}: ClubReviewsReviewDialogSectionProps) {
  const t = useTranslations("Admin.Users");

  return (
    <AdminConfirmDialog
      body={
        <>
          <Typography>
            {review?.action === "approve"
              ? t("clubsActions.approveBody")
              : t("clubsActions.rejectBody")}
          </Typography>
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
            <Typography className="mt-2 text-sm text-danger" role="alert">
              {reviewError}
            </Typography>
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

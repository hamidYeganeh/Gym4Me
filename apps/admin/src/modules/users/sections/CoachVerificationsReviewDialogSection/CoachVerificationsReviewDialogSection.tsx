import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { AdminConfirmDialog, AdminDatePicker } from "@/shared/components";
import type { CoachVerificationsReviewDialogSectionProps } from "./CoachVerificationsReviewDialogSection.types";

export function CoachVerificationsReviewDialogSection({
  review,
  reviewNote,
  credential,
  onCredentialChange,
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
          <Typography>
            {review?.action === "approve"
              ? t("coachActions.approveBody")
              : t("coachActions.rejectBody")}
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
          {review?.action === "approve" ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <TextField
                fullWidth
                isRequired
                name="credentialTypeKey"
                value={credential.typeKey}
                onChange={(value) => onCredentialChange("typeKey", value)}
              >
                <Label>{t("coachActions.credentialType")}</Label>
                <Input />
              </TextField>
              <TextField
                fullWidth
                isRequired
                name="credentialIssuer"
                value={credential.issuer}
                onChange={(value) => onCredentialChange("issuer", value)}
              >
                <Label>{t("coachActions.credentialIssuer")}</Label>
                <Input />
              </TextField>
              <AdminDatePicker
                label={t("coachActions.credentialIssuedAt")}
                name="credentialIssuedAt"
                value={credential.issuedAt}
                onChange={(value) => onCredentialChange("issuedAt", value)}
              />
              <AdminDatePicker
                isRequired
                label={t("coachActions.credentialExpiresAt")}
                name="credentialExpiresAt"
                value={credential.expiresAt}
                onChange={(value) => onCredentialChange("expiresAt", value)}
              />
            </div>
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

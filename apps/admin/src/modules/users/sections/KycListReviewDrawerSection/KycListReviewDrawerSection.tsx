import { Link as RouterLink } from "react-router-dom";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { AdminEvidenceGallery, AdminFormDrawer } from "@/shared/components";
import { routes } from "@/shared/lib/routes";
import { formatAdminDate } from "@/shared/lib/user-format";
import { kycUserId, kycUserLabel } from "../../lib/kyc-table-columns";
import { kycListReviewDrawerSectionVariants } from "./KycListReviewDrawerSection.styles";
import type { KycListReviewDrawerSectionProps } from "./KycListReviewDrawerSection.types";

export function KycListReviewDrawerSection({
  selected,
  onOpenChange,
  docPending,
  docError,
  onOpenDocument,
  onApprove,
  onReject,
}: KycListReviewDrawerSectionProps) {
  const t = useTranslations("Admin.Users");
  const styles = kycListReviewDrawerSectionVariants();
  const userLinkId = selected ? kycUserId(selected) : null;

  return (
    <AdminFormDrawer
      isOpen={Boolean(selected)}
      title={t("kycActions.reviewTitle")}
      onOpenChange={onOpenChange}
    >
      {selected ? (
        <div className="flex flex-col gap-4">
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-muted">{t("kycColumns.user")}</dt>
              <dd className="font-medium">
                {userLinkId ? (
                  <RouterLink
                    className="text-accent underline-offset-2 hover:underline"
                    to={routes.user(userLinkId)}
                  >
                    {kycUserLabel(selected)}
                  </RouterLink>
                ) : (
                  kycUserLabel(selected)
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted">{t("kycColumns.kind")}</dt>
              <dd>{t(`kycKind.${selected.kind}`)}</dd>
            </div>
            {selected.nationalId ? (
              <div>
                <dt className="text-muted">{t("kycColumns.nationalId")}</dt>
                <dd className="tabular-nums" dir="ltr">
                  {selected.nationalId}
                </dd>
              </div>
            ) : null}
            {selected.birthDate ? (
              <div>
                <dt className="text-muted">{t("kycColumns.birthDate")}</dt>
                <dd>{formatAdminDate(selected.birthDate)}</dd>
              </div>
            ) : null}
            {selected.documentType ? (
              <div>
                <dt className="text-muted">{t("kycColumns.documentType")}</dt>
                <dd>
                  {selected.documentType === "national_card" ||
                  selected.documentType === "selfie" ||
                  selected.documentType === "coach_certificate" ||
                  selected.documentType === "business_license"
                    ? t(`kycDocumentType.${selected.documentType}`)
                    : selected.documentType}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-muted">{t("kycColumns.createdAt")}</dt>
              <dd>{formatAdminDate(selected.createdAt)}</dd>
            </div>
          </dl>

          <AdminEvidenceGallery
            documentPending={docPending}
            emptyLabel={t("kycActions.noDocument")}
            label={t("kycActions.evidence")}
            openDocumentLabel={
              selected.hasDocument ? t("kycActions.openDocument") : undefined
            }
            onOpenDocument={
              selected.hasDocument ? onOpenDocument : undefined
            }
          />
          {docError ? (
            <Typography className="text-sm text-danger" role="alert">
              {docError}
            </Typography>
          ) : null}

          {selected.status === "pending" ? (
            <div className={styles.actions()}>
              <Button variant="primary" onPress={onApprove}>
                {t("kycActions.approve")}
              </Button>
              <Button variant="danger" onPress={onReject}>
                {t("kycActions.reject")}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </AdminFormDrawer>
  );
}

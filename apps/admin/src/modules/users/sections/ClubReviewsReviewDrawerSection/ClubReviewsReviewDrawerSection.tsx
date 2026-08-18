import { Button } from "@heroui/react/button";
import { useTranslations } from "next-intl";
import { AdminEvidenceGallery, AdminFormDrawer } from "@/shared/components";
import { mediaApi } from "@/shared/lib/api";
import { clubReviewsReviewDrawerSectionVariants } from "./ClubReviewsReviewDrawerSection.styles";
import type { ClubReviewsReviewDrawerSectionProps } from "./ClubReviewsReviewDrawerSection.types";

export function ClubReviewsReviewDrawerSection({
  selected,
  onOpenChange,
  onApprove,
  onReject,
}: ClubReviewsReviewDrawerSectionProps) {
  const t = useTranslations("Admin.Users");
  const styles = clubReviewsReviewDrawerSectionVariants();

  const evidenceIds = selected
    ? [
        ...(selected.identity.coverMediaId
          ? [selected.identity.coverMediaId]
          : []),
        ...selected.review.documentMediaIds,
      ]
    : [];

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
              <dt className="text-muted">{t("clubsColumns.name")}</dt>
              <dd className="font-medium">{selected.identity.name}</dd>
            </div>
            {selected.identity.description ? (
              <div>
                <dt className="text-muted">{t("clubsColumns.description")}</dt>
                <dd className="whitespace-pre-wrap">
                  {selected.identity.description}
                </dd>
              </div>
            ) : null}
            {selected.location?.address ||
            selected.contact.phones.length > 0 ? (
              <div>
                <dt className="text-muted">{t("clubsColumns.contact")}</dt>
                <dd>
                  {[
                    selected.location?.address,
                    ...selected.contact.phones.map((p) => p.number),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </dd>
              </div>
            ) : null}
            {selected.identity.coverMediaId ? (
              <div>
                <dt className="text-muted">{t("clubsColumns.cover")}</dt>
                <dd>
                  <a
                    className="text-accent underline-offset-2 hover:underline"
                    href={mediaApi.fileUrl(selected.identity.coverMediaId)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {t("kycActions.openDocument")}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>

          <AdminEvidenceGallery
            emptyLabel={t("kycActions.noDocument")}
            label={t("kycActions.evidence")}
            mediaIds={evidenceIds}
          />

          {selected.review.status === "pending_review" ? (
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

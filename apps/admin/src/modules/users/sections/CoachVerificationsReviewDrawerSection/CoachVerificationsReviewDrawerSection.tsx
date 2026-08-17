import { Link as RouterLink } from "react-router-dom";
import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import { AdminEvidenceGallery, AdminFormDrawer } from "@/shared/components";
import { routes } from "@/shared/lib/routes";
import { coachUserLabel } from "../CoachVerificationsTableSection";
import { coachVerificationsReviewDrawerSectionVariants } from "./CoachVerificationsReviewDrawerSection.styles";
import type { CoachVerificationsReviewDrawerSectionProps } from "./CoachVerificationsReviewDrawerSection.types";

export function CoachVerificationsReviewDrawerSection({
  selected,
  onOpenChange,
  onApprove,
  onReject,
}: CoachVerificationsReviewDrawerSectionProps) {
  const t = useTranslations("Admin.Users");
  const styles = coachVerificationsReviewDrawerSectionVariants();

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
              <dt className="text-muted">{t("coachColumns.user")}</dt>
              <dd className="font-medium">
                <RouterLink
                  className="text-accent underline-offset-2 hover:underline"
                  to={routes.user(selected.userId)}
                >
                  {coachUserLabel(selected)}
                </RouterLink>
              </dd>
            </div>
            {selected.user?.phone ? (
              <div>
                <dt className="text-muted">{t("columns.phone")}</dt>
                <dd className="tabular-nums" dir="ltr">
                  {selected.user.phone}
                </dd>
              </div>
            ) : null}
            {selected.experience.headline || selected.experience.years != null ? (
              <div>
                <dt className="text-muted">{t("coachColumns.experience")}</dt>
                <dd>
                  {[
                    selected.experience.headline,
                    selected.experience.years != null
                      ? t("coachColumns.years", {
                          count: selected.experience.years,
                        })
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </dd>
              </div>
            ) : null}
            {selected.bio ? (
              <div>
                <dt className="text-muted">{t("coachColumns.bio")}</dt>
                <dd className="whitespace-pre-wrap">{selected.bio}</dd>
              </div>
            ) : null}
          </dl>

          <AdminEvidenceGallery
            emptyLabel={t("kycActions.noDocument")}
            label={t("kycActions.evidence")}
            mediaIds={selected.verification.documentMediaIds}
          />

          {selected.verification.status === "pending" ? (
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

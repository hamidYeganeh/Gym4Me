import { Card } from "@heroui/react";
import { useTranslations } from "next-intl";
import { formatAdminDate } from "@/shared/lib/user-format";
import { UsersRolesForm } from "../../components/UsersRolesForm";
import { usersDetailRolesSectionVariants } from "./UsersDetailRolesSection.styles";
import type { UsersDetailRolesSectionProps } from "./UsersDetailRolesSection.types";

export function UsersDetailRolesSection({
  user,
  defaultValues,
  onSubmit,
  className,
}: UsersDetailRolesSectionProps) {
  const t = useTranslations("Admin.Users");
  const styles = usersDetailRolesSectionVariants();

  return (
    <Card className={styles.card({ className })}>
      <Card.Header>
        <Card.Title>{t("createModal.roles")}</Card.Title>
      </Card.Header>
      <Card.Content className={styles.content()}>
        <UsersRolesForm defaultValues={defaultValues} onSubmit={onSubmit} />

        <div className={styles.facts()}>
          <div className={styles.factRow()}>
            <span className={styles.factLabel()}>{t("detail.code")}</span>
            <span className={styles.factValue()}>{user.code || "—"}</span>
          </div>
          <div className={styles.factRow()}>
            <span className={styles.factLabel()}>
              {t("detail.referralCode")}
            </span>
            <span className={styles.factValue()}>
              {user.referralCode || "—"}
            </span>
          </div>
          <div className={styles.factRow()}>
            <span className={styles.factLabel()}>
              {t("detail.phoneVerified")}
            </span>
            <span className={styles.factValue()}>
              {user.phoneVerifiedAt
                ? t("detail.verified")
                : t("detail.unverified")}
            </span>
          </div>
          <div className={styles.factRow()}>
            <span className={styles.factLabel()}>{t("columns.createdAt")}</span>
            <span className={styles.factValue()}>
              {formatAdminDate(user.createdAt)}
            </span>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}

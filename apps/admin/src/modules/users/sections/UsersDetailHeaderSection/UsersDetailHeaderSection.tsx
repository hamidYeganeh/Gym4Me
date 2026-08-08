import { Button, Chip, Typography } from "@heroui/react";
import { ArrowLeft, Lock1, LockUnlocked1, Trash1 } from "@repo/icons";
import { useTranslations } from "next-intl";
import {
  kycChipColor,
  statusChipColor,
  userDisplayName,
} from "@/shared/lib/user-format";
import { usersDetailHeaderSectionVariants } from "./UsersDetailHeaderSection.styles";
import type { UsersDetailHeaderSectionProps } from "./UsersDetailHeaderSection.types";

export function UsersDetailHeaderSection({
  user,
  canMutateStatus,
  actionPending,
  onBack,
  onActivate,
  onDeactivate,
  onDelete,
  className,
}: UsersDetailHeaderSectionProps) {
  const t = useTranslations("Admin.Users");
  const styles = usersDetailHeaderSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div className={styles.copy()}>
        <div className={styles.backRow()}>
          <Button size="sm" variant="tertiary" onPress={onBack}>
            <ArrowLeft size={16} />
            {t("detail.back")}
          </Button>
        </div>
        <Typography className={styles.title()} type="h1" weight="bold">
          {user
            ? userDisplayName(user, t("detail.unnamed"))
            : t("detail.title")}
        </Typography>
        {user ? (
          <>
            <Typography className={styles.subtitle()}>{user.phone}</Typography>
            <div className={styles.meta()}>
              <Chip
                color={statusChipColor(user.status)}
                size="sm"
                variant="soft"
              >
                {t(`status.${user.status}`)}
              </Chip>
              <Chip
                color={kycChipColor(user.kyc.status)}
                size="sm"
                variant="soft"
              >
                {t(`kyc.${user.kyc.status}`)}
              </Chip>
            </div>
          </>
        ) : null}
      </div>

      {user && canMutateStatus ? (
        <div className={styles.actions()}>
          {user.status === "blocked" ? (
            <Button
              isPending={actionPending}
              variant="primary"
              onPress={onActivate}
            >
              <LockUnlocked1 size={18} />
              {t("actions.activate")}
            </Button>
          ) : user.status === "active" ? (
            <Button variant="secondary" onPress={onDeactivate}>
              <Lock1 size={18} />
              {t("actions.deactivate")}
            </Button>
          ) : null}
          <Button variant="danger" onPress={onDelete}>
            <Trash1 size={18} />
            {t("actions.delete")}
          </Button>
        </div>
      ) : null}
    </section>
  );
}

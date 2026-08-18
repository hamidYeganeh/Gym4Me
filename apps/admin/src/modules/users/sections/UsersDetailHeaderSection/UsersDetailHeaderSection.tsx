import { Avatar } from "@heroui/react/avatar";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Lock1 } from "@repo/icons/Lock1";
import { LockUnlocked1 } from "@repo/icons/LockUnlocked1";
import { Pencil1 } from "@repo/icons/Pencil1";
import { Share1 } from "@repo/icons/Share1";
import { Trash1 } from "@repo/icons/Trash1";
import { User } from "@repo/icons/User";
import { useTranslations } from "next-intl";
import { mediaApi } from "@/shared/lib/api";
import { userDisplayName } from "@/shared/lib/user-format";
import { usersDetailHeaderSectionVariants } from "./UsersDetailHeaderSection.styles";
import type { UsersDetailHeaderSectionProps } from "./UsersDetailHeaderSection.types";

function initials(user: NonNullable<UsersDetailHeaderSectionProps["user"]>) {
  const first = user.name.first?.trim()?.[0] ?? "";
  const last = user.name.last?.trim()?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

export function UsersDetailHeaderSection({
  user,
  canMutateStatus,
  actionPending,
  onEdit,
  onShare,
  onActivate,
  onDeactivate,
  onDelete,
  className,
}: UsersDetailHeaderSectionProps) {
  const t = useTranslations("Admin.Users");
  const styles = usersDetailHeaderSectionVariants();
  const displayName = user
    ? userDisplayName(user, t("detail.unnamed"))
    : t("detail.title");
  const avatarUrl = user?.avatar.mediaId
    ? mediaApi.fileUrl(user.avatar.mediaId)
    : undefined;
  const memberBadge =
    user?.kyc.status === "approved"
      ? t("detail.memberBadgeVerified")
      : user
        ? t(`status.${user.status}`)
        : null;

  return (
    <section className={styles.root({ className })}>
      <div className={styles.banner()}>
        <div aria-hidden className={styles.bannerGlow()} />
        {user ? (
          <Button
            aria-label={t("detail.editBanner")}
            className={styles.bannerEdit()}
            isIconOnly
            size="lg"
            variant="tertiary"
            onPress={onEdit}
          >
            <Pencil1 size={18} />
          </Button>
        ) : null}
      </div>

      <div className={styles.body()}>
        {user ? (
          <div className={styles.avatarWrap()}>
            <Avatar className={styles.avatar()} size="lg">
              {avatarUrl ? (
                <Avatar.Image alt={displayName} src={avatarUrl} />
              ) : null}
              <Avatar.Fallback className={styles.avatarFallback()}>
                {initials(user)}
              </Avatar.Fallback>
            </Avatar>
          </div>
        ) : null}

        <div className={styles.row()}>
          <div className={styles.identity()}>
            <div className={styles.nameRow()}>
              <Typography className={styles.name()} type="h1" weight="bold">
                {displayName}
              </Typography>
              {memberBadge ? (
                <span className={styles.badge()}>{memberBadge}</span>
              ) : null}
            </div>
            {user ? (
              <Typography className={styles.contact()}>{user.phone}</Typography>
            ) : null}
          </div>

          {user ? (
            <div className={styles.actions()}>
              <Button
                className={styles.shareButton()}
                variant="secondary"
                onPress={onShare}
              >
                <Share1 size={18} />
                {t("detail.share")}
              </Button>
              {canMutateStatus && user.status === "blocked" ? (
                <Button
                  isPending={actionPending}
                  variant="primary"
                  onPress={onActivate}
                >
                  <LockUnlocked1 size={18} />
                  {t("actions.activate")}
                </Button>
              ) : canMutateStatus && user.status === "active" ? (
                <Button variant="primary" onPress={onDeactivate}>
                  <Lock1 size={18} />
                  {t("actions.deactivate")}
                </Button>
              ) : (
                <Button variant="primary" onPress={onEdit}>
                  <User size={18} />
                  {t("detail.viewProfile")}
                </Button>
              )}
              {canMutateStatus ? (
                <Button isIconOnly size="lg" variant="danger" onPress={onDelete}>
                  <Trash1 size={18} />
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

import { Button, Chip, Typography } from "@heroui/react";
import { Chat } from "@repo/icons/Chat";
import { File1 } from "@repo/icons/File1";
import { Plus } from "@repo/icons/Plus";
import { ShieldCheck } from "@repo/icons/ShieldCheck";
import { StarFour } from "@repo/icons/StarFour";
import { ThumbsUp } from "@repo/icons/ThumbsUp";
import { UsersTwo } from "@repo/icons/UsersTwo";
import { useTranslations } from "next-intl";
import { baseProfileIdentitySectionVariants } from "./BaseProfileIdentitySection.styles";
import type { BaseProfileIdentitySectionProps } from "./BaseProfileIdentitySection.types";

const STAT_ICON = 18;

export function BaseProfileIdentitySection({
  displayName,
  activeRoleLabel,
  memberSince,
  showKycCta,
  onHelpPress,
  onKycPress,
  className,
}: BaseProfileIdentitySectionProps) {
  const t = useTranslations("Mobile.Profile");
  const styles = baseProfileIdentitySectionVariants();

  return (
    <div className={className}>
      <section className={styles.identity()}>
        <Chip
          className={styles.memberChip()}
          color="accent"
          size="sm"
          variant="secondary"
        >
          <StarFour size={12} />
          <Chip.Label>{t("memberPlus", { role: activeRoleLabel })}</Chip.Label>
        </Chip>
        <Typography className={styles.memberSince()} type="body-sm">
          {memberSince
            ? t("memberSince", { date: memberSince })
            : t("memberSinceFallback")}
        </Typography>
        <Typography className={styles.name()} type="h1" weight="bold">
          {displayName}
        </Typography>
      </section>

      <div className={styles.stats()}>
        <div className={styles.stat()}>
          <File1 aria-hidden className={styles.statIcon()} size={STAT_ICON} />
          <Typography className={styles.statValue()} type="body" weight="bold">
            {t("statPostsValue")}
          </Typography>
          <Typography className={styles.statLabel()} type="body-sm">
            {t("statPosts")}
          </Typography>
        </div>
        <div className={styles.stat()}>
          <UsersTwo
            aria-hidden
            className={styles.statIcon()}
            size={STAT_ICON}
          />
          <Typography className={styles.statValue()} type="body" weight="bold">
            {t("statFollowersValue")}
          </Typography>
          <Typography className={styles.statLabel()} type="body-sm">
            {t("statFollowers")}
          </Typography>
        </div>
        <div className={styles.stat()}>
          <ThumbsUp
            aria-hidden
            className={styles.statIcon()}
            size={STAT_ICON}
          />
          <Typography className={styles.statValue()} type="body" weight="bold">
            {t("statLikesValue")}
          </Typography>
          <Typography className={styles.statLabel()} type="body-sm">
            {t("statLikes")}
          </Typography>
        </div>
      </div>

      <div className={styles.actions()}>
        <Button
          className={styles.followButton()}
          fullWidth
          size="lg"
          variant="primary"
        >
          {t("follow")}
          <Plus size={16} />
        </Button>
        <Button
          className={styles.chatButton()}
          fullWidth
          size="lg"
          variant="outline"
          onPress={onHelpPress}
        >
          {t("chat")}
          <Chat size={16} />
        </Button>
      </div>

      {showKycCta ? (
        <section className={styles.kycCard()}>
          <Typography className={styles.kycHint()} type="body-sm">
            {t("kycHint")}
          </Typography>
          <Button size="lg" variant="secondary" onPress={onKycPress}>
            <ShieldCheck size={20} />
            {t("kycCta")}
          </Button>
        </section>
      ) : null}
    </div>
  );
}

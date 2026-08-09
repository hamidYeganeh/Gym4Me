"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Button, Chip, Typography } from "@heroui/react";
import { ArrowUpload } from "@repo/icons/ArrowUpload";
import { ChartPie1 } from "@repo/icons/ChartPie1";
import { Chat } from "@repo/icons/Chat";
import { File1 } from "@repo/icons/File1";
import { Gear1 } from "@repo/icons/Gear1";
import { Image1 } from "@repo/icons/Image1";
import { Plus } from "@repo/icons/Plus";
import { ShieldCheck } from "@repo/icons/ShieldCheck";
import { StarFour } from "@repo/icons/StarFour";
import { ThumbsUp } from "@repo/icons/ThumbsUp";
import { User } from "@repo/icons/User";
import { UsersTwo } from "@repo/icons/UsersTwo";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { useTranslations } from "next-intl";
import { formatMemberSince } from "@/modules/account/lib/profile-demographics";
import { mediaFileUrl } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { baseProfileScreenVariants } from "./BaseProfileScreen.styles";
import type { BaseProfileScreenProps } from "./BaseProfileScreen.types";

const ICON = 20;
const STAT_ICON = 18;
const AVATAR_ICON = 40;

export function BaseProfileScreen({
  className,
  roleSegment = "athlete",
}: BaseProfileScreenProps) {
  const t = useTranslations("Mobile.Profile");
  const tRole = useTranslations("Mobile.RoleApply");
  const styles = baseProfileScreenVariants();
  const router = useRouter();
  const { user, activeRole } = useAuth();

  const displayName = useMemo(() => {
    const parts = [user?.name.first, user?.name.last].filter(Boolean);
    if (parts.length > 0) return parts.join(" ");
    return user?.code ?? t("title");
  }, [t, user]);

  const activeRoleLabel = useMemo(() => {
    if (activeRole === "coach") return tRole("coach");
    if (activeRole === "club_owner") return tRole("owner");
    return tRole("athlete");
  }, [activeRole, tRole]);

  const memberSince = formatMemberSince(user?.createdAt);
  const avatarSrc = mediaFileUrl(user?.avatar.mediaId);
  const showKycCta =
    user?.kyc.status === "none" || user?.kyc.status === "rejected";

  const path = (suffix: string) => `/${roleSegment}/profile/${suffix}`;

  return (
    <AppLayout className={styles.root({ className })}>
      <div className={styles.content()}>
        <section className={styles.hero()}>
          <div aria-hidden className={styles.cover()}>
            <Image1 className={styles.coverIcon()} size={36} />
          </div>

          <div className={styles.avatarRow()}>
            <Button
              aria-label={t("settings")}
              className={styles.sideAction()}
              isIconOnly
              onPress={() => router.push(`/${roleSegment}/settings`)}
              size="lg"
              variant="secondary"
            >
              <Gear1 size={ICON} />
            </Button>

            <div className={styles.avatarWrap()}>
              <Avatar className={styles.avatar()} color="accent">
                {avatarSrc ? (
                  <Avatar.Image
                    alt={displayName}
                    className={styles.avatarImage()}
                    src={avatarSrc}
                  />
                ) : null}
                <Avatar.Fallback className={styles.avatarFallback()}>
                  <User size={AVATAR_ICON} />
                </Avatar.Fallback>
              </Avatar>
              <Button
                aria-label={t("uploadAvatar")}
                className={styles.avatarUpload()}
                isIconOnly
                onPress={() => router.push(path("edit"))}
                size="lg"
                variant="tertiary"
              >
                <ArrowUpload size={14} />
              </Button>
            </div>

            <Button
              aria-label={t("analytics")}
              className={styles.sideAction()}
              isIconOnly
              onPress={() => router.push(`/${roleSegment}`)}
              size="lg"
              variant="secondary"
            >
              <ChartPie1 size={ICON} />
            </Button>
          </div>
        </section>

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
            <Typography
              className={styles.statValue()}
              type="body"
              weight="bold"
            >
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
            <Typography
              className={styles.statValue()}
              type="body"
              weight="bold"
            >
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
            <Typography
              className={styles.statValue()}
              type="body"
              weight="bold"
            >
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
            onPress={() => router.push(path("help"))}
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
            <Button
              size="lg"
              variant="secondary"
              onPress={() => router.push(`/${roleSegment}/kyc`)}
            >
              <ShieldCheck size={20} />
              {t("kycCta")}
            </Button>
          </section>
        ) : null}

        <section className={styles.postsCard()}>
          <div className={styles.postsBody()}>
            <Typography
              className={styles.postsTitle()}
              type="body"
              weight="bold"
            >
              {t("postsEmptyTitle")}
            </Typography>
            <Typography className={styles.postsHint()} type="body-sm">
              {t("postsEmptyHint")}
            </Typography>
          </div>
          <div className={styles.postsFooter()}>
            <Button className={styles.createPost()} variant="ghost">
              {t("createPost")}
              <Plus size={16} />
            </Button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

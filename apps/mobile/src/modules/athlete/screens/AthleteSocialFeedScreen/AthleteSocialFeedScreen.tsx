"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Bookmark } from "@repo/icons/Bookmark";
import { Chat } from "@repo/icons/Chat";
import { Flag1 } from "@repo/icons/Flag1";
import { Heart } from "@repo/icons/Heart";
import { Plus } from "@repo/icons/Plus";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { toPersianDigits } from "@/modules/athlete/lib/weight/format";
import { athleteSocialFeedScreenVariants } from "./AthleteSocialFeedScreen.styles";
import type { AthleteSocialFeedScreenProps } from "./AthleteSocialFeedScreen.types";

export function AthleteSocialFeedScreen({
  posts,
  pendingId,
  onLike,
  onSave,
  onReport,
  className,
}: AthleteSocialFeedScreenProps) {
  const t = useTranslations("AthleteSocial");
  const styles = athleteSocialFeedScreenVariants();
  const router = useRouter();

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          endContent={
            <Button
              aria-label={t("create")}
              isIconOnly
              onPress={() => router.push("/athlete/social/create")}
              size="lg"
              variant="ghost"
            >
              <Plus className="text-foreground" size={22} />
            </Button>
          }
        />
      }
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.introTitle()} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle()} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        {posts.length === 0 ? (
          <div className={styles.empty()}>
            <Typography type="h4" weight="semibold">
              {t("emptyTitle")}
            </Typography>
            <Typography className={styles.meta()} type="body-sm">
              {t("emptyBody")}
            </Typography>
            <Button
              onPress={() => router.push("/athlete/social/create")}
              variant="primary"
            >
              {t("create")}
            </Button>
          </div>
        ) : (
          <div className={styles.list()}>
            {posts.map((post) => (
              <article className={styles.card()} key={post.id}>
                <Button
                  className="flex w-full flex-col gap-3 text-start"
                  variant="ghost"
                  onPress={() => router.push(`/athlete/social/${post.id}`)}
                >
                  <div className={styles.cardTop()}>
                    <div>
                      <Typography
                        className={styles.author()}
                        type="body"
                        weight="semibold"
                      >
                        {post.authorLabel}
                      </Typography>
                      <Typography className={styles.meta()} type="body-sm">
                        {post.createdLabel}
                      </Typography>
                    </div>
                  </div>
                  <Typography className={styles.body()} type="body">
                    {post.body}
                  </Typography>
                  {post.mediaUrls.length > 0 ? (
                    <div className={styles.mediaGrid()}>
                      {post.mediaUrls.map((url, index) => (
                        <img
                          alt={t("postMediaAlt", { index: index + 1 })}
                          className={styles.mediaImage()}
                          key={url}
                          loading="lazy"
                          src={url}
                        />
                      ))}
                    </div>
                  ) : null}
                </Button>
                <div className={styles.actions()}>
                  <Button
                    isDisabled={pendingId === post.id}
                    isIconOnly
                    onPress={() => void onLike(post.id)}
                    size="lg"
                    variant="ghost"
                  >
                    <Heart
                      className={post.liked ? "text-danger" : "text-foreground"}
                      size={20}
                    />
                  </Button>
                  <Typography className={styles.meta()} type="body-sm">
                    {toPersianDigits(post.likeCount)}
                  </Typography>
                  <Button
                    isIconOnly
                    onPress={() => router.push(`/athlete/social/${post.id}`)}
                    size="lg"
                    variant="ghost"
                  >
                    <Chat className="text-foreground" size={20} />
                  </Button>
                  <Typography className={styles.meta()} type="body-sm">
                    {toPersianDigits(post.commentCount)}
                  </Typography>
                  <Button
                    isDisabled={pendingId === post.id}
                    isIconOnly
                    onPress={() => void onSave(post.id)}
                    size="lg"
                    variant="ghost"
                  >
                    <Bookmark
                      className={
                        post.saved ? "text-accent" : "text-foreground"
                      }
                      size={20}
                    />
                  </Button>
                  {onReport ? (
                    <Button
                      isIconOnly
                      onPress={() => void onReport(post.id)}
                      size="lg"
                      variant="ghost"
                    >
                      <Flag1 className="text-muted" size={18} />
                    </Button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

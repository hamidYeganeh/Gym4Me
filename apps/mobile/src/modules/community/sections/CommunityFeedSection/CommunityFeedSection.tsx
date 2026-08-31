"use client";

import { TextWithBrand } from "@repo/ui/kit/LineShadowText";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Bookmark } from "@repo/icons/Bookmark";
import { Chat } from "@repo/icons/Chat";
import { Heart } from "@repo/icons/Heart";
import { Image1 } from "@repo/icons/Image1";
import { useTranslations } from "next-intl";
import { communityFeedSectionVariants } from "./CommunityFeedSection.styles";
import type { CommunityFeedSectionProps } from "./CommunityFeedSection.types";

export function CommunityFeedSection({
  posts,
  isLoading = false,
  pendingId,
  canCreate = false,
  onLike,
  onSave,
  onPostPress,
  onCreatePress,
  className,
}: CommunityFeedSectionProps) {
  const t = useTranslations("CommunityHome");
  const slots = communityFeedSectionVariants();

  if (isLoading) {
    return null;
  }

  if (posts.length === 0) {
    return (
      <div className={slots.empty({ className })}>
        <Typography type="h4" weight="semibold">
          {t("emptyTitle")}
        </Typography>
        <Typography className={slots.meta()} type="body-sm">
          {t("emptyBody")}
        </Typography>
        {canCreate ? (
          <Button onPress={onCreatePress} variant="primary" size="lg">
            {t("createPost")}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <section className={slots.root({ className })}>
      <div className={slots.list()}>
        {posts.map((post) => (
          <article className={slots.card()} key={post.id}>
            <Button size="lg"
              className="flex w-full flex-col gap-3 text-start"
              onPress={() => onPostPress?.(post.id)}
              variant="ghost"
            >
              <div>
                <Typography
                  className={slots.author()}
                  type="body"
                  weight="semibold"
                >
                  {post.authorLabel}
                </Typography>
                <Typography className={slots.meta()} type="body-sm">
                  {post.createdLabel}
                </Typography>
              </div>
              <Typography className={slots.body()} type="body">
                <TextWithBrand>{post.body}</TextWithBrand>
              </Typography>
              {post.mediaCount > 0 ? (
                <div className={slots.media()}>
                  <Image1 size={28} />
                </div>
              ) : null}
            </Button>
            <div className={slots.actions()}>
              <Button
                aria-label={t("like")}
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
              <Typography className={slots.meta()} type="body-sm">
                {post.likeCount.toLocaleString("fa-IR")}
              </Typography>
              <Button
                aria-label={t("comment")}
                isIconOnly
                onPress={() => onPostPress?.(post.id)}
                size="lg"
                variant="ghost"
              >
                <Chat className="text-foreground" size={20} />
              </Button>
              <Typography className={slots.meta()} type="body-sm">
                {post.commentCount.toLocaleString("fa-IR")}
              </Typography>
              <Button
                aria-label={t("save")}
                isDisabled={pendingId === post.id}
                isIconOnly
                onPress={() => void onSave(post.id)}
                size="lg"
                variant="ghost"
              >
                <Bookmark
                  className={post.saved ? "text-accent" : "text-foreground"}
                  size={20}
                />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

"use client";

import { Button } from "@heroui/react/button";
import { Skeleton } from "@heroui/react/skeleton";
import { Typography } from "@heroui/react/typography";
import { Bookmark } from "@repo/icons/Bookmark";
import { Chat } from "@repo/icons/Chat";
import { Heart } from "@repo/icons/Heart";
import { Image1 } from "@repo/icons/Image1";
import { useTranslations } from "next-intl";
import { communityFeedSectionVariants } from "./CommunityFeedSection.styles";
import type { CommunityFeedSectionProps } from "./CommunityFeedSection.types";

function CommunityFeedSkeleton({ className }: { className?: string }) {
  const slots = communityFeedSectionVariants();

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={slots.list({ className })}
      role="status"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <article className={slots.card()} key={index}>
          <Skeleton aria-hidden className="h-5 w-32 rounded-md" />
          <Skeleton aria-hidden className="h-3.5 w-20 rounded-md" />
          <Skeleton aria-hidden className="h-4 w-full rounded-md" />
          <Skeleton aria-hidden className="h-4 w-4/5 rounded-md" />
          <Skeleton aria-hidden className="h-36 w-full rounded-[18px]" />
          <div className={slots.actions()}>
            <Skeleton aria-hidden className="size-10 rounded-full" />
            <Skeleton aria-hidden className="size-10 rounded-full" />
            <Skeleton aria-hidden className="size-10 rounded-full" />
          </div>
        </article>
      ))}
    </div>
  );
}

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
    return <CommunityFeedSkeleton className={className} />;
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
          <Button onPress={onCreatePress} variant="primary">
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
            <Button
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
                {post.body}
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

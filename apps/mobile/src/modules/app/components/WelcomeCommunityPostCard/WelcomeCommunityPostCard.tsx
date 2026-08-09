"use client";

import { Button, Card, Typography } from "@heroui/react";
import {
  Bookmark,
  Chat,
  Check,
  DotThreeVertical,
  Eye,
  Heart,
} from "@repo/icons";
import { welcomeCommunityPostCardVariants } from "./WelcomeCommunityPostCard.styles";
import type { WelcomeCommunityPostCardProps } from "./WelcomeCommunityPostCard.types";

export function WelcomeCommunityPostCard({
  className,
  author,
  postedAt,
  body,
  hashtags,
  views,
  likes,
  comments,
  saveLabel,
  menuLabel,
}: WelcomeCommunityPostCardProps) {
  const styles = welcomeCommunityPostCardVariants();

  return (
    <Card className={styles.root({ className })} variant="transparent">
      <Card.Header className={styles.header()}>
        <div className={styles.authorBlock()}>
          <div className={styles.authorRow()}>
            <Typography className={styles.author()} type="body" weight="bold">
              {author}
            </Typography>
            <span aria-hidden className={styles.verified()}>
              <Check className={styles.verifiedIcon()} size={10} />
            </span>
          </div>
          <Typography className={styles.postedAt()} type="body-xs">
            {postedAt}
          </Typography>
        </div>

        <Button
          aria-label={menuLabel}
          className={styles.menu()}
          isIconOnly
          size="lg"
          variant="ghost"
        >
          <DotThreeVertical size={20} />
        </Button>
      </Card.Header>

      <Card.Content className={styles.body()}>
        <Typography className={styles.paragraph()} type="body">
          {body}
        </Typography>
        {hashtags.length > 0 ? (
          <p className={styles.hashtagRow()}>
            {hashtags.map((tag) => (
              <span className={styles.hashtag()} key={tag}>
                {tag}
              </span>
            ))}
            <span aria-hidden>💪🙀</span>
          </p>
        ) : null}
      </Card.Content>

      <Card.Footer className={styles.footer()}>
        <div className={styles.metrics()}>
          <span className={styles.metric()}>
            <Eye aria-hidden className={styles.metricIcon()} size={16} />
            {views}
          </span>
          <span className={styles.metric()}>
            <Heart aria-hidden className={styles.metricIcon()} size={16} />
            {likes}
          </span>
          <span className={styles.metric()}>
            <Chat aria-hidden className={styles.metricIcon()} size={16} />
            {comments}
          </span>
        </div>

        <Button className={styles.save()} size="sm" variant="ghost">
          <Bookmark className={styles.saveIcon()} size={16} />
          {saveLabel}
        </Button>
      </Card.Footer>
    </Card>
  );
}

"use client";

import type { ReactNode } from "react";
import { Avatar, Button, Typography } from "@heroui/react";
import { ArrowUpRight } from "@repo/icons/ArrowUpRight";
import { Bookmark } from "@repo/icons/Bookmark";
import { Chat } from "@repo/icons/Chat";
import { Eye } from "@repo/icons/Eye";
import { Heart } from "@repo/icons/Heart";
import { PlayCircle } from "@repo/icons/PlayCircle";
import { MediaImage } from "../../common/MediaImage";
import { articleCardVariants } from "./ArticleCard.styles";
import type { ArticleCardProps } from "./ArticleCard.types";

function MetaLine({
  items,
  className,
  dotClassName,
}: {
  items: ReactNode[];
  className: string;
  dotClassName: string;
}) {
  const filtered = items.filter((item) => item != null && item !== "");
  if (filtered.length === 0) return null;

  return (
    <div className={className}>
      {filtered.map((item, index) => (
        <span key={index} className="inline-flex items-center gap-1.5">
          {index > 0 ? (
            <span aria-hidden className={dotClassName}>
              •
            </span>
          ) : null}
          <span>{item}</span>
        </span>
      ))}
    </div>
  );
}

export function ArticleCard({
  variant = "stacked",
  coverSrc,
  category,
  title,
  publishedAtLabel,
  readingTimeLabel,
  viewsLabel,
  likesLabel,
  commentsLabel,
  author,
  saved = false,
  saveLabel,
  onSavePress,
  actionLabel,
  className,
  onPress,
  ...props
}: ArticleCardProps) {
  const slots = articleCardVariants({ variant });
  const isStacked = variant === "stacked";
  const isRow = variant === "row";
  const isFeed = variant === "feed";

  return (
    <div className={slots.root({ className })}>
      <Button
        {...props}
        aria-label={actionLabel}
        className={slots.pressable()}
        variant="ghost"
        onPress={onPress}
      >
        {!isFeed ? (
          <div className={slots.cover()}>
            {coverSrc ? (
              <MediaImage
                alt=""
                className={slots.coverImage()}
                image={coverSrc}
                sizes="(max-width: 768px) 100vw, 420px"
              />
            ) : null}
          </div>
        ) : null}

        <div className={slots.body()}>
          {isStacked ? (
            <MetaLine
              className={slots.meta()}
              dotClassName={slots.metaDot()}
              items={[publishedAtLabel, category, readingTimeLabel]}
            />
          ) : null}

          {isFeed ? (
            <MetaLine
              className={slots.meta()}
              dotClassName={slots.metaDot()}
              items={[publishedAtLabel, category, readingTimeLabel]}
            />
          ) : null}

          {isRow ? (
            <Typography className={slots.category()} type="body-xs" weight="bold">
              {category}
            </Typography>
          ) : null}

          <Typography
            className={slots.title()}
            type={isStacked || isFeed ? "h3" : "body"}
            weight="bold"
          >
            {title}
          </Typography>

          {isFeed ? (
            <MetaLine
              className={slots.engagement()}
              dotClassName={slots.metaDot()}
              items={[
                viewsLabel != null ? (
                  <span key="views" className={slots.engagementItem()}>
                    <Eye size={16} />
                    {viewsLabel}
                  </span>
                ) : null,
                likesLabel != null ? (
                  <span key="likes" className={slots.engagementItem()}>
                    <Heart size={16} />
                    {likesLabel}
                  </span>
                ) : null,
                commentsLabel != null ? (
                  <span key="comments" className={slots.engagementItem()}>
                    <Chat size={16} />
                    {commentsLabel}
                  </span>
                ) : null,
              ]}
            />
          ) : null}

          {isStacked && author ? (
            <div className={slots.footer()}>
              <div className={slots.author()}>
                <Avatar className="size-8 shrink-0">
                  {author.avatarSrc ? (
                    <Avatar.Image alt="" src={author.avatarSrc} />
                  ) : null}
                  <Avatar.Fallback>
                    {typeof author.name === "string"
                      ? author.name.slice(0, 1)
                      : "A"}
                  </Avatar.Fallback>
                </Avatar>
                <Typography className={slots.authorName()} type="body-sm">
                  {author.name}
                </Typography>
              </div>
              <span aria-hidden className={slots.iconAffordance()}>
                <ArrowUpRight size={22} />
              </span>
            </div>
          ) : null}

          {isRow && author ? (
            <div className={slots.footer()}>
              <Typography className={slots.authorName()} type="body-sm">
                {author.name}
              </Typography>
              <span className={slots.duration()}>
                {readingTimeLabel ? <span>{readingTimeLabel}</span> : null}
                <PlayCircle className={slots.iconAffordance()} size={18} />
              </span>
            </div>
          ) : null}
        </div>
      </Button>

      {onSavePress && saveLabel ? (
        <div
          className={
            isFeed
              ? "absolute end-3 top-3 z-10"
              : isStacked
                ? "absolute end-3 bottom-3 z-10"
                : "absolute end-2 top-2 z-10"
          }
        >
          <Button
            aria-label={saveLabel}
            aria-pressed={saved}
            className={slots.saveButton({
              className: saved ? slots.saveButtonActive() : undefined,
            })}
            isIconOnly
            size="lg"
            variant="ghost"
            onPress={onSavePress}
          >
            <Bookmark size={18} />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Eye } from "@repo/icons/Eye";
import { File1 } from "@repo/icons/File1";
import { Play } from "@repo/icons/Play";
import { MediaImage } from "../../common/MediaImage";
import { brandAwareText } from "../../kit/LineShadowText";
import { clubGalleryCardVariants } from "./ClubGalleryCard.styles";
import type {
  ClubGalleryCardMediaKind,
  ClubGalleryCardProps,
} from "./ClubGalleryCard.types";

function MediaKindIcon({
  kind,
}: {
  kind: Extract<ClubGalleryCardMediaKind, "video" | "document">;
}) {
  if (kind === "document") return <File1 size={36} />;
  return <Play size={40} />;
}

export function ClubGalleryCard({
  image,
  imageAlt = "",
  title,
  author,
  viewsLabel,
  durationLabel,
  mediaKind = "image",
  isNew = false,
  newLabel = "New",
  actionLabel,
  className,
  onPress,
  ...props
}: ClubGalleryCardProps) {
  const slots = clubGalleryCardVariants();

  return (
    <div className={slots.root({ className })}>
      <Button
        {...props}
        aria-label={actionLabel}
        className={slots.pressable()}
        variant="ghost"
        onPress={onPress}
      >
        <div className={slots.media()}>
          <MediaImage
            alt={imageAlt}
            aria-hidden={imageAlt ? undefined : true}
            className={slots.image()}
            image={image}
            sizes="160px"
          />

          {isNew ? <span className={slots.badge()}>{newLabel}</span> : null}

          {mediaKind === "video" || mediaKind === "document" ? (
            <span aria-hidden className={slots.mediaIcon()}>
              <MediaKindIcon kind={mediaKind} />
            </span>
          ) : null}

          {mediaKind === "video" && durationLabel != null && durationLabel !== "" ? (
            <span className={slots.duration()}>{durationLabel}</span>
          ) : null}
        </div>

        <div className={slots.body()}>
          <Typography className={slots.title()} type="body-sm" weight="bold">
            {title}
          </Typography>

          {author != null && author !== "" ? (
            <Typography className={slots.author()} type="body-xs">
              {brandAwareText(author)}
            </Typography>
          ) : null}

          {viewsLabel != null && viewsLabel !== "" ? (
            <span className={slots.views()}>
              <Eye aria-hidden size={14} />
              {viewsLabel}
            </span>
          ) : null}
        </div>
      </Button>
    </div>
  );
}

"use client";

import { Button, Card, Typography } from "@heroui/react";
import { ArrowUpRight } from "@repo/icons/ArrowUpRight";
import { MediaImage } from "../../common/MediaImage";
import { clubBranchCardVariants } from "./ClubBranchCard.styles";
import type {
  ClubBranchCardProps,
  ClubBranchCardSize,
} from "./ClubBranchCard.types";

const ARROW_SIZE: Record<ClubBranchCardSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

const TITLE_TYPE: Record<ClubBranchCardSize, "h3" | "h2" | "h1"> = {
  sm: "h3",
  md: "h2",
  lg: "h1",
};

const SUBTITLE_TYPE: Record<
  ClubBranchCardSize,
  "body-xs" | "body-sm" | "body"
> = {
  sm: "body-xs",
  md: "body-sm",
  lg: "body",
};

export function ClubBranchCard({
  image,
  imageAlt = "",
  title,
  subtitle,
  size = "md",
  actionLabel,
  onAction,
  imageClassName,
  actionClassName,
  className,
  ...props
}: ClubBranchCardProps) {
  const slots = clubBranchCardVariants({ size });

  return (
    <Card
      className={slots.root({ className })}
      data-size={size}
      variant="transparent"
      {...props}
    >
      <div className={slots.media()}>
        <MediaImage
          alt={imageAlt}
          className={slots.image({ className: imageClassName })}
          image={image}
          sizes="(max-width: 768px) 50vw, 280px"
        />
        <div aria-hidden className={slots.scrim()} />
      </div>

      <div className={slots.body()}>
        <div className={slots.labels()}>
          <Typography
            className={slots.title()}
            type={TITLE_TYPE[size]}
            weight="bold"
          >
            {title}
          </Typography>
          {subtitle != null && subtitle !== "" ? (
            <Typography
              className={slots.subtitle()}
              type={SUBTITLE_TYPE[size]}
              weight="normal"
            >
              {subtitle}
            </Typography>
          ) : null}
        </div>

        <Button
          aria-label={actionLabel}
          className={slots.action({ className: actionClassName })}
          isIconOnly
          onPress={onAction}
          size="lg"
          variant="ghost"
        >
          <ArrowUpRight size={ARROW_SIZE[size]} />
        </Button>
      </div>
    </Card>
  );
}

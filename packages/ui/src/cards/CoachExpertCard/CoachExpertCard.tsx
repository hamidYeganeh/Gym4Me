"use client";

import { Avatar } from "@heroui/react/avatar";
import { Badge } from "@heroui/react/badge";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Check } from "@repo/icons/Check";
import { PLACEHOLDER_IMAGE } from "../../common/placeholder";
import { coachExpertCardVariants } from "./CoachExpertCard.styles";
import type { CoachExpertCardProps } from "./CoachExpertCard.types";

function resolveSrc(image: CoachExpertCardProps["image"]) {
  if (typeof image !== "string") return PLACEHOLDER_IMAGE;
  const trimmed = image.trim();
  return trimmed.length > 0 ? trimmed : PLACEHOLDER_IMAGE;
}

export function CoachExpertCard({
  image,
  imageAlt = "",
  title,
  isVerified = true,
  verifiedLabel = "Verified",
  onPress,
  className,
  ...props
}: CoachExpertCardProps) {
  const slots = coachExpertCardVariants();
  const src = resolveSrc(image);

  const avatar = (
    <Avatar className={slots.avatar()} size="lg">
      <Avatar.Image alt={imageAlt} src={src} />
      <Avatar.Fallback>
        {typeof title === "string" ? title.slice(0, 2) : "?"}
      </Avatar.Fallback>
    </Avatar>
  );

  return (
    <Button
      {...props}
      className={slots.root({ className })}
      onPress={onPress}
      variant="ghost"
    >
      {isVerified ? (
        <Badge.Anchor>
          {avatar}
          <Badge
            aria-label={verifiedLabel}
            className={slots.badge()}
            color="success"
            placement="bottom-right"
            size="sm"
          >
            <Check aria-hidden className={slots.badgeIcon()} size={12} />
          </Badge>
        </Badge.Anchor>
      ) : (
        avatar
      )}
      <Typography className={slots.title()} type="body-sm" weight="medium">
        {title}
      </Typography>
    </Button>
  );
}

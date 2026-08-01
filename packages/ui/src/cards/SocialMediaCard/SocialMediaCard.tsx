"use client";

import { Button, Card, Typography } from "@heroui/react";
import { LogoFacebook } from "@repo/icons/LogoFacebook";
import { LogoInstagram } from "@repo/icons/LogoInstagram";
import { LogoLinkedin } from "@repo/icons/LogoLinkedin";
import { Share2 } from "@repo/icons/Share2";
import { socialMediaCardVariants } from "./SocialMediaCard.styles";
import type {
  SocialMediaCardProps,
  SocialMediaItem,
} from "./SocialMediaCard.types";

const ICON_SIZE = 24;

function defaultItems({
  facebookLabel,
  instagramLabel,
  linkedinLabel,
  onFacebook,
  onInstagram,
  onLinkedIn,
}: Pick<
  SocialMediaCardProps,
  | "facebookLabel"
  | "instagramLabel"
  | "linkedinLabel"
  | "onFacebook"
  | "onInstagram"
  | "onLinkedIn"
>): SocialMediaItem[] {
  return [
    {
      key: "facebook",
      label: facebookLabel ?? "Facebook",
      icon: <LogoFacebook size={ICON_SIZE} />,
      onPress: onFacebook,
    },
    {
      key: "instagram",
      label: instagramLabel ?? "Instagram",
      icon: <LogoInstagram size={ICON_SIZE} />,
      onPress: onInstagram,
    },
    {
      key: "linkedin",
      label: linkedinLabel ?? "LinkedIn",
      icon: <LogoLinkedin size={ICON_SIZE} />,
      onPress: onLinkedIn,
    },
  ];
}

export function SocialMediaCard({
  title = "SHARE THIS ON",
  items,
  facebookLabel,
  instagramLabel,
  linkedinLabel,
  onFacebook,
  onInstagram,
  onLinkedIn,
  shareIcon,
  className,
  ...props
}: SocialMediaCardProps) {
  const slots = socialMediaCardVariants();
  const resolvedItems =
    items ??
    defaultItems({
      facebookLabel,
      instagramLabel,
      linkedinLabel,
      onFacebook,
      onInstagram,
      onLinkedIn,
    });

  return (
    <Card className={slots.root({ className })} variant="transparent" {...props}>
      <Card.Header className={slots.header()}>
        <Typography className={slots.title()} type="body" weight="bold">
          {title}
        </Typography>
        <span aria-hidden className={slots.shareIcon()}>
          {shareIcon ?? <Share2 size={22} />}
        </span>
      </Card.Header>

      <Card.Content className={slots.list()}>
        {resolvedItems.map((item, index) => (
          <Button
            aria-label={item.label}
            className={slots.item()}
            key={item.key}
            onPress={item.onPress}
            style={{ zIndex: resolvedItems.length - index }}
            variant="ghost"
          >
            <span className={slots.itemIcon()}>{item.icon}</span>
          </Button>
        ))}
      </Card.Content>
    </Card>
  );
}

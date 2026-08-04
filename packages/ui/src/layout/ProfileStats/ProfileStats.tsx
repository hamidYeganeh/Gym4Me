"use client";

import { Avatar, Button, Typography } from "@heroui/react";
import { ArrowUpRight } from "@repo/icons/ArrowUpRight";
import { PLACEHOLDER_IMAGE } from "../../common/placeholder";
import { profileStatsVariants } from "./ProfileStats.styles";
import type { ProfileStatsProps } from "./ProfileStats.types";

function resolveSrc(src: string | undefined) {
  if (typeof src !== "string") return PLACEHOLDER_IMAGE;
  const trimmed = src.trim();
  return trimmed.length > 0 ? trimmed : PLACEHOLDER_IMAGE;
}

export function ProfileStats({ stats, className }: ProfileStatsProps) {
  const slots = profileStatsVariants();

  if (stats.length === 0) return null;

  return (
    <div className={slots.root({ className })}>
      {stats.map((stat) => (
        <div className={slots.card()} key={stat.key}>
          <Typography className={slots.label()} type="body-sm">
            {stat.label}
          </Typography>
          <Typography className={slots.value()} weight="bold">
            {stat.value}
          </Typography>

          {stat.avatars && stat.avatars.length > 0 ? (
            <div className={slots.avatars()}>
              {stat.avatars.slice(0, 3).map((src, index) => (
                <Avatar className={slots.avatar()} key={`${stat.key}-${index}`}>
                  <Avatar.Image
                    alt=""
                    className={slots.avatarImage()}
                    src={resolveSrc(src)}
                  />
                  <Avatar.Fallback>·</Avatar.Fallback>
                </Avatar>
              ))}
            </div>
          ) : null}

          {stat.onActionPress ? (
            <Button
              aria-label={stat.actionLabel || stat.label}
              className={slots.action()}
              isIconOnly
              onPress={stat.onActionPress}
              size="lg"
              variant="tertiary"
            >
              <ArrowUpRight size={16} />
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

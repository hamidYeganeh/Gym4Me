"use client";

import { Avatar } from "@heroui/react/avatar";
import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Typography } from "@heroui/react/typography";
import { discoverySearchUsersSectionVariants } from "./DiscoverySearchUsersSection.styles";
import type { DiscoverySearchUsersSectionProps } from "./DiscoverySearchUsersSection.types";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2);
  return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`;
}

export function DiscoverySearchUsersSection({
  users,
  followingIds,
  title,
  followLabel,
  followingLabel,
  emptyLabel,
  joinedLabel,
  followAria,
  unfollowAria,
  openUserAria,
  onOpen,
  onFollow,
  className,
}: DiscoverySearchUsersSectionProps) {
  const slots = discoverySearchUsersSectionVariants();

  return (
    <section className={slots.root({ className })}>
      <Typography className={slots.title()} type="h4" weight="bold">
        {title}
      </Typography>

      {users.length === 0 ? (
        <Typography className={slots.empty()} type="body-sm">
          {emptyLabel}
        </Typography>
      ) : (
        <div className={slots.list()} role="list">
          {users.map((user) => {
            const following = followingIds.has(user.id);
            return (
              <Card className={slots.card()} key={user.id} variant="transparent">
                <div className={slots.row()} role="listitem">
                  <Button
                    aria-label={openUserAria(user.name)}
                    className={slots.identity()}
                    variant="ghost"
                    onPress={() => onOpen(user)}
                  >
                    <Avatar className={slots.avatar()} color="accent" size="lg">
                      <Avatar.Image
                        alt=""
                        className={slots.avatarImage()}
                        src={user.image}
                      />
                      <Avatar.Fallback>
                        {initialsFromName(user.name)}
                      </Avatar.Fallback>
                    </Avatar>
                    <span className={slots.copy()}>
                      <Typography
                        className={slots.name()}
                        type="body"
                        weight="bold"
                      >
                        {user.name}
                      </Typography>
                      <Typography className={slots.joined()} type="body-sm">
                        {joinedLabel(user.joinedYear)}
                      </Typography>
                    </span>
                  </Button>
                  <Button
                    aria-label={
                      following ? unfollowAria(user.name) : followAria(user.name)
                    }
                    className={slots.follow()}
                    size="sm"
                    variant={following ? "outline" : "primary"}
                    onPress={() => onFollow(user)}
                  >
                    {following ? followingLabel : followLabel}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

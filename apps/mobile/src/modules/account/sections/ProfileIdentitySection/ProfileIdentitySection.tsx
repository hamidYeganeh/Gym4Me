"use client";

import { Avatar } from "@heroui/react/avatar";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { StarFour } from "@repo/icons/StarFour";
import { profileIdentitySectionVariants } from "./ProfileIdentitySection.styles";
import type { ProfileIdentitySectionProps } from "./ProfileIdentitySection.types";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2);
  return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`;
}

export function ProfileIdentitySection({
  name,
  roleLabel,
  subtitle,
  avatarSrc,
  avatarAlt = "",
  className,
  ...props
}: ProfileIdentitySectionProps) {
  const styles = profileIdentitySectionVariants();
  const trimmedAvatar = avatarSrc?.trim();

  return (
    <section className={styles.root({ className })} {...props}>
      <div className={styles.avatarWrap()}>
        <Avatar className={styles.avatar()} color="accent">
          {trimmedAvatar ? (
            <Avatar.Image
              alt={avatarAlt || name}
              className={styles.avatarImage()}
              src={trimmedAvatar}
            />
          ) : null}
          <Avatar.Fallback>{initialsFromName(name)}</Avatar.Fallback>
        </Avatar>
      </div>

      <Chip className={styles.roleChip()} size="sm">
        <StarFour size={14} />
        <Chip.Label>{roleLabel}</Chip.Label>
      </Chip>

      <div className="flex flex-col gap-2">
        <Typography className={styles.name()} type="h1" weight="bold">
          {name}
        </Typography>
        <Typography className={styles.subtitle()} type="body">
          {subtitle}
        </Typography>
      </div>
    </section>
  );
}

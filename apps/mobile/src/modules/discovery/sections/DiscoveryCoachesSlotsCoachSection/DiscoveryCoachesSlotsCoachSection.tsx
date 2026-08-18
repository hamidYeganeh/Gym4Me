"use client";

import { Avatar } from "@heroui/react/avatar";
import { Typography } from "@heroui/react/typography";
import { StarFull } from "@repo/icons/StarFull";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { discoveryCoachesSlotsCoachSectionVariants } from "./DiscoveryCoachesSlotsCoachSection.styles";
import type { DiscoveryCoachesSlotsCoachSectionProps } from "./DiscoveryCoachesSlotsCoachSection.types";

function formatRating(rating: number) {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2);
  return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`;
}

export function DiscoveryCoachesSlotsCoachSection({
  coach,
  className,
}: DiscoveryCoachesSlotsCoachSectionProps) {
  const styles = discoveryCoachesSlotsCoachSectionVariants();
  const avatarSrc = coach.avatar?.trim() || PLACEHOLDER_IMAGE;

  return (
    <div className={styles.root({ className })}>
      <Avatar className={styles.avatar()} size="lg">
        <Avatar.Image alt={coach.name} src={avatarSrc} />
        <Avatar.Fallback>{initialsFromName(coach.name)}</Avatar.Fallback>
      </Avatar>
      <div className={styles.meta()}>
        <Typography className={styles.name()} weight="bold">
          {coach.name}
        </Typography>
        <Typography className={styles.specialty()} type="body-sm">
          {coach.specialty}
        </Typography>
      </div>
      <div className={styles.rating()}>
        <Typography className={styles.ratingValue()} weight="semibold">
          {formatRating(coach.rating)}
        </Typography>
        <StarFull aria-hidden className={styles.ratingStar()} size={16} />
      </div>
    </div>
  );
}

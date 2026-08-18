"use client";

import { Avatar } from "@heroui/react/avatar";
import { Typography } from "@heroui/react/typography";
import { StarFull } from "@repo/icons/StarFull";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { discoveryCoachesReserveHeaderSectionVariants as styles } from "./DiscoveryCoachesReserveHeaderSection.styles";
import type { DiscoveryCoachesReserveHeaderSectionProps } from "./DiscoveryCoachesReserveHeaderSection.types";

function formatRating(rating: number) {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2);
  return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`;
}

export function DiscoveryCoachesReserveHeaderSection({
  coach,
}: DiscoveryCoachesReserveHeaderSectionProps) {
  const slots = styles();

  return (
    <div className={slots.coachRow()}>
      <Avatar className={slots.avatar()} size="lg">
        <Avatar.Image
          alt={coach.name}
          src={coach.avatar?.trim() || PLACEHOLDER_IMAGE}
        />
        <Avatar.Fallback>{initialsFromName(coach.name)}</Avatar.Fallback>
      </Avatar>
      <div className={slots.coachMeta()}>
        <Typography className={slots.coachName()} weight="bold">
          {coach.name}
        </Typography>
        <Typography className={slots.coachSpecialty()} type="body-sm">
          {coach.specialty}
        </Typography>
      </div>
      {coach.rating > 0 ? (
        <div className={slots.rating()}>
          <Typography className={slots.ratingValue()} weight="semibold">
            {formatRating(coach.rating)}
          </Typography>
          <StarFull aria-hidden className={slots.ratingStar()} size={16} />
        </div>
      ) : null}
    </div>
  );
}

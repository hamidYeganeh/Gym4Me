"use client";

import { Card } from "@heroui/react";
import { BookOpen } from "@repo/icons/BookOpen";
import { clubAmenityCardVariants } from "./ClubAmenityCard.styles";
import type { ClubAmenityCardProps } from "./ClubAmenityCard.types";

export function ClubAmenityCard({
  title,
  subtitle,
  icon,
  className,
  ...props
}: ClubAmenityCardProps) {
  const slots = clubAmenityCardVariants();

  return (
    <Card
      className={slots.root({ className })}
      variant="transparent"
      {...props}
    >
      <div className={slots.body()}>
        <Card.Header className={slots.header()}>
          <Card.Title className={slots.title()}>{title}</Card.Title>
          {subtitle != null && subtitle !== "" ? (
            <Card.Description className={slots.subtitle()}>
              {subtitle}
            </Card.Description>
          ) : null}
        </Card.Header>
      </div>

      <span aria-hidden className={slots.iconBadge()}>
        {icon ?? <BookOpen className={slots.icon()} size={36} />}
      </span>
    </Card>
  );
}

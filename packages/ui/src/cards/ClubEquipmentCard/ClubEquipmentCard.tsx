"use client";

import { Card } from "@heroui/react";
import { Treadmill } from "@repo/icons/Treadmill";
import { clubEquipmentCardVariants } from "./ClubEquipmentCard.styles";
import type { ClubEquipmentCardProps } from "./ClubEquipmentCard.types";

export function ClubEquipmentCard({
  title,
  subtitle,
  meta,
  icon,
  className,
  ...props
}: ClubEquipmentCardProps) {
  const slots = clubEquipmentCardVariants();

  return (
    <Card
      className={slots.root({ className })}
      variant="transparent"
      {...props}
    >
      <span aria-hidden className={slots.iconBadge()}>
        {icon ?? <Treadmill className={slots.icon()} size={20} />}
      </span>

      <div className={slots.body()}>
        <Card.Header className={slots.header()}>
          <Card.Title className={slots.title()}>{title}</Card.Title>
          {subtitle != null && subtitle !== "" ? (
            <Card.Description className={slots.subtitle()}>
              {subtitle}
            </Card.Description>
          ) : null}
        </Card.Header>

        {meta != null && meta !== "" ? (
          <p className={slots.meta()}>{meta}</p>
        ) : null}
      </div>
    </Card>
  );
}

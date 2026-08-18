"use client";

import { Card } from "@heroui/react/card";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { MapPin1 } from "@repo/icons/MapPin1";
import { StarFull } from "@repo/icons/StarFull";
import { UsersTwo } from "@repo/icons/UsersTwo";
import type { ReactNode } from "react";
import { clubLocationCardVariants } from "./ClubLocationCard.styles";
import type {
  ClubLocationCardProps,
  ClubLocationStatKey,
} from "./ClubLocationCard.types";

function splitStatValue(value: ReactNode): {
  amount: ReactNode;
  unit?: string;
} {
  if (typeof value !== "string") return { amount: value };
  const trimmed = value.trim();
  const match = trimmed.match(/^(.+?)\s+(کیلومتر|km|KM)$/u);
  if (!match) return { amount: trimmed };
  return { amount: match[1]!.trim(), unit: match[2] };
}

function StatIcon({
  statKey,
  className,
  scoreClassName,
  studentsClassName,
}: {
  statKey: ClubLocationStatKey;
  className: string;
  scoreClassName: string;
  studentsClassName: string;
}) {
  if (statKey === "distance") {
    return <MapPin1 aria-hidden className={className} size={14} />;
  }
  if (statKey === "score") {
    return <StarFull aria-hidden className={scoreClassName} size={14} />;
  }
  return <UsersTwo aria-hidden className={studentsClassName} size={14} />;
}

export function ClubLocationCard({
  status,
  statusLabel,
  hoursLabel,
  stats,
  className,
  ...props
}: ClubLocationCardProps) {
  const slots = clubLocationCardVariants({ status });
  const showHeader =
    (status != null && statusLabel != null && statusLabel !== "") ||
    (hoursLabel != null && hoursLabel !== "");

  return (
    <div className={slots.root({ className })} {...props}>
      {showHeader ? (
        <div className={slots.header()}>
          {status != null && statusLabel != null && statusLabel !== "" ? (
            <Chip className={slots.statusChip()} size="sm">
              <Chip.Label>{statusLabel}</Chip.Label>
            </Chip>
          ) : null}
          {hoursLabel != null && hoursLabel !== "" ? (
            <Typography className={slots.hours()} type="body-xs">
              {hoursLabel}
            </Typography>
          ) : null}
        </div>
      ) : null}

      {stats.length > 0 ? (
        <Card className={slots.card()} variant="default">
          <div className={slots.body()}>
            {stats.map((stat) => {
              const { amount, unit } = splitStatValue(stat.value);
              return (
                <div className={slots.cell()} key={stat.key}>
                  <div className={slots.valueStack()}>
                    <Typography
                      className={slots.value()}
                      type="h3"
                      weight="bold"
                    >
                      {amount}
                    </Typography>
                    {unit ? (
                      <Typography className={slots.unit()} type="body-xs">
                        {unit}
                      </Typography>
                    ) : null}
                  </div>
                  <div className={slots.meta()}>
                    <StatIcon
                      className={slots.icon()}
                      scoreClassName={slots.iconScore()}
                      statKey={stat.key}
                      studentsClassName={slots.iconStudents()}
                    />
                    <Typography className={slots.label()} type="body-xs">
                      {stat.label}
                    </Typography>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

"use client";

import { Card } from "@heroui/react";
import { BarbellDiagonal } from "@repo/icons/BarbellDiagonal";
import { useId } from "react";
import { Logo } from "../../common/Logo";
import { achievementCardVariants } from "./AchievementCard.styles";
import type { AchievementCardProps } from "./AchievementCard.types";

const POLYGON_PATH =
  "M31.4453 1.00049C32.173 1.00049 32.8302 1.19644 33.5273 1.51221C34.2045 1.81897 34.9861 2.2709 35.9453 2.82471L57.3906 15.2056C58.3498 15.7593 59.1321 16.21 59.7363 16.6431C60.3583 17.0889 60.8569 17.5607 61.2207 18.1909C61.5845 18.8211 61.7433 19.4889 61.8184 20.2505C61.8913 20.9903 61.8906 21.8931 61.8906 23.0005V47.7622C61.8906 48.8696 61.8913 49.7724 61.8184 50.5122C61.7433 51.2738 61.5845 51.9416 61.2207 52.5718C60.8569 53.202 60.3583 53.6738 59.7363 54.1196C59.1321 54.5527 58.3498 55.0034 57.3906 55.5571L35.9453 67.938C34.9861 68.4918 34.2045 68.9437 33.5273 69.2505C32.8302 69.5663 32.173 69.7622 31.4453 69.7622C30.7176 69.7622 30.0604 69.5663 29.3633 69.2505C29.0247 69.0971 28.6596 68.9077 28.2598 68.687L26.9453 67.938L5.5 55.5571C4.54086 55.0034 3.75851 54.5527 3.1543 54.1196C2.53229 53.6738 2.03377 53.202 1.66992 52.5718C1.30614 51.9416 1.14734 51.2738 1.07227 50.5122C0.999372 49.7724 1 48.8696 1 47.7622V23.0005C1 21.8931 0.999372 20.9903 1.07227 20.2505C1.14734 19.4889 1.30614 18.8211 1.66992 18.1909C2.03377 17.5607 2.53229 17.0889 3.1543 16.6431C3.75851 16.21 4.54086 15.7593 5.5 15.2056L26.9453 2.82471C27.9045 2.2709 28.6861 1.81897 29.3633 1.51221C30.0604 1.19644 30.7176 1.00049 31.4453 1.00049Z";

function AchievementPolygonFrame({
  className,
  pathClassName,
}: {
  className?: string;
  pathClassName?: string;
}) {
  const gradientId = `achievement-stroke-${useId().replace(/:/g, "")}`;

  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      viewBox="0 0 63 71"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className={pathClassName}
        d={POLYGON_PATH}
        stroke={`url(#${gradientId})`}
        strokeWidth={2}
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={gradientId}
          x1="31.4453"
          x2="31.4453"
          y1="1.38135"
          y2="69.3813"
        >
          <stop stopColor="var(--achievement)" />
          <stop offset="1" stopColor="var(--achievement)" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AchievementCard({
  variant = "polygon",
  color = "accent",
  icon,
  badgeIcon,
  className,
  ...props
}: AchievementCardProps) {
  const slots = achievementCardVariants({ variant, color });

  return (
    <Card
      className={slots.root({ className })}
      data-color={color}
      data-variant={variant}
      variant="transparent"
      {...props}
    >
      <AchievementPolygonFrame
        className={slots.frame()}
        pathClassName={slots.framePath()}
      />

      <span aria-hidden className={slots.iconWrap()}>
        {icon ?? <BarbellDiagonal className={slots.icon()} size={28} />}
      </span>

      <span aria-hidden className={slots.badge()}>
        {badgeIcon ?? (
          <Logo
            aria-hidden
            className={slots.badgeIcon()}
            color="var(--achievement)"
            gradient={false}
            shadow={false}
            size={14}
            title=""
          />
        )}
      </span>
    </Card>
  );
}

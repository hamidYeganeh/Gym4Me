"use client";

import { Button, ProgressBar, Typography } from "@heroui/react";
import { Flag1 } from "@repo/icons/Flag1";
import { Pencil1 } from "@repo/icons/Pencil1";
import { metricGoalCardVariants } from "./MetricGoalCard.styles";
import type { MetricGoalCardProps } from "./MetricGoalCard.types";

export function MetricGoalCard({
  goalValue,
  goalLabel,
  description,
  progress,
  progressLabel,
  currentLabel,
  editLabel,
  onEdit,
  icon,
  className,
}: MetricGoalCardProps) {
  const slots = metricGoalCardVariants();
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={slots.root({ className })}>
      <div className={slots.header()}>
        <span aria-hidden className={slots.iconWrap()}>
          {icon ?? <Flag1 size={22} />}
        </span>
        <div className={slots.goalMeta()}>
          <Typography className={slots.goalValue()} weight="bold">
            {goalValue}
          </Typography>
          <Typography className={slots.goalLabel()} type="body-sm">
            {goalLabel}
          </Typography>
        </div>
      </div>

      <Typography className={slots.description()} type="body-sm">
        {description}
      </Typography>

      <div className={slots.progress()}>
        <ProgressBar
          aria-label={String(goalLabel)}
          className="gap-0"
          value={clamped}
        >
          <ProgressBar.Track className={slots.track()}>
            <ProgressBar.Fill className={slots.fill()} />
          </ProgressBar.Track>
        </ProgressBar>
        <div className={slots.progressLabels()}>
          <Typography className={slots.progressText()} type="body-sm">
            {progressLabel}
          </Typography>
          <Typography className={slots.progressText()} type="body-sm">
            {currentLabel}
          </Typography>
        </div>
      </div>

      <Button className={slots.edit()} onPress={onEdit} variant="ghost">
        <Pencil1 className={slots.editIcon()} size={16} />
        {editLabel}
      </Button>
    </div>
  );
}

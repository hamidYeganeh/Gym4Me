"use client";

import { Card } from "@heroui/react/card";
import { ProgressBar } from "@heroui/react/progress-bar";
import { Separator } from "@heroui/react/separator";
import { Typography } from "@heroui/react/typography";
import { StarFull } from "@repo/icons/StarFull";
import { reviewSummaryCardVariants } from "./ReviewSummaryCard.styles";
import type { ReviewSummaryCardProps } from "./ReviewSummaryCard.types";

export function ReviewSummaryCard({
  average,
  averageLabel,
  usersLabel,
  buckets,
  highlights = [],
  className,
  ...props
}: ReviewSummaryCardProps) {
  const slots = reviewSummaryCardVariants();

  return (
    <Card
      className={slots.root({ className })}
      variant="transparent"
      {...props}
    >
      <Card.Content className="flex flex-col gap-0 p-0">
        <div className={slots.summary()}>
          <div className={slots.averageBlock()}>
            <Typography className={slots.average()} weight="bold">
              {average}
            </Typography>
            <Typography className={slots.averageLabel()} type="body-sm">
              {averageLabel}
            </Typography>
            <Typography className={slots.usersLabel()} type="body-sm">
              {usersLabel}
            </Typography>
          </div>

          <div className={slots.bars()} role="list">
            {buckets.map((bucket) => (
              <div
                className={slots.barRow()}
                key={bucket.stars}
                role="listitem"
              >
                <span className={slots.barStar()}>
                  {bucket.stars}
                  <StarFull
                    aria-hidden
                    className={slots.barStarIcon()}
                    size={12}
                  />
                </span>
                <ProgressBar
                  aria-label={`${bucket.stars}`}
                  className={slots.progress()}
                  maxValue={100}
                  size="sm"
                  value={Math.round(Math.min(1, Math.max(0, bucket.ratio)) * 100)}
                >
                  <ProgressBar.Track className={slots.progressTrack()}>
                    <ProgressBar.Fill className={slots.progressFill()} />
                  </ProgressBar.Track>
                </ProgressBar>
                <span className={slots.barCount()}>{bucket.count}</span>
              </div>
            ))}
          </div>
        </div>

        {highlights.length > 0 ? (
          <div className={slots.highlights()} role="list">
            {highlights.map((highlight, index) => (
              <div key={highlight.id}>
                {index > 0 ? (
                  <Separator className={slots.divider()} />
                ) : null}
                <div className={slots.highlight()} role="listitem">
                  <span aria-hidden className={slots.highlightIcon()}>
                    {highlight.icon}
                  </span>
                  <span className={slots.highlightMeta()}>
                    <span className={slots.highlightTitle()}>
                      {highlight.title}
                    </span>
                    <span className={slots.highlightDescription()}>
                      {highlight.description}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Card.Content>
    </Card>
  );
}

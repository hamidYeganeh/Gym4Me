"use client";

import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Link } from "@heroui/react/link";
import { Typography } from "@heroui/react/typography";
import { ArrowUpRight } from "@repo/icons/ArrowUpRight";
import { Clipboard } from "@repo/icons/Clipboard";
import { ownerHomeTasksOverviewSectionStyles as styles } from "./OwnerHomeTasksOverviewSection.styles";
import type { OwnerHomeTasksOverviewSectionProps } from "./OwnerHomeTasksOverviewSection.types";

const ACTION_ICON_SIZE = 16;
const SUMMARY_ICON_SIZE = 18;

export function OwnerHomeTasksOverviewSection({
  title,
  summary,
  seeAllLabel,
  primary,
  upcoming,
  assigned,
  onSeeAll,
}: OwnerHomeTasksOverviewSectionProps) {
  return (
    <section aria-label={title} className={styles.root}>
      <div className={styles.header}>
        <Typography className={styles.title} type="h4" weight="bold">
          {title}
        </Typography>

        <div className={styles.summaryRow}>
          <div className={styles.summary}>
            <Clipboard
              aria-hidden
              className={styles.summaryIcon}
              size={SUMMARY_ICON_SIZE}
            />
            <Typography className={styles.summaryText} type="body-sm">
              {summary}
            </Typography>
          </div>

          <Link className={styles.seeAll} onPress={onSeeAll}>
            {seeAllLabel}
          </Link>
        </div>
      </div>

      <div className={styles.grid}>
        <Card className={styles.primaryCard} variant="transparent">
          <div aria-hidden className={styles.primaryDecor}>
            <span className={styles.primaryBar} />
            <span className={styles.primaryBar} />
            <span className={styles.primaryBar} />
          </div>

          <div className={styles.primaryHeader}>
            <Typography className={styles.primaryLabel} type="body" weight="medium">
              {primary.title}
            </Typography>
            <Button
              aria-label={primary.actionLabel}
              className={styles.primaryAction}
              isIconOnly
              onPress={primary.onAction}
              size="lg"
              variant="ghost"
            >
              <ArrowUpRight size={ACTION_ICON_SIZE} />
            </Button>
          </div>

          <div className={styles.primaryBody}>
            <Typography className={styles.primaryValue} type="body" weight="bold">
              {primary.value}
            </Typography>
            <Typography className={styles.primaryDescription} type="body-sm">
              {primary.description}
            </Typography>
          </div>
        </Card>

        <Card
          className={`${styles.secondaryCard} ${styles.upcomingCard}`}
          variant="transparent"
        >
          <div className={styles.cardHeader}>
            <Typography className={styles.cardLabel} type="body-sm" weight="medium">
              {upcoming.title}
            </Typography>
            <Button
              aria-label={upcoming.actionLabel}
              className={styles.cardAction}
              isIconOnly
              onPress={upcoming.onAction}
              size="lg"
              variant="ghost"
            >
              <ArrowUpRight size={ACTION_ICON_SIZE} />
            </Button>
          </div>
          <div className={styles.cardBody}>
            <Typography className={styles.cardValue} type="body" weight="bold">
              {upcoming.value}
            </Typography>
            <Typography className={styles.cardDescription} type="body-sm">
              {upcoming.description}
            </Typography>
          </div>
        </Card>

        <Card
          className={`${styles.secondaryCard} ${styles.assignedCard}`}
          variant="transparent"
        >
          <div className={styles.cardHeader}>
            <Typography className={styles.cardLabel} type="body-sm" weight="medium">
              {assigned.title}
            </Typography>
            <Button
              aria-label={assigned.actionLabel}
              className={styles.cardAction}
              isIconOnly
              onPress={assigned.onAction}
              size="lg"
              variant="ghost"
            >
              <ArrowUpRight size={ACTION_ICON_SIZE} />
            </Button>
          </div>
          <div className={styles.cardBody}>
            <Typography className={styles.cardValue} type="body" weight="bold">
              {assigned.value}
            </Typography>
            <Typography className={styles.cardDescription} type="body-sm">
              {assigned.description}
            </Typography>
          </div>
        </Card>
      </div>
    </section>
  );
}

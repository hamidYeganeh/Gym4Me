"use client";

import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import type { CoachClientSession } from "../../lib/coach-clients-data";
import { coachClientDetailSessionsSectionVariants } from "./CoachClientDetailSessionsSection.styles";
import type { CoachClientDetailSessionsSectionProps } from "./CoachClientDetailSessionsSection.types";

const SESSION_STATUS_CHIP_COLOR: Record<
  CoachClientSession["status"],
  "success" | "warning" | "danger" | "default"
> = {
  COMPLETED: "success",
  CONFIRMED: "success",
  CANCELLED: "danger",
  NO_SHOW: "warning",
};

const SESSION_STATUS_LABEL_KEY: Record<CoachClientSession["status"], string> = {
  COMPLETED: "statusCompleted",
  CONFIRMED: "statusConfirmed",
  CANCELLED: "statusCancelled",
  NO_SHOW: "statusNoShow",
};

export function CoachClientDetailSessionsSection({
  title,
  sessions,
  emptyMessage,
}: CoachClientDetailSessionsSectionProps) {
  const t = useTranslations("CoachClientDetail");
  const styles = coachClientDetailSessionsSectionVariants();

  return (
    <section className={styles.root()}>
      <Typography className={styles.title()} type="h4" weight="semibold">
        {title}
      </Typography>
      <div className={styles.groupCard()}>
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <div key={session.id}>
              <div className={styles.row()}>
                <div className={styles.rowBody()}>
                  <Typography
                    className={styles.rowTitle()}
                    type="body"
                    weight="semibold"
                  >
                    {session.typeLabel}
                  </Typography>
                  <Typography className={styles.rowMeta()} type="body-sm">
                    {session.dateLabel}
                  </Typography>
                </div>
                <Chip
                  color={SESSION_STATUS_CHIP_COLOR[session.status]}
                  size="sm"
                  variant="soft"
                >
                  <Chip.Label>
                    {t(SESSION_STATUS_LABEL_KEY[session.status])}
                  </Chip.Label>
                </Chip>
              </div>
              <div className={styles.divider()} />
            </div>
          ))
        ) : emptyMessage ? (
          <Typography className={styles.emptyRow()} type="body-sm">
            {emptyMessage}
          </Typography>
        ) : null}
      </div>
    </section>
  );
}

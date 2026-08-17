import { Chip, Typography } from "@heroui/react";
import { ownerClubDetailClassesSectionVariants } from "./OwnerClubDetailClassesSection.styles";
import type { OwnerClubDetailClassesSectionProps } from "./OwnerClubDetailClassesSection.types";

export function OwnerClubDetailClassesSection({
  title,
  enrolledLabel,
  classes,
  activeStateLabel,
  pausedStateLabel,
  className,
}: OwnerClubDetailClassesSectionProps) {
  const styles = ownerClubDetailClassesSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h4" weight="semibold">
        {title}
      </Typography>
      <div className={styles.groupCard()}>
        {classes.map((classItem, index) => {
          const fillPercent = Math.min(
            Math.round((classItem.enrolled / classItem.capacity) * 100),
            100,
          );

          return (
            <div key={classItem.id}>
              <div className={styles.row()}>
                <span className={styles.rowBody()}>
                  <Typography
                    className={styles.rowLabel()}
                    type="body"
                    weight="medium"
                  >
                    {classItem.title}
                  </Typography>
                  <Typography className={styles.rowHint()} type="body-sm">
                    {classItem.coach} · {classItem.scheduleLabel}
                  </Typography>
                  <span className={styles.progress()}>
                    <span className={styles.progressRow()}>
                      <Typography
                        className={styles.progressLabel()}
                        type="body-sm"
                      >
                        {enrolledLabel}
                      </Typography>
                      <span className={styles.progressValue()}>
                        {classItem.enrolled}/{classItem.capacity}
                      </span>
                    </span>
                    <span aria-hidden className={styles.progressTrack()}>
                      <span
                        className={styles.progressFill()}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </span>
                  </span>
                </span>
                <Chip
                  color={
                    classItem.state === "active" ? "success" : "warning"
                  }
                  size="sm"
                  variant="soft"
                >
                  <Chip.Label>
                    {classItem.state === "active"
                      ? activeStateLabel
                      : pausedStateLabel}
                  </Chip.Label>
                </Chip>
              </div>
              {index < classes.length - 1 ? (
                <div aria-hidden className={styles.divider()} />
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

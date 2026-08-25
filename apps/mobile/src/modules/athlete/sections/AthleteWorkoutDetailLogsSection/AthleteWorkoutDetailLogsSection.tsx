import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { athleteWorkoutDetailLogsSectionVariants } from "./AthleteWorkoutDetailLogsSection.styles";
import type { AthleteWorkoutDetailLogsSectionProps } from "./AthleteWorkoutDetailLogsSection.types";

export function AthleteWorkoutDetailLogsSection({
  title,
  emptyTitle,
  emptyBody,
  sessionLabel,
  setsCountLabel,
  logStatusLabel,
  coachFeedbackLabel,
  logs,
  className,
}: AthleteWorkoutDetailLogsSectionProps) {
  const styles = athleteWorkoutDetailLogsSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.sectionTitle()} type="body-sm">
        {title}
      </Typography>
      {logs.length === 0 ? (
        <div className={styles.empty()}>
          <Typography type="h4" weight="semibold">
            {emptyTitle}
          </Typography>
          <Typography className={styles.meta()} type="body-sm">
            {emptyBody}
          </Typography>
        </div>
      ) : (
        <div className={styles.list()}>
          {logs.map((log) => (
            <article className={styles.card()} key={log.id}>
              <div className={styles.cardTop()}>
                <Typography type="body" weight="semibold">
                  {sessionLabel(log.sessionIndex)}
                </Typography>
                <Chip
                  color={
                    log.status === "completed"
                      ? "success"
                      : log.status === "draft" ||
                          log.status === "in_progress"
                        ? "warning"
                        : "default"
                  }
                  size="sm"
                  variant="soft"
                >
                  <Chip.Label>{logStatusLabel(log.status)}</Chip.Label>
                </Chip>
              </div>
              <Typography className={styles.meta()} type="body-sm">
                {log.loggedLabel} · {setsCountLabel(log.setsCount)}
              </Typography>
              {log.reviews.map((review) => (
                <div className="mt-2 rounded-xl bg-content2 p-2" key={review.id}>
                  <Typography type="body-sm" weight="semibold">{coachFeedbackLabel}</Typography>
                  <Typography className={styles.meta()} type="body-sm">{review.note}</Typography>
                </div>
              ))}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

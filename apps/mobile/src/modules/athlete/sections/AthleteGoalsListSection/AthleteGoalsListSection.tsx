import { Button, Chip, Typography } from "@heroui/react";
import type { MetricGoalStatus } from "@repo/api";
import { goalStatusLabel } from "@/modules/athlete/lib/goal-helpers";
import { athleteGoalsListSectionVariants } from "./AthleteGoalsListSection.styles";
import type { AthleteGoalsListSectionProps } from "./AthleteGoalsListSection.types";

export function AthleteGoalsListSection({
  goals,
  pending = false,
  onUpdateGoalStatus,
  className,
}: AthleteGoalsListSectionProps) {
  const styles = athleteGoalsListSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography type="h3" weight="semibold">
        اهداف فعلی
      </Typography>
      {goals.length === 0 ? (
        <div className={styles.empty()}>هنوز هدفی ثبت نشده است.</div>
      ) : (
        <div className={styles.list()}>
          {goals.map((goal) => (
            <article className={styles.row()} key={goal.id}>
              <div className={styles.rowTop()}>
                <div>
                  <Typography type="body" weight="semibold">
                    {goal.metricKey} · {goal.target.operator}{" "}
                    {goal.target.value}
                    {goal.target.unit ? ` ${goal.target.unit}` : ""}
                  </Typography>
                  <Typography className={styles.meta()} type="body-sm">
                    {goal.period}
                  </Typography>
                </div>
                <Chip size="sm" variant="soft">
                  <Chip.Label>{goalStatusLabel(goal.status)}</Chip.Label>
                </Chip>
              </div>
              {goal.status === "active" ? (
                <Button
                  isDisabled={pending}
                  onPress={() =>
                    void onUpdateGoalStatus(goal.id, "paused" as MetricGoalStatus)
                  }
                  size="sm"
                  variant="secondary"
                >
                  توقف
                </Button>
              ) : goal.status === "paused" ? (
                <Button
                  isDisabled={pending}
                  onPress={() =>
                    void onUpdateGoalStatus(goal.id, "active" as MetricGoalStatus)
                  }
                  size="sm"
                  variant="secondary"
                >
                  فعال‌سازی
                </Button>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

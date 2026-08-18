import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import type {
  MetricGoalOperator,
  MetricGoalPeriod,
} from "@repo/api";
import {
  GOAL_OPERATOR_OPTIONS,
  GOAL_PERIOD_OPTIONS,
} from "@/modules/athlete/lib/goal-helpers";
import { athleteGoalsCreateSectionVariants } from "./AthleteGoalsCreateSection.styles";
import type { AthleteGoalsCreateSectionProps } from "./AthleteGoalsCreateSection.types";

export function AthleteGoalsCreateSection({
  metricOptions,
  metricKey,
  operator,
  targetValue,
  period,
  pending = false,
  onMetricKeyChange,
  onOperatorChange,
  onTargetValueChange,
  onPeriodChange,
  onSubmit,
  className,
}: AthleteGoalsCreateSectionProps) {
  const styles = athleteGoalsCreateSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography type="h3" weight="semibold">
        هدف جدید
      </Typography>
      <div className={styles.form()}>
        <label className="flex flex-col gap-1.5">
          <span className={styles.meta()}>متریک</span>
          <select
            className={styles.nativeSelect()}
            onChange={(event) => onMetricKeyChange(event.target.value)}
            value={metricKey}
          >
            {metricOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={styles.meta()}>عملگر</span>
          <select
            className={styles.nativeSelect()}
            onChange={(event) =>
              onOperatorChange(event.target.value as MetricGoalOperator)
            }
            value={operator}
          >
            {GOAL_OPERATOR_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <TextField>
          <Label>مقدار هدف</Label>
          <Input
            inputMode="decimal"
            onChange={(event) => onTargetValueChange(event.target.value)}
            value={targetValue}
          />
        </TextField>
        <label className="flex flex-col gap-1.5">
          <span className={styles.meta()}>دوره</span>
          <select
            className={styles.nativeSelect()}
            onChange={(event) =>
              onPeriodChange(event.target.value as MetricGoalPeriod)
            }
            value={period}
          >
            {GOAL_PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <Button
          fullWidth
          isDisabled={pending}
          onPress={() => void onSubmit()}
          variant="primary"
        >
          ثبت هدف
        </Button>
      </div>
    </section>
  );
}

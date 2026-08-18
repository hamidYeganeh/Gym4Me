import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import type { MetricReminder } from "@repo/api";
import { reminderStatusLabel } from "@/modules/athlete/lib/goal-helpers";
import { athleteGoalsReminderSectionVariants } from "./AthleteGoalsReminderSection.styles";
import type { AthleteGoalsReminderSectionProps } from "./AthleteGoalsReminderSection.types";

export function AthleteGoalsReminderSection({
  metricOptions,
  reminders,
  reminderKey,
  localTime,
  quietStart,
  quietEnd,
  enableReminder,
  pending = false,
  onReminderKeyChange,
  onLocalTimeChange,
  onQuietStartChange,
  onQuietEndChange,
  onEnableReminderChange,
  onSubmit,
  className,
}: AthleteGoalsReminderSectionProps) {
  const styles = athleteGoalsReminderSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography type="h3" weight="semibold">
        یادآوری متریک (opt-in)
      </Typography>
      <div className={styles.form()}>
        <label className="flex flex-col gap-1.5">
          <span className={styles.meta()}>متریک</span>
          <select
            className={styles.nativeSelect()}
            onChange={(event) => onReminderKeyChange(event.target.value)}
            value={reminderKey}
          >
            {metricOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <TextField>
          <Label>ساعت یادآوری (محلی)</Label>
          <Input
            onChange={(event) => onLocalTimeChange(event.target.value)}
            type="time"
            value={localTime}
          />
        </TextField>
        <div className={styles.quietRow()}>
          <TextField>
            <Label>شروع ساعات سکوت</Label>
            <Input
              onChange={(event) => onQuietStartChange(event.target.value)}
              type="time"
              value={quietStart}
            />
          </TextField>
          <TextField>
            <Label>پایان ساعات سکوت</Label>
            <Input
              onChange={(event) => onQuietEndChange(event.target.value)}
              type="time"
              value={quietEnd}
            />
          </TextField>
        </div>
        <label className={styles.scopeRow()}>
          <input
            checked={enableReminder}
            onChange={(event) => onEnableReminderChange(event.target.checked)}
            type="checkbox"
          />
          فعال‌سازی یادآوری (opt-in صریح)
        </label>
        <Button
          fullWidth
          isDisabled={pending}
          onPress={() => void onSubmit()}
          variant="secondary"
        >
          ذخیره یادآوری
        </Button>
      </div>
      {reminders.length === 0 ? (
        <div className={styles.empty()}>یادآوری ثبت‌شده‌ای نیست.</div>
      ) : (
        <div className={styles.list()}>
          {reminders.map((reminder: MetricReminder) => (
            <article className={styles.row()} key={reminder.id}>
              <div className={styles.rowTop()}>
                <Typography type="body" weight="semibold">
                  {reminder.metricKey} · {reminder.schedule.localTime}
                </Typography>
                <Chip size="sm" variant="soft">
                  <Chip.Label>
                    {reminderStatusLabel(reminder.status)}
                  </Chip.Label>
                </Chip>
              </div>
              <Typography className={styles.meta()} type="body-sm">
                سکوت:{" "}
                {reminder.quietHours
                  ? `${reminder.quietHours.start ?? "—"} → ${reminder.quietHours.end ?? "—"}`
                  : "—"}
              </Typography>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

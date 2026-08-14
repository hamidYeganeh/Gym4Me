"use client";

import {
  Button,
  Chip,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import type {
  CreateMetricGoalInput,
  MetricGoal,
  MetricGoalOperator,
  MetricGoalPeriod,
  MetricReminder,
  MetricReminderStatus,
  UpsertMetricReminderInput,
} from "@repo/api";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { athleteGoalsScreenVariants } from "./AthleteGoalsScreen.styles";
import type { AthleteGoalsScreenProps } from "./AthleteGoalsScreen.types";

const PERIOD_OPTIONS: { value: MetricGoalPeriod; label: string }[] = [
  { value: "daily", label: "روزانه" },
  { value: "weekly", label: "هفتگی" },
  { value: "rolling_7d", label: "۷ روز غلتان" },
];

const OPERATOR_OPTIONS: { value: MetricGoalOperator; label: string }[] = [
  { value: "gte", label: "حداقل" },
  { value: "lte", label: "حداکثر" },
  { value: "eq", label: "مساوی" },
];

function goalStatusLabel(status: MetricGoal["status"]) {
  switch (status) {
    case "active":
      return "فعال";
    case "paused":
      return "متوقف";
    case "completed":
      return "کامل";
    case "archived":
      return "بایگانی";
    default:
      return status;
  }
}

function reminderStatusLabel(status: MetricReminderStatus) {
  switch (status) {
    case "active":
      return "فعال (opt-in)";
    case "paused":
      return "متوقف (پیش‌فرض)";
    case "archived":
      return "بایگانی";
    default:
      return status;
  }
}

export function AthleteGoalsScreen({
  goals,
  reminders,
  metricOptions,
  pending = false,
  onCreateGoal,
  onUpdateGoalStatus,
  onUpsertReminder,
}: AthleteGoalsScreenProps) {
  const router = useRouter();
  const styles = athleteGoalsScreenVariants();
  const [metricKey, setMetricKey] = useState(metricOptions[0]?.key ?? "steps");
  const [operator, setOperator] = useState<MetricGoalOperator>("gte");
  const [targetValue, setTargetValue] = useState("10000");
  const [period, setPeriod] = useState<MetricGoalPeriod>("daily");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [reminderKey, setReminderKey] = useState(
    metricOptions[0]?.key ?? "steps",
  );
  const [localTime, setLocalTime] = useState("09:00");
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");
  const [enableReminder, setEnableReminder] = useState(false);

  async function submitGoal() {
    const value = Number(targetValue);
    if (!Number.isFinite(value)) return;
    setMessage(null);
    setError(null);
    const input: CreateMetricGoalInput = {
      metricKey,
      target: {
        operator,
        value,
        unit: metricOptions.find((item) => item.key === metricKey)?.unit,
      },
      period,
      effective: { start: new Date().toISOString() },
      status: "active",
    };
    try {
      await onCreateGoal(input);
      setMessage("هدف با موفقیت ثبت شد.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "ثبت هدف ناموفق بود.");
    }
  }

  async function submitReminder() {
    setMessage(null);
    setError(null);
    const timezone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Tehran";
    const input: UpsertMetricReminderInput = {
      schedule: {
        timezone,
        weekdays: [0, 1, 2, 3, 4, 5, 6],
        localTime,
      },
      quietHours: {
        start: quietStart,
        end: quietEnd,
      },
      channel: "push",
      // Opt-in only — default remains paused unless explicitly enabled.
      status: enableReminder ? "active" : "paused",
    };
    try {
      await onUpsertReminder(reminderKey, input);
      setMessage(
        enableReminder
          ? "یادآوری فعال شد."
          : "یادآوری ذخیره شد (متوقف — برای فعال‌سازی opt-in لازم است).",
      );
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "ذخیره یادآوری ناموفق بود.",
      );
    }
  }

  return (
    <AppLayout
      className={styles.root()}
      header={
        <Header
          startContent={
            <Button
              aria-label="بازگشت"
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft size={22} />
            </Button>
          }
        />
      }
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography type="h1" weight="bold">
            اهداف و یادآوری
          </Typography>
          <Typography className={styles.subtitle()} type="body">
            هدف متریک تعریف کن. یادآوری‌ها به‌صورت پیش‌فرض متوقف‌اند و فقط با
            opt-in فعال می‌شوند.
          </Typography>
        </section>

        <section className={styles.card()}>
          <Typography type="h3" weight="semibold">
            هدف جدید
          </Typography>
          <div className={styles.form()}>
            <label className="flex flex-col gap-1.5">
              <span className={styles.meta()}>متریک</span>
              <select
                className={styles.nativeSelect()}
                onChange={(event) => setMetricKey(event.target.value)}
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
                  setOperator(event.target.value as MetricGoalOperator)
                }
                value={operator}
              >
                {OPERATOR_OPTIONS.map((option) => (
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
                onChange={(event) => setTargetValue(event.target.value)}
                value={targetValue}
              />
            </TextField>
            <label className="flex flex-col gap-1.5">
              <span className={styles.meta()}>دوره</span>
              <select
                className={styles.nativeSelect()}
                onChange={(event) =>
                  setPeriod(event.target.value as MetricGoalPeriod)
                }
                value={period}
              >
                {PERIOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <Button
              fullWidth
              isDisabled={pending}
              onPress={() => void submitGoal()}
              variant="primary"
            >
              ثبت هدف
            </Button>
          </div>
        </section>

        <section className={styles.card()}>
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
                      onPress={() => void onUpdateGoalStatus(goal.id, "paused")}
                      size="sm"
                      variant="secondary"
                    >
                      توقف
                    </Button>
                  ) : goal.status === "paused" ? (
                    <Button
                      isDisabled={pending}
                      onPress={() => void onUpdateGoalStatus(goal.id, "active")}
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

        <section className={styles.card()}>
          <Typography type="h3" weight="semibold">
            یادآوری متریک (opt-in)
          </Typography>
          <div className={styles.form()}>
            <label className="flex flex-col gap-1.5">
              <span className={styles.meta()}>متریک</span>
              <select
                className={styles.nativeSelect()}
                onChange={(event) => setReminderKey(event.target.value)}
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
                onChange={(event) => setLocalTime(event.target.value)}
                type="time"
                value={localTime}
              />
            </TextField>
            <div className={styles.quietRow()}>
              <TextField>
                <Label>شروع ساعات سکوت</Label>
                <Input
                  onChange={(event) => setQuietStart(event.target.value)}
                  type="time"
                  value={quietStart}
                />
              </TextField>
              <TextField>
                <Label>پایان ساعات سکوت</Label>
                <Input
                  onChange={(event) => setQuietEnd(event.target.value)}
                  type="time"
                  value={quietEnd}
                />
              </TextField>
            </div>
            <label className={styles.scopeRow()}>
              <input
                checked={enableReminder}
                onChange={(event) => setEnableReminder(event.target.checked)}
                type="checkbox"
              />
              فعال‌سازی یادآوری (opt-in صریح)
            </label>
            <Button
              fullWidth
              isDisabled={pending}
              onPress={() => void submitReminder()}
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

        {message ? <p className={styles.feedback()}>{message}</p> : null}
        {error ? <p className={styles.error()}>{error}</p> : null}
      </div>
    </AppLayout>
  );
}

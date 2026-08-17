import { Button, Input, Label, TextField, Typography } from "@heroui/react";
import { athleteSelfTrackingMetricFormSectionVariants } from "./AthleteSelfTrackingMetricFormSection.styles";
import type { AthleteSelfTrackingMetricFormSectionProps } from "./AthleteSelfTrackingMetricFormSection.types";

export function AthleteSelfTrackingMetricFormSection({
  metric,
  value,
  recordedAt,
  note,
  pending = false,
  message = null,
  error = null,
  onValueChange,
  onRecordedAtChange,
  onNoteChange,
  onSubmit,
  className,
}: AthleteSelfTrackingMetricFormSectionProps) {
  const styles = athleteSelfTrackingMetricFormSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div>
        <Typography type="h3" weight="semibold">
          ثبت {metric.label}
        </Typography>
        <Typography className={styles.meta()} type="body-sm">
          {metric.hint} · این داده به‌صورت پیش‌فرض خصوصی است.
        </Typography>
      </div>
      <div className={styles.form()}>
        <TextField>
          <Label>مقدار ({metric.unitLabel})</Label>
          <Input
            inputMode="decimal"
            max={metric.max}
            min={metric.min}
            onChange={(event) => onValueChange(event.target.value)}
            step={metric.step}
            type="number"
            value={value}
          />
        </TextField>
        <div className={styles.grid()}>
          <TextField>
            <Label>زمان ثبت</Label>
            <Input
              onChange={(event) => onRecordedAtChange(event.target.value)}
              type="datetime-local"
              value={recordedAt}
            />
          </TextField>
          <TextField>
            <Label>یادداشت (اختیاری)</Label>
            <Input
              onChange={(event) => onNoteChange(event.target.value)}
              value={note}
            />
          </TextField>
        </div>
        <Button
          fullWidth
          isDisabled={
            pending ||
            value.trim() === "" ||
            Number(value) < metric.min ||
            Number(value) > metric.max
          }
          onPress={() => void onSubmit()}
          variant="primary"
        >
          ثبت در تاریخچه
        </Button>
        {message ? <p className={styles.feedback()}>{message}</p> : null}
        {error ? <p className={styles.error()}>{error}</p> : null}
      </div>
    </section>
  );
}

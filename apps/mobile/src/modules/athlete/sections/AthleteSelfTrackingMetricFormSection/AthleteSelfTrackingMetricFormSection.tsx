import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Mobile.SelfTracking");
  const styles = athleteSelfTrackingMetricFormSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div>
        <Typography type="h3" weight="semibold">
          {t("logTitle", { label: metric.label })}
        </Typography>
        <Typography className={styles.meta()} type="body-sm">
          {metric.hint} · {t("privacyHint")}
        </Typography>
      </div>
      <div className={styles.form()}>
        <TextField>
          <Label>{t("valueLabel", { unit: metric.unitLabel })}</Label>
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
            <Label>{t("recordedAtLabel")}</Label>
            <Input
              onChange={(event) => onRecordedAtChange(event.target.value)}
              type="datetime-local"
              value={recordedAt}
            />
          </TextField>
          <TextField>
            <Label>{t("noteLabel")}</Label>
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
          size="lg"
          variant="primary"
        >
          {t("submit")}
        </Button>
        {message ? (
          <Typography className={styles.feedback()} type="body-sm">
            {message}
          </Typography>
        ) : null}
        {error ? (
          <Typography className={styles.error()} type="body-sm">
            {error}
          </Typography>
        ) : null}
      </div>
    </section>
  );
}

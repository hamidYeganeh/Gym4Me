"use client";

import { Button, Separator, Typography } from "@heroui/react";
import { Fire1, Minus, Plus } from "@repo/icons";
import { onboardingCaloriesSectionVariants } from "./OnboardingCaloriesSection.styles";
import type { OnboardingCaloriesSectionProps } from "./OnboardingCaloriesSection.types";

function formatCalories(value: number): string {
  return value.toLocaleString("fa-IR");
}

export function OnboardingCaloriesSection({
  label,
  unitLabel,
  summaryTemplate,
  value,
  presets,
  min,
  max,
  step,
  onChange,
  className,
}: OnboardingCaloriesSectionProps) {
  const styles = onboardingCaloriesSectionVariants();
  const display = formatCalories(value);
  const summary = summaryTemplate.replace("{value}", display);

  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <div className={styles.root({ className })}>
      <Typography className={styles.unitLabel()}>{unitLabel}</Typography>

      <div aria-label={label} className={styles.stepper()}>
        <Button
          aria-label="−"
          className={styles.stepButton()}
          isIconOnly
          size="lg"
          variant="secondary"
          onPress={() => onChange(clamp(value - step))}
        >
          <Minus size={22} />
        </Button>

        <Typography className={styles.value()}>{display}</Typography>

        <Button
          aria-label="+"
          className={styles.stepButton()}
          isIconOnly
          size="lg"
          variant="secondary"
          onPress={() => onChange(clamp(value + step))}
        >
          <Plus size={22} />
        </Button>
      </div>

      <Separator className={styles.divider()} />

      <Typography className={styles.summary()}>{summary}</Typography>

      <div className={styles.presets()}>
        {[...presets].reverse().map((preset) => {
          const selected = value === preset;
          const presetStyles = onboardingCaloriesSectionVariants({ selected });
          return (
            <Button
              key={preset}
              className={presetStyles.preset()}
              size="sm"
              variant="ghost"
              onPress={() => onChange(preset)}
            >
              {preset.toLocaleString("fa-IR")}
              <Fire1
                aria-hidden
                className={presetStyles.presetIcon()}
                size={16}
              />
            </Button>
          );
        })}
      </div>
    </div>
  );
}

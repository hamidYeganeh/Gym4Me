"use client";

import NumberFlow from "@number-flow/react";
import { Button } from "@heroui/react/button";
import { Separator } from "@heroui/react/separator";
import { Typography } from "@heroui/react/typography";
import { Fire1 } from "@repo/icons/Fire1";
import { Minus } from "@repo/icons/Minus";
import { Plus } from "@repo/icons/Plus";
import { useTranslations } from "next-intl";
import { onboardingCaloriesSectionVariants } from "./OnboardingCaloriesSection.styles";
import type { OnboardingCaloriesSectionProps } from "./OnboardingCaloriesSection.types";

export function OnboardingCaloriesSection({
  label,
  unitLabel,
  value,
  presets,
  min,
  max,
  step,
  onChange,
  className,
}: OnboardingCaloriesSectionProps) {
  const t = useTranslations("Mobile.Onboarding.calories");
  const styles = onboardingCaloriesSectionVariants();
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

        <NumberFlow
          className={styles.value()}
          format={{ maximumFractionDigits: 0 }}
          locales="fa-IR"
          style={{ color: "var(--foreground)" }}
          value={value}
        />

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

      <Typography className={styles.summary()}>
        {t.rich("summary", {
          kcal: () => (
            <NumberFlow
              className={styles.summaryValue()}
              format={{ maximumFractionDigits: 0 }}
              locales="fa-IR"
              style={{ color: "var(--foreground)" }}
              value={value}
            />
          ),
        })}
      </Typography>

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
              <NumberFlow
                format={{ maximumFractionDigits: 0 }}
                locales="fa-IR"
                value={preset}
              />
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

"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { onboardingSleepSectionVariants } from "./OnboardingSleepSection.styles";
import type { OnboardingSleepSectionProps } from "./OnboardingSleepSection.types";

export function OnboardingSleepSection({
  options,
  value,
  onChange,
  className,
}: OnboardingSleepSectionProps) {
  const base = onboardingSleepSectionVariants();
  const current = options.find((option) => option.level === value) ?? options[0];

  return (
    <div className={base.root({ className })}>
      {current ? (
        <Typography className={base.label()}>{current.label}</Typography>
      ) : null}

      <div className={base.track()} role="group">
        {options.map((option) => {
          const selected = option.level === value;
          const styles = onboardingSleepSectionVariants({ selected });
          return (
            <Button
              key={option.level}
              aria-pressed={selected}
              className={styles.item()}
              variant="ghost"
              onPress={() => onChange(option.level)}
            >
              {option.level}
            </Button>
          );
        })}
      </div>

      {current ? (
        <Typography className={base.description()}>
          {current.description}
        </Typography>
      ) : null}
    </div>
  );
}

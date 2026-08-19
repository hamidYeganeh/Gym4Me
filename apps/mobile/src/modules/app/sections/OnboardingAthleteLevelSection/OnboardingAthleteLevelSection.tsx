"use client";

import { Chip } from "@heroui/react/chip";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { HandSwipeRight } from "@repo/icons/HandSwipeRight";
import { AdaptiveSlider } from "@repo/ui/kit/AdaptiveSlider";
import { onboardingAthleteLevelSectionVariants } from "./OnboardingAthleteLevelSection.styles";
import type { OnboardingAthleteLevelSectionProps } from "./OnboardingAthleteLevelSection.types";

export function OnboardingAthleteLevelSection({
  label,
  levelLabel,
  dragHint,
  options,
  value,
  onChange,
  isLoading = false,
  isError = false,
  emptyLabel,
  errorLabel,
  className,
}: OnboardingAthleteLevelSectionProps) {
  const styles = onboardingAthleteLevelSectionVariants();
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selected = options[selectedIndex] ?? options[0];
  const maxIndex = Math.max(0, options.length - 1);

  if (isLoading) {
    return (
      <div className={styles.root({ className })}>
        <div className={styles.status()}>
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.root({ className })}>
        <Typography className={styles.statusText()}>{errorLabel}</Typography>
      </div>
    );
  }

  if (options.length === 0 || !selected) {
    return (
      <div className={styles.root({ className })}>
        <Typography className={styles.statusText()}>{emptyLabel}</Typography>
      </div>
    );
  }

  return (
    <div className={styles.root({ className })}>
      <Chip color="success" size="sm" variant="soft" className={styles.badge()}>
        <Chip.Label>{levelLabel(selectedIndex + 1)}</Chip.Label>
      </Chip>

      <AdaptiveSlider
        aria-label={label}
        className={styles.slider()}
        max={maxIndex}
        min={0}
        showValue={false}
        step={1}
        value={selectedIndex}
        onChange={(next) => {
          const option = options[next];
          if (option) onChange(option.value);
        }}
      />

      <div className={styles.copy()}>
        <Typography className={styles.name()}>{selected.name}</Typography>
        {selected.description ? (
          <Typography className={styles.description()}>
            {selected.description}
          </Typography>
        ) : null}
      </div>

      <div className={styles.hint()}>
        <HandSwipeRight aria-hidden className={styles.hintIcon()} size={20} />
        <span>{dragHint}</span>
      </div>
    </div>
  );
}

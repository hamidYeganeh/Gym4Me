"use client";

import type { ComponentType } from "react";
import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { BreadToast } from "@repo/icons/BreadToast";
import { ChickenDrumstick } from "@repo/icons/ChickenDrumstick";
import { ForkKnife } from "@repo/icons/ForkKnife";
import { Leaf } from "@repo/icons/Leaf";
import { EmptyState } from "@repo/ui/kit/EmptyState";
import { onboardingDietSectionVariants } from "./OnboardingDietSection.styles";
import type { OnboardingDietSectionProps } from "./OnboardingDietSection.types";

type IconComponent = ComponentType<{
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}>;

const DIET_ICONS: Record<string, IconComponent> = {
  balanced: ForkKnife,
  vegetarian: Leaf,
  vegan: Leaf,
  protein: ChickenDrumstick,
  gluten_free: BreadToast,
  glutenfree: BreadToast,
  keto: ChickenDrumstick,
};

function resolveDietIcon(id: string, icon?: string | null): IconComponent {
  const candidates = [icon, id]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLowerCase().replace(/[^a-z0-9]/g, ""));

  for (const key of candidates) {
    const match = DIET_ICONS[key];
    if (match) return match;
  }
  return ForkKnife;
}

export function OnboardingDietSection({
  label,
  options,
  value,
  onChange,
  isLoading = false,
  isError = false,
  emptyLabel,
  errorLabel,
  className,
}: OnboardingDietSectionProps) {
  const base = onboardingDietSectionVariants();

  if (isLoading) {
    return (
      <div className={base.root({ className })}>
        <div className={base.status()}>
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={base.root({ className })}>
        <Typography className={base.statusText()}>{errorLabel}</Typography>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className={base.root({ className })}>
        <EmptyState title={emptyLabel} />
      </div>
    );
  }

  return (
    <div className={base.root({ className })}>
      <div aria-label={label} className={base.grid()} role="group">
        {options.map((option) => {
          const selected = option.id === value;
          const styles = onboardingDietSectionVariants({ selected });
          const Icon = resolveDietIcon(option.id, option.icon);

          return (
            <Button
              key={option.id}
              aria-pressed={selected}
              className={styles.card()}
              fullWidth
              variant="ghost"
              onPress={() => onChange(option.id)}
            >
              <Icon aria-hidden className={styles.icon()} size={28} />
              <Typography className={styles.title()}>{option.title}</Typography>
              {option.description ? (
                <Typography className={styles.description()}>
                  {option.description}
                </Typography>
              ) : null}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

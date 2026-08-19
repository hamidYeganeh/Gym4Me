"use client";

import type { ComponentType } from "react";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { FaceDepressed } from "@repo/icons/FaceDepressed";
import { FaceHappy } from "@repo/icons/FaceHappy";
import { FaceNeutral } from "@repo/icons/FaceNeutral";
import { FaceOverjoyed } from "@repo/icons/FaceOverjoyed";
import { FaceSad } from "@repo/icons/FaceSad";
import type { OnboardingMoodId } from "@/modules/app/lib/onboarding-data";
import { onboardingMoodSectionVariants } from "./OnboardingMoodSection.styles";
import type { OnboardingMoodSectionProps } from "./OnboardingMoodSection.types";

const MOOD_ICONS: Record<
  OnboardingMoodId,
  ComponentType<{ className?: string; size?: number; "aria-hidden"?: boolean }>
> = {
  depressed: FaceDepressed,
  sad: FaceSad,
  neutral: FaceNeutral,
  happy: FaceHappy,
  overjoyed: FaceOverjoyed,
};

export function OnboardingMoodSection({
  options,
  value,
  onChange,
  className,
}: OnboardingMoodSectionProps) {
  const styles = onboardingMoodSectionVariants();
  const selected = options.find((option) => option.id === value) ?? options[0];

  return (
    <div className={styles.root({ className })}>
      <div aria-label="mood" className={styles.row()} role="group">
        {options.map((option) => {
          const active = option.id === value;
          const faceStyles = onboardingMoodSectionVariants({ active });
          const Icon = MOOD_ICONS[option.id];

          return (
            <Button
              key={option.id}
              aria-label={option.statement}
              aria-pressed={active}
              className={faceStyles.face()}
              isIconOnly
              size="lg"
              variant="ghost"
              onPress={() => onChange(option.id)}
            >
              <Icon aria-hidden className={faceStyles.faceIcon()} size={40} />
            </Button>
          );
        })}
      </div>

      {selected ? (
        <Typography className={styles.statement()}>
          {selected.statement}
        </Typography>
      ) : null}
    </div>
  );
}

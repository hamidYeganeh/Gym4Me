"use client";

import { Typography } from "@heroui/react/typography";
import { FormStepper } from "@repo/ui/kit/FormStepper";
import Image from "next/image";
import { onboardingPhaseIntroSectionVariants } from "./OnboardingPhaseIntroSection.styles";
import type { OnboardingPhaseIntroSectionProps } from "./OnboardingPhaseIntroSection.types";

const HERO_SRC = "/onboarding-personal.png";

export function OnboardingPhaseIntroSection({
  title,
  subtitle,
  imageAlt,
  steps,
  activePhaseIndex,
  phaseAria,
  className,
}: OnboardingPhaseIntroSectionProps) {
  const styles = onboardingPhaseIntroSectionVariants();

  return (
    <div className={styles.root({ className })}>
      <FormStepper
        activeIndex={activePhaseIndex}
        aria-label={phaseAria}
        className={styles.stepper()}
        steps={steps}
      />

      <div className={styles.sheet()}>
        <div className={styles.figure()}>
          <Image
            alt={imageAlt}
            className={styles.image()}
            height={480}
            src={HERO_SRC}
            width={384}
          />
        </div>

        <div className={styles.copy()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {title}
          </Typography>
          <Typography className={styles.subtitle()}>{subtitle}</Typography>
        </div>
      </div>
    </div>
  );
}

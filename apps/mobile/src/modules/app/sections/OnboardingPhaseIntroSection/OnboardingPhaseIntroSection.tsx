"use client";

import { Typography } from "@heroui/react/typography";
import { FormStepper } from "@repo/ui/kit/FormStepper";
import { ProgressiveBlur } from "@repo/ui/kit/ProgressiveBlur";
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
      <div className={styles.media()}>
        <Image
          alt={imageAlt}
          className={styles.image()}
          fill
          sizes="100vw"
          src={HERO_SRC}
        />
      </div>

      <div aria-hidden className={styles.topFade()}>
        <ProgressiveBlur
          blurIntensity={2}
          blurLayers={8}
          className={styles.topBlur()}
          direction="top"
        />
        <div className={styles.topWash()} />
      </div>

      <div aria-hidden className={styles.bottomFade()}>
        <ProgressiveBlur
          blurIntensity={2}
          blurLayers={8}
          className={styles.bottomBlur()}
          direction="bottom"
        />
        <div className={styles.bottomWash()} />
      </div>

      <div className={styles.content()}>
        <FormStepper
          activeIndex={activePhaseIndex}
          aria-label={phaseAria}
          className={styles.stepper()}
          steps={steps}
        />

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

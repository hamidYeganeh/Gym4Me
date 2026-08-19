"use client";

import { Typography } from "@heroui/react/typography";
import { ProgressiveBlur } from "@repo/ui/kit/ProgressiveBlur";
import Image from "next/image";
import { onboardingExperienceSectionVariants } from "./OnboardingExperienceSection.styles";
import type { OnboardingExperienceSectionProps } from "./OnboardingExperienceSection.types";

const FITNESS_SRC = "/onboarding-fitness.png";

export function OnboardingExperienceSection({
  title,
  imageAlt,
  className,
}: OnboardingExperienceSectionProps) {
  const styles = onboardingExperienceSectionVariants();

  return (
    <div className={styles.root({ className })}>
      <div className={styles.media()}>
        <Image
          alt={imageAlt}
          className={styles.image()}
          fill
          priority
          sizes="100vw"
          src={FITNESS_SRC}
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

      <div className={styles.content()}>
        <Typography className={styles.title()} type="h1" weight="bold">
          {title}
        </Typography>
      </div>
    </div>
  );
}

"use client";

import { Typography } from "@heroui/react/typography";
import { ProgressiveBlur } from "@repo/ui/kit/ProgressiveBlur";
import Image from "next/image";
import { onboardingReviewSectionVariants } from "./OnboardingReviewSection.styles";
import type { OnboardingReviewSectionProps } from "./OnboardingReviewSection.types";

const REVIEW_SRC = "/onboarding-review.png";

export function OnboardingReviewSection({
  title,
  subtitle,
  artAlt,
  className,
}: OnboardingReviewSectionProps) {
  const styles = onboardingReviewSectionVariants();

  return (
    <div className={styles.root({ className })}>
      <div className={styles.media()}>
        <Image
          alt={artAlt}
          className={styles.image()}
          fill
          priority
          sizes="100vw"
          src={REVIEW_SRC}
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
        <Typography className={styles.subtitle()}>{subtitle}</Typography>
      </div>
    </div>
  );
}

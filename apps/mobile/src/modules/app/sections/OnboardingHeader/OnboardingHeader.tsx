"use client";

import { Button } from "@heroui/react/button";
import { ProgressBar } from "@heroui/react/progress-bar";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { onboardingHeaderVariants } from "./OnboardingHeader.styles";
import type { OnboardingHeaderProps } from "./OnboardingHeader.types";

export function OnboardingHeader({
  progress,
  progressLabel,
  skipLabel,
  backLabel,
  onBack,
  onSkip,
  showProgress = true,
  className,
}: OnboardingHeaderProps) {
  const styles = onboardingHeaderVariants();
  const value = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <header className={styles.root({ className })}>
      <Button
        aria-label={backLabel}
        className={styles.back()}
        isIconOnly
        size="lg"
        variant="ghost"
        onPress={onBack}
      >
        <ChevronLeft aria-hidden className={styles.backIcon()} size={24} />
      </Button>

      {showProgress ? (
        <>
          <ProgressBar
            aria-label={progressLabel}
            className={styles.progress()}
            value={value}
          >
            <ProgressBar.Track className={styles.track()}>
              <ProgressBar.Fill className={styles.fill()} />
            </ProgressBar.Track>
          </ProgressBar>

          <Button
            className={styles.skip()}
            size="sm"
            variant="ghost"
            onPress={onSkip}
          >
            {skipLabel}
          </Button>
        </>
      ) : (
        <div className={styles.progress()} />
      )}
    </header>
  );
}

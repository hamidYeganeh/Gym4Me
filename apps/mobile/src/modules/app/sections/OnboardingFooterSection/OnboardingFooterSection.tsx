import { Button } from "@heroui/react/button";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { onboardingFooterSectionVariants } from "./OnboardingFooterSection.styles";
import type { OnboardingFooterSectionProps } from "./OnboardingFooterSection.types";

export function OnboardingFooterSection({
  t,
  isCaloriesStep,
  isAvatarStep,
  isAvatarUploading,
  canContinue,
  calories,
  caloriesKnown,
  goNext,
  handleCaloriesUnknown,
  requestFinish,
  className,
}: OnboardingFooterSectionProps) {
  const styles = onboardingFooterSectionVariants();

  if (isAvatarUploading) return null;

  if (isCaloriesStep) {
    return (
      <div className={styles.root({ className })}>
        <div className={styles.stack()}>
          <Button
            className={
              calories > 0 || !caloriesKnown
                ? styles.continue()
                : styles.continueSoft()
            }
            fullWidth
            size="lg"
            variant={calories > 0 || !caloriesKnown ? "primary" : "secondary"}
            onPress={goNext}
          >
            {t("continue")}
            <ArrowRight
              aria-hidden
              className={styles.continueIcon()}
              size={20}
            />
          </Button>
          <Button
            className={styles.secondaryAction()}
            size="sm"
            variant="ghost"
            onPress={handleCaloriesUnknown}
          >
            {t("calories.unknown")}
          </Button>
        </div>
      </div>
    );
  }

  if (isAvatarStep) {
    return (
      <div className={styles.root({ className })}>
        <div className={styles.stack()}>
          <Button
            aria-disabled={!canContinue}
            className={canContinue ? styles.continue() : styles.continueSoft()}
            fullWidth
            size="lg"
            variant={canContinue ? "primary" : "secondary"}
            onPress={goNext}
          >
            {t("continue")}
            <ArrowRight
              aria-hidden
              className={styles.continueIcon()}
              size={20}
            />
          </Button>
          <Button
            className={styles.skip()}
            size="sm"
            variant="ghost"
            onPress={requestFinish}
          >
            {t("avatar.skip")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root({ className })}>
      <Button
        aria-disabled={!canContinue}
        className={canContinue ? styles.continue() : styles.continueSoft()}
        fullWidth
        size="lg"
        variant={canContinue ? "primary" : "secondary"}
        onPress={goNext}
      >
        {t("continue")}
        <ArrowRight
          aria-hidden
          className={styles.continueIcon()}
          size={20}
        />
      </Button>
    </div>
  );
}

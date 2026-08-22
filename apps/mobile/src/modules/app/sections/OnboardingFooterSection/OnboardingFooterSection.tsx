import { Button } from "@heroui/react/button";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { onboardingFooterSectionVariants } from "./OnboardingFooterSection.styles";
import type { OnboardingFooterSectionProps } from "./OnboardingFooterSection.types";

export function OnboardingFooterSection({
  t,
  isCaloriesStep,
  isAvatarStep,
  isAvatarUploading,
  hasAvatar,
  canContinue,
  goNext,
  handleCaloriesUnknown,
  className,
}: OnboardingFooterSectionProps) {
  const styles = onboardingFooterSectionVariants();

  if (isAvatarUploading) return null;

  if (isCaloriesStep) {
    return (
      <div className={styles.root({ className })}>
        <div className={styles.stack()}>
          <Button
            className={canContinue ? styles.continue() : styles.continueSoft()}
            fullWidth
            isDisabled={!canContinue}
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
        <Button
          className={styles.continue()}
          fullWidth
          size="lg"
          variant="primary"
          onPress={goNext}
        >
          {hasAvatar ? t("finish") : t("avatar.finishWithoutPhoto")}
          <ArrowRight
            aria-hidden
            className={styles.continueIcon()}
            size={20}
          />
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.root({ className })}>
      <Button
        className={canContinue ? styles.continue() : styles.continueSoft()}
        fullWidth
        isDisabled={!canContinue}
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

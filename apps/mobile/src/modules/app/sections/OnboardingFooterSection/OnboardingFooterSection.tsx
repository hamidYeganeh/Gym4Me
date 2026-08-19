import { Button } from "@heroui/react/button";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { onboardingFooterSectionVariants } from "./OnboardingFooterSection.styles";
import type { OnboardingFooterSectionProps } from "./OnboardingFooterSection.types";

export function OnboardingFooterSection({
  t,
  isCaloriesStep,
  isAvatarUploading,
  canContinue,
  calories,
  caloriesKnown,
  goNext,
  handleCaloriesUnknown,
  className,
}: OnboardingFooterSectionProps) {
  const styles = onboardingFooterSectionVariants();

  if (isAvatarUploading) return null;

  return (
    <div className={styles.root({ className })}>
      {isCaloriesStep ? (
        <div className={styles.caloriesFooter()}>
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
            className={styles.caloriesUnknown()}
            size="sm"
            variant="ghost"
            onPress={handleCaloriesUnknown}
          >
            {t("calories.unknown")}
          </Button>
        </div>
      ) : (
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
      )}
    </div>
  );
}

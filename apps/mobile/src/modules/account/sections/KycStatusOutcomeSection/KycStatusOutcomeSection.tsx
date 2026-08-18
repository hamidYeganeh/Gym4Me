import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { ShieldCheck } from "@repo/icons/ShieldCheck";
import { kycStatusOutcomeSectionVariants } from "./KycStatusOutcomeSection.styles";
import type { KycStatusOutcomeSectionProps } from "./KycStatusOutcomeSection.types";

export function KycStatusOutcomeSection({
  title,
  subtitle,
  continueLabel,
  onContinue,
  className,
}: KycStatusOutcomeSectionProps) {
  const styles = kycStatusOutcomeSectionVariants();

  return (
    <main className={styles.root({ className })}>
      <section className={styles.panel()}>
        <div className={styles.body()}>
          <ShieldCheck className={styles.icon()} size={88} />
          <Typography className={styles.title()} type="h1" weight="bold">
            {title}
          </Typography>
          <Typography className={styles.subtitle()} color="muted">
            {subtitle}
          </Typography>
        </div>
        <div className={styles.actions()}>
          <Button
            className={styles.primary()}
            fullWidth
            size="lg"
            variant="primary"
            onPress={onContinue}
          >
            {continueLabel}
            <ArrowRight className={styles.primaryIcon()} size={20} />
          </Button>
        </div>
      </section>
    </main>
  );
}

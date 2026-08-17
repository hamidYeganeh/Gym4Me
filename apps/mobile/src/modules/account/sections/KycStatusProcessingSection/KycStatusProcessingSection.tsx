import { Logo } from "@repo/ui/common/Logo";
import { kycStatusProcessingSectionVariants } from "./KycStatusProcessingSection.styles";
import type { KycStatusProcessingSectionProps } from "./KycStatusProcessingSection.types";

export function KycStatusProcessingSection({
  labels,
  activeIndex,
  className,
}: KycStatusProcessingSectionProps) {
  const styles = kycStatusProcessingSectionVariants();

  return (
    <main className={styles.root({ className })}>
      <div className={styles.steps()}>
        {labels.map((label, index) => (
          <p
            className={`${styles.step()} ${
              index === activeIndex
                ? styles.stepActive()
                : styles.stepIdle()
            }`}
            key={label}
          >
            {label}
          </p>
        ))}
      </div>
      <div aria-hidden className={styles.glow()} />
      <div className={styles.mark()}>
        <Logo gradient={false} shadow size="3xl" />
      </div>
    </main>
  );
}

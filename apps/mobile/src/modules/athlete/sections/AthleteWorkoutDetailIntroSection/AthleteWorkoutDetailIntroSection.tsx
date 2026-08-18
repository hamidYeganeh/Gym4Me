import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { athleteWorkoutDetailIntroSectionVariants } from "./AthleteWorkoutDetailIntroSection.styles";
import type { AthleteWorkoutDetailIntroSectionProps } from "./AthleteWorkoutDetailIntroSection.types";

export function AthleteWorkoutDetailIntroSection({
  title,
  focusLabel,
  statusLabel,
  periodLabel,
  className,
}: AthleteWorkoutDetailIntroSectionProps) {
  const styles = athleteWorkoutDetailIntroSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {title}
      </Typography>
      <Typography className={styles.subtitle()} type="body">
        {focusLabel}
      </Typography>
      <div className={styles.metaRow()}>
        <Chip size="sm" variant="soft">
          <Chip.Label>{statusLabel}</Chip.Label>
        </Chip>
        <Typography className={styles.meta()} type="body-sm">
          {periodLabel}
        </Typography>
      </div>
    </section>
  );
}

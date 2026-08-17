import { Typography } from "@heroui/react";
import { athleteGoalsIntroSectionVariants } from "./AthleteGoalsIntroSection.styles";
import type { AthleteGoalsIntroSectionProps } from "./AthleteGoalsIntroSection.types";

export function AthleteGoalsIntroSection({
  className,
}: AthleteGoalsIntroSectionProps) {
  const styles = athleteGoalsIntroSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography type="h1" weight="bold">
        اهداف و یادآوری
      </Typography>
      <Typography className={styles.subtitle()} type="body">
        هدف متریک تعریف کن. یادآوری‌ها به‌صورت پیش‌فرض متوقف‌اند و فقط با
        opt-in فعال می‌شوند.
      </Typography>
    </section>
  );
}

import { Typography } from "@heroui/react/typography";
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
        برای یکی از معیارهای سلامتی‌ات هدف بساز. یادآوری‌ها فقط با اجازه خودت
        فعال می‌شوند.
      </Typography>
    </section>
  );
}

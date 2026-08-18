import { Typography } from "@heroui/react/typography";
import { coachSlotsManageIntroSectionVariants } from "./CoachSlotsManageIntroSection.styles";
import type { CoachSlotsManageIntroSectionProps } from "./CoachSlotsManageIntroSection.types";

export function CoachSlotsManageIntroSection({
  title,
  subtitle,
  className,
}: CoachSlotsManageIntroSectionProps) {
  const styles = coachSlotsManageIntroSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {title}
      </Typography>
      <Typography className={styles.subtitle()} type="body">
        {subtitle}
      </Typography>
    </section>
  );
}

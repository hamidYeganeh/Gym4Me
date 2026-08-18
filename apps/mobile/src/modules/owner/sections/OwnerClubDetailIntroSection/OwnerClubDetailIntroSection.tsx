import { Typography } from "@heroui/react/typography";
import { ownerClubDetailIntroSectionVariants } from "./OwnerClubDetailIntroSection.styles";
import type { OwnerClubDetailIntroSectionProps } from "./OwnerClubDetailIntroSection.types";

export function OwnerClubDetailIntroSection({
  name,
  city,
  className,
}: OwnerClubDetailIntroSectionProps) {
  const styles = ownerClubDetailIntroSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {name}
      </Typography>
      <Typography className={styles.subtitle()} type="body">
        {city}
      </Typography>
    </section>
  );
}

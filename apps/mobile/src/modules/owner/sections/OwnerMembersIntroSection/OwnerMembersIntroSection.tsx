import { Typography } from "@heroui/react/typography";
import { ownerMembersIntroSectionVariants } from "./OwnerMembersIntroSection.styles";
import type { OwnerMembersIntroSectionProps } from "./OwnerMembersIntroSection.types";

export function OwnerMembersIntroSection({
  title,
  subtitle,
  countLabel,
  className,
}: OwnerMembersIntroSectionProps) {
  const styles = ownerMembersIntroSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {title}
      </Typography>
      <Typography className={styles.subtitle()} type="body">
        {subtitle}
      </Typography>
      <Typography className={styles.count()} type="body-sm">
        {countLabel}
      </Typography>
    </section>
  );
}

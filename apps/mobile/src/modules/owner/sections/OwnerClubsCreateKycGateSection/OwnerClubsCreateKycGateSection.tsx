import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ownerClubsCreateKycGateSectionVariants } from "./OwnerClubsCreateKycGateSection.styles";
import type { OwnerClubsCreateKycGateSectionProps } from "./OwnerClubsCreateKycGateSection.types";

export function OwnerClubsCreateKycGateSection({
  kycStatus,
  title,
  pendingHint,
  requiredHint,
  ctaLabel,
  onCta,
  className,
}: OwnerClubsCreateKycGateSectionProps) {
  const styles = ownerClubsCreateKycGateSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div>
        <Typography className={styles.title()} type="h4" weight="bold">
          {title}
        </Typography>
        <Typography className={styles.hint()} type="body-sm">
          {kycStatus === "pending" ? pendingHint : requiredHint}
        </Typography>
      </div>
      {kycStatus !== "pending" ? (
        <Button fullWidth size="lg" variant="primary" onPress={onCta}>
          {ctaLabel}
        </Button>
      ) : null}
    </section>
  );
}

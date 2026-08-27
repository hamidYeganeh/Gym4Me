import { TextWithBrand } from "@repo/ui/kit/LineShadowText";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { Crown1 } from "@repo/icons/Crown1";
import { useTranslations } from "next-intl";
import { baseProfileIdentitySectionVariants } from "./BaseProfileIdentitySection.styles";
import type { BaseProfileIdentitySectionProps } from "./BaseProfileIdentitySection.types";

export function BaseProfileIdentitySection({
  displayName,
  activeRoleLabel,
  memberSince,
  className,
}: BaseProfileIdentitySectionProps) {
  const t = useTranslations("Mobile.Profile");
  const styles = baseProfileIdentitySectionVariants();

  return (
    <section className={styles.identity({ className })}>
      <Chip
        className={styles.memberChip()}
        color="accent"
        variant="soft"
      >
        <Crown1 size={12} />
        <Chip.Label>{t("memberPlus", { role: activeRoleLabel })}</Chip.Label>
      </Chip>
      <Typography className={styles.memberSince()} type="body-sm">
        <TextWithBrand>
          {memberSince
            ? t("memberSince", { date: memberSince })
            : t("memberSinceFallback")}
        </TextWithBrand>
      </Typography>
      <Typography className={styles.name()} type="h1" weight="bold">
        {displayName}
      </Typography>
    </section>
  );
}

import { Button, Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import { payoutsListHeaderSectionVariants } from "./PayoutsListHeaderSection.styles";
import type { PayoutsListHeaderSectionProps } from "./PayoutsListHeaderSection.types";

export function PayoutsListHeaderSection({
  onDraftOpen,
  onRefresh,
  className,
}: PayoutsListHeaderSectionProps) {
  const t = useTranslations("Admin.Finance");
  const styles = payoutsListHeaderSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {t("payouts.title")}
      </Typography>
      <Typography className={styles.subtitle()}>
        {t("payouts.subtitle")}
      </Typography>
      <div className={styles.actions()}>
        <Button size="sm" variant="primary" onPress={onDraftOpen}>
          {t("payouts.actions.draft")}
        </Button>
        <Button size="sm" variant="ghost" onPress={onRefresh}>
          {t("refresh")}
        </Button>
      </div>
    </section>
  );
}

import { Button, Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import { bookingsListHeaderSectionVariants } from "./BookingsListHeaderSection.styles";
import type { BookingsListHeaderSectionProps } from "./BookingsListHeaderSection.types";

export function BookingsListHeaderSection({
  onRefresh,
  className,
}: BookingsListHeaderSectionProps) {
  const t = useTranslations("Admin.Bookings");
  const styles = bookingsListHeaderSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {t("title")}
      </Typography>
      <Typography className={styles.subtitle()}>{t("subtitle")}</Typography>
      <div className={styles.actions()}>
        <Button onPress={onRefresh} variant="outline">
          {t("refresh")}
        </Button>
      </div>
    </section>
  );
}

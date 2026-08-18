import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { supportTicketsHeaderSectionVariants } from "./SupportTicketsHeaderSection.styles";
import type { SupportTicketsHeaderSectionProps } from "./SupportTicketsHeaderSection.types";

export function SupportTicketsHeaderSection({
  className,
}: SupportTicketsHeaderSectionProps) {
  const t = useTranslations("Admin.Support");
  const styles = supportTicketsHeaderSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {t("ticketsTitle")}
      </Typography>
      <Typography className={styles.subtitle()}>{t("ticketsSubtitle")}</Typography>
    </section>
  );
}

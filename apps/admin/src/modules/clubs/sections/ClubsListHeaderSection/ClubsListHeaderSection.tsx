import { Button, Typography } from "@heroui/react";
import { ArrowRotateClockwise1, Plus } from "@repo/icons";
import { useTranslations } from "next-intl";
import { clubsListHeaderSectionVariants } from "./ClubsListHeaderSection.styles";
import type { ClubsListHeaderSectionProps } from "./ClubsListHeaderSection.types";

export function ClubsListHeaderSection({
  usingMock,
  onRefresh,
  onCreate,
  className,
}: ClubsListHeaderSectionProps) {
  const t = useTranslations("Admin.Clubs");
  const styles = clubsListHeaderSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div className={styles.copy()}>
        <Typography className={styles.title()} type="h1" weight="bold">
          {t("title")}
        </Typography>
        <Typography className={styles.subtitle()}>{t("subtitle")}</Typography>
        {usingMock ? (
          <p className={styles.badge()}>{t("usingMock")}</p>
        ) : null}
      </div>
      <div className={styles.actions()}>
        <Button variant="outline" onPress={onRefresh}>
          <ArrowRotateClockwise1 size={18} />
          {t("refresh")}
        </Button>
        <Button variant="primary" onPress={onCreate}>
          <Plus size={18} />
          {t("create")}
        </Button>
      </div>
    </section>
  );
}

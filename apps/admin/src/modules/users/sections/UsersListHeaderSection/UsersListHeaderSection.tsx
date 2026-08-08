import { Button, Typography } from "@heroui/react";
import { ArrowRotateClockwise1, Plus } from "@repo/icons";
import { useTranslations } from "next-intl";
import { usersListHeaderSectionVariants } from "./UsersListHeaderSection.styles";
import type { UsersListHeaderSectionProps } from "./UsersListHeaderSection.types";

export function UsersListHeaderSection({
  onRefresh,
  onCreate,
  className,
}: UsersListHeaderSectionProps) {
  const t = useTranslations("Admin.Users");
  const styles = usersListHeaderSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div className={styles.copy()}>
        <Typography className={styles.title()} type="h1" weight="bold">
          {t("title")}
        </Typography>
        <Typography className={styles.subtitle()}>{t("subtitle")}</Typography>
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

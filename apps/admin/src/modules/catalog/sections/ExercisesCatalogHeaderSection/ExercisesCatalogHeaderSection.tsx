import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { exercisesCatalogHeaderSectionVariants } from "./ExercisesCatalogHeaderSection.styles";
import type { ExercisesCatalogHeaderSectionProps } from "./ExercisesCatalogHeaderSection.types";

export function ExercisesCatalogHeaderSection({
  onCreate,
  onRefresh,
  className,
}: ExercisesCatalogHeaderSectionProps) {
  const t = useTranslations("Admin.Catalog");
  const styles = exercisesCatalogHeaderSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {t("exercises.title")}
      </Typography>
      <Typography className={styles.subtitle()}>
        {t("exercises.subtitle")}
      </Typography>
      <div className={styles.actions()}>
        <Button size="sm" variant="primary" onPress={onCreate}>
          {t("create")}
        </Button>
        <Button size="sm" variant="ghost" onPress={onRefresh}>
          {t("refresh")}
        </Button>
      </div>
    </section>
  );
}

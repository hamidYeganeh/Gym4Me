import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import type { FoodItemStatus } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFilterSelect } from "@/shared/components";
import { foodItemsHeaderSectionVariants } from "./FoodItemsHeaderSection.styles";
import type { FoodItemsHeaderSectionProps } from "./FoodItemsHeaderSection.types";

const FOOD_STATUSES: FoodItemStatus[] = ["active", "archived"];

export function FoodItemsHeaderSection({
  statusFilter,
  onStatusChange,
  onCreate,
  onRefresh,
  className,
}: FoodItemsHeaderSectionProps) {
  const t = useTranslations("Admin.Catalog");
  const styles = foodItemsHeaderSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {t("food.title")}
      </Typography>
      <Typography className={styles.subtitle()}>{t("food.subtitle")}</Typography>
      <div className={styles.filters()}>
        <AdminFilterSelect
          allLabel={t("filterAll")}
          label={t("food.filters.status")}
          options={FOOD_STATUSES.map((item) => ({
            value: item,
            label: t(`food.statuses.${item}`),
          }))}
          value={statusFilter}
          onChange={(value) => onStatusChange(value as typeof statusFilter)}
        />
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

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import type { FoodItemStatus } from "@repo/api";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { useTranslations } from "next-intl";
import { foodItemsHeaderSectionVariants } from "./FoodItemsHeaderSection.styles";
import type { FoodItemsHeaderSectionProps } from "./FoodItemsHeaderSection.types";

const STATUSES: Array<FoodItemStatus | "all"> = ["all", "active", "archived"];

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
      <div className={styles.actions()}>
        {STATUSES.map((status) => (
          <FilterChip
            key={status}
            onPress={() => onStatusChange(status)}
            selected={statusFilter === status}
          >
            {status === "all" ? t("filterAll") : status}
          </FilterChip>
        ))}
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

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { useTranslations } from "next-intl";
import {
  BANNER_PLACEMENTS,
  PUBLISH_STATUSES,
} from "../../lib/banner-constants";
import { bannersListHeaderSectionVariants } from "./BannersListHeaderSection.styles";
import type { BannersListHeaderSectionProps } from "./BannersListHeaderSection.types";

export function BannersListHeaderSection({
  statusFilter,
  placementFilter,
  onStatusChange,
  onPlacementChange,
  onCreate,
  onRefresh,
  className,
}: BannersListHeaderSectionProps) {
  const t = useTranslations("Admin.Banners");
  const styles = bannersListHeaderSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {t("title")}
      </Typography>
      <Typography className={styles.subtitle()}>{t("subtitle")}</Typography>
      <div className={styles.actions()}>
        {(["all", ...PUBLISH_STATUSES] as const).map((value) => (
          <FilterChip
            key={value}
            onPress={() => onStatusChange(value)}
            selected={statusFilter === value}
          >
            {value === "all" ? t("filterAll") : t(`publishStatus.${value}`)}
          </FilterChip>
        ))}
        <Button size="sm" variant="primary" onPress={onCreate}>
          {t("actions.create")}
        </Button>
        <Button size="sm" variant="ghost" onPress={onRefresh}>
          {t("refresh")}
        </Button>
      </div>
      <div className={styles.actions()}>
        {(["all", ...BANNER_PLACEMENTS] as const).map((value) => (
          <FilterChip
            key={value}
            onPress={() => onPlacementChange(value)}
            selected={placementFilter === value}
          >
            {value === "all" ? t("filterAll") : t(`placements.${value}`)}
          </FilterChip>
        ))}
      </div>
    </section>
  );
}

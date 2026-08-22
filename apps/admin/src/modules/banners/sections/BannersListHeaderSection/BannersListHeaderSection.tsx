import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import type { BannerPlacement, PublishStatus } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFilterSelect } from "@/shared/components";
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
      <div className={styles.filters()}>
        <AdminFilterSelect
          allLabel={t("filterAll")}
          label={t("filters.publishStatus")}
          options={PUBLISH_STATUSES.map((item) => ({
            value: item,
            label: t(`publishStatus.${item}`),
          }))}
          value={statusFilter}
          onChange={(value) =>
            onStatusChange(value as PublishStatus | "all")
          }
        />
        <AdminFilterSelect
          allLabel={t("filterAll")}
          label={t("filters.placement")}
          options={BANNER_PLACEMENTS.map((item) => ({
            value: item,
            label: t(`placements.${item}`),
          }))}
          value={placementFilter}
          onChange={(value) =>
            onPlacementChange(value as BannerPlacement | "all")
          }
        />
        <Button size="sm" variant="primary" onPress={onCreate}>
          {t("actions.create")}
        </Button>
        <Button size="sm" variant="ghost" onPress={onRefresh}>
          {t("refresh")}
        </Button>
      </div>
    </section>
  );
}

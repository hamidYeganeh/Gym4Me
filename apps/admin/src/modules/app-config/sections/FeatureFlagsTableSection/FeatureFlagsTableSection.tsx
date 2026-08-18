import { useMemo } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import type { FeatureFlag } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import { featureFlagsTableSectionVariants } from "./FeatureFlagsTableSection.styles";
import type { FeatureFlagsTableSectionProps } from "./FeatureFlagsTableSection.types";

const columnHelper = createColumnHelper<FeatureFlag>();

type FlagTableMeta = {
  actionsClassName: string;
  onEdit: (row: FeatureFlag) => void;
  onPause: (row: FeatureFlag) => void;
  onActivate: (row: FeatureFlag) => void;
};

export function FeatureFlagsTableSection({
  items,
  loading,
  error,
  onEdit,
  onPause,
  onActivate,
}: FeatureFlagsTableSectionProps) {
  const t = useTranslations("Admin.Ops");
  const styles = featureFlagsTableSectionVariants();

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("key", {
          header: t("flags.columns.key"),
          cell: ({ getValue }) => (
            <span className="block max-w-56 truncate" dir="ltr">
              {getValue()}
            </span>
          ),
        }),
        columnHelper.accessor("status", {
          header: t("flags.columns.status"),
          cell: ({ getValue }) => {
            const value = getValue();
            return (
              <Chip
                color={
                  value === "active"
                    ? "success"
                    : value === "paused"
                      ? "warning"
                      : "default"
                }
                size="sm"
                variant="soft"
              >
                <Chip.Label>{t(`flags.status.${value}`)}</Chip.Label>
              </Chip>
            );
          },
        }),
        columnHelper.accessor("rolloutPercentage", {
          header: t("flags.columns.rollout"),
          cell: ({ getValue }) => <span dir="ltr">{getValue()}%</span>,
        }),
        columnHelper.accessor((row) => row.platforms.join(", "), {
          id: "platforms",
          header: t("flags.columns.platforms"),
          cell: ({ getValue }) => <span dir="ltr">{getValue()}</span>,
        }),
        columnHelper.accessor((row) => row.channels.join(", "), {
          id: "channels",
          header: t("flags.columns.channels"),
          cell: ({ getValue }) => <span dir="ltr">{getValue()}</span>,
        }),
        columnHelper.display({
          id: "actions",
          header: t("flags.columns.actions"),
          size: 220,
          cell: (info) => {
            const meta = info.table.options.meta as FlagTableMeta | undefined;
            if (!meta) return null;
            const row = info.row.original;
            return (
              <div className={meta.actionsClassName}>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => meta.onEdit(row)}
                >
                  {t("flags.editTitle")}
                </Button>
                {row.status === "active" ? (
                  <Button
                    size="sm"
                    variant="danger"
                    onPress={() => meta.onPause(row)}
                  >
                    {t("flags.pause")}
                  </Button>
                ) : row.status === "paused" || row.status === "draft" ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onPress={() => meta.onActivate(row)}
                  >
                    {t("flags.activate")}
                  </Button>
                ) : null}
              </div>
            );
          },
        }),
      ] as ColumnDef<FeatureFlag, unknown>[],
    [t],
  );

  const meta: FlagTableMeta = {
    actionsClassName: styles.actions(),
    onEdit,
    onPause,
    onActivate,
  };

  return (
    <AdminDataTable
      ariaLabel={t("flags.title")}
      columns={columns}
      data={items}
      emptyLabel={t("flags.empty")}
      error={error}
      getRowId={(row) => row.id}
      hasMore={false}
      isFetchingMore={false}
      isLoading={loading}
      loadingLabel={t("loading")}
      loadingMoreLabel={t("loadingMore")}
      meta={meta}
      onLoadMore={() => {}}
      summaryLabel={t("flags.summary", { loaded: items.length })}
    />
  );
}

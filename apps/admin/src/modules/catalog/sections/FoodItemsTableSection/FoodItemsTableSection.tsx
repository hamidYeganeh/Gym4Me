import { useMemo } from "react";
import { Button, Chip } from "@heroui/react";
import type { FoodItem } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import { foodItemsTableSectionVariants } from "./FoodItemsTableSection.styles";
import type {
  FoodItemsTableSectionProps,
  FoodTableMeta,
} from "./FoodItemsTableSection.types";

const columnHelper = createColumnHelper<FoodItem>();

export function FoodItemsTableSection({
  items,
  total,
  loading,
  fetchingMore,
  hasMore,
  error,
  onLoadMore,
  onEdit,
  onArchive,
  className,
}: FoodItemsTableSectionProps) {
  const t = useTranslations("Admin.Catalog");
  const styles = foodItemsTableSectionVariants();

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("name", {
          header: t("food.columns.name"),
          cell: ({ getValue }) => (
            <span className="block max-w-56 truncate font-medium">
              {getValue()}
            </span>
          ),
        }),
        columnHelper.accessor((row) => row.categoryKey ?? "—", {
          id: "category",
          header: t("food.columns.category"),
        }),
        columnHelper.accessor((row) => row.servingLabel ?? "—", {
          id: "serving",
          header: t("food.columns.serving"),
        }),
        columnHelper.accessor((row) => row.macros.calories ?? "—", {
          id: "calories",
          header: t("food.columns.calories"),
        }),
        columnHelper.accessor((row) => row.macros.proteinG ?? "—", {
          id: "protein",
          header: t("food.columns.protein"),
        }),
        columnHelper.accessor("status", {
          header: t("food.columns.status"),
          cell: ({ getValue }) => (
            <Chip
              color={getValue() === "active" ? "success" : "warning"}
              size="sm"
              variant="soft"
            >
              <Chip.Label>{getValue()}</Chip.Label>
            </Chip>
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: t("food.columns.actions"),
          size: 170,
          cell: (info) => {
            const meta = info.table.options.meta as FoodTableMeta | undefined;
            if (!meta) return null;
            return (
              <div className={meta.actionsClassName}>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => meta.onEdit(info.row.original)}
                >
                  {t("edit")}
                </Button>
                {info.row.original.status === "active" ? (
                  <Button
                    size="sm"
                    variant="danger"
                    onPress={() => meta.onArchive(info.row.original)}
                  >
                    {t("archive")}
                  </Button>
                ) : null}
              </div>
            );
          },
        }),
      ] as ColumnDef<FoodItem, unknown>[],
    [t],
  );

  const meta: FoodTableMeta = {
    actionsClassName: styles.actions(),
    onEdit,
    onArchive,
  };

  return (
    <AdminDataTable
      ariaLabel={t("food.title")}
      className={className}
      columns={columns}
      data={items}
      emptyLabel={t("food.empty")}
      error={error}
      getRowId={(row) => row.id}
      hasMore={hasMore}
      isFetchingMore={fetchingMore}
      isLoading={loading}
      loadingLabel={t("loading")}
      loadingMoreLabel={t("loadingMore")}
      meta={meta}
      onLoadMore={onLoadMore}
      summaryLabel={t("food.summary", {
        loaded: items.length,
        total,
      })}
    />
  );
}

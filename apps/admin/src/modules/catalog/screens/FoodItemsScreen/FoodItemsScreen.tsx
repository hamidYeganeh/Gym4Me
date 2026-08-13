import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip, Typography } from "@heroui/react";
import type { FoodItem, FoodItemStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  AdminConfirmDialog,
  AdminDataTable,
  AdminShell,
} from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminNutrition } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { foodItemsScreenVariants } from "./FoodItemsScreen.styles";
import type { FoodItemsScreenProps } from "./FoodItemsScreen.types";

const PAGE_SIZE = 30;
const STATUSES: Array<FoodItemStatus | "all"> = ["all", "active", "archived"];

const columnHelper = createColumnHelper<FoodItem>();

type FoodTableMeta = {
  actionsClassName: string;
  onEdit: (row: FoodItem) => void;
  onArchive: (row: FoodItem) => void;
};

export function FoodItemsScreen({ className }: FoodItemsScreenProps) {
  const t = useTranslations("Admin.Catalog");
  const navigate = useNavigate();
  const styles = foodItemsScreenVariants();

  const [statusFilter, setStatusFilter] = useState<FoodItemStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [archiving, setArchiving] = useState<FoodItem | null>(null);
  const [archivePending, setArchivePending] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ statusFilter, search, pageSize: PAGE_SIZE }),
    [statusFilter, search],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminNutrition.listFoodItems({
        page,
        page_size: pageSize,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search.trim() || undefined,
      });
    },
    [statusFilter, search],
  );

  const {
    items,
    total,
    loading,
    fetchingMore,
    hasMore,
    error,
    loadMore,
    reload,
  } = useAdminInfiniteQuery<FoodItem>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("food.errorLoad"),
    fetchPage,
  });

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
    onEdit: (row) => navigate(routes.catalogFoodEdit(row.id)),
    onArchive: (row) => {
      setArchiving(row);
      setArchiveError(null);
    },
  };

  const handleArchive = async () => {
    if (!archiving) return;
    setArchivePending(true);
    setArchiveError(null);
    try {
      await adminNutrition.archiveFoodItem(archiving.id);
      setArchiving(null);
      void reload();
    } catch (err) {
      setArchiveError(
        err instanceof ApiError ? err.message : t("actionError"),
      );
    } finally {
      setArchivePending(false);
    }
  };

  return (
    <AdminShell
      activeNavId="catalogs"
      className={className}
      catalogSection={{
        activeTabId: "food",
        searchValue: search,
        onSearchChange: setSearch,
      }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("food.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("food.subtitle")}
          </Typography>
          <div className={styles.actions()}>
            {STATUSES.map((status) => (
              <FilterChip
                key={status}
                onPress={() => setStatusFilter(status)}
                selected={statusFilter === status}
              >
                {status === "all" ? t("filterAll") : status}
              </FilterChip>
            ))}
            <Button
              size="sm"
              variant="primary"
              onPress={() => navigate(routes.catalogFoodNew)}
            >
              {t("create")}
            </Button>
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("food.title")}
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
          onLoadMore={loadMore}
          summaryLabel={t("food.summary", {
            loaded: items.length,
            total,
          })}
        />
      </div>

      <AdminConfirmDialog
        body={
          <>
            <p>{t("food.archiveBody")}</p>
            {archiveError ? (
              <p className="mt-2 text-sm text-danger" role="alert">
                {archiveError}
              </p>
            ) : null}
          </>
        }
        cancelLabel={t("cancel")}
        confirmLabel={t("archive")}
        confirmVariant="danger"
        isOpen={Boolean(archiving)}
        isPending={archivePending}
        title={t("food.archiveTitle")}
        onConfirm={() => void handleArchive()}
        onOpenChange={(open) => {
          if (!open) setArchiving(null);
        }}
      />
    </AdminShell>
  );
}

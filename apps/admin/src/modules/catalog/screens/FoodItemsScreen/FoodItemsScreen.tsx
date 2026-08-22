import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FoodItem, FoodItemStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import { adminNutrition } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import {
  loadNutritionCategoryOptions,
  nutritionCategoryLabels,
} from "../../lib/nutrition-categories";
import { FoodItemsArchiveDialogSection } from "../../sections/FoodItemsArchiveDialogSection";
import { FoodItemsHeaderSection } from "../../sections/FoodItemsHeaderSection";
import { FoodItemsTableSection } from "../../sections/FoodItemsTableSection";
import { foodItemsScreenVariants } from "./FoodItemsScreen.styles";
import type { FoodItemsScreenProps } from "./FoodItemsScreen.types";

const PAGE_SIZE = 30;
const FILTER_KEYS = ["status"] as const;

type FoodItemsFilters = {
  status: FoodItemStatus | "all";
};

const FILTER_DEFAULTS: FoodItemsFilters & {
  search: string;
  page: number;
  page_size: number;
} = {
  status: "all",
  search: "",
  page: 1,
  page_size: PAGE_SIZE,
};

export function FoodItemsScreen({ className }: FoodItemsScreenProps) {
  const t = useTranslations("Admin.Catalog");
  const navigate = useNavigate();
  const styles = foodItemsScreenVariants();

  const {
    search,
    searchInput,
    setSearchInput,
    filters,
    setFilter,
    page,
    pageSize,
    setPage,
  } = useAdminListQueryParams<FoodItemsFilters>({
    filterKeys: FILTER_KEYS,
    defaults: FILTER_DEFAULTS,
  });
  const [archiving, setArchiving] = useState<FoodItem | null>(null);
  const [archivePending, setArchivePending] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    let cancelled = false;
    void loadNutritionCategoryOptions()
      .then((options) => {
        if (!cancelled) setCategoryLabels(nutritionCategoryLabels(options));
      })
      .catch(() => {
        if (!cancelled) setCategoryLabels({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const queryKey = useMemo(
    () => JSON.stringify({ filters, search, pageSize }),
    [filters, pageSize, search],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminNutrition.listFoodItems({
        page,
        page_size: pageSize,
        status: filters.status === "all" ? undefined : filters.status,
        search: search.trim() || undefined,
      });
    },
    [filters, search],
  );

  const {
    items,
    total,
    totalPages,
    loading,
    error,
    setPage: changePage,
    reload,
  } = useAdminPaginatedQuery<FoodItem>({
    queryKey,
    page,
    pageSize,
    onPageChange: setPage,
    errorFallback: t("food.errorLoad"),
    fetchPage,
  });

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
        searchValue: searchInput,
        onSearchChange: setSearchInput,
      }}
    >
      <div className={styles.content()}>
        <FoodItemsHeaderSection
          statusFilter={filters.status}
          onCreate={() => navigate(routes.catalogFoodNew)}
          onRefresh={() => void reload()}
          onStatusChange={(value) => setFilter("status", value)}
        />

        <FoodItemsTableSection
          categoryLabels={categoryLabels}
          error={error}
          items={items}
          loading={loading}
          total={total}
          onArchive={(row) => {
            setArchiving(row);
            setArchiveError(null);
          }}
          onEdit={(row) => navigate(routes.catalogFoodEdit(row.id))}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={changePage}
        />
      </div>

      <FoodItemsArchiveDialogSection
        archiveError={archiveError}
        archivePending={archivePending}
        archiving={archiving}
        onConfirm={() => void handleArchive()}
        onOpenChange={(open) => {
          if (!open) setArchiving(null);
        }}
      />
    </AdminShell>
  );
}

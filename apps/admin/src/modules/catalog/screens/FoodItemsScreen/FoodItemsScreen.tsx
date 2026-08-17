import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FoodItem, FoodItemStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminNutrition } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { FoodItemsArchiveDialogSection } from "../../sections/FoodItemsArchiveDialogSection";
import { FoodItemsHeaderSection } from "../../sections/FoodItemsHeaderSection";
import { FoodItemsTableSection } from "../../sections/FoodItemsTableSection";
import { foodItemsScreenVariants } from "./FoodItemsScreen.styles";
import type { FoodItemsScreenProps } from "./FoodItemsScreen.types";

const PAGE_SIZE = 30;

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
        <FoodItemsHeaderSection
          statusFilter={statusFilter}
          onCreate={() => navigate(routes.catalogFoodNew)}
          onRefresh={() => void reload()}
          onStatusChange={setStatusFilter}
        />

        <FoodItemsTableSection
          error={error}
          fetchingMore={fetchingMore}
          hasMore={hasMore}
          items={items}
          loading={loading}
          total={total}
          onArchive={(row) => {
            setArchiving(row);
            setArchiveError(null);
          }}
          onEdit={(row) => navigate(routes.catalogFoodEdit(row.id))}
          onLoadMore={loadMore}
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

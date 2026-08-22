import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AdminBanner, BannerPlacement, PublishStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import { adminBanners } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { BannersListDeleteDialogSection } from "../../sections/BannersListDeleteDialogSection";
import { BannersListHeaderSection } from "../../sections/BannersListHeaderSection";
import { BannersListTableSection } from "../../sections/BannersListTableSection";
import { bannersListScreenVariants } from "./BannersListScreen.styles";
import type { BannersListScreenProps } from "./BannersListScreen.types";

const PAGE_SIZE = 30;
const FILTER_KEYS = ["publishStatus", "placement"] as const;

type BannersListFilters = {
  publishStatus: PublishStatus | "all";
  placement: BannerPlacement | "all";
};

const FILTER_DEFAULTS: BannersListFilters & {
  search: string;
  page: number;
  page_size: number;
} = {
  publishStatus: "all",
  placement: "all",
  search: "",
  page: 1,
  page_size: PAGE_SIZE,
};

export function BannersListScreen({ className }: BannersListScreenProps) {
  const t = useTranslations("Admin.Banners");
  const navigate = useNavigate();
  const styles = bannersListScreenVariants();

  const {
    search,
    searchInput,
    setSearchInput,
    filters,
    setFilter,
    page,
    pageSize,
    setPage,
  } = useAdminListQueryParams<BannersListFilters>({
    filterKeys: FILTER_KEYS,
    defaults: FILTER_DEFAULTS,
  });
  const [deleting, setDeleting] = useState<AdminBanner | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ filters, search, pageSize }),
    [filters, pageSize, search],
  );

  const fetchPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      return adminBanners.list({
        page: nextPage,
        page_size: nextPageSize,
        publishStatus:
          filters.publishStatus === "all" ? undefined : filters.publishStatus,
        placement: filters.placement === "all" ? undefined : filters.placement,
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
  } = useAdminPaginatedQuery<AdminBanner>({
    queryKey,
    page,
    pageSize,
    onPageChange: setPage,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletePending(true);
    setDeleteError(null);
    try {
      await adminBanners.delete(deleting.id);
      setDeleting(null);
      void reload();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <AdminShell
      activeNavId="banners"
      bannersSection={{
        searchValue: searchInput,
        onSearchChange: setSearchInput,
      }}
      className={className}
    >
      <div className={styles.content()}>
        <BannersListHeaderSection
          placementFilter={filters.placement}
          statusFilter={filters.publishStatus}
          onCreate={() => navigate(routes.bannersNew)}
          onPlacementChange={(value) => setFilter("placement", value)}
          onRefresh={() => void reload()}
          onStatusChange={(value) => setFilter("publishStatus", value)}
        />

        <BannersListTableSection
          error={error}
          items={items}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onDelete={(row) => {
            setDeleting(row);
            setDeleteError(null);
          }}
          onEdit={(row) => navigate(routes.bannerEdit(row.id))}
          onPageChange={changePage}
        />
      </div>

      <BannersListDeleteDialogSection
        deleteError={deleteError}
        deletePending={deletePending}
        deleting={deleting}
        onConfirm={() => void handleDelete()}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </AdminShell>
  );
}

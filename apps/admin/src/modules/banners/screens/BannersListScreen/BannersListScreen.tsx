import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AdminBanner, BannerPlacement, PublishStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminBanners } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { BannersListDeleteDialogSection } from "../../sections/BannersListDeleteDialogSection";
import { BannersListHeaderSection } from "../../sections/BannersListHeaderSection";
import { BannersListTableSection } from "../../sections/BannersListTableSection";
import { bannersListScreenVariants } from "./BannersListScreen.styles";
import type { BannersListScreenProps } from "./BannersListScreen.types";

const PAGE_SIZE = 30;

export function BannersListScreen({ className }: BannersListScreenProps) {
  const t = useTranslations("Admin.Banners");
  const navigate = useNavigate();
  const styles = bannersListScreenVariants();

  const [statusFilter, setStatusFilter] = useState<PublishStatus | "all">(
    "all",
  );
  const [placementFilter, setPlacementFilter] = useState<
    BannerPlacement | "all"
  >("all");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<AdminBanner | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const queryKey = useMemo(
    () =>
      JSON.stringify({
        statusFilter,
        placementFilter,
        search,
        pageSize: PAGE_SIZE,
      }),
    [statusFilter, placementFilter, search],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminBanners.list({
        page,
        page_size: pageSize,
        publishStatus: statusFilter === "all" ? undefined : statusFilter,
        placement: placementFilter === "all" ? undefined : placementFilter,
        search: search.trim() || undefined,
      });
    },
    [statusFilter, placementFilter, search],
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
  } = useAdminInfiniteQuery<AdminBanner>({
    queryKey,
    pageSize: PAGE_SIZE,
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
        searchValue: search,
        onSearchChange: setSearch,
      }}
      className={className}
    >
      <div className={styles.content()}>
        <BannersListHeaderSection
          placementFilter={placementFilter}
          statusFilter={statusFilter}
          onCreate={() => navigate(routes.bannersNew)}
          onPlacementChange={setPlacementFilter}
          onRefresh={() => void reload()}
          onStatusChange={setStatusFilter}
        />

        <BannersListTableSection
          error={error}
          fetchingMore={fetchingMore}
          hasMore={hasMore}
          items={items}
          loading={loading}
          total={total}
          onDelete={(row) => {
            setDeleting(row);
            setDeleteError(null);
          }}
          onEdit={(row) => navigate(routes.bannerEdit(row.id))}
          onLoadMore={loadMore}
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

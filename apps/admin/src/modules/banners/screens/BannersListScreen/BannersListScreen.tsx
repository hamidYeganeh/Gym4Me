import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip, Typography } from "@heroui/react";
import type { AdminBanner, BannerPlacement, PublishStatus } from "@repo/api";
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
import { adminBanners } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import {
  BANNER_PLACEMENTS,
  PUBLISH_STATUSES,
} from "../../lib/banner-constants";
import { bannersListScreenVariants } from "./BannersListScreen.styles";
import type { BannersListScreenProps } from "./BannersListScreen.types";

const PAGE_SIZE = 30;

const columnHelper = createColumnHelper<AdminBanner>();

type BannerTableMeta = {
  onEdit: (row: AdminBanner) => void;
  onDelete: (row: AdminBanner) => void;
  actionsClassName: string;
};

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

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("title", {
          header: t("columns.title"),
          size: 220,
          enableSorting: false,
          cell: (info) => (
            <span className="block truncate font-medium">
              {info.getValue()}
            </span>
          ),
        }),
        columnHelper.accessor("placement", {
          header: t("columns.placement"),
          size: 150,
          enableSorting: false,
          cell: (info) => t(`placements.${info.getValue()}`),
        }),
        columnHelper.accessor((row) => row.slides.length, {
          id: "slides",
          header: t("columns.slides"),
          size: 80,
          enableSorting: false,
          cell: (info) => (
            <span className="tabular-nums">{info.getValue()}</span>
          ),
        }),
        columnHelper.accessor("publishStatus", {
          header: t("columns.publishStatus"),
          size: 120,
          enableSorting: false,
          cell: (info) => {
            const status = info.getValue();
            const color =
              status === "published"
                ? "success"
                : status === "draft"
                  ? "warning"
                  : "danger";
            return (
              <Chip color={color} size="sm" variant="soft">
                {t(`publishStatus.${status}`)}
              </Chip>
            );
          },
        }),
        columnHelper.accessor("order", {
          header: t("columns.order"),
          size: 70,
          enableSorting: false,
          cell: (info) => (
            <span className="tabular-nums">{info.getValue()}</span>
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: t("columns.actions"),
          size: 160,
          cell: (info) => {
            const meta = info.table.options.meta as
              | BannerTableMeta
              | undefined;
            if (!meta) return null;
            return (
              <div className={meta.actionsClassName}>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => meta.onEdit(info.row.original)}
                >
                  {t("actions.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onPress={() => meta.onDelete(info.row.original)}
                >
                  {t("actions.delete")}
                </Button>
              </div>
            );
          },
        }),
      ] as ColumnDef<AdminBanner, unknown>[],
    [t],
  );

  const meta: BannerTableMeta = {
    actionsClassName: styles.actions(),
    onEdit: (row) => navigate(routes.bannerEdit(row.id)),
    onDelete: (row) => {
      setDeleting(row);
      setDeleteError(null);
    },
  };

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
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("subtitle")}
          </Typography>
          <div className={styles.actions()}>
            {(["all", ...PUBLISH_STATUSES] as const).map((value) => (
              <FilterChip
                key={value}
                onPress={() => setStatusFilter(value)}
                selected={statusFilter === value}
              >
                {value === "all" ? t("filterAll") : t(`publishStatus.${value}`)}
              </FilterChip>
            ))}
            <Button
              size="sm"
              variant="primary"
              onPress={() => navigate(routes.bannersNew)}
            >
              {t("actions.create")}
            </Button>
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
          <div className={styles.actions()}>
            {(["all", ...BANNER_PLACEMENTS] as const).map((value) => (
              <FilterChip
                key={value}
                onPress={() => setPlacementFilter(value)}
                selected={placementFilter === value}
              >
                {value === "all" ? t("filterAll") : t(`placements.${value}`)}
              </FilterChip>
            ))}
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("title")}
          columns={columns}
          data={items}
          emptyLabel={t("empty")}
          error={error}
          getRowId={(row) => row.id}
          hasMore={hasMore}
          isFetchingMore={fetchingMore}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          meta={meta}
          summaryLabel={t("infinite.summary", {
            loaded: items.length,
            total,
          })}
          onLoadMore={loadMore}
        />
      </div>

      <AdminConfirmDialog
        body={
          <>
            <p>{t("actions.deleteBody")}</p>
            {deleteError ? (
              <p className="mt-2 text-sm text-danger" role="alert">
                {deleteError}
              </p>
            ) : null}
          </>
        }
        cancelLabel={t("cancel")}
        confirmLabel={t("actions.delete")}
        confirmVariant="danger"
        isOpen={Boolean(deleting)}
        isPending={deletePending}
        title={t("actions.deleteTitle")}
        onConfirm={() => void handleDelete()}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </AdminShell>
  );
}

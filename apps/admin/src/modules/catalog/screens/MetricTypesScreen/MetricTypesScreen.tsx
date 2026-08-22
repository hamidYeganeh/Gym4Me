import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import type { MetricType } from "@repo/api";
import { ApiError } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  AdminConfirmDialog,
  AdminDataTable,
  AdminShell,
} from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import {
  adminListPaginationProps,
  adminListPaginationSummary,
} from "@/shared/lib/admin-list-pagination";
import { adminProgress } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { metricTypesScreenVariants } from "./MetricTypesScreen.styles";
import type { MetricTypesScreenProps } from "./MetricTypesScreen.types";

const PAGE_SIZE = 30;

const columnHelper = createColumnHelper<MetricType>();

type MetricTableMeta = {
  actionsClassName: string;
  onEdit: (row: MetricType) => void;
  onArchive: (row: MetricType) => void;
};

export function MetricTypesScreen({ className }: MetricTypesScreenProps) {
  const t = useTranslations("Admin.Catalog");
  const tCommon = useTranslations("Admin.Common");
  const navigate = useNavigate();
  const styles = metricTypesScreenVariants();

  const [search, setSearch] = useState("");
  const [archiving, setArchiving] = useState<MetricType | null>(null);
  const [archivePending, setArchivePending] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const { page, pageSize, setPage } = useAdminListQueryParams<Record<never, never>>({
    filterKeys: [],
    defaults: { page: 1, page_size: PAGE_SIZE },
  });

  const queryKey = useMemo(
    () => JSON.stringify({ search, pageSize }),
    [pageSize, search],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminProgress.listMetricTypes({
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
      });
    },
    [search],
  );

  const {
    items,
    total,
    totalPages,
    loading,
    error,
    setPage: changePage,
    reload,
  } = useAdminPaginatedQuery<MetricType>({
    queryKey,
    page,
    pageSize,
    onPageChange: setPage,
    errorFallback: t("metrics.errorLoad"),
    fetchPage,
  });

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("key", {
          header: t("metrics.columns.key"),
          cell: ({ getValue }) => <span dir="ltr">{getValue()}</span>,
        }),
        columnHelper.accessor("name", {
          header: t("metrics.columns.name"),
        }),
        columnHelper.accessor("valueKind", {
          header: t("metrics.columns.valueKind"),
        }),
        columnHelper.accessor((row) => row.unit ?? "—", {
          id: "unit",
          header: t("metrics.columns.unit"),
        }),
        columnHelper.accessor("status", {
          header: t("metrics.columns.status"),
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
          header: t("metrics.columns.actions"),
          size: 170,
          cell: (info) => {
            const meta = info.table.options.meta as MetricTableMeta | undefined;
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
      ] as ColumnDef<MetricType, unknown>[],
    [t],
  );

  const meta: MetricTableMeta = {
    actionsClassName: styles.actions(),
    onEdit: (row) => navigate(routes.catalogMetricEdit(row.id)),
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
      await adminProgress.archiveMetricType(archiving.id);
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

  const summary = adminListPaginationSummary(page, pageSize, total);

  return (
    <AdminShell
      activeNavId="catalogs"
      className={className}
      catalogSection={{
        activeTabId: "metrics",
        searchValue: search,
        onSearchChange: setSearch,
      }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("metrics.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("metrics.subtitle")}
          </Typography>
          <div className={styles.actions()}>
            <Button
              size="sm"
              variant="primary"
              onPress={() => navigate(routes.catalogMetricNew)}
            >
              {t("create")}
            </Button>
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("metrics.title")}
          columns={columns}
          data={items}
          emptyLabel={t("metrics.empty")}
          error={error}
          getRowId={(row) => row.id}
          isLoading={loading}
          loadingLabel={t("loading")}
          meta={meta}
          pagination={adminListPaginationProps({
            page,
            totalPages,
            previousLabel: tCommon("pagination.previous"),
            nextLabel: tCommon("pagination.next"),
            onPageChange: changePage,
          })}
          summaryLabel={tCommon("pagination.summary", summary)}
        />
      </div>

      <AdminConfirmDialog
        body={
          <>
            <Typography>{t("metrics.archiveBody")}</Typography>
            {archiveError ? (
              <Typography className="mt-2 text-sm text-danger" role="alert">
                {archiveError}
              </Typography>
            ) : null}
          </>
        }
        cancelLabel={t("cancel")}
        confirmLabel={t("archive")}
        confirmVariant="danger"
        isOpen={Boolean(archiving)}
        isPending={archivePending}
        title={t("metrics.archiveTitle")}
        onConfirm={() => void handleArchive()}
        onOpenChange={(open) => {
          if (!open) setArchiving(null);
        }}
      />
    </AdminShell>
  );
}

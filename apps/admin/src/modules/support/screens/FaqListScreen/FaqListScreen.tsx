import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip, Typography } from "@heroui/react";
import type { AdminFaqItem, PublishStatus } from "@repo/api";
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
import { adminSupport } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { PUBLISH_STATUSES } from "../../lib/support-constants";
import { faqListScreenVariants } from "./FaqListScreen.styles";
import type { FaqListScreenProps } from "./FaqListScreen.types";

const PAGE_SIZE = 30;

const columnHelper = createColumnHelper<AdminFaqItem>();

type FaqTableMeta = {
  onEdit: (row: AdminFaqItem) => void;
  onDelete: (row: AdminFaqItem) => void;
  actionsClassName: string;
};

export function FaqListScreen({ className }: FaqListScreenProps) {
  const t = useTranslations("Admin.Support");
  const navigate = useNavigate();
  const styles = faqListScreenVariants();

  const [statusFilter, setStatusFilter] = useState<PublishStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<AdminFaqItem | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ statusFilter, search, pageSize: PAGE_SIZE }),
    [statusFilter, search],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminSupport.listFaq({
        page,
        page_size: pageSize,
        publishStatus: statusFilter === "all" ? undefined : statusFilter,
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
  } = useAdminInfiniteQuery<AdminFaqItem>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("question", {
          header: t("faqColumns.question"),
          size: 260,
          enableSorting: false,
          cell: (info) => (
            <span className="block truncate font-medium">
              {info.getValue()}
            </span>
          ),
        }),
        columnHelper.accessor("audience", {
          header: t("faqColumns.audience"),
          size: 120,
          enableSorting: false,
          cell: (info) => t(`audience.${info.getValue()}`),
        }),
        columnHelper.accessor("publishStatus", {
          header: t("faqColumns.publishStatus"),
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
          header: t("faqColumns.order"),
          size: 70,
          enableSorting: false,
          cell: (info) => (
            <span className="tabular-nums">{info.getValue()}</span>
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: t("faqColumns.actions"),
          size: 160,
          cell: (info) => {
            const meta = info.table.options.meta as FaqTableMeta | undefined;
            if (!meta) return null;
            return (
              <div className={meta.actionsClassName}>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => meta.onEdit(info.row.original)}
                >
                  {t("faqActions.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onPress={() => meta.onDelete(info.row.original)}
                >
                  {t("faqActions.delete")}
                </Button>
              </div>
            );
          },
        }),
      ] as ColumnDef<AdminFaqItem, unknown>[],
    [t],
  );

  const meta: FaqTableMeta = {
    actionsClassName: styles.actions(),
    onEdit: (row) => navigate(routes.supportFaqEdit(row.id)),
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
      await adminSupport.deleteFaq(deleting.id);
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
      activeNavId="support"
      className={className}
      supportSection={{
        activeTabId: "faq",
        searchValue: search,
        onSearchChange: setSearch,
      }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("faqTitle")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("faqSubtitle")}
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
              onPress={() => navigate(routes.supportFaqNew)}
            >
              {t("faqActions.create")}
            </Button>
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("faqTitle")}
          columns={columns}
          data={items}
          emptyLabel={t("faqEmpty")}
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
            <p>{t("faqActions.deleteBody")}</p>
            {deleteError ? (
              <p className="mt-2 text-sm text-danger" role="alert">
                {deleteError}
              </p>
            ) : null}
          </>
        }
        cancelLabel={t("cancel")}
        confirmLabel={t("faqActions.delete")}
        confirmVariant="danger"
        isOpen={Boolean(deleting)}
        isPending={deletePending}
        title={t("faqActions.deleteTitle")}
        onConfirm={() => void handleDelete()}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </AdminShell>
  );
}

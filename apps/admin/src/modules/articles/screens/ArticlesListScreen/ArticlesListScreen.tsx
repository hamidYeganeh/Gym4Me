import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip, Typography } from "@heroui/react";
import type { AdminArticle, PublishStatus } from "@repo/api";
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
import { adminArticles } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { PUBLISH_STATUSES } from "../../lib/article-constants";
import { articlesListScreenVariants } from "./ArticlesListScreen.styles";
import type { ArticlesListScreenProps } from "./ArticlesListScreen.types";

const PAGE_SIZE = 30;

const columnHelper = createColumnHelper<AdminArticle>();

type ArticlesTableMeta = {
  onEdit: (row: AdminArticle) => void;
  onDelete: (row: AdminArticle) => void;
  actionsClassName: string;
};

export function ArticlesListScreen({ className }: ArticlesListScreenProps) {
  const t = useTranslations("Admin.Articles");
  const navigate = useNavigate();
  const styles = articlesListScreenVariants();

  const [statusFilter, setStatusFilter] = useState<PublishStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<AdminArticle | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ statusFilter, search, pageSize: PAGE_SIZE }),
    [statusFilter, search],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminArticles.list({
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
  } = useAdminInfiniteQuery<AdminArticle>({
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
        columnHelper.accessor((row) => row.taxonomy.category, {
          id: "category",
          header: t("columns.category"),
          size: 110,
          enableSorting: false,
        }),
        columnHelper.accessor((row) => row.taxonomy.kind, {
          id: "kind",
          header: t("columns.kind"),
          size: 100,
          enableSorting: false,
          cell: (info) => t(`kinds.${info.getValue()}`),
        }),
        columnHelper.accessor((row) => row.taxonomy.audience, {
          id: "audience",
          header: t("columns.audience"),
          size: 100,
          enableSorting: false,
          cell: (info) => t(`audiences.${info.getValue()}`),
        }),
        columnHelper.accessor("readingTimeMinutes", {
          header: t("columns.readingTime"),
          size: 90,
          enableSorting: false,
          cell: (info) => t("readingTimeValue", { minutes: info.getValue() }),
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
        columnHelper.accessor("engagement", {
          header: t("columns.engagement"),
          size: 140,
          enableSorting: false,
          cell: (info) => {
            const value = info.getValue();
            return (
              <span className="tabular-nums text-muted">
                {t("engagementSummary", {
                  likes: value.likesCount,
                  comments: value.commentsCount,
                  saves: value.savesCount,
                })}
              </span>
            );
          },
        }),
        columnHelper.display({
          id: "actions",
          header: t("columns.actions"),
          size: 160,
          cell: (info) => {
            const meta = info.table.options.meta as ArticlesTableMeta | undefined;
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
      ] as ColumnDef<AdminArticle, unknown>[],
    [t],
  );

  const meta: ArticlesTableMeta = {
    actionsClassName: styles.actions(),
    onEdit: (row) => navigate(routes.articleEdit(row.id)),
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
      await adminArticles.delete(deleting.id);
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
      activeNavId="articles"
      articlesSection={{
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
              onPress={() => navigate(routes.articlesNew)}
            >
              {t("actions.create")}
            </Button>
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
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

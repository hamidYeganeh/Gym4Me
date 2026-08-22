import { useMemo } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import type { AdminArticle } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import {
  adminListPaginationProps,
  adminListPaginationSummary,
} from "@/shared/lib/admin-list-pagination";
import { articlesListTableSectionVariants } from "./ArticlesListTableSection.styles";
import type {
  ArticlesListTableSectionProps,
  ArticlesTableMeta,
} from "./ArticlesListTableSection.types";

const columnHelper = createColumnHelper<AdminArticle>();

export function ArticlesListTableSection({
  items,
  total,
  page,
  pageSize,
  totalPages,
  loading,
  error,
  onPageChange,
  onEdit,
  onDelete,
  className,
}: ArticlesListTableSectionProps) {
  const t = useTranslations("Admin.Articles");
  const tCommon = useTranslations("Admin.Common");
  const styles = articlesListTableSectionVariants();

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
    onEdit,
    onDelete,
  };

  const summary = adminListPaginationSummary(page, pageSize, total);

  return (
    <AdminDataTable
      ariaLabel={t("title")}
      className={className}
      columns={columns}
      data={items}
      emptyLabel={t("empty")}
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
        onPageChange,
      })}
      summaryLabel={tCommon("pagination.summary", summary)}
    />
  );
}

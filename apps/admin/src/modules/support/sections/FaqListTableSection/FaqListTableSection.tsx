import { useMemo } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import type { AdminFaqItem } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import {
  adminListPaginationProps,
  adminListPaginationSummary,
} from "@/shared/lib/admin-list-pagination";
import { faqListTableSectionVariants } from "./FaqListTableSection.styles";
import type {
  FaqListTableSectionProps,
  FaqTableMeta,
} from "./FaqListTableSection.types";

const columnHelper = createColumnHelper<AdminFaqItem>();

export function FaqListTableSection({
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
}: FaqListTableSectionProps) {
  const t = useTranslations("Admin.Support");
  const tCommon = useTranslations("Admin.Common");
  const styles = faqListTableSectionVariants();

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
    onEdit,
    onDelete,
  };

  const summary = adminListPaginationSummary(page, pageSize, total);

  return (
    <AdminDataTable
      ariaLabel={t("faqTitle")}
      className={className}
      columns={columns}
      data={items}
      emptyLabel={t("faqEmpty")}
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

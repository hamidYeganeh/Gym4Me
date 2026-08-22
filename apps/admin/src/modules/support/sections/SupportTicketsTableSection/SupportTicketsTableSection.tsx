import { useMemo } from "react";
import type { SupportTicket } from "@repo/api";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import {
  adminListPaginationProps,
  adminListPaginationSummary,
} from "@/shared/lib/admin-list-pagination";
import {
  createSupportTableColumns,
  type SupportTableMeta,
} from "../../lib/support-table-columns";
import { supportTicketsTableSectionVariants } from "./SupportTicketsTableSection.styles";
import type { SupportTicketsTableSectionProps } from "./SupportTicketsTableSection.types";

export function SupportTicketsTableSection({
  items,
  total,
  page,
  pageSize,
  totalPages,
  loading,
  error,
  onPageChange,
  onView,
  className,
}: SupportTicketsTableSectionProps) {
  const t = useTranslations("Admin.Support");
  const tCommon = useTranslations("Admin.Common");
  const styles = supportTicketsTableSectionVariants();

  const columns = useMemo(
    () =>
      createSupportTableColumns({
        columns: {
          ticketNumber: t("columns.ticketNumber"),
          requester: t("columns.requester"),
          subject: t("columns.subject"),
          category: t("columns.category"),
          priority: t("columns.priority"),
          status: t("columns.status"),
          lastMessageAt: t("columns.lastMessageAt"),
          actions: t("columns.actions"),
        },
        category: (category) => t(`category.${category}`),
        priority: (priority) => t(`priority.${priority}`),
        status: (status) => t(`status.${status}`),
        view: t("actionsMenu.view"),
      }) as ColumnDef<SupportTicket, unknown>[],
    [t],
  );

  const meta: SupportTableMeta = {
    actionsClassName: styles.actions(),
    onView,
  };

  const summary = adminListPaginationSummary(page, pageSize, total);

  return (
    <AdminDataTable
      ariaLabel={t("ticketsTitle")}
      className={className}
      columns={columns}
      data={items}
      emptyLabel={t("ticketsEmpty")}
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

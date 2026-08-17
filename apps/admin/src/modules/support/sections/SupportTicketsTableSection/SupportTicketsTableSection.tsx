import { useMemo } from "react";
import type { SupportTicket } from "@repo/api";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import {
  createSupportTableColumns,
  type SupportTableMeta,
} from "../../lib/support-table-columns";
import { supportTicketsTableSectionVariants } from "./SupportTicketsTableSection.styles";
import type { SupportTicketsTableSectionProps } from "./SupportTicketsTableSection.types";

export function SupportTicketsTableSection({
  items,
  total,
  loading,
  fetchingMore,
  hasMore,
  error,
  onLoadMore,
  onView,
  className,
}: SupportTicketsTableSectionProps) {
  const t = useTranslations("Admin.Support");
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

  return (
    <AdminDataTable
      ariaLabel={t("ticketsTitle")}
      className={className}
      columns={columns}
      data={items}
      emptyLabel={t("ticketsEmpty")}
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
      onLoadMore={onLoadMore}
    />
  );
}

import { useMemo } from "react";
import type { AuditLogItem } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import {
  adminListPaginationProps,
  adminListPaginationSummary,
} from "@/shared/lib/admin-list-pagination";
import { formatAdminDate } from "@/shared/lib/user-format";
import type { AuditLogsTableSectionProps } from "./AuditLogsTableSection.types";

const columnHelper = createColumnHelper<AuditLogItem>();

export function AuditLogsTableSection({
  items,
  total,
  page,
  pageSize,
  totalPages,
  loading,
  error,
  onPageChange,
  className,
}: AuditLogsTableSectionProps) {
  const t = useTranslations("Admin.Ops");
  const tCommon = useTranslations("Admin.Common");

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("action", {
          header: t("audit.columns.action"),
          cell: ({ getValue }) => (
            <span className="block max-w-56 truncate" dir="ltr">
              {getValue()}
            </span>
          ),
        }),
        columnHelper.accessor((row) => row.actorId ?? "—", {
          id: "actor",
          header: t("audit.columns.actor"),
          cell: ({ getValue }) => (
            <span className="block max-w-44 truncate" dir="ltr">
              {getValue()}
            </span>
          ),
        }),
        columnHelper.accessor((row) => row.targetUserId ?? "—", {
          id: "target",
          header: t("audit.columns.target"),
          cell: ({ getValue }) => (
            <span className="block max-w-44 truncate" dir="ltr">
              {getValue()}
            </span>
          ),
        }),
        columnHelper.accessor((row) => row.ip ?? "—", {
          id: "ip",
          header: t("audit.columns.ip"),
          cell: ({ getValue }) => <span dir="ltr">{getValue()}</span>,
        }),
        columnHelper.accessor("createdAt", {
          header: t("audit.columns.createdAt"),
          cell: ({ getValue }) => formatAdminDate(getValue()),
        }),
      ] as ColumnDef<AuditLogItem, unknown>[],
    [t],
  );

  const summary = adminListPaginationSummary(page, pageSize, total);

  return (
    <AdminDataTable
      ariaLabel={t("audit.title")}
      className={className}
      columns={columns}
      data={items}
      emptyLabel={t("audit.empty")}
      error={error}
      getRowId={(row) => row.id}
      isLoading={loading}
      loadingLabel={t("loading")}
      pagination={adminListPaginationProps({
        page,
        totalPages,
        previousLabel: tCommon("pagination.previous"),
        nextLabel: tCommon("pagination.next"),
        onPageChange,
      })}
      summaryLabel={t("audit.summary", {
        loaded: `${summary.from}–${summary.to}`,
        total: summary.total,
      })}
    />
  );
}

import { useMemo } from "react";
import type { AuditLogItem } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import { formatAdminDate } from "@/shared/lib/user-format";
import type { AuditLogsTableSectionProps } from "./AuditLogsTableSection.types";

const columnHelper = createColumnHelper<AuditLogItem>();

export function AuditLogsTableSection({
  items,
  total,
  loading,
  fetchingMore,
  hasMore,
  error,
  onLoadMore,
  className,
}: AuditLogsTableSectionProps) {
  const t = useTranslations("Admin.Ops");

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

  return (
    <AdminDataTable
      ariaLabel={t("audit.title")}
      className={className}
      columns={columns}
      data={items}
      emptyLabel={t("audit.empty")}
      error={error}
      getRowId={(row) => row.id}
      hasMore={hasMore}
      isFetchingMore={fetchingMore}
      isLoading={loading}
      loadingLabel={t("loading")}
      loadingMoreLabel={t("loadingMore")}
      onLoadMore={onLoadMore}
      summaryLabel={t("audit.summary", {
        loaded: items.length,
        total,
      })}
    />
  );
}

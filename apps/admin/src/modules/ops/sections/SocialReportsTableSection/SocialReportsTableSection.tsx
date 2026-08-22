import { useMemo } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import type { SocialReport } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import {
  adminListPaginationProps,
  adminListPaginationSummary,
} from "@/shared/lib/admin-list-pagination";
import { formatAdminDate } from "@/shared/lib/user-format";
import { socialReportsTableSectionVariants } from "./SocialReportsTableSection.styles";
import type {
  ReportTableMeta,
  SocialReportsTableSectionProps,
} from "./SocialReportsTableSection.types";

const columnHelper = createColumnHelper<SocialReport>();

export function SocialReportsTableSection({
  items,
  total,
  page,
  pageSize,
  totalPages,
  loading,
  error,
  onPageChange,
  onResolve,
  className,
}: SocialReportsTableSectionProps) {
  const t = useTranslations("Admin.Ops");
  const tCommon = useTranslations("Admin.Common");
  const styles = socialReportsTableSectionVariants();

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor((row) => `${row.target.kind}:${row.target.id}`, {
          id: "target",
          header: t("social.columns.target"),
          cell: ({ getValue }) => (
            <span className="block max-w-52 truncate" dir="ltr">
              {getValue()}
            </span>
          ),
        }),
        columnHelper.accessor("reason", {
          header: t("social.columns.reason"),
          cell: ({ getValue }) => (
            <span className="block max-w-56 truncate">{getValue()}</span>
          ),
        }),
        columnHelper.accessor("reporterId", {
          header: t("social.columns.reporter"),
          cell: ({ getValue }) => (
            <span className="block max-w-44 truncate" dir="ltr">
              {getValue()}
            </span>
          ),
        }),
        columnHelper.accessor("status", {
          header: t("social.columns.status"),
          cell: ({ getValue }) => {
            const status = getValue();
            const color =
              status === "open"
                ? "warning"
                : status === "resolved"
                  ? "success"
                  : "danger";
            return (
              <Chip color={color} size="sm" variant="soft">
                <Chip.Label>{status}</Chip.Label>
              </Chip>
            );
          },
        }),
        columnHelper.accessor("createdAt", {
          header: t("social.columns.createdAt"),
          cell: ({ getValue }) => formatAdminDate(getValue()),
        }),
        columnHelper.display({
          id: "actions",
          header: t("social.columns.actions"),
          size: 210,
          cell: (info) => {
            const meta = info.table.options.meta as ReportTableMeta | undefined;
            if (!meta) return null;
            const row = info.row.original;
            if (row.status !== "open") return null;
            return (
              <div className={meta.actionsClassName}>
                <Button
                  size="sm"
                  variant="primary"
                  onPress={() => meta.onResolve(row, "resolved")}
                >
                  {t("social.actions.resolve")}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => meta.onResolve(row, "rejected")}
                >
                  {t("social.actions.reject")}
                </Button>
              </div>
            );
          },
        }),
      ] as ColumnDef<SocialReport, unknown>[],
    [t],
  );

  const meta: ReportTableMeta = {
    actionsClassName: styles.actions(),
    onResolve,
  };

  const summary = adminListPaginationSummary(page, pageSize, total);

  return (
    <AdminDataTable
      ariaLabel={t("social.title")}
      className={className}
      columns={columns}
      data={items}
      emptyLabel={t("social.empty")}
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
